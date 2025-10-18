/**
 * Custom Hook: useApi
 * Generic hook for API calls with loading and error states
 *
 * React 19: No memoization needed - React Compiler handles optimization
 * StrictMode Protected: Uses refs for callbacks and AbortController for cleanup
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

  // StrictMode Protection: Use refs to track component state and requests
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const autoFetchExecutedRef = useRef(false); // Prevent auto-fetch from running twice in StrictMode

  // StrictMode Fix: Store callbacks in refs to prevent unstable dependencies
  const apiCallRef = useRef(apiCall);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  // Keep refs up to date without triggering re-renders
  useEffect(() => {
    apiCallRef.current = apiCall;
  }, [apiCall]);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, []);

  const execute = useCallback(async () => {
    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      // Use ref to get latest apiCall without adding to deps
      const result = await apiCallRef.current();

      if (isMountedRef.current) {
        setData(result);
        onSuccessRef.current?.(result);
      }

      return result;
    } catch (err: unknown) {
      // Ignore abort errors - they're intentional
      if (isMountedRef.current && (err as { name?: string }).name !== 'AbortError') {
        const apiError = (err as { error?: ApiError }).error || {
          error_code: 'UNKNOWN_ERROR',
          message: (err as Error).message || 'An unexpected error occurred',
          details: { data: [] },
        };
        setError(apiError);
        onErrorRef.current?.(apiError);
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []); // Empty deps - execute is now stable, uses refs internally

  // StrictMode Fix: Use ref guard to prevent auto-fetch from running twice
  useEffect(() => {
    if (autoFetch && !autoFetchExecutedRef.current) {
      autoFetchExecutedRef.current = true;
      execute();
    }
  }, [autoFetch, execute, ...(deps || [])]); // Conditional spread is safe here

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
