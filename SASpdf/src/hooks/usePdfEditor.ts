import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PdfAnnotation, SecuritySettings, ToolMode } from '../types';
import type { TextBlock } from '../services/textBlocks';
import { loadPdfDocument } from '../services/pdfLoader';
import {
  applyAnnotationsToPdf,
  applySecurityToPdf,
  downloadPdf,
  loadImageFile,
} from '../services/pdfEditor';

export function usePdfEditor() {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState('document.pdf');
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [tool, setTool] = useState<ToolMode>('select');
  const [annotations, setAnnotations] = useState<PdfAnnotation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const doc = await loadPdfDocument(buffer.slice(0));
      setPdfBytes(buffer);
      setPdfDoc(doc);
      setFileName(file.name);
      setNumPages(doc.numPages);
      setCurrentPage(0);
      setAnnotations([]);
      setSelectedId(null);
    } catch {
      setError('Не удалось загрузить PDF-файл');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addAnnotation = useCallback((ann: Omit<PdfAnnotation, 'id'>) => {
    const id = uuidv4();
    setAnnotations((prev) => [...prev, { ...ann, id }]);
    setSelectedId(id);
    return id;
  }, []);

  const updateAnnotation = useCallback((id: string, updates: Partial<PdfAnnotation>) => {
    setAnnotations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    );
  }, []);

  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const savePdf = useCallback(
    async (security?: SecuritySettings) => {
      if (!pdfBytes) return;
      setIsLoading(true);
      try {
        let result = await applyAnnotationsToPdf(pdfBytes, annotations, scale);
        if (security && (security.userPassword || security.ownerPassword)) {
          result = await applySecurityToPdf(result, security);
        }
        downloadPdf(result, fileName.replace(/\.pdf$/i, '') + '_edited.pdf');
      } catch {
        setError('Ошибка при сохранении PDF');
      } finally {
        setIsLoading(false);
      }
    },
    [pdfBytes, annotations, fileName, scale],
  );

  const addImageFromFile = useCallback(
    async (file: File, pageIndex: number, x: number, y: number) => {
      const imageData = await loadImageFile(file);
      addAnnotation({
        type: 'image',
        pageIndex,
        x,
        y,
        width: 150,
        height: 100,
        imageData,
      });
    },
    [addAnnotation],
  );

  const handleTextEdit = useCallback(
    (block: TextBlock, newText: string, measuredWidth: number, measuredHeight: number) => {
      const existing = annotations.find(
        (a) => a.type === 'edit-text' && a.sourceBlockId === block.id,
      );

      if (newText === block.text) {
        if (existing) deleteAnnotation(existing.id);
        return;
      }

      if (existing) {
        updateAnnotation(existing.id, {
          content: newText,
          width: measuredWidth,
          height: measuredHeight,
        });
        return;
      }

      addAnnotation({
        type: 'edit-text',
        pageIndex: block.pageIndex,
        sourceBlockId: block.id,
        x: block.x,
        y: block.y,
        width: measuredWidth,
        height: measuredHeight,
        content: newText,
        originalText: block.text,
        fontSize: block.fontSize,
        color: '#000000',
      });
    },
    [annotations, addAnnotation, updateAnnotation, deleteAnnotation],
  );

  return {
    pdfDoc,
    pdfBytes,
    fileName,
    currentPage,
    numPages,
    scale,
    tool,
    annotations,
    selectedId,
    isLoading,
    error,
    setCurrentPage,
    setScale,
    setTool,
    setSelectedId,
    setError,
    loadFile,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    savePdf,
    addImageFromFile,
    handleTextEdit,
  };
}

export type PdfEditorState = ReturnType<typeof usePdfEditor>;
