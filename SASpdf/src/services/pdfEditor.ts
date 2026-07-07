import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt';
import { viewportToPdfRect } from './textBlocks';
import type { PdfAnnotation, SecuritySettings } from '../types';

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  return rgb(r, g, b);
}

async function dataUrlToBytes(dataUrl: string): Promise<Uint8Array> {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function applyAnnotationsToPdf(
  pdfBytes: ArrayBuffer,
  annotations: PdfAnnotation[],
  scale = 1.2,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  for (const ann of annotations) {
    const page = pages[ann.pageIndex];
    if (!page) continue;

    const { height: pageHeight } = page.getSize();
    const rect = viewportToPdfRect(ann, pageHeight, scale);
    const fontSize = (ann.fontSize ?? 14) / scale;

    switch (ann.type) {
      case 'text': {
        page.drawRectangle({
          x: rect.x - 2,
          y: rect.y - 2,
          width: rect.width + 4,
          height: rect.height + 4,
          color: rgb(1, 1, 1),
        });
        const color = ann.color ? hexToRgb(ann.color) : rgb(0, 0, 0);
        page.drawText(ann.content ?? '', {
          x: rect.x,
          y: rect.y + rect.height - fontSize,
          size: fontSize,
          font,
          color,
          maxWidth: rect.width,
        });
        break;
      }
      case 'edit-text': {
        page.drawRectangle({
          x: rect.x - 2,
          y: rect.y - 2,
          width: rect.width + 4,
          height: rect.height + 4,
          color: rgb(1, 1, 1),
        });
        if (ann.content) {
          const color = ann.color ? hexToRgb(ann.color) : rgb(0, 0, 0);
          page.drawText(ann.content, {
            x: rect.x,
            y: rect.y + rect.height - fontSize,
            size: fontSize,
            font,
            color,
            maxWidth: rect.width,
          });
        }
        break;
      }
      case 'note': {
        page.drawRectangle({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          color: rgb(1, 0.95, 0.6),
          borderColor: rgb(0.8, 0.7, 0.2),
          borderWidth: 1,
        });
        if (ann.content) {
          page.drawText(ann.content, {
            x: rect.x + 4,
            y: rect.y + rect.height - 10 / scale,
            size: 10 / scale,
            font,
            color: rgb(0.2, 0.2, 0.2),
            maxWidth: rect.width - 8,
          });
        }
        break;
      }
      case 'redact': {
        page.drawRectangle({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          color: rgb(0, 0, 0),
        });
        break;
      }
      case 'signature':
      case 'image': {
        if (!ann.imageData) break;
        const imgBytes = await dataUrlToBytes(ann.imageData);
        const isPng = ann.imageData.startsWith('data:image/png');
        const image = isPng
          ? await pdfDoc.embedPng(imgBytes)
          : await pdfDoc.embedJpg(imgBytes);
        page.drawImage(image, {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
        break;
      }
    }
  }

  return pdfDoc.save();
}

export async function applySecurityToPdf(
  pdfBytes: Uint8Array,
  settings: SecuritySettings,
): Promise<Uint8Array> {
  if (!settings.userPassword && !settings.ownerPassword) {
    return pdfBytes;
  }

  return encryptPDF(pdfBytes, settings.userPassword || 'user', {
    ownerPassword: settings.ownerPassword || settings.userPassword || 'owner',
    allowPrinting: settings.allowPrinting,
    allowModifying: settings.allowEditing,
    allowCopying: settings.allowCopying,
    allowAnnotating: settings.allowEditing,
    allowFillingForms: settings.allowEditing,
    allowExtraction: settings.allowCopying,
    allowAssembly: settings.allowEditing,
  });
}

export function downloadPdf(bytes: Uint8Array, fileName: string) {
  const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function loadImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export { rgb };
