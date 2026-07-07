import * as pdfjsLib from 'pdfjs-dist';
import type { PageViewport } from 'pdfjs-dist';

export interface TextBlock {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: string;
}

interface RawTextItem {
  str: string;
  x: number;
  y: number;
  baseline: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
}

const LINE_THRESHOLD = 8;

function sameLine(a: TextBlock, b: TextBlock): boolean {
  const aMid = a.y + a.height / 2;
  const bMid = b.y + b.height / 2;
  return Math.abs(aMid - bMid) < Math.max(a.fontSize, b.fontSize) * 0.55;
}

function mergeTwoBlocks(a: TextBlock, b: TextBlock): TextBlock {
  const left = a.x <= b.x ? a : b;
  const right = a.x <= b.x ? b : a;
  const gap = right.x - (left.x + left.width);
  const spacer = gap > left.fontSize * 0.15 ? ' ' : '';
  const text = a.x <= b.x
    ? `${left.text}${spacer}${right.text}`
    : `${right.text}${spacer}${left.text}`;

  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const rightEdge = Math.max(a.x + a.width, b.x + b.width);
  const bottom = Math.max(a.y + a.height, b.y + b.height);
  const fontSize = Math.max(a.fontSize, b.fontSize);

  return {
    id: a.id,
    pageIndex: a.pageIndex,
    x,
    y,
    width: rightEdge - x,
    height: bottom - y,
    text: text.trim(),
    fontSize,
    fontFamily: a.fontFamily,
  };
}

function mergeAdjacentLineBlocks(blocks: TextBlock[]): TextBlock[] {
  const sorted = [...blocks].sort((a, b) => a.y - b.y || a.x - b.x);
  const merged: TextBlock[] = [];

  for (const block of sorted) {
    const last = merged[merged.length - 1];
    if (!last) {
      merged.push({ ...block });
      continue;
    }

    const gap = block.x - (last.x + last.width);
    const adjacent = sameLine(last, block) && gap < block.fontSize * 1.5;

    if (adjacent) {
      merged[merged.length - 1] = mergeTwoBlocks(last, block);
    } else {
      merged.push({ ...block });
    }
  }

  return merged.map((block, index) => ({
    ...block,
    id: `p${block.pageIndex}-l${index}`,
  }));
}

export async function extractTextBlocks(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageIndex: number,
  scale: number,
): Promise<TextBlock[]> {
  const page = await pdfDoc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });
  const textContent = await page.getTextContent();

  const raw: RawTextItem[] = [];

  for (const item of textContent.items) {
    if (!('str' in item) || !item.str.trim()) continue;
    const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
    const fontSize = Math.abs(tx[0]) || Math.abs(tx[3]) || 12;
    const itemWidth = item.width
      ? Math.abs(item.width * tx[0])
      : fontSize * item.str.length * 0.55;

    raw.push({
      str: item.str,
      x: tx[4],
      y: tx[5] - fontSize * 1.05,
      baseline: tx[5],
      width: Math.max(itemWidth, fontSize * 0.5),
      height: fontSize * 1.2,
      fontSize,
      fontFamily: item.fontName || 'sans-serif',
    });
  }

  if (raw.length === 0) return [];

  raw.sort((a, b) => a.baseline - b.baseline || a.x - b.x);

  const lineGroups: RawTextItem[][] = [];
  for (const item of raw) {
    const line = lineGroups.find(
      (group) => Math.abs(group[0].baseline - item.baseline) <= LINE_THRESHOLD,
    );
    if (line) {
      line.push(item);
    } else {
      lineGroups.push([item]);
    }
  }

  const blocks = lineGroups.map((line, lineIndex) => {
    line.sort((a, b) => a.x - b.x);

    let text = '';
    let prevEnd = -Infinity;
    for (const item of line) {
      const gap = item.x - prevEnd;
      if (text && gap > item.fontSize * 0.2) text += ' ';
      text += item.str;
      prevEnd = item.x + item.width;
    }

    const x = line[0].x;
    const fontSize = Math.max(...line.map((item) => item.fontSize));
    const baseline = Math.max(...line.map((item) => item.baseline));
    const endX = Math.max(...line.map((item) => item.x + item.width));
    const y = baseline - fontSize * 1.05;
    const height = fontSize * 1.25;

    return {
      id: `p${pageIndex}-l${lineIndex}`,
      pageIndex,
      x,
      y,
      width: Math.max(endX - x, fontSize),
      height,
      text: text.trim(),
      fontSize,
      fontFamily: line[0].fontFamily,
    };
  }).filter((block) => block.text.length > 0);

  return mergeAdjacentLineBlocks(blocks);
}

export function viewportToPdfRect(
  ann: { x: number; y: number; width: number; height: number },
  pageHeight: number,
  scale: number,
) {
  const x = ann.x / scale;
  const width = ann.width / scale;
  const height = ann.height / scale;
  const y = pageHeight - (ann.y + ann.height) / scale;
  return { x, y, width, height };
}

export type { PageViewport };
