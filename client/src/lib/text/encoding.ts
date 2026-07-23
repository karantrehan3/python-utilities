export type Encoding = 'base64' | 'url' | 'html';

function utf8ToBase64(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function base64ToUtf8(input: string): string {
  const binary = atob(input.trim());
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function htmlEncode(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function htmlDecode(input: string): string {
  const doc = new DOMParser().parseFromString(input, 'text/html');
  return doc.documentElement.textContent ?? '';
}

export function encodeText(text: string, encoding: Encoding): string {
  switch (encoding) {
    case 'base64':
      return utf8ToBase64(text);
    case 'url':
      return encodeURIComponent(text);
    case 'html':
      return htmlEncode(text);
  }
}

export function decodeText(text: string, encoding: Encoding): string {
  switch (encoding) {
    case 'base64':
      return base64ToUtf8(text);
    case 'url':
      return decodeURIComponent(text.trim());
    case 'html':
      return htmlDecode(text);
  }
}
