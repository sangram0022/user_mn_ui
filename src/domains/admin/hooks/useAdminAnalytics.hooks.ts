/**
 * Admin Analytics Hooks
 * React Query hooks for dashboard statistics and growth analytics
 * Extends existing useAdminStats.hooks.ts
 */

import { useQuery } from '@tanstack/react-query';
import { adminAnalyticsService } from '../services';
import type {
  AdminStatsParams,
  GrowthAnalyticsParams,
} from '../types';

// ============================================================================
// Query Keys
// ============================================================================

export const adminAnalyticsKeys = {
  all: ['admin', 'analytics'] as const,
  stats: (params?: AdminStatsParams) => [...adminAnalyticsKeys.all, 'stats', params] as const,
  growth: (params?: GrowthAnalyticsParams) => [...adminAnalyticsKeys.all, 'growth', params] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch comprehensive dashboard statistics
 */
export const useAdminStats = (params?: AdminStatsParams) => {
  return useQuery({
    queryKey: adminAnalyticsKeys.stats(params),
    queryFn: () => adminAnalyticsService.getAdminStats(params),
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};

/**
 * Fetch user growth analytics with predictions
 */
export const useGrowthAnalytics = (params?: GrowthAnalyticsParams) => {
  return useQuery({
    queryKey: adminAnalyticsKeys.growth(params),
    queryFn: () => adminAnalyticsService.getGrowthAnalytics(params),
    staleTime: 300000, // 5 minutes - predictions don't change frequently
    retry: false, // Don't retry if endpoint doesn't exist (404)
  });
};

// ============================================================================
// Convenience Hooks for Specific Time Periods
// ============================================================================

/**
 * Get weekly stats (7 days)
 */
export const useWeeklyStats = () => {
  return useQuery({
    queryKey: adminAnalyticsKeys.stats({ period: '7d', include_charts: true }),
    queryFn: () => adminAnalyticsService.getWeeklyStats(),
    staleTime: 60000,
  });
};

/**
 * Get monthly stats (30 days)
 */
export const useMonthlyStats = () => {
  return useQuery({
    queryKey: adminAnalyticsKeys.stats({ period: '30d', include_charts: true }),
    queryFn: () => adminAnalyticsService.getMonthlyStats(),
    staleTime: 120000, // 2 minutes
  });
};

/**
 * Get quarterly stats (90 days)
 */
export const useQuarterlyStats = () => {
  return useQuery({
    queryKey: adminAnalyticsKeys.stats({ period: '90d', include_charts: true }),
    queryFn: () => adminAnalyticsService.getQuarterlyStats(),
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Get yearly stats (1 year)
 */
export const useYearlyStats = () => {
  return useQuery({
    queryKey: adminAnalyticsKeys.stats({ period: '1y', include_charts: true }),
    queryFn: () => adminAnalyticsService.getYearlyStats(),
    staleTime: 600000, // 10 minutes
  });
};

// ============================================================================
// Specific Metric Hooks
// ============================================================================

/**
 * Get user-related metrics only (users, registrations, activity)
 */
export const useUserMetrics = () => {
  return useQuery({
    queryKey: adminAnalyticsKeys.stats({ metrics: ['users', 'registrations', 'activity'] }),
    queryFn: () => adminAnalyticsService.getUserMetrics(),
    staleTime: 60000,
  });
};

/**
 * Get performance metrics only
 */
export const usePerformanceMetrics = () => {
  return useQuery({
    queryKey: adminAnalyticsKeys.stats({ metrics: ['performance'] }),
    queryFn: () => adminAnalyticsService.getPerformanceMetrics(),
    staleTime: 120000, // 2 minutes
  });
};

// ============================================================================
// Growth Analytics with Predictions
// ============================================================================

/**
 * Get growth analytics with predictions enabled
 */
export const useGrowthWithPredictions = () => {
  return useQuery({
    queryKey: adminAnalyticsKeys.growth({
      period: '90d',
      granularity: 'daily',
      include_predictions: true,
    }),
    queryFn: () => adminAnalyticsService.getGrowthWithPredictions(),
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Get daily growth for specific period
 */
export const useDailyGrowth = (days: 30 | 60 | 90 = 30) => {
  return useQuery({
    queryKey: adminAnalyticsKeys.growth({
      period: `${days}d` as '30d' | '90d',
      granularity: 'daily',
    }),
    queryFn: () => adminAnalyticsService.getGrowthAnalytics({
      period: `${days}d` as '30d' | '90d',
      granularity: 'daily',
    }),
    staleTime: 180000, // 3 minutes
  });
};

/**
 * Get weekly growth for specific period
 */
export const useWeeklyGrowth = (period: '30d' | '90d' | '1y' = '90d') => {
  return useQuery({
    queryKey: adminAnalyticsKeys.growth({ period, granularity: 'weekly' }),
    queryFn: () => adminAnalyticsService.getGrowthAnalytics({
      period,
      granularity: 'weekly',
    }),
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Get monthly growth for specific period
 */
export const useMonthlyGrowth = (period: '90d' | '1y' = '1y') => {
  return useQuery({
    queryKey: adminAnalyticsKeys.growth({ period, granularity: 'monthly' }),
    queryFn: () => adminAnalyticsService.getGrowthAnalytics({
      period,
      granularity: 'monthly',
    }),
    staleTime: 600000, // 10 minutes
  });
};

// ============================================================================
// Combined Dashboard Hook
// ============================================================================

/**
 * Combined hook for dashboard - fetches stats and growth together
 */
export const useDashboardData = (period: '30d' | '90d' | '1y' | 'all' = '30d') => {
  const stats = useAdminStats({ period, include_charts: true });
  const growth = useGrowthAnalytics({ period, granularity: 'daily', include_predictions: true });

  return {
    stats: stats.data,
    growth: growth.data,
    isLoading: stats.isLoading || growth.isLoading,
    isError: stats.isError || growth.isError,
    error: stats.error || growth.error,
    refetch: () => {
      stats.refetch();
      growth.refetch();
    },
  };
};
