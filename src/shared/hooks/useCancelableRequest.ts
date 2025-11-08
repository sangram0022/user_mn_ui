/**
 * useCancelableRequest Hook
 * 
 * Provides AbortController for request cancellation on component unmount.
 * Prevents memory leaks and "Can't perform a React state update on an unmounted component" warnings.
 * 
 * @example
 * ```tsx
 * function UserList() {
 *   const { signal, cleanup } = useCancelableRequest();
 *   const [users, setUsers] = useState([]);
 * 
 *   useEffect(() => {
 *     async function fetchUsers() {
 *       try {
 *         const data = await apiClient.get('/users', { signal });
 *         setUsers(data);
 *       } catch (error) {
 *         if (error.name !== 'AbortError') {
 *           // Handle actual errors, ignore abort errors
 *         }
 *       }
 *     }
 *     fetchUsers();
 *     return cleanup; // Cleanup on unmount
 *   }, [signal, cleanup]);
 * }
 * ```
 */

import { useEffect, useRef } from 'react';
import { logger } from '@/core/logging';

interface UseCancelableRequestReturn {
  /**
   * AbortSignal to pass to API requests
   */
  signal: AbortSignal;
  
  /**
   * Cleanup function to abort ongoing requests
   * Call this in useEffect cleanup or manually
   */
  cleanup: () => void;
  
  /**
   * Check if the request was aborted
   */
  isAborted: () => boolean;
}

/**
 * Hook for cancelable API requests
 * Automatically aborts requests on component unmount
 */
export function useCancelableRequest(): UseCancelableRequestReturn {
  const controllerRef = useRef<AbortController | null>(null);

  // Initialize AbortController
  if (!controllerRef.current) {
    controllerRef.current = new AbortController();
  }

  const cleanup = () => {
    if (controllerRef.current && !controllerRef.current.signal.aborted) {
      logger().debug('Aborting request due to component unmount or cleanup', {
        context: 'useCancelableRequest.cleanup',
      });
      controllerRef.current.abort();
    }
  };

  const isAborted = () => {
    return controllerRef.current?.signal.aborted ?? false;
  };

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  return {
    signal: controllerRef.current.signal,
    cleanup,
    isAborted,
  };
}

/**
 * Utility: Check if error is an AbortError
 * Use this to filter out abort errors in catch blocks
 */
export function isAbortError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' || error.name === 'CanceledError')
  );
}

/**
 * Utility: Wrap async function with abort handling
 * Automatically ignores abort errors
 */
export async function withAbortHandling<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  signal: AbortSignal
): Promise<T | null> {
  try {
    return await fn(signal);
  } catch (error) {
    if (isAbortError(error)) {
      // Request was aborted, return null instead of throwing
      logger().debug('Request aborted', {
        context: 'withAbortHandling',
      });
      return null;
    }
    // Re-throw actual errors
    throw error;
  }
}

export default useCancelableRequest;
