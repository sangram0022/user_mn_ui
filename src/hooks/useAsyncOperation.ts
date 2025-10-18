/**
 * Custom React Hook: useAsyncOperation
 *
 * Manages loading, error, and success states for async operations.
 * Reduces boilerplate code for common async patterns in components.
 *
 * React 19: No memoization needed - React Compiler handles optimization
 *
 * @example
 * ```tsx
 * const { execute, isLoading, error, clearError } = useAsyncOperation();
 *
 * const handleSubmit = async () => {
 *   await execute(async () => {
 *     await apiClient.createUser(formData);
 *   }, {
 *     onSuccess: () => logger.info('User created'),
 *     onError: (err) => logger.error(err)
 *   });
 * };
 * ```
 */

import { useState } from 'react';

export interface AsyncOperationOptions<T = void> {
  onSuccess?: (result: T) => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
  onFinally?: () => void | Promise<void>;
}

export interface UseAsyncOperationResult<T = void> {
  execute: (
    operation: () => Promise<T>,
    options?: AsyncOperationOptions<T>
  ) => Promise<T | undefined>;
  isLoading: boolean;
  error: Error | null;
  // Last successful result (exposed for tests convenience)
  data: T | null;
  clearError: () => void;
  reset: () => void;
}

/**
 * Hook for managing async operations with loading and error states
 */
export function useAsyncOperation<T = void>(): UseAsyncOperationResult<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const clearError = () => {
    setError(null);
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setData(null);
  };

  const execute = async (
    operation: () => Promise<T>,
    options?: AsyncOperationOptions<T>
  ): Promise<T | undefined> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await operation();
      setData(result as T);

      if (options?.onSuccess) {
        await options.onSuccess(result);
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Operation failed');
      setError(error);

      if (options?.onError) {
        await options.onError(error);
      }

      return undefined;
    } finally {
      setIsLoading(false);

      if (options?.onFinally) {
        await options.onFinally();
      }
    }
  };

  // Return the hook result
  return {
    execute,
    isLoading,
    error,
    data,
    clearError,
    reset,
  };
}

export default useAsyncOperation;
