const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/**
 * Format a byte count into a human-readable string (e.g. "1.5 MB").
 * Single source of truth — do not re-implement per component.
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTE_UNITS.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${BYTE_UNITS[i]}`;
}
