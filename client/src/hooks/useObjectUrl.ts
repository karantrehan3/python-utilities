import { useEffect, useState } from 'react';

/**
 * Create an object URL for a File/Blob and revoke it automatically when the
 * source changes or the component unmounts. Prevents the leaks that arise from
 * calling URL.createObjectURL in useMemo/render.
 */
export function useObjectUrl(source: Blob | File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!source) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(source);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [source]);

  return url;
}
