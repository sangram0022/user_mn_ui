// ========================================
// Query Keys Factory - SINGLE SOURCE OF TRUTH
// ========================================
// 
// Centralized query key definitions for TanStack Query
// Follows TanStack Query best practices for key structure
// 
// Key Structure Pattern:
// [domain, action, ...filters/params]
// 
// Examples:
// - ['users'] - All users
// - ['users', 'list', { status: 'active' }] - Filtered users
// - ['users', 'detail', '123'] - Specific user
// - ['users', 'detail', '123', 'roles'] - User's roles
// 
// Benefits:
// - Type-safe query keys
// - Easy cache invalidation
// - Clear data dependencies
// - Consistent structure
// 
// Usage:
//   import { queryKeys } from '@/services/api/queryKeys';
//   
//   useQuery({
//     queryKey: queryKeys.users.list({ status: 'active' }),
//     queryFn: fetchUsers,
//   });
// 
// @see https://tanstack.com/query/latest/docs/framework/react/guides/query-keys
// ========================================

// ========================================
// Types
// ========================================

export type QueryKeyFactory<T = unknown> = {
  all: readonly unknown[];
  lists: () => readonly unknown[];
  list: (filters?: T) => readonly unknown[];
  details: () => readonly unknown[];
  detail: (id: string | number) => readonly unknown[];
};

export interface UserFilters {
  status?: 'active' | 'inactive' | 'pending';
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface RoleFilters {
  search?: string;
  page?: number;
  limit?: number;
}

// ========================================
// Query Keys Factory
// ========================================

/**
 * Centralized query keys for all API queries
 * Single source of truth for cache keys
 */
export const queryKeys = {
  // ========================================
  // Users Domain
  // ========================================
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: UserFilters) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.users.details(), id] as const,
    profile: () => [...queryKeys.users.all, 'profile'] as const,
    pendingApprovals: () => [...queryKeys.users.lists(), { status: 'pending' }] as const,
    roles: (userId: string | number) => [...queryKeys.users.detail(userId), 'roles'] as const,
    permissions: (userId: string | number) => [...queryKeys.users.detail(userId), 'permissions'] as const,
    activity: (userId: string | number) => [...queryKeys.users.detail(userId), 'activity'] as const,
  },

  // ========================================
  // Auth Domain
  // ========================================
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    csrfToken: () => [...queryKeys.auth.all, 'csrf-token'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
    permissions: () => [...queryKeys.auth.all, 'permissions'] as const,
  },

  // ========================================
  // Roles Domain
  // ========================================
  roles: {
    all: ['roles'] as const,
    lists: () => [...queryKeys.roles.all, 'list'] as const,
    list: (filters?: RoleFilters) => [...queryKeys.roles.lists(), filters] as const,
    details: () => [...queryKeys.roles.all, 'detail'] as const,
    detail: (name: string) => [...queryKeys.roles.details(), name] as const,
    permissions: (name: string) => [...queryKeys.roles.detail(name), 'permissions'] as const,
  },

  // ========================================
  // Audit Logs Domain
  // ========================================
  auditLogs: {
    all: ['audit-logs'] as const,
    lists: () => [...queryKeys.auditLogs.all, 'list'] as const,
    list: (filters?: AuditLogFilters) => [...queryKeys.auditLogs.lists(), filters] as const,
    details: () => [...queryKeys.auditLogs.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.auditLogs.details(), id] as const,
    stats: () => [...queryKeys.auditLogs.all, 'stats'] as const,
  },

  // ========================================
  // Dashboard Domain
  // ========================================
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    userStats: () => [...queryKeys.dashboard.stats(), 'users'] as const,
    activityStats: () => [...queryKeys.dashboard.stats(), 'activity'] as const,
    recentActivity: () => [...queryKeys.dashboard.all, 'recent-activity'] as const,
  },

  // ========================================
  // Reports Domain
  // ========================================
  reports: {
    all: ['reports'] as const,
    lists: () => [...queryKeys.reports.all, 'list'] as const,
    list: (filters?: { type?: string; startDate?: string; endDate?: string }) => 
      [...queryKeys.reports.lists(), filters] as const,
    detail: (id: string | number) => [...queryKeys.reports.all, 'detail', id] as const,
  },

  // ========================================
  // Health Check
  // ========================================
  health: {
    all: ['health'] as const,
    check: () => [...queryKeys.health.all, 'check'] as const,
    api: () => [...queryKeys.health.all, 'api'] as const,
    database: () => [...queryKeys.health.all, 'database'] as const,
  },
} as const;

// ========================================
// Cache Invalidation Helpers
// ========================================

/**
 * Helper functions for cache invalidation
 * Use these to invalidate related queries
 */
export const invalidationHelpers = {
  /**
   * Invalidate all user-related queries
   */
  invalidateUsers: () => queryKeys.users.all,

  /**
   * Invalidate all queries for a specific user
   */
  invalidateUser: (userId: string | number) => queryKeys.users.detail(userId),

  /**
   * Invalidate user lists (affects all filtered lists)
   */
  invalidateUserLists: () => queryKeys.users.lists(),

  /**
   * Invalidate all role-related queries
   */
  invalidateRoles: () => queryKeys.roles.all,

  /**
   * Invalidate specific role
   */
  invalidateRole: (roleName: string) => queryKeys.roles.detail(roleName),

  /**
   * Invalidate all audit log queries
   */
  invalidateAuditLogs: () => queryKeys.auditLogs.all,

  /**
   * Invalidate dashboard stats
   */
  invalidateDashboard: () => queryKeys.dashboard.all,

  /**
   * Invalidate auth session
   */
  invalidateAuth: () => queryKeys.auth.all,
} as const;

// ========================================
// Query Key Utilities
// ========================================

/**
 * Check if a query key matches a pattern
 * Useful for selective cache invalidation
 * 
 * Example:
 *   isQueryKeyMatching(
 *     ['users', 'detail', '123'],
 *     ['users', 'detail']
 *   ) // true
 */
export function isQueryKeyMatching(
  queryKey: readonly unknown[],
  pattern: readonly unknown[]
): boolean {
  if (pattern.length > queryKey.length) return false;
  return pattern.every((value, index) => queryKey[index] === value);
}

/**
 * Extract filters from query key
 * 
 * Example:
 *   extractFilters(['users', 'list', { status: 'active' }])
 *   // Returns: { status: 'active' }
 */
export function extractFilters<T = unknown>(queryKey: readonly unknown[]): T | undefined {
  const lastItem = queryKey[queryKey.length - 1];
  if (typeof lastItem === 'object' && lastItem !== null) {
    return lastItem as T;
  }
  return undefined;
}

// ========================================
// Export Types
// ========================================

export type QueryKeys = typeof queryKeys;
export type InvalidationHelpers = typeof invalidationHelpers;

// ========================================
// Default Export
// ========================================

export default queryKeys;
