export interface ImageResult {
  blob: Blob;
  format: string;
  size: number;
  width: number;
  height: number;
}

export interface ImageInfoResult {
  format: string;
  size: number;
  dimensions: string;
  width: number;
  height: number;
}

/** Output formats the browser <canvas> can encode. */
export const CANVAS_FORMATS = new Set(['PNG', 'JPEG', 'WEBP']);

const MIME_BY_FORMAT: Record<string, string> = {
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  WEBP: 'image/webp',
  BMP: 'image/bmp',
  GIF: 'image/gif',
  TIFF: 'image/tiff',
};

export function mimeForFormat(format: string): string {
  return MIME_BY_FORMAT[format.toUpperCase()] ?? 'application/octet-stream';
}

function isTiff(file: File): boolean {
  return file.type === 'image/tiff' || /\.tiff?$/i.test(file.name);
}

/**
 * Whether an operation can run fully in the browser: the canvas can only
 * encode PNG/JPEG/WEBP and cannot decode TIFF input.
 */
export function canRunClientSide(file: File, outputFormat: string): boolean {
  return !isTiff(file) && CANVAS_FORMATS.has(outputFormat.toUpperCase());
}

async function encodeCanvas(
  canvas: HTMLCanvasElement,
  format: string,
  quality?: number,
): Promise<ImageResult> {
  const mime = mimeForFormat(format);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, quality !== undefined ? quality / 100 : undefined),
  );
  if (!blob) throw new Error(`Could not encode image as ${format}.`);
  return { blob, format: format.toUpperCase(), size: blob.size, width: canvas.width, height: canvas.height };
}

function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create a drawing context.');
  return [canvas, ctx];
}

export async function getImageInfo(file: File): Promise<ImageInfoResult> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  bitmap.close();
  const extFormat = (file.name.split('.').pop() ?? '').toUpperCase();
  const typeFormat = file.type.replace('image/', '').toUpperCase();
  return {
    format: typeFormat || extFormat || 'UNKNOWN',
    size: file.size,
    dimensions: `${width}x${height}`,
    width,
    height,
  };
}

export async function resizeImage(
  file: File,
  width: number,
  height: number,
  format: string,
): Promise<ImageResult> {
  const bitmap = await createImageBitmap(file);
  const [canvas, ctx] = makeCanvas(width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return encodeCanvas(canvas, format);
}

export async function compressImage(
  file: File,
  quality: number,
  format: string,
): Promise<ImageResult> {
  const bitmap = await createImageBitmap(file);
  const [canvas, ctx] = makeCanvas(bitmap.width, bitmap.height);
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return encodeCanvas(canvas, format, quality);
}

export async function convertImage(file: File, format: string): Promise<ImageResult> {
  const bitmap = await createImageBitmap(file);
  const [canvas, ctx] = makeCanvas(bitmap.width, bitmap.height);
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return encodeCanvas(canvas, format);
}

export interface CropInsets {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export async function cropImage(
  file: File,
  { left, top, right, bottom }: CropInsets,
  format: string,
): Promise<ImageResult> {
  const bitmap = await createImageBitmap(file);
  const cropWidth = bitmap.width - left - right;
  const cropHeight = bitmap.height - top - bottom;
  if (cropWidth <= 0 || cropHeight <= 0) {
    bitmap.close();
    throw new Error('Crop offsets leave no visible area.');
  }
  const [canvas, ctx] = makeCanvas(cropWidth, cropHeight);
  ctx.drawImage(bitmap, left, top, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  bitmap.close();
  return encodeCanvas(canvas, format);
}

export async function rotateImage(
  file: File,
  angle: number,
  flipHorizontal: boolean,
  flipVertical: boolean,
  format: string,
): Promise<ImageResult> {
  const bitmap = await createImageBitmap(file);
  const swap = angle === 90 || angle === 270;
  const [canvas, ctx] = makeCanvas(
    swap ? bitmap.height : bitmap.width,
    swap ? bitmap.width : bitmap.height,
  );
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
  bitmap.close();
  return encodeCanvas(canvas, format);
}

export interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
}

/** 3x3 sharpen convolution; amount > 0 sharpens. Edges are left unchanged. */
function sharpen(image: ImageData, amount: number): ImageData {
  const { width, height, data } = image;
  const out = new Uint8ClampedArray(data);
  const stride = width * 4;
  const center = 1 + 4 * amount;
  const side = -amount;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        out[i + c] =
          center * data[i + c] +
          side * (data[i - 4 + c] + data[i + 4 + c] + data[i - stride + c] + data[i + stride + c]);
      }
    }
  }
  return new ImageData(out, width, height);
}

/** Blend the image toward a 3x3 box blur; strength 0..1. */
function softBlur(image: ImageData, strength: number): ImageData {
  const { width, height, data } = image;
  const out = new Uint8ClampedArray(data);
  const stride = width * 4;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        const avg =
          (data[i + c] +
            data[i - 4 + c] +
            data[i + 4 + c] +
            data[i - stride + c] +
            data[i + stride + c] +
            data[i - stride - 4 + c] +
            data[i - stride + 4 + c] +
            data[i + stride - 4 + c] +
            data[i + stride + 4 + c]) /
          9;
        out[i + c] = data[i + c] * (1 - strength) + avg * strength;
      }
    }
  }
  return new ImageData(out, width, height);
}

export async function adjustImage(
  file: File,
  { brightness, contrast, saturation, sharpness }: Adjustments,
  format: string,
): Promise<ImageResult> {
  const bitmap = await createImageBitmap(file);
  const [canvas, ctx] = makeCanvas(bitmap.width, bitmap.height);
  // brightness/contrast/saturate share Pillow's "1.0 = original" semantics.
  ctx.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  if (sharpness !== 1) {
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const adjusted =
      sharpness > 1 ? sharpen(image, sharpness - 1) : softBlur(image, Math.min(1, 1 - sharpness));
    ctx.putImageData(adjusted, 0, 0);
  }

  return encodeCanvas(canvas, format);
}
