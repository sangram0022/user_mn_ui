/**
 * Admin Analytics Service
 * API calls for dashboard statistics and growth analytics
 * 
 * Endpoints implemented:
 * - GET /api/v1/admin/stats (dashboard statistics)
 * - GET /api/v1/admin/analytics/growth (user growth analytics)
 */

import { apiClient } from '../../../services/api/apiClient';
import { API_PREFIXES, unwrapResponse } from '../../../services/api/common';
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
  const queryParams = new URLSearchParams();
  
  if (params) {
    if (params.period) {
      queryParams.append('period', params.period);
    }
    if (params.include_charts !== undefined) {
      queryParams.append('include_charts', String(params.include_charts));
    }
    if (params.metrics && params.metrics.length > 0) {
      queryParams.append('metrics', params.metrics.join(','));
    }
  }
  
  const queryString = queryParams.toString();
  const url = queryString ? `${API_PREFIX}/stats?${queryString}` : `${API_PREFIX}/stats`;
  
  const response = await apiClient.get<AdminStats>(url);
  return unwrapResponse<AdminStats>(response.data);
};

/**
 * GET /api/v1/admin/analytics/growth
 * Get user growth analytics with trends and predictions
 */
export const getGrowthAnalytics = async (
  params?: GrowthAnalyticsParams
): Promise<GrowthAnalytics> => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    if (params.period) {
      queryParams.append('period', params.period);
    }
    if (params.granularity) {
      queryParams.append('granularity', params.granularity);
    }
    if (params.include_predictions !== undefined) {
      queryParams.append('include_predictions', String(params.include_predictions));
    }
  }
  
  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_PREFIX}/analytics/growth?${queryString}`
    : `${API_PREFIX}/analytics/growth`;
  
  const response = await apiClient.get<GrowthAnalytics>(url);
  return unwrapResponse<GrowthAnalytics>(response.data);
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
