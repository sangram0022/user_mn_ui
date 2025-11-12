/**
 * Admin Analytics Service
 * API calls for dashboard statistics and growth analytics
 * 
 * Response Format:
 * All functions interact with backend ApiResponse<T> format:
 * - Success: { success: true, data: T, message?, timestamp? }
 * - Error: { success: false, error: string, message_code?, timestamp? }
 * 
 * Functions use unwrapResponse() to return unwrapped data (T).
 * 
 * Endpoints implemented:
 * - GET /api/v1/admin/stats (dashboard statistics - user counts, activity metrics)
 * - GET /api/v1/admin/analytics/growth (user growth analytics - time series data)
 * 
 * @see {ApiResponse} @/core/api/types
 */

import { apiGet } from '@/core/api/apiHelpers';
import { API_PREFIXES } from '../../../services/api/common';
import type {
  AdminStatsParams,
  AdminStats,
  GrowthAnalyticsParams,
  GrowthAnalytics,
} from '../types';

const API_PREFIX = API_PREFIXES.ADMIN;

// ============================================================================
// Analytics Endpoints
// ============================================================================

/**
 * GET /api/v1/admin/stats
 * Get comprehensive dashboard statistics
 */
export const getAdminStats = async (params?: AdminStatsParams): Promise<AdminStats> => {
  return apiGet<AdminStats>(`${API_PREFIX}/stats`, params as Record<string, unknown>);
};

/**
 * GET /api/v1/admin/analytics/growth
 * Get user growth analytics with trends and predictions
 */
export const getGrowthAnalytics = async (
  params?: GrowthAnalyticsParams
): Promise<GrowthAnalytics> => {
  return apiGet<GrowthAnalytics>(`${API_PREFIX}/analytics/growth`, params as Record<string, unknown>);
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get stats for specific time period
 */
export const getWeeklyStats = () => getAdminStats({ period: '7d', include_charts: true });
export const getMonthlyStats = () => getAdminStats({ period: '30d', include_charts: true });
export const getQuarterlyStats = () => getAdminStats({ period: '90d', include_charts: true });
export const getYearlyStats = () => getAdminStats({ period: '1y', include_charts: true });

/**
 * Get specific metrics only
 */
export const getUserMetrics = () => getAdminStats({ metrics: ['users', 'registrations', 'activity'] });
export const getPerformanceMetrics = () => getAdminStats({ metrics: ['performance'] });

/**
 * Get growth with predictions
 */
export const getGrowthWithPredictions = () => getGrowthAnalytics({
  period: '90d',
  granularity: 'daily',
  include_predictions: true,
});

// Export all as default object
const adminAnalyticsService = {
  getAdminStats,
  getGrowthAnalytics,
  getWeeklyStats,
  getMonthlyStats,
  getQuarterlyStats,
  getYearlyStats,
  getUserMetrics,
  getPerformanceMetrics,
  getGrowthWithPredictions,
};

export default adminAnalyticsService;
