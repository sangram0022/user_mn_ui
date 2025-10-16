/**
 * Infinite Scroll Integration Examples
 *
 * This file demonstrates various ways to integrate infinite scrolling
 * into the application for progressive data loading.
 */

import { useInfiniteScroll } from '@hooks/useInfiniteScroll';
import { SkeletonList } from '@shared/components/ui/Skeleton';
import { useCallback, useEffect, useState } from 'react';
import type { OptimisticUser } from '../hooks/useOptimisticUserManagement';

/**
 * Example 1: Basic Infinite Scroll for User List
 *
 * Loads users progressively as the user scrolls down
 */
export function InfiniteUserList() {
  const [users, setUsers] = useState<OptimisticUser[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load more users function - useCallback ensures stable reference for useEffect
  const loadMore = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Replace with actual API call
      const response = await fetch(`/api/users?page=${page}&limit=20`);
      const data = await response.json();

      setUsers((prev) => [...prev, ...data.users]);
      setPage((prev) => prev + 1);
      setHasMore(data.users.length > 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, page]);

  // Initialize infinite scroll
  const { sentinelRef, loadMore: triggerLoad } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
    rootMargin: '200px', // Start loading 200px before reaching bottom
  });

  // Load initial data - loadMore is stable due to useCallback
  useEffect(() => {
    loadMore();
  }, [loadMore]);

  return (
    <div className="space-y-4">
      {/* User list */}
      <div className="divide-y divide-gray-200">
        {users.map((user) => (
          <div key={user.id} className="py-4">
            <h3 className="font-medium text-gray-900">{user.full_name || user.email}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        ))}
      </div>

      {/* Loading indicator at bottom */}
      {hasMore && (
        <div ref={sentinelRef} className="py-4">
          {isLoading ? (
            <SkeletonList items={3} />
          ) : (
            <div className="text-center text-gray-500">Scroll to load more...</div>
          )}
        </div>
      )}

      {/* Error state with retry */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={triggerLoad}
            className="mt-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* End of list */}
      {!hasMore && users.length > 0 && (
        <div className="py-4 text-center text-gray-500">You've reached the end of the list</div>
      )}
    </div>
  );
}

/**
 * Example 2: Infinite Scroll with Search/Filters
 *
 * Combines infinite scroll with search and filter capabilities
 */
interface InfiniteUserListWithFiltersProps {
  searchTerm: string;
  roleFilter: string;
  statusFilter?: boolean;
}

export function InfiniteUserListWithFilters({
  searchTerm,
  roleFilter,
  statusFilter,
}: InfiniteUserListWithFiltersProps) {
  const [users, setUsers] = useState<OptimisticUser[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter !== undefined && { is_active: String(statusFilter) }),
      });

      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();

      setUsers((prev) => [...prev, ...data.users]);
      setPage((prev) => prev + 1);
      setHasMore(data.users.length > 0);
    } finally {
      setIsLoading(false);
    }
  };

  const { sentinelRef, reset } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
    rootMargin: '100px',
  });

  // Reset when filters change
  useEffect(() => {
    setUsers([]);
    setPage(1);
    setHasMore(true);
    reset();
  }, [searchTerm, roleFilter, statusFilter, reset]);

  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>User: {user.email}</div>
      ))}
      {hasMore && <div ref={sentinelRef}>{isLoading && <SkeletonList items={3} />}</div>}
    </div>
  );
}

/**
 * Example 3: Integration with UserManagementPage
 *
 * Shows how to modify the existing UserManagementPage to use infinite scroll
 */
export const INTEGRATION_GUIDE = `
/**
 * Step-by-step guide to add infinite scroll to UserManagementPage.tsx
 */

// 1. Add import at the top
import { useInfiniteScroll } from '@hooks/useInfiniteScroll';
import { SkeletonTable } from '@shared/components/ui/Skeleton';

// 2. Replace pagination state with infinite scroll state
// REMOVE:
const [pagination, setPagination] = useState({ skip: 0, limit: 20, total: 0, hasMore: false });

// ADD:
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

// 3. Modify fetchUsers to append instead of replace
const fetchUsers = async (pageNum = 1, append = false) => {
  setIsLoading(true);
  try {
    const response = await apiClient.get(\`/users?page=\${pageNum}&limit=20\`);
    const newUsers = response.data.users;
    
    if (append) {
      setUsers(prev => [...prev, ...newUsers]);
    } else {
      setUsers(newUsers);
    }
    
    setHasMore(newUsers.length === 20); // Has more if we got a full page
    setPage(pageNum + 1);
  } finally {
    setIsLoading(false);
  }
};

// 4. Add infinite scroll hook
const { sentinelRef } = useInfiniteScroll({
  onLoadMore: () => fetchUsers(page, true),
  hasMore,
  isLoading,
  rootMargin: '200px',
});

// 5. Update JSX - replace pagination controls with sentinel
// REMOVE pagination buttons at the bottom

// ADD sentinel div after the table
<div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
  <table className="w-full">
    <thead>{/* ...existing header... */}</thead>
    <tbody>
      {users.map((user, index) => (
        <tr key={user.id}>{/* ...existing row... */}</tr>
      ))}
    </tbody>
  </table>
  
  {/* Infinite scroll sentinel */}
  {hasMore && (
    <div ref={sentinelRef} className="p-4">
      {isLoading ? (
        <SkeletonTable rows={3} columns={5} />
      ) : (
        <div className="text-center text-gray-500">Loading more...</div>
      )}
    </div>
  )}
</div>

// 6. Benefits:
// - No pagination buttons needed
// - Smooth continuous scrolling
// - Better mobile UX
// - Automatic loading
// - Shows skeleton loaders
`;

/**
 * Example 4: Infinite Scroll with Virtual Scrolling (Advanced)
 *
 * Combines infinite scroll for loading data with virtual scrolling for rendering
 * Best for extremely large datasets (100,000+ items)
 */
export function InfiniteVirtualUserList() {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users?page=${page}&limit=50`);
      const data = await response.json();

      // Process data here - would combine with virtual scroll
      setPage((prev) => prev + 1);
      setHasMore(data.users.length === 50);
    } finally {
      setIsLoading(false);
    }
  };

  // Infinite scroll for loading
  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
  });

  // Virtual scrolling for rendering (import from useVirtualScroll hook)
  // const { virtualItems, totalHeight, containerRef } = useVirtualScroll({
  //   items: allUsers,
  //   itemHeight: 80,
  //   containerHeight: 600,
  // });

  return (
    <div>
      {/* Virtual scroll container */}
      {/* Render virtualItems.map() here */}

      {/* Sentinel at bottom for infinite loading */}
      {hasMore && <div ref={sentinelRef}>{isLoading && <SkeletonList items={3} />}</div>}
    </div>
  );
}

/**
 * Example 5: Optimistic Updates + Infinite Scroll
 *
 * Combines optimistic updates with infinite scroll for best UX
 */
export function OptimisticInfiniteUserList() {
  const [users, setUsers] = useState<OptimisticUser[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users?page=${page}&limit=20`);
      const data = await response.json();

      setUsers((prev) => [...prev, ...data.users]);
      setPage((prev) => prev + 1);
      setHasMore(data.users.length > 0);
    } finally {
      setIsLoading(false);
    }
  };

  // Optimistic delete
  const deleteUser = async (userId: string) => {
    // Optimistically remove from UI
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    try {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      // Success - already removed
    } catch (err) {
      // Rollback on error
      await loadMore(); // Reload data
      console.error('Delete failed:', err);
    }
  };

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
  });

  return (
    <div>
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between p-4">
          <span>{user.email}</span>
          <button
            onClick={() => deleteUser(user.id)}
            className="rounded bg-red-500 px-3 py-1 text-white"
          >
            Delete
          </button>
        </div>
      ))}

      {hasMore && <div ref={sentinelRef}>{isLoading && <div>Loading more...</div>}</div>}
    </div>
  );
}
