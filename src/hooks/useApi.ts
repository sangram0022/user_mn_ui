/**
 * Custom Hook: useApi
 * Generic hook for API calls with loading and error states
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../types/api.types';

interface UseApiOptions<T> {
  autoFetch?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  deps?: React.DependencyList;
}

/**
 * Generic hook for making API calls with automatic loading and error management
 * @param apiCall Function that returns a promise with the API response
 * @param options Configuration options
 */
export function useApi<T>(apiCall: () => Promise<T>, options: UseApiOptions<T> = {}) {
  const { autoFetch = false, onSuccess, onError, deps = [] } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<ApiError | null>(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const execute = useCallback(async () => {
    // Abort previous request if exists
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();

      if (isMountedRef.current) {
        setData(result);
        onSuccess?.(result);
      }

      return result;
    } catch (err: unknown) {
      if (isMountedRef.current && (err as { name?: string }).name !== 'AbortError') {
        const apiError = (err as { error?: ApiError }).error || {
          error_code: 'UNKNOWN_ERROR',
          message: (err as Error).message || 'An unexpected error occurred',
          details: { data: [] },
        };
        setError(apiError);
        onError?.(apiError);
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiCall, onSuccess, onError]);

  useEffect(() => {
    if (autoFetch) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    reset,
    isSuccess: !loading && !error && data !== null,
    isError: !loading && error !== null,
  };
}
