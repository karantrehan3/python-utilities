import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';

interface UseApiCallReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: unknown[]) => Promise<T | undefined>;
  reset: () => void;
}

export function useApiCall<T>(
  apiFn: (...args: unknown[]) => Promise<T>,
  successMessage?: string,
): UseApiCallReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: unknown[]) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFn(...args);
        setData(result);
        if (successMessage) {
          notifications.show({ title: 'Success', message: successMessage, color: 'green' });
        }
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(message);
        notifications.show({ title: 'Error', message, color: 'red' });
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [apiFn, successMessage],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
}
