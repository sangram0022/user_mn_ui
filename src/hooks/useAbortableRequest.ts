/**
 * Abortable Request Hook
 * Provides automatic request cancellation to prevent memory leaks
 * when components unmount during async operations
 */

import { useEffect, useRef } from 'react';

interface UseAbortableRequestReturn<T> {
  execute: () => Promise<T>;
  abort: () => void;
}

/**
 * Hook for executing abortable async requests
 * @param requestFn - Function that accepts AbortSignal and returns a Promise
 * @returns Object with execute and abort methods
 *
 * @example
 * ```tsx
 * const { execute, abort } = useAbortableRequest(async (signal) => {
 *   const response = await fetch('/api/users', { signal });
 *   return response.json();
 * });
 *
 * useEffect(() => {
 *   execute().then(setUsers).catch(handleError);
 * }, []);
 * ```
 */
export const useAbortableRequest = <T>(
  requestFn: (signal: AbortSignal) => Promise<T>
): UseAbortableRequestReturn<T> => {
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  // Cleanup on unmount
  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
    },
    []
  );

  const execute = async (): Promise<T> => {
    // Abort any pending request
    abortControllerRef.current?.abort();

    // Create new controller
    abortControllerRef.current = new AbortController();

    return requestFn(abortControllerRef.current.signal);
  };

  const abort = () => {
    abortControllerRef.current?.abort();
  };

  return { execute, abort };
};

export default useAbortableRequest;
