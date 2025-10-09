/**
 * Analytics adapter functions
 * Provides backward-compatible API wrappers for analytics operations
 */

import baseApiClient from '../apiClient';
import type { AnalyticsResponse } from './types';

/**
 * Get user analytics data
 */
export async function getUserAnalytics(): Promise<AnalyticsResponse> {
  const analytics = await baseApiClient.getUserAnalytics();
  
  return {
    success: true,
    data: analytics
  };
}

/**
 * Get lifecycle analytics (if available)
 */
export async function getLifecycleAnalytics<T = unknown>(): Promise<AnalyticsResponse> {
  try {
    const analytics = await baseApiClient.getLifecycleAnalytics<T>();
    
    return {
      success: true,
      data: analytics
    };
  } catch {
    return {
      success: false,
      message: 'Lifecycle analytics not available',
      data: undefined
    };
  }
}

/**
 * @deprecated Legacy adapter exports removed.
 */
export {};
