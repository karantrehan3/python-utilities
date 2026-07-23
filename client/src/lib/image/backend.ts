import { apiPost } from '../../api/client';
import { blobFromBase64 } from '../download';
import { mimeForFormat, type ImageResult } from './canvas';

interface ImageApiResponse {
  result: string;
  format: string;
  size: number;
  original_size?: number;
  compressed_size?: number;
}

export interface BackendImageResult extends ImageResult {
  originalSize?: number;
  compressedSize?: number;
}

/**
 * Fallback path for image operations the browser canvas can't handle
 * (BMP/GIF/TIFF output, TIFF input). Posts to the existing endpoint and
 * surfaces the backend's `detail` error message verbatim in failures.
 */
export async function imageViaBackend(
  endpoint: string,
  file: File,
  params: Record<string, string | number | boolean>,
): Promise<BackendImageResult> {
  const formData = new FormData();
  formData.append('file', file);
  for (const [key, value] of Object.entries(params)) {
    formData.append(key, String(value));
  }

  const response = await apiPost(endpoint, formData);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `Request failed with status ${response.status}`);
  }

  const data: ImageApiResponse = await response.json();
  const blob = blobFromBase64(data.result, mimeForFormat(data.format));
  const bitmap = await createImageBitmap(blob).catch(() => null);
  const width = bitmap?.width ?? 0;
  const height = bitmap?.height ?? 0;
  bitmap?.close();

  return {
    blob,
    format: data.format.toUpperCase(),
    size: data.size ?? blob.size,
    width,
    height,
    originalSize: data.original_size,
    compressedSize: data.compressed_size,
  };
}
