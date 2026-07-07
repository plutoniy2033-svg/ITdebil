import { useRef, useState } from 'react';
import { usePdfEditor } from './hooks/usePdfEditor';
import { Toolbar } from './components/Toolbar';
import { PdfViewer } from './components/PdfViewer';
import { Sidebar } from './components/Sidebar';
import { SignaturePad } from './components/SignaturePad';
import { SecurityDialog } from './components/SecurityDialog';
import { CompletionScreen } from './components/CompletionScreen';
import type { SecuritySettings } from './types';
import { downloadPdf, applyAnnotationsToPdf, applySecurityToPdf } from './services/pdfEditor';

export default function App() {
  const editor = usePdfEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [pendingSecurity, setPendingSecurity] = useState<SecuritySettings | null>(null);

  const handleOpenFile = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) editor.loadFile(file);
    e.target.value = '';
  };

  const handleSave = () => {
    if (pendingSecurity) {
      editor.savePdf(pendingSecurity);
    } else {
      editor.savePdf();
    }
    setShowCompletion(true);
  };

  const handleSecurityApply = (settings: SecuritySettings) => {
    setPendingSecurity(settings);
    setShowSecurity(false);
    editor.savePdf(settings);
    setShowCompletion(true);
  };

  const handleDownloadFromCompletion = async () => {
    if (editor.pdfBytes) {
      let result = await applyAnnotationsToPdf(editor.pdfBytes, editor.annotations, editor.scale);
      if (pendingSecurity) {
        result = await applySecurityToPdf(result, pendingSecurity);
      }
      downloadPdf(result, editor.fileName.replace(/\.pdf$/i, '') + '_edited.pdf');
    }
  };

  const handleNewDocument = () => {
    setShowCompletion(false);
    setPendingSecurity(null);
    handleOpenFile();
  };

  const handleSignatureConfirm = (dataUrl: string) => {
    editor.addAnnotation({
      type: 'signature',
      pageIndex: editor.currentPage,
      x: 100,
      y: 100,
      width: 200,
      height: 80,
      imageData: dataUrl,
    });
    setShowSignature(false);
    editor.setTool('select');
  };

  const handleImageUpload = () => imageInputRef.current?.click();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      editor.addImageFromFile(file, editor.currentPage, 100, 100);
      editor.setTool('select');
    }
    e.target.value = '';
  };

  if (showCompletion) {
    return (
      <CompletionScreen
        onDownload={handleDownloadFromCompletion}
        onNewDocument={handleNewDocument}
      />
    );
  }

  return (
    <div className="app">
      <Toolbar
        tool={editor.tool}
        onToolChange={(t) => {
          editor.setTool(t);
          if (t === 'signature') setShowSignature(true);
          if (t === 'image') handleImageUpload();
        }}
        onOpenFile={handleOpenFile}
        onSave={handleSave}
        onSecurity={() => setShowSecurity(true)}
        hasDocument={!!editor.pdfDoc}
        isLoading={editor.isLoading}
        scale={editor.scale}
        onScaleChange={editor.setScale}
        currentPage={editor.currentPage}
        numPages={editor.numPages}
        onPageChange={editor.setCurrentPage}
      />

      <div className="workspace">
        <PdfViewer
          pdfDoc={editor.pdfDoc}
          currentPage={editor.currentPage}
          scale={editor.scale}
          tool={editor.tool}
          annotations={editor.annotations}
          selectedId={editor.selectedId}
          onAddAnnotation={editor.addAnnotation}
          onUpdateAnnotation={editor.updateAnnotation}
          onSelectAnnotation={editor.setSelectedId}
          onTextEdit={editor.handleTextEdit}
        />

        {editor.pdfDoc && (
          <Sidebar
            annotations={editor.annotations}
            currentPage={editor.currentPage}
            selectedId={editor.selectedId}
            onSelect={editor.setSelectedId}
            onUpdate={editor.updateAnnotation}
            onDelete={editor.deleteAnnotation}
          />
        )}
      </div>

      {!editor.pdfDoc && !editor.isLoading && (
        <div className="welcome-screen">
          <div className="welcome-content">
            <h1>SASpdf</h1>
            <p>Редактор PDF-файлов</p>
            <button className="btn btn-primary btn-lg" onClick={handleOpenFile}>
              Открыть PDF
            </button>
            <ul className="feature-list">
              <li>Редактирование и добавление текста</li>
              <li>Электронная подпись</li>
              <li>Заметки и аннотации</li>
              <li>Работа с изображениями</li>
              <li>Защита паролем и ограничение прав</li>
              <li>Замазывание конфиденциальной информации</li>
            </ul>
          </div>
        </div>
      )}

      {editor.isLoading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <span>Загрузка...</span>
        </div>
      )}

      {editor.error && (
        <div className="toast error" onClick={() => editor.setError(null)}>
          {editor.error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        hidden
        onChange={handleFileChange}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        hidden
        onChange={handleImageChange}
      />

      {showSignature && (
        <SignaturePad
          onConfirm={handleSignatureConfirm}
          onCancel={() => {
            setShowSignature(false);
            editor.setTool('select');
          }}
        />
      )}

      {showSecurity && (
        <SecurityDialog
          onApply={handleSecurityApply}
          onClose={() => setShowSecurity(false)}
        />
      )}
    </div>
  );
}
