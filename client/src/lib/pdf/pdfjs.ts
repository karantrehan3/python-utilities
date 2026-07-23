import type { PDFDocumentProxy } from 'pdfjs-dist';

type PdfJsModule = typeof import('pdfjs-dist');

let pdfjsPromise: Promise<PdfJsModule> | null = null;

/**
 * Lazily load pdfjs-dist and wire up its web worker. Dynamically imported so
 * the heavy renderer stays out of the initial app bundle.
 */
export async function loadPdfjs(): Promise<PdfJsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import('pdfjs-dist');
      const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      return pdfjs;
    })();
  }
  return pdfjsPromise;
}

/** Load a PDF document from raw bytes. Caller owns destroying it. */
export async function openPdfDocument(data: ArrayBuffer): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfjs();
  // pdfjs transfers/detaches the buffer; hand it a copy so the caller's bytes survive.
  return pdfjs.getDocument({ data: data.slice(0) }).promise;
}

/**
 * Render the first page of a PDF to a PNG data URL for use as a thumbnail.
 * Returns null if the document can't be rendered (e.g. encrypted).
 */
export async function renderFirstPageThumbnail(
  data: ArrayBuffer,
  maxWidth = 320,
): Promise<string | null> {
  let doc: PDFDocumentProxy | null = null;
  try {
    doc = await openPdfDocument(data);
    const page = await doc.getPage(1);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(maxWidth / baseViewport.width, 2);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    if (!canvas.getContext('2d')) return null;

    await page.render({ canvas, viewport }).promise;
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  } finally {
    void doc?.loadingTask.destroy();
  }
}
