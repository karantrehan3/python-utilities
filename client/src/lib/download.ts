/** Decode a base64 string into a Blob of the given MIME type. */
export function blobFromBase64(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

/**
 * Trigger a browser download for a Blob under the given filename.
 * Centralises the anchor/objectURL dance so components don't repeat it.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Build an output filename that preserves the original base name and appends a
 * suffix, e.g. withSuffix('report.pdf', 'compressed') => 'report_compressed.pdf'.
 * Pass `ext` to change the extension (e.g. 'zip' for archive outputs).
 */
export function withSuffix(originalName: string, suffix: string, ext?: string): string {
  const dot = originalName.lastIndexOf('.');
  const base = dot > 0 ? originalName.slice(0, dot) : originalName;
  const extension = ext ?? (dot > 0 ? originalName.slice(dot + 1) : 'pdf');
  return `${base}_${suffix}.${extension}`;
}

/**
 * Read the server-supplied download filename from a response's
 * Content-Disposition header, falling back when it is absent/unparseable.
 * Handles both RFC 5987 `filename*=UTF-8''…` and plain `filename="…"`.
 */
export function filenameFromResponse(response: Response, fallback: string): string {
  const header = response.headers.get('Content-Disposition');
  if (!header) return fallback;

  const extended = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(header);
  if (extended?.[1]) {
    try {
      return decodeURIComponent(extended[1].replace(/["']/g, '').trim());
    } catch {
      // fall through to the plain form
    }
  }

  const plain = /filename="?([^";]+)"?/i.exec(header);
  if (plain?.[1]) return plain[1].trim();

  return fallback;
}
