/**
 * Admin Data Transformers
 * Transforms admin API responses (analytics, statistics, audit logs) to frontend models
 * Handles data aggregation, formatting, and computed properties for admin dashboards
 * 
 * Purpose: Decouple admin API responses from UI data requirements
 */

import type { 
  AdminStats as ApiAdminStats,
  GrowthAnalytics as ApiGrowthAnalytics,
  UserStatusBreakdown,
  UserVerificationBreakdown,
  UserAccountTypeBreakdown,
} from '@/domains/admin/types/adminAnalytics.types';

// ============================================================================
// Frontend Admin Models
// ============================================================================

export interface AdminStatsUI {
  period: string;
  generatedAt: Date;
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    newUsersThisPeriod: number;
    growthRate: string;
    growthRateValue: number;
    growthTrend: 'up' | 'down' | 'stable';
  };
  users: {
    total: number;
    byStatus: UserStatusBreakdown;
    byVerification: UserVerificationBreakdown;
    byAccountType: UserAccountTypeBreakdown;
    statusPercentages: Record<string, string>;
  };
  registrations: {
    totalThisPeriod: number;
    approved: number;
    rejected: number;
    pending: number;
    dailyAverage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    approvalRate: number;
    rejectionRate: number;
  };
  activity: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: string;
    totalSessions: number;
    bounceRate: string;
    engagementScore: number;
    engagementLevel: 'high' | 'medium' | 'low';
  };
  
  // Computed properties
  isHealthy: boolean;
  healthScore: number;
  keyInsights: string[];
}

export interface GrowthAnalyticsUI {
  period: string;
  granularity: string;
  summary: {
    totalUsersStart: number;
    totalUsersEnd: number;
    netGrowth: number;
    growthRate: string;
    growthRateValue: number;
    avgDailyGrowth: number;
    peakGrowthDate: string;
    peakGrowthValue: number;
  };
  timeSeries: Array<{
    date: string;
    totalUsers: number;
    newUsers: number;
    churnedUsers: number;
    netGrowth: number;
    growthRate: string;
    growthRateValue: number;
  }>;
  trends: {
    overallTrend: 'increasing' | 'decreasing' | 'stable';
    momentum: 'positive' | 'negative' | 'neutral';
    volatility: 'low' | 'medium' | 'high';
    seasonalPattern: string;
  };
  predictions?: {
    next7Days: {
      expectedNewUsers: number;
      expectedTotal: number;
      confidence: string;
      confidenceValue: number;
    };
    next30Days: {
      expectedNewUsers: number;
      expectedTotal: number;
      confidence: string;
      confidenceValue: number;
    };
  };
  
  // Computed properties
  isGrowthPositive: boolean;
  averageGrowthRate: number;
  bestPerformingPeriod: string;
  worstPerformingPeriod: string;
}

// ============================================================================
// Transform Functions
// ============================================================================

/**
 * Transform API AdminStats to UI AdminStats
 * Adds computed properties and formatted values
 * 
 * @param apiStats - Admin statistics from API
 * @returns UI-friendly admin statistics with insights
 */
export function transformAdminStats(apiStats: ApiAdminStats): AdminStatsUI {
  // Parse growth rate
  const growthRateValue = parseFloat(apiStats.overview.growth_rate.replace('%', ''));
  const growthTrend: 'up' | 'down' | 'stable' = 
    growthRateValue > 2 ? 'up' : growthRateValue < -2 ? 'down' : 'stable';
  
  // Calculate status percentages
  const totalUsers = apiStats.users.total;
  const statusPercentages: Record<string, string> = {};
  Object.entries(apiStats.users.by_status).forEach(([status, count]) => {
    statusPercentages[status] = `${((count / totalUsers) * 100).toFixed(1)}%`;
  });
  
  // Calculate registration rates
  const totalRegistrations = apiStats.registrations.total_this_period;
  const approvalRate = totalRegistrations > 0 
    ? (apiStats.registrations.approved / totalRegistrations) * 100 
    : 0;
  const rejectionRate = totalRegistrations > 0 
    ? (apiStats.registrations.rejected / totalRegistrations) * 100 
    : 0;
  
  // Determine engagement level
  const engagementScore = apiStats.activity.engagement_score;
  const engagementLevel: 'high' | 'medium' | 'low' = 
    engagementScore >= 75 ? 'high' : engagementScore >= 50 ? 'medium' : 'low';
  
  // Calculate health score (0-100)
  const healthScore = calculateHealthScore({
    activeUsersPercentage: (apiStats.overview.active_users / totalUsers) * 100,
    growthRate: growthRateValue,
    engagementScore,
    approvalRate,
    bounceRate: parseFloat(apiStats.activity.bounce_rate.replace('%', '')),
  });
  
  const isHealthy = healthScore >= 70;
  
  // Generate key insights
  const keyInsights = generateInsights(apiStats, {
    growthRateValue,
    approvalRate,
    engagementLevel,
    healthScore,
  });
  
  return {
    period: apiStats.period,
    generatedAt: new Date(apiStats.generated_at),
    overview: {
      totalUsers: apiStats.overview.total_users,
      activeUsers: apiStats.overview.active_users,
      inactiveUsers: apiStats.overview.inactive_users,
      newUsersThisPeriod: apiStats.overview.new_users_this_period,
      growthRate: apiStats.overview.growth_rate,
      growthRateValue,
      growthTrend,
    },
    users: {
      total: totalUsers,
      byStatus: apiStats.users.by_status,
      byVerification: apiStats.users.by_verification,
      byAccountType: apiStats.users.by_account_type,
      statusPercentages,
    },
    registrations: {
      totalThisPeriod: totalRegistrations,
      approved: apiStats.registrations.approved,
      rejected: apiStats.registrations.rejected,
      pending: apiStats.registrations.pending,
      dailyAverage: apiStats.registrations.daily_average,
      trend: apiStats.registrations.trend,
      approvalRate,
      rejectionRate,
    },
    activity: {
      dailyActiveUsers: apiStats.activity.daily_active_users,
      weeklyActiveUsers: apiStats.activity.weekly_active_users,
      monthlyActiveUsers: apiStats.activity.monthly_active_users,
      averageSessionDuration: apiStats.activity.average_session_duration,
      totalSessions: apiStats.activity.total_sessions,
      bounceRate: apiStats.activity.bounce_rate,
      engagementScore,
      engagementLevel,
    },
    
    // Computed properties
    isHealthy,
    healthScore,
    keyInsights,
  };
}

/**
 * Transform API GrowthAnalytics to UI GrowthAnalytics
 * Adds computed metrics and formatted values
 * 
 * @param apiGrowth - Growth analytics from API
 * @returns UI-friendly growth analytics with computed metrics
 */
export function transformGrowthAnalytics(apiGrowth: ApiGrowthAnalytics): GrowthAnalyticsUI {
  // Parse growth rate
  const growthRateValue = parseFloat(apiGrowth.summary.growth_rate.replace('%', ''));
  
  // Transform time series data
  const timeSeries = apiGrowth.time_series.map(point => ({
    date: point.date,
    totalUsers: point.total_users,
    newUsers: point.new_users,
    churnedUsers: point.churned_users,
    netGrowth: point.net_growth,
    growthRate: point.growth_rate,
    growthRateValue: parseFloat(point.growth_rate.replace('%', '')),
  }));
  
  // Transform predictions if available
  let predictions;
  if (apiGrowth.predictions) {
    predictions = {
      next7Days: {
        expectedNewUsers: apiGrowth.predictions.next_7_days.expected_new_users,
        expectedTotal: apiGrowth.predictions.next_7_days.expected_total,
        confidence: apiGrowth.predictions.next_7_days.confidence,
        confidenceValue: parseFloat(apiGrowth.predictions.next_7_days.confidence.replace('%', '')),
      },
      next30Days: {
        expectedNewUsers: apiGrowth.predictions.next_30_days.expected_new_users,
        expectedTotal: apiGrowth.predictions.next_30_days.expected_total,
        confidence: apiGrowth.predictions.next_30_days.confidence,
        confidenceValue: parseFloat(apiGrowth.predictions.next_30_days.confidence.replace('%', '')),
      },
    };
  }
  
  // Compute metrics
  const isGrowthPositive = apiGrowth.summary.net_growth > 0;
  const averageGrowthRate = timeSeries.reduce((sum, point) => sum + point.growthRateValue, 0) / timeSeries.length;
  
  // Find best and worst performing periods
  const sortedByGrowth = [...timeSeries].sort((a, b) => b.netGrowth - a.netGrowth);
  const bestPerformingPeriod = sortedByGrowth[0]?.date || 'N/A';
  const worstPerformingPeriod = sortedByGrowth[sortedByGrowth.length - 1]?.date || 'N/A';
  
  return {
    period: apiGrowth.period,
    granularity: apiGrowth.granularity,
    summary: {
      totalUsersStart: apiGrowth.summary.total_users_start,
      totalUsersEnd: apiGrowth.summary.total_users_end,
      netGrowth: apiGrowth.summary.net_growth,
      growthRate: apiGrowth.summary.growth_rate,
      growthRateValue,
      avgDailyGrowth: apiGrowth.summary.avg_daily_growth,
      peakGrowthDate: apiGrowth.summary.peak_growth_date,
      peakGrowthValue: apiGrowth.summary.peak_growth_value,
    },
    timeSeries,
    trends: {
      overallTrend: apiGrowth.trends.overall_trend,
      momentum: apiGrowth.trends.momentum,
      volatility: apiGrowth.trends.volatility,
      seasonalPattern: apiGrowth.trends.seasonal_pattern,
    },
    predictions,
    
    // Computed properties
    isGrowthPositive,
    averageGrowthRate,
    bestPerformingPeriod,
    worstPerformingPeriod,
  };
}

/**
 * Transform chart data for visualization libraries
 * Converts API data to format expected by Chart.js, Recharts, etc.
 * 
 * @param timeSeries - Growth time series data
 * @returns Chart-ready data structure
 */
export function transformToChartData(timeSeries: Array<{
  date: string;
  newUsers: number;
  churnedUsers: number;
  netGrowth: number;
}>) {
  return {
    labels: timeSeries.map(point => point.date),
    datasets: [
      {
        label: 'New Users',
        data: timeSeries.map(point => point.newUsers),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
      },
      {
        label: 'Churned Users',
        data: timeSeries.map(point => point.churnedUsers),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
      },
      {
        label: 'Net Growth',
        data: timeSeries.map(point => point.netGrowth),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
    ],
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate overall platform health score (0-100)
 * 
 * @param metrics - Key metrics for health calculation
 * @returns Health score (0-100)
 */
function calculateHealthScore(metrics: {
  activeUsersPercentage: number;
  growthRate: number;
  engagementScore: number;
  approvalRate: number;
  bounceRate: number;
}): number {
  // Weighted scoring (total: 100 points)
  const activeUsersScore = Math.min(metrics.activeUsersPercentage, 30); // Max 30 points
  const growthScore = Math.max(0, Math.min(metrics.growthRate * 2, 20)); // Max 20 points
  const engagementScoreWeighted = (metrics.engagementScore / 100) * 25; // Max 25 points
  const approvalScore = (metrics.approvalRate / 100) * 15; // Max 15 points
  const bounceScore = Math.max(0, 10 - (metrics.bounceRate / 10)); // Max 10 points (lower is better)
  
  const totalScore = activeUsersScore + growthScore + engagementScoreWeighted + approvalScore + bounceScore;
  
  return Math.min(100, Math.max(0, Math.round(totalScore)));
}

/**
 * Generate actionable insights from admin statistics
 * 
 * @param apiStats - Raw admin statistics
 * @param computed - Computed metrics
 * @returns Array of insight messages
 */
function generateInsights(
  apiStats: ApiAdminStats,
  computed: {
    growthRateValue: number;
    approvalRate: number;
    engagementLevel: 'high' | 'medium' | 'low';
    healthScore: number;
  }
): string[] {
  const insights: string[] = [];
  
  // Growth insights
  if (computed.growthRateValue > 10) {
    insights.push(`🚀 Exceptional growth rate of ${computed.growthRateValue.toFixed(1)}% - keep up the momentum!`);
  } else if (computed.growthRateValue < -5) {
    insights.push(`⚠️ Negative growth detected (${computed.growthRateValue.toFixed(1)}%) - review retention strategies`);
  }
  
  // Engagement insights
  if (computed.engagementLevel === 'low') {
    insights.push(`📉 Low engagement score (${apiStats.activity.engagement_score}) - consider user experience improvements`);
  } else if (computed.engagementLevel === 'high') {
    insights.push(`✨ High engagement score (${apiStats.activity.engagement_score}) - users are highly active!`);
  }
  
  // Approval rate insights
  if (computed.approvalRate < 70 && apiStats.registrations.total_this_period > 10) {
    insights.push(`🔍 Low approval rate (${computed.approvalRate.toFixed(1)}%) - review registration requirements`);
  }
  
  // Active users insights
  const activePercentage = (apiStats.overview.active_users / apiStats.users.total) * 100;
  if (activePercentage < 50) {
    insights.push(`⚡ Only ${activePercentage.toFixed(1)}% users are active - consider re-engagement campaigns`);
  }
  
  // Registration trend insights
  if (apiStats.registrations.trend === 'decreasing') {
    insights.push(`📊 Registration trend is decreasing - review marketing and onboarding processes`);
  } else if (apiStats.registrations.trend === 'increasing') {
    insights.push(`📈 Registration trend is increasing - great marketing performance!`);
  }
  
  // Overall health
  if (computed.healthScore >= 80) {
    insights.push(`💪 Overall platform health is excellent (${computed.healthScore}/100)`);
  } else if (computed.healthScore < 60) {
    insights.push(`🚨 Platform health needs attention (${computed.healthScore}/100) - prioritize improvements`);
  }
  
  return insights;
}

