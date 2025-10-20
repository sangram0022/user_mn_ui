import { mapApiErrorToMessage } from '@shared/utils/errorMapper';
import { useState } from 'react';
import { useToast } from './useToast';

/**
 * Custom hook for API calls with built-in error handling and loading states
 *
 * Features:
 * - Automatic loading state management
 * - Built-in error handling with error mapper
 * - Optional toast notifications
 * - Success/error callbacks
 * - TypeScript generics for type safety
 *
 * @example
 * ```typescript
 * const { loading, error, execute } = useApiCall<User[]>();
 *
 * const loadUsers = async () => {
 *   const users = await execute(
 *     () => apiClient.getUsers(),
 *     {
 *       onSuccess: (data) => setUsers(data),
 *       showErrorToast: true,
 *     }
 *   );
 * };
 * ```
 */
export function useApiCall<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Execute an API call with automatic error handling
   *
   * @param apiCall - Function that returns a Promise (e.g., () => apiClient.getUsers())
   * @param options - Configuration options
   * @param options.onSuccess - Callback executed on success
   * @param options.onError - Callback executed on error
   * @param options.showErrorToast - Whether to show error toast (default: true)
   * @param options.showSuccessToast - Whether to show success toast (default: false)
   * @param options.successMessage - Custom success message for toast
   * @returns The API response data or null if error occurred
   */
  const execute = async (
    apiCall: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void;
      onError?: (error: string) => void;
      showErrorToast?: boolean;
      showSuccessToast?: boolean;
      successMessage?: string;
    }
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiCall();

      // Execute success callback
      options?.onSuccess?.(data);

      // Show success toast if requested
      if (options?.showSuccessToast) {
        const message = options.successMessage || 'Operation completed successfully';
        toast.success(message);
      }

      return data;
    } catch (err) {
      // Map the error to a user-friendly message
      const errorMessage = mapApiErrorToMessage(err as unknown);
      setError(errorMessage);

      // Show error toast (default: true)
      if (options?.showErrorToast !== false) {
        toast.error(errorMessage);
      }

      // Execute error callback
      options?.onError?.(errorMessage);

      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset error state manually
   */
  const clearError = () => setError(null);

  return {
    loading,
    error,
    execute,
    clearError,
  };
}

/**
 * Hook for API calls that return paginated data
 *
 * @example
 * ```typescript
 * const { loading, error, data, page, setPage, totalPages } = usePaginatedApiCall<User>();
 *
 * useEffect(() => {
 *   loadPage(page);
 * }, [page]);
 *
 * const loadPage = async (pageNum: number) => {
 *   const response = await execute(
 *     () => apiClient.getUsers({ page: pageNum, page_size: 10 })
 *   );
 *   if (response) {
 *     setData(response.items);
 *     setTotalPages(response.total_pages);
 *   }
 * };
 * ```
 */
export function usePaginatedApiCall<T>() {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [data, setData] = useState<T[]>([]);
  const { loading, error, execute, clearError } = useApiCall<{
    items: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  }>();

  const loadPage = async (
    apiCall: () => Promise<{
      items: T[];
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
    }>,
    options?: {
      showErrorToast?: boolean;
    }
  ): Promise<boolean> => {
    const response = await execute(apiCall, options);
    if (response) {
      setData(response.items);
      setTotalPages(response.total_pages);
      return true;
    }
    return false;
  };

  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum);
    }
  };

  return {
    loading,
    error,
    data,
    page,
    totalPages,
    setPage,
    nextPage,
    prevPage,
    goToPage,
    loadPage,
    clearError,
  };
}
