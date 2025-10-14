/**
 * Custom React Hook: usePagination
 *
 * Manages pagination state and provides helper functions for
 * navigating through paginated data.
 *
 * React 19: No memoization needed - React Compiler handles optimization
 *
 * @example
 * ```tsx
 * const pagination = usePagination({ pageSize: 20 });
 *
 * // Fetch data
 * const data = await apiClient.getUsers({
 *   skip: pagination.skip,
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

import { useState } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number; // legacy
  totalItems?: number; // legacy
  initialTotal?: number;
  pageSize?: number;
}

export const usePagination = (options: UsePaginationOptions = {}) => {
  const { initialPage = 1, initialLimit = 10, totalItems = 0, initialTotal, pageSize } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(pageSize ?? initialLimit);
  const [total, setTotal] = useState(initialTotal ?? totalItems);

  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  const offset = (page - 1) * limit;

  const nextPage = () => {
    if (hasNext) {
      setPage((p: number) => p + 1);
    }
  };

  const prevPage = () => {
    if (hasPrev) {
      setPage((p: number) => p - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  };

  const changeLimit = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  };

  const updateTotal = (newTotal: number) => {
    setTotal(newTotal);
  };

  const reset = () => {
    setPage(initialPage);
    setLimit(initialLimit);
  };

  return {
    page,
    pageSize: limit,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
    offset,
    skip: offset,
    nextPage,
    prevPage,
    previousPage: prevPage,
    goToPage,
    setPage,
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
