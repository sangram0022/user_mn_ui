/**
 * Admin Analytics Hooks
 * React Query hooks for dashboard statistics and growth analytics
 * Following DRY principles - only used hooks included
 */

import { useQuery } from '@tanstack/react-query';
import { adminAnalyticsService } from '../services';
import { queryKeys } from '@/services/api/queryClient';
import type {
  AdminStatsParams,
  GrowthAnalyticsParams,
} from '../types';

// ============================================================================
// Query Hooks - Used in DashboardPage
// ============================================================================

/**
 * Fetch comprehensive dashboard statistics
 * Used in: DashboardPage
 */
export const useAdminStats = (params?: AdminStatsParams) => {
  return useQuery({
    queryKey: queryKeys.admin.analytics.stats(params),
    queryFn: () => adminAnalyticsService.getAdminStats(params),
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};

/**
 * Fetch user growth analytics with predictions
 * Used in: DashboardPage
 */
export const useGrowthAnalytics = (params?: GrowthAnalyticsParams) => {
  return useQuery({
    queryKey: queryKeys.admin.analytics.growth(params),
    queryFn: () => adminAnalyticsService.getGrowthAnalytics(params),
    staleTime: 300000, // 5 minutes - predictions don't change frequently
    retry: false, // Don't retry if endpoint doesn't exist (404)
  });
};
