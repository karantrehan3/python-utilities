import { openPdfDocument } from './pdfjs';

const DEFAULT_PDF_DPI = 72;

/**
 * Render every page of a PDF to an image and return the set as a ZIP archive.
 * Rendering runs through pdfjs entirely in the browser.
 */
export async function pdfToImages(
  file: File,
  format: 'png' | 'jpeg',
  dpi: number,
): Promise<Blob> {
  const { default: JSZip } = await import('jszip');
  const doc = await openPdfDocument(await file.arrayBuffer());
  const zip = new JSZip();
  const scale = dpi / DEFAULT_PDF_DPI;
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';

  try {
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      if (!canvas.getContext('2d')) throw new Error('Could not render page.');

      await page.render({ canvas, viewport }).promise;
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, mimeType),
      );
      if (blob) {
        zip.file(`page_${pageNum}.${format}`, blob);
      }
      page.cleanup();
    }
  } finally {
    void doc.loadingTask.destroy();
  }

  return zip.generateAsync({ type: 'blob' });
}
