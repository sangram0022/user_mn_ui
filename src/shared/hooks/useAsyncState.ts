/**
 * Hook for managing common async operation state (loading, error, data)
 * Consolidates repeated patterns across the codebase
 *
 * React 19 Migration: All memoization removed - React Compiler handles optimization
 */

import { useState } from 'react';

export interface AsyncState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface AsyncOperationOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for managing common async operation state (loading, error, data)
 * Consolidates repeated patterns across the codebase
 */
export function useAsyncState<T = unknown>(
  initialData: T | null = null
): [
  AsyncState<T>,
  {
    setLoading: (loading: boolean) => void;
    setData: (data: T | null) => void;
    setError: (error: Error | null) => void;
    reset: () => void;
    execute: <U>(asyncFn: () => Promise<U>, options?: AsyncOperationOptions) => Promise<void>;
  },
] {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  // Convert all useCallback to plain functions
  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  };

  const setData = (data: T | null) => {
    setState((prev) => ({ ...prev, data, error: null }));
  };

  const setError = (error: Error | null) => {
    setState((prev) => ({ ...prev, error, loading: false }));
  };

  const reset = () => {
    setState({
      data: initialData,
      loading: false,
      error: null,
    });
  };

  const execute = async <U>(
    asyncFn: () => Promise<U>,
    options?: AsyncOperationOptions
  ): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const result = await asyncFn();
      setState((prev) => ({
        ...prev,
        data: result as T,
        loading: false,
        error: null,
      }));
      options?.onSuccess?.(result);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState((prev) => ({ ...prev, error: err, loading: false }));
      options?.onError?.(err);
    }
  };

  return [state, { setLoading, setData, setError, reset, execute }];
}

/**
 * Simplified version for basic loading/error states without data
 */
export function useAsyncOperation(): [
  { loading: boolean; error: Error | null },
  {
    execute: <T>(asyncFn: () => Promise<T>, options?: AsyncOperationOptions) => Promise<void>;
    setError: (error: Error | null) => void;
    reset: () => void;
  },
] {
  const [{ loading, error }, { setLoading, setError, reset }] = useAsyncState();

  // Convert useCallback to plain function
  const execute = async <T>(
    asyncFn: () => Promise<T>,
    options?: AsyncOperationOptions
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      setLoading(false);
      options?.onSuccess?.(result);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setError(err);
      setLoading(false);
      options?.onError?.(err);
    }
  };

  return [
    { loading, error },
    { execute, setError, reset },
  ];
}
