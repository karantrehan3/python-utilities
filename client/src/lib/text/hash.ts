export type HashAlgorithm = 'md5' | 'sha1' | 'sha224' | 'sha256' | 'sha384' | 'sha512';

/**
 * Hash text in the browser. Uses hash-wasm (dynamically imported) so MD5 and
 * SHA-224 — which the Web Crypto API doesn't provide — are supported uniformly.
 */
export async function hashText(text: string, algorithm: HashAlgorithm): Promise<string> {
  const wasm = await import('hash-wasm');
  const fns: Record<HashAlgorithm, (input: string) => Promise<string>> = {
    md5: wasm.md5,
    sha1: wasm.sha1,
    sha224: wasm.sha224,
    sha256: wasm.sha256,
    sha384: wasm.sha384,
    sha512: wasm.sha512,
  };
  return fns[algorithm](text);
}
