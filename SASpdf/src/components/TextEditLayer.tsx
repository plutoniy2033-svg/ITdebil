import { useEffect, useRef, useState, useCallback } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { extractTextBlocks, type TextBlock } from '../services/textBlocks';
import type { PdfAnnotation, ToolMode } from '../types';

interface TextEditLayerProps {
  pdfDoc: PDFDocumentProxy;
  currentPage: number;
  scale: number;
  tool: ToolMode;
  annotations: PdfAnnotation[];
  onTextEdit: (block: TextBlock, newText: string, measuredWidth: number, measuredHeight: number) => void;
  onAddTextAt: (x: number, y: number) => void;
}

export function TextEditLayer({
  pdfDoc,
  currentPage,
  scale,
  tool,
  annotations,
  onTextEdit,
  onAddTextAt,
}: TextEditLayerProps) {
  const [blocks, setBlocks] = useState<TextBlock[]>([]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const extracted = await extractTextBlocks(pdfDoc, currentPage, scale);
      if (!cancelled) setBlocks(extracted);
    })();
    return () => { cancelled = true; };
  }, [pdfDoc, currentPage, scale]);

  const pageEdits = annotations.filter(
    (a) => a.type === 'edit-text' && a.pageIndex === currentPage,
  );

  const getEditForBlock = useCallback(
    (block: TextBlock) => pageEdits.find((a) => a.sourceBlockId === block.id),
    [pageEdits],
  );

  const getBlockText = useCallback(
    (block: TextBlock) => getEditForBlock(block)?.content ?? block.text,
    [getEditForBlock],
  );

  const isBlockChanged = useCallback(
    (block: TextBlock) => {
      const edit = getEditForBlock(block);
      return edit !== undefined && edit.content !== block.text;
    },
    [getEditForBlock],
  );

  useEffect(() => {
    for (const block of blocks) {
      if (activeBlockId === block.id) continue;
      const el = contentRefs.current.get(block.id);
      if (!el) continue;
      el.textContent = isBlockChanged(block) ? getBlockText(block) : '';
    }
  }, [blocks, pageEdits, activeBlockId, getBlockText, isBlockChanged]);

  const handleFocus = (block: TextBlock) => {
    setActiveBlockId(block.id);
    const el = contentRefs.current.get(block.id);
    if (el) {
      el.textContent = getBlockText(block);
      requestAnimationFrame(() => {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      });
    }
  };

  const handleBlur = (block: TextBlock, el: HTMLDivElement) => {
    const newText = el.innerText.replace(/\n/g, ' ');
    const measuredWidth = Math.max(block.width, el.scrollWidth + 8);
    const measuredHeight = Math.max(block.height, el.scrollHeight + 4);
    onTextEdit(block, newText, measuredWidth, measuredHeight);
    setActiveBlockId(null);
    if (newText === block.text) {
      el.textContent = '';
    }
  };

  const handleLayerClick = (e: React.MouseEvent) => {
    if (tool !== 'edit-text') return;
    if ((e.target as HTMLElement).closest('.text-edit-block')) return;
    const rect = layerRef.current!.getBoundingClientRect();
    onAddTextAt(e.clientX - rect.left, e.clientY - rect.top);
  };

  const renderChangedBlock = (block: TextBlock) => {
    const edit = getEditForBlock(block)!;
    return (
      <div
        key={`changed-${block.id}`}
        className="text-changed-block"
        style={{
          left: block.x,
          top: block.y,
          width: edit.width ?? block.width,
          minHeight: edit.height ?? block.height,
          fontSize: block.fontSize,
          fontFamily: block.fontFamily,
          lineHeight: 1.2,
        }}
      >
        <div className="text-edit-mask" />
        <div
          className="text-edit-content text-edit-readonly"
          style={{ fontSize: block.fontSize, fontFamily: block.fontFamily }}
        >
          {edit.content}
        </div>
      </div>
    );
  };

  const renderEditableBlock = (block: TextBlock) => {
    const isActive = activeBlockId === block.id;
    const changed = isBlockChanged(block);

    if (changed && !isActive) return null;

    return (
      <div
        key={block.id}
        className={`text-edit-block ${isActive ? 'active' : ''}`}
        style={{
          left: block.x,
          top: block.y,
          width: block.width,
          minHeight: block.height,
          fontSize: block.fontSize,
          fontFamily: block.fontFamily,
          lineHeight: 1.2,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {isActive && <div className="text-edit-mask" />}
        <div
          ref={(el) => {
            if (el) contentRefs.current.set(block.id, el);
            else contentRefs.current.delete(block.id);
          }}
          className="text-edit-content"
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          onFocus={() => handleFocus(block)}
          onBlur={(e) => handleBlur(block, e.currentTarget)}
          onInput={(e) => {
            const el = e.currentTarget;
            const parent = el.parentElement;
            if (parent) {
              parent.style.width = `${Math.max(block.width, el.scrollWidth + 8)}px`;
              parent.style.minHeight = `${Math.max(block.height, el.scrollHeight + 4)}px`;
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') e.currentTarget.blur();
          }}
          style={{ fontSize: block.fontSize, fontFamily: block.fontFamily }}
        />
      </div>
    );
  };

  const changedBlocks = blocks.filter(isBlockChanged);

  if (tool === 'select') {
    return (
      <>
        <div className="text-layer selectable" ref={layerRef}>
          {blocks.filter((b) => !isBlockChanged(b)).map((block) => (
            <span
              key={block.id}
              className="text-select-span"
              style={{
                left: block.x,
                top: block.y,
                width: block.width,
                height: block.height,
                fontSize: block.fontSize,
                fontFamily: block.fontFamily,
                lineHeight: 1.2,
              }}
            >
              {block.text}
            </span>
          ))}
        </div>
        <div className="text-edit-layer text-edit-layer-readonly">
          {changedBlocks.map(renderChangedBlock)}
        </div>
      </>
    );
  }

  if (tool === 'edit-text') {
    return (
      <div ref={layerRef} className="text-edit-layer" onClick={handleLayerClick}>
        {changedBlocks.map(renderChangedBlock)}
        {blocks.map(renderEditableBlock)}
      </div>
    );
  }

  return (
    <div className="text-edit-layer text-edit-layer-readonly">
      {changedBlocks.map(renderChangedBlock)}
    </div>
  );
}
