// Absolute API origin for cross-origin deployments (UI and API on different
// hosts). Set VITE_API_BASE_URL at build time, e.g. https://kiln-api.onrender.com.
// Unset → same-origin relative path (works behind an nginx /api proxy).
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const BASE_URL = `${API_ORIGIN}/api/v1`;

export async function apiPost(path: string, body: FormData): Promise<Response> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    body,
  });
  return response;
}

export async function apiPostJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function downloadFile(path: string, body: FormData, filename: string): Promise<void> {
  const response = await apiPost(path, body);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `Request failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
