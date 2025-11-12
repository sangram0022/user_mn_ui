/**
 * Admin Analytics - Type Definitions
 * Types for analytics and statistics endpoints
 * 
 * Endpoints covered:
 * - GET /api/v1/admin/stats
 * - GET /api/v1/admin/analytics/growth
 */

import type { TimePeriod } from './admin.types';

// ============================================================================
// Admin Dashboard Statistics
// ============================================================================

export interface AdminStatsParams {
  period?: TimePeriod;
  include_charts?: boolean;
  metrics?: string[];
}

export interface AdminStatsOverview {
  total_users: number;
  active_users: number;
  inactive_users: number;
  new_users_this_period: number;
  growth_rate: string;
}

export interface UserStatusBreakdown {
  active: number;
  inactive: number;
  pending_approval: number;
  suspended: number;
  deleted: number;
}

export interface UserVerificationBreakdown {
  email_verified: number;
  email_not_verified: number;
  phone_verified: number;
  phone_not_verified: number;
}

export interface UserAccountTypeBreakdown {
  regular: number;
  premium: number;
  trial: number;
}

export interface UserStats {
  total: number;
  by_status: UserStatusBreakdown;
  by_verification: UserVerificationBreakdown;
  by_account_type: UserAccountTypeBreakdown;
}

export interface RegistrationChartData {
  date: string;
  registrations: number;
  approvals: number;
  rejections: number;
}

export interface RegistrationStats {
  total_this_period: number;
  approved: number;
  rejected: number;
  pending: number;
  daily_average: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  chart_data?: RegistrationChartData[];
}

export interface ActivityStats {
  daily_active_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  average_session_duration: string;
  total_sessions: number;
  bounce_rate: string;
  engagement_score: number;
}

export interface RoleDistribution {
  distribution: Record<string, number>;
  percentage: Record<string, string>;
}

export interface CountryData {
  country: string;
  code: string;
  users: number;
  percentage: string;
}

export interface GeographyStats {
  top_countries: CountryData[];
  total_countries: number;
}

export interface DeviceStats {
  platforms: Record<string, number>;
  browsers: Record<string, number>;
  operating_systems: Record<string, number>;
}

export interface PerformanceStats {
  avg_api_response_time: string;
  error_rate: string;
  uptime: string;
}

export interface AdminStats {
  period: string;
  generated_at: string;
  overview: AdminStatsOverview;
  users: UserStats;
  registrations: RegistrationStats;
  activity: ActivityStats;
  roles: RoleDistribution;
  geography: GeographyStats;
  devices: DeviceStats;
  performance: PerformanceStats;
}

// ============================================================================
// Growth Analytics
// ============================================================================

export interface GrowthAnalyticsParams {
  period?: '30d' | '90d' | '6m' | '1y' | 'all';
  granularity?: 'daily' | 'weekly' | 'monthly';
  include_predictions?: boolean;
}

export interface GrowthSummary {
  total_users_start: number;
  total_users_end: number;
  net_growth: number;
  growth_rate: string;
  avg_daily_growth: number;
  peak_growth_date: string;
  peak_growth_value: number;
}

export interface GrowthDataPoint {
  date: string;
  total_users: number;
  new_users: number;
  churned_users: number;
  net_growth: number;
  growth_rate: string;
}

export interface GrowthTrends {
  overall_trend: 'increasing' | 'decreasing' | 'stable';
  momentum: 'positive' | 'negative' | 'neutral';
  volatility: 'low' | 'medium' | 'high';
  seasonal_pattern: string;
}

export interface GrowthPrediction {
  expected_new_users: number;
  expected_total: number;
  confidence: string;
}

export interface GrowthPredictions {
  next_7_days: GrowthPrediction;
  next_30_days: GrowthPrediction;
}

export interface GrowthMilestone {
  milestone: string;
  achieved_on?: string;
  estimated_date?: string;
  days_from_start?: number;
  days_remaining?: number;
}

export interface GrowthAnalytics {
  period: string;
  granularity: string;
  summary: GrowthSummary;
  time_series: GrowthDataPoint[];
  trends: GrowthTrends;
  predictions?: GrowthPredictions;
  milestones: GrowthMilestone[];
}

// ============================================================================
// Chart Data Types
// ============================================================================

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  fill?: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      display: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    title: {
      display: boolean;
      text: string;
    };
  };
}

// ============================================================================
// Type Guards
// ============================================================================

export function isAdminStats(obj: unknown): obj is AdminStats {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'period' in obj &&
    'overview' in obj &&
    'users' in obj
  );
}

export function isGrowthAnalytics(obj: unknown): obj is GrowthAnalytics {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'summary' in obj &&
    'time_series' in obj &&
    'trends' in obj
  );
}
