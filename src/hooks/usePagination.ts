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

import { useState, useCallback, useMemo } from 'react';

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
  initialTotal?: number;
}

export interface UsePaginationResult {
  // Current state
  page: number;
  pageSize: number;
  total: number;
  skip: number;
  limit: number;
  
  // Computed values
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // Actions
  setPage: (page: number) => void;
  setTotal: (total: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  reset: () => void;
}

/**
 * Hook for managing pagination state
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationResult {
  const {
    initialPage = 0,
    pageSize: initialPageSize = 25,
    initialTotal = 0
  } = options;

  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [total, setTotal] = useState(initialTotal);

  // Computed values
  const skip = useMemo(() => page * pageSize, [page, pageSize]);
  const limit = pageSize;
  const totalPages = useMemo(() => Math.ceil(total / pageSize) || 1, [total, pageSize]);
  const hasNextPage = useMemo(() => page < totalPages - 1, [page, totalPages]);
  const hasPreviousPage = useMemo(() => page > 0, [page]);

  // Actions
  const setPage = useCallback((newPage: number) => {
    setPageState(Math.max(0, newPage));
  }, []);

  const setPageSize = useCallback((newPageSize: number) => {
    setPageSizeState(newPageSize);
    setPageState(0); // Reset to first page when page size changes
  }, []);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPageState(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPageState(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const reset = useCallback(() => {
    setPageState(initialPage);
    setPageSizeState(initialPageSize);
    setTotal(initialTotal);
  }, [initialPage, initialPageSize, initialTotal]);

  return {
    page,
    pageSize,
    total,
    skip,
    limit,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    setPage,
    setTotal,
    setPageSize,
    nextPage,
    previousPage,
    reset
  };
}

export default usePagination;
