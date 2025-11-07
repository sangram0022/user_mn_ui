// ⭐ SINGLE SOURCE OF TRUTH for React Query configuration
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - reduces duplicate requests
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime) - keeps data in memory
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: 'always', // Refetch when window regains focus for freshness
      refetchOnReconnect: true,
      // ✅ CRITICAL: React Query automatically deduplicates identical requests
      // When multiple components request the same queryKey simultaneously,
      // only ONE request is made and all components share the result.
      // This is built-in behavior - no additional config needed,
      // but staleTime ensures we don't request again too quickly.
    },
    mutations: {
      retry: 1,
    },
  },
});

// ⭐ SINGLE SOURCE OF TRUTH for query keys
export const queryKeys = {
  // Auth domain
  auth: {
    all: ['auth'] as const,
    csrfToken: () => [...queryKeys.auth.all, 'csrf-token'] as const,
  },
  
  // Profile domain
  profile: {
    all: ['profile'] as const,
    me: () => [...queryKeys.profile.all, 'me'] as const,
  },
  
  // Users domain
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: unknown) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  
  // RBAC domain
  rbac: {
    all: ['rbac'] as const,
    roles: {
      all: ['rbac', 'roles'] as const,
      lists: () => [...queryKeys.rbac.roles.all, 'list'] as const,
      list: (filters?: unknown) => [...queryKeys.rbac.roles.lists(), filters] as const,
      details: () => [...queryKeys.rbac.roles.all, 'detail'] as const,
      detail: (id: string) => [...queryKeys.rbac.roles.details(), id] as const,
      check: (userId: string, roleName: string) => [...queryKeys.rbac.roles.all, 'check', userId, roleName] as const,
    },
    permissions: {
      all: ['rbac', 'permissions'] as const,
      list: () => [...queryKeys.rbac.permissions.all, 'list'] as const,
    },
    cache: {
      all: ['rbac', 'cache'] as const,
      stats: () => [...queryKeys.rbac.cache.all, 'stats'] as const,
    },
  },
  
  // Admin domain
  admin: {
    all: ['admin'] as const,
    stats: {
      all: ['admin', 'stats'] as const,
    },
    analytics: {
      all: ['admin', 'analytics'] as const,
      stats: (params?: unknown) => [...queryKeys.admin.analytics.all, 'stats', params] as const,
      growth: (params?: unknown) => [...queryKeys.admin.analytics.all, 'growth', params] as const,
      weekly: () => [...queryKeys.admin.analytics.stats({ period: '7d', include_charts: true })] as const,
      monthly: () => [...queryKeys.admin.analytics.stats({ period: '30d', include_charts: true })] as const,
      quarterly: () => [...queryKeys.admin.analytics.stats({ period: '90d', include_charts: true })] as const,
    },
    auditLogs: (filters?: unknown) => [...queryKeys.admin.all, 'audit-logs', filters] as const,
  },
  
  // Audit domain
  audit: {
    all: ['audit'] as const,
    events: {
      all: ['audit', 'events'] as const,
      lists: () => [...queryKeys.audit.events.all, 'list'] as const,
      list: (filters?: unknown) => [...queryKeys.audit.events.lists(), filters] as const,
      details: () => [...queryKeys.audit.events.all, 'detail'] as const,
      detail: (id: string) => [...queryKeys.audit.events.details(), id] as const,
    },
  },
  
  // GDPR domain
  gdpr: {
    all: ['gdpr'] as const,
    exportStatus: (id: string) => [...queryKeys.gdpr.all, 'export', id] as const,
  },
  
  // Monitoring domain
  monitoring: {
    all: ['monitoring'] as const,
    health: {
      all: ['monitoring', 'health'] as const,
      basic: () => [...queryKeys.monitoring.health.all, 'basic'] as const,
      detailed: () => [...queryKeys.monitoring.health.all, 'detailed'] as const,
      db: () => [...queryKeys.monitoring.health.all, 'db'] as const,
      system: () => [...queryKeys.monitoring.health.all, 'system'] as const,
    },
    patterns: {
      all: ['monitoring', 'patterns'] as const,
      overview: () => [...queryKeys.monitoring.patterns.all, 'overview'] as const,
      circuits: () => [...queryKeys.monitoring.patterns.all, 'circuits'] as const,
      cache: () => [...queryKeys.monitoring.patterns.all, 'cache'] as const,
      events: () => [...queryKeys.monitoring.patterns.all, 'events'] as const,
      eventHistory: () => [...queryKeys.monitoring.patterns.all, 'event-history'] as const,
    },
    circuitBreaker: {
      all: ['monitoring', 'circuit-breaker'] as const,
      status: () => [...queryKeys.monitoring.circuitBreaker.all, 'status'] as const,
      metrics: () => [...queryKeys.monitoring.circuitBreaker.all, 'metrics'] as const,
    },
    metrics: {
      all: ['monitoring', 'metrics'] as const,
      business: () => [...queryKeys.monitoring.metrics.all, 'business'] as const,
      performance: () => [...queryKeys.monitoring.metrics.all, 'performance'] as const,
    },
  },
} as const;
