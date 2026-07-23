import type { PDFDocument, PDFImage } from 'pdf-lib';

/**
 * Client-side PDF operations built on pdf-lib. All heavy imports are dynamic so
 * they stay out of the initial bundle and only load when a tool runs.
 */

async function loadPdfLib() {
  return import('pdf-lib');
}

async function loadDoc(file: File): Promise<PDFDocument> {
  const { PDFDocument } = await loadPdfLib();
  const bytes = await file.arrayBuffer();
  return PDFDocument.load(bytes, { ignoreEncryption: true });
}

function toBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes as BlobPart], { type: 'application/pdf' });
}

/** Parse a 1-indexed page list like "1,3,5" into 0-indexed numbers. */
function parsePageList(pages: string, total: number): number[] {
  return pages
    .split(',')
    .map((p) => parseInt(p.trim(), 10))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= total)
    .map((n) => n - 1);
}

export async function mergePdfs(files: File[]): Promise<Blob> {
  const { PDFDocument } = await loadPdfLib();
  const out = await PDFDocument.create();
  for (const file of files) {
    const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((page) => out.addPage(page));
  }
  return toBlob(await out.save());
}

/** Split a PDF into one-page documents, returned as a ZIP archive. */
export async function splitPdf(file: File): Promise<Blob> {
  const { PDFDocument } = await loadPdfLib();
  const { default: JSZip } = await import('jszip');
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const zip = new JSZip();

  const count = src.getPageCount();
  for (let i = 0; i < count; i++) {
    const single = await PDFDocument.create();
    const [page] = await single.copyPages(src, [i]);
    single.addPage(page);
    zip.file(`page_${i + 1}.pdf`, await single.save());
  }
  return zip.generateAsync({ type: 'blob' });
}

export async function extractPages(file: File, startPage: number, endPage: number): Promise<Blob> {
  const { PDFDocument } = await loadPdfLib();
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const total = src.getPageCount();
  if (startPage < 1) throw new Error('Start page must be 1 or greater.');
  if (endPage > total) throw new Error(`Page range out of bounds. PDF has ${total} pages.`);

  const out = await PDFDocument.create();
  const indices = Array.from({ length: endPage - startPage + 1 }, (_, k) => startPage - 1 + k);
  const pages = await out.copyPages(src, indices);
  pages.forEach((page) => out.addPage(page));
  return toBlob(await out.save());
}

export async function rotatePdf(file: File, rotation: number, pages?: string): Promise<Blob> {
  const { degrees } = await loadPdfLib();
  const doc = await loadDoc(file);
  const all = doc.getPages();
  const targets = pages?.trim()
    ? parsePageList(pages, all.length)
    : all.map((_, i) => i);

  for (const idx of targets) {
    const page = all[idx];
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + rotation) % 360));
  }
  return toBlob(await doc.save());
}

type PageNumberPosition = 'bottom-center' | 'bottom-right' | 'bottom-left';

export async function addPageNumbers(
  file: File,
  position: PageNumberPosition,
  startNumber: number,
  fontSize: number,
): Promise<Blob> {
  const { StandardFonts, rgb } = await loadPdfLib();
  const doc = await loadDoc(file);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const margin = 24;

  doc.getPages().forEach((page, i) => {
    const label = String(startNumber + i);
    const { width } = page.getSize();
    const textWidth = font.widthOfTextAtSize(label, fontSize);
    let x = margin;
    if (position === 'bottom-center') x = (width - textWidth) / 2;
    else if (position === 'bottom-right') x = width - textWidth - margin;
    page.drawText(label, { x, y: margin, size: fontSize, font, color: rgb(0, 0, 0) });
  });
  return toBlob(await doc.save());
}

type WatermarkPosition = 'center' | 'diagonal';

export async function watermarkPdf(
  file: File,
  text: string,
  fontSize: number,
  opacity: number,
  position: WatermarkPosition,
): Promise<Blob> {
  const { StandardFonts, rgb, degrees } = await loadPdfLib();
  const doc = await loadDoc(file);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const angle = position === 'diagonal' ? 45 : 0;

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);
    // Anchor at page centre, then offset back along the (possibly rotated) baseline.
    const rad = (angle * Math.PI) / 180;
    const x = width / 2 - (textWidth / 2) * Math.cos(rad) + (textHeight / 2) * Math.sin(rad);
    const y = height / 2 - (textWidth / 2) * Math.sin(rad) - (textHeight / 2) * Math.cos(rad);
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: degrees(angle),
    });
  }
  return toBlob(await doc.save());
}

async function embedImage(doc: PDFDocument, file: File): Promise<PDFImage> {
  const type = file.type.toLowerCase();
  if (type === 'image/jpeg' || type === 'image/jpg') {
    return doc.embedJpg(await file.arrayBuffer());
  }
  if (type === 'image/png') {
    return doc.embedPng(await file.arrayBuffer());
  }
  // webp/bmp/gif: decode via canvas, re-encode as PNG for embedding.
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process image.');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!pngBlob) throw new Error(`Unsupported image: ${file.name}`);
  return doc.embedPng(await pngBlob.arrayBuffer());
}

export async function imagesToPdf(files: File[]): Promise<Blob> {
  const { PDFDocument } = await loadPdfLib();
  const doc = await PDFDocument.create();
  for (const file of files) {
    const image = await embedImage(doc, file);
    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  return toBlob(await doc.save());
}

export interface PdfInfo {
  page_count: number;
  is_encrypted: boolean;
  file_size: number;
  metadata: Record<string, string> | null;
}

export async function getPdfInfo(file: File, includeMetadata: boolean): Promise<PdfInfo> {
  const doc = await loadDoc(file);

  let metadata: Record<string, string> | null = null;
  if (includeMetadata) {
    const entries: Record<string, string | undefined> = {
      title: doc.getTitle(),
      author: doc.getAuthor(),
      subject: doc.getSubject(),
      keywords: doc.getKeywords(),
      creator: doc.getCreator(),
      producer: doc.getProducer(),
      creationDate: doc.getCreationDate()?.toISOString(),
      modificationDate: doc.getModificationDate()?.toISOString(),
    };
    metadata = Object.fromEntries(
      Object.entries(entries).filter((entry): entry is [string, string] => Boolean(entry[1])),
    );
  }

  return {
    page_count: doc.getPageCount(),
    is_encrypted: doc.isEncrypted,
    file_size: file.size,
    metadata,
  };
}
