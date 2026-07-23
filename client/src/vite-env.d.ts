/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute API origin for cross-origin deploys, e.g. https://kiln-api.onrender.com.
   *  Leave unset to call a same-origin relative path. */
  readonly VITE_API_BASE_URL?: string;
  /** Dev-only: proxy target used by vite.config.ts. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
