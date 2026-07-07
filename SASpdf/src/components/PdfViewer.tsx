import { useEffect, useRef, useState, useCallback } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { renderPageToCanvas } from '../services/pdfLoader';
import { TextEditLayer } from './TextEditLayer';
import type { PdfAnnotation, ToolMode } from '../types';
import type { TextBlock } from '../services/textBlocks';

interface PdfViewerProps {
  pdfDoc: PDFDocumentProxy | null;
  currentPage: number;
  scale: number;
  tool: ToolMode;
  annotations: PdfAnnotation[];
  selectedId: string | null;
  onAddAnnotation: (ann: Omit<PdfAnnotation, 'id'>) => string;
  onUpdateAnnotation: (id: string, updates: Partial<PdfAnnotation>) => void;
  onSelectAnnotation: (id: string | null) => void;
  onTextEdit: (block: TextBlock, newText: string, measuredWidth: number, measuredHeight: number) => void;
}

export function PdfViewer({
  pdfDoc,
  currentPage,
  scale,
  tool,
  annotations,
  selectedId,
  onAddAnnotation,
  onUpdateAnnotation,
  onSelectAnnotation,
  onTextEdit,
}: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [dragState, setDragState] = useState<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const [drawState, setDrawState] = useState<{ startX: number; startY: number } | null>(null);
  const [previewRect, setPreviewRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let cancelled = false;

    (async () => {
      const viewport = await renderPageToCanvas(pdfDoc, currentPage, scale, canvasRef.current!);
      if (!cancelled) {
        setPageSize({ width: viewport.width, height: viewport.height });
      }
    })();

    return () => { cancelled = true; };
  }, [pdfDoc, currentPage, scale]);

  const getRelativeCoords = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const pageAnnotations = annotations.filter(
    (a) => a.pageIndex === currentPage && a.type !== 'edit-text',
  );

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (tool === 'select' || tool === 'redact' || tool === 'signature' || tool === 'image' || tool === 'edit-text') {
      if (tool === 'select') onSelectAnnotation(null);
      return;
    }

    const { x, y } = getRelativeCoords(e);

    if (tool === 'text') {
      onAddAnnotation({
        type: 'text',
        pageIndex: currentPage,
        x,
        y,
        width: 220,
        height: 28,
        content: 'Новый текст',
        fontSize: 14,
        color: '#000000',
      });
    } else if (tool === 'note') {
      onAddAnnotation({
        type: 'note',
        pageIndex: currentPage,
        x,
        y,
        width: 180,
        height: 100,
        content: 'Заметка',
      });
    }
  };

  const handleAddTextAt = (x: number, y: number) => {
    onAddAnnotation({
      type: 'text',
      pageIndex: currentPage,
      x,
      y,
      width: 220,
      height: 28,
      content: '',
      fontSize: 14,
      color: '#000000',
    });
  };

  const handleMouseDown = (e: React.MouseEvent, ann: PdfAnnotation) => {
    if (tool !== 'select') return;
    e.stopPropagation();
    onSelectAnnotation(ann.id);
    const { x, y } = getRelativeCoords(e);
    setDragState({ id: ann.id, startX: x, startY: y, origX: ann.x, origY: ann.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragState) {
      const { x, y } = getRelativeCoords(e);
      onUpdateAnnotation(dragState.id, {
        x: dragState.origX + (x - dragState.startX),
        y: dragState.origY + (y - dragState.startY),
      });
    }
    if (drawState && tool === 'redact') {
      const { x, y } = getRelativeCoords(e);
      setPreviewRect({
        x: Math.min(drawState.startX, x),
        y: Math.min(drawState.startY, y),
        width: Math.abs(x - drawState.startX),
        height: Math.abs(y - drawState.startY),
      });
    }
  };

  const handleMouseUp = () => {
    if (drawState && previewRect && previewRect.width > 5 && previewRect.height > 5) {
      onAddAnnotation({
        type: 'redact',
        pageIndex: currentPage,
        ...previewRect,
      });
    }
    setDragState(null);
    setDrawState(null);
    setPreviewRect(null);
  };

  const handleDrawStart = (e: React.MouseEvent) => {
    if (tool !== 'redact') return;
    e.stopPropagation();
    const { x, y } = getRelativeCoords(e);
    setDrawState({ startX: x, startY: y });
  };

  const handleResize = (e: React.MouseEvent, ann: PdfAnnotation) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const origW = ann.width;
    const origH = ann.height;

    const onMove = (ev: MouseEvent) => {
      onUpdateAnnotation(ann.id, {
        width: Math.max(20, origW + (ev.clientX - startX)),
        height: Math.max(20, origH + (ev.clientY - startY)),
      });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  if (!pdfDoc) return null;

  return (
    <div className="pdf-viewer">
      <div
        ref={containerRef}
        className="pdf-page-container"
        style={{ width: pageSize.width, height: pageSize.height }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas ref={canvasRef} className="pdf-canvas" />

        <TextEditLayer
          pdfDoc={pdfDoc}
          currentPage={currentPage}
          scale={scale}
          tool={tool}
          annotations={annotations}
          onTextEdit={onTextEdit}
          onAddTextAt={handleAddTextAt}
        />

        <div
          className={`annotation-layer ${tool === 'edit-text' ? 'annotation-layer-passive' : ''}`}
          onClick={handleCanvasClick}
          onMouseDown={handleDrawStart}
        >
          {pageAnnotations.map((ann) => (
            <div
              key={ann.id}
              className={`annotation annotation-${ann.type} ${selectedId === ann.id ? 'selected' : ''}`}
              style={{
                left: ann.x,
                top: ann.y,
                width: ann.width,
                height: ann.height,
                fontSize: ann.fontSize,
                color: ann.color,
              }}
              onMouseDown={(e) => handleMouseDown(e, ann)}
            >
              {ann.type === 'text' ? (
                <>
                  {(tool === 'select' && selectedId === ann.id) && (
                    <div className="annotation-text-mask" />
                  )}
                  <div
                    className="annotation-text annotation-text-editable"
                    contentEditable={tool === 'select' && selectedId === ann.id}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const el = e.currentTarget;
                      onUpdateAnnotation(ann.id, {
                        content: el.innerText,
                        width: Math.max(ann.width, el.scrollWidth + 8),
                        height: Math.max(ann.height, el.scrollHeight + 4),
                      });
                    }}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      const parent = el.closest('.annotation') as HTMLElement | null;
                      if (parent) {
                        parent.style.width = `${Math.max(ann.width, el.scrollWidth + 8)}px`;
                        parent.style.minHeight = `${Math.max(ann.height, el.scrollHeight + 4)}px`;
                      }
                    }}
                  >
                    {ann.content}
                  </div>
                </>
              ) : ann.type === 'note' ? (
                <div className="annotation-note">{ann.content}</div>
              ) : ann.type === 'redact' ? (
                <div className="annotation-redact" />
              ) : ann.imageData ? (
                <img
                  src={ann.imageData}
                  alt=""
                  className={`annotation-${ann.type}`}
                  draggable={false}
                />
              ) : null}

              {selectedId === ann.id && tool === 'select' && (
                <div
                  className="resize-handle se"
                  onMouseDown={(e) => handleResize(e, ann)}
                />
              )}
            </div>
          ))}

          {previewRect && (
            <div
              className="annotation annotation-redact"
              style={{
                left: previewRect.x,
                top: previewRect.y,
                width: previewRect.width,
                height: previewRect.height,
                opacity: 0.5,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
