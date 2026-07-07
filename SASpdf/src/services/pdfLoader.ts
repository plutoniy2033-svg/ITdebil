import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export { pdfjsLib };

export async function loadPdfDocument(data: ArrayBuffer) {
  return pdfjsLib.getDocument({ data }).promise;
}

export async function renderPageToCanvas(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageIndex: number,
  scale: number,
  canvas: HTMLCanvasElement,
) {
  const page = await pdfDoc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas context unavailable');

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: context, viewport }).promise;
  return viewport;
}

export async function extractPageText(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageIndex: number,
) {
  const page = await pdfDoc.getPage(pageIndex + 1);
  const textContent = await page.getTextContent();
  return textContent.items
    .map((item) => ('str' in item ? item.str : ''))
    .join(' ');
}
