/**
 * Custom React Hook: usePagination
 *
 * Manages pagination state and provides helper functions for
 * navigating through paginated data.
 *
 * @example
 * ```tsx
 * const pagination = usePagination({ pageSize: 20 });
 *
 * // Fetch data
 * const data = await apiClient.getUsers({ *   skip: pagination.skip,
 *   limit: pagination.limit
 * });
 *
 * // Update total
 * pagination.setTotal(data.total);
 *
 * // Navigate
 * <button onClick={pagination.nextPage}>Next</button>
 * ```
 */

import { useCallback, useMemo, useState } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  totalItems?: number;
}

export const usePagination = (options: UsePaginationOptions = {}) => {
  const { initialPage = 1, initialLimit = 10, totalItems = 0 } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(totalItems);

  const totalPages = useMemo(() => {
    return Math.ceil(total / limit);
  }, [total, limit]);

  const hasNext = useMemo(() => {
    return page < totalPages;
  }, [page, totalPages]);

  const hasPrev = useMemo(() => {
    return page > 1;
  }, [page]);

  const offset = useMemo(() => {
    return (page - 1) * limit;
  }, [page, limit]);

  const nextPage = useCallback(() => {
    if (hasNext) {
      setPage((p: number) => p + 1);
    }
  }, [hasNext]);

  const prevPage = useCallback(() => {
    if (hasPrev) {
      setPage((p: number) => p - 1);
    }
  }, [hasPrev]);

  const goToPage = useCallback(
    (pageNumber: number) => {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        setPage(pageNumber);
      }
    },
    [totalPages]
  );

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  }, []);

  const updateTotal = useCallback((newTotal: number) => {
    setTotal(newTotal);
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
  }, [initialPage, initialLimit]);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
    offset,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    updateTotal,
    reset,
    paginationParams: {
      page,
      limit,
    },
  };
};

export default usePagination;
