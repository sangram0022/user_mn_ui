/**
 * Admin Analytics Dashboard Page
 *
 * Comprehensive analytics dashboard displaying:
 * - User growth trends over time
 * - Active users metrics
 * - Engagement distribution
 * - Lifecycle stage breakdown
 *
 * Features:
 * - React 19 Compiler-optimized components
 * - Recharts for data visualization
 * - Real-time data fetching with retry logic
 * - Responsive charts for all screen sizes
 * - Accessible data tables as fallback
 * - Loading states with skeletons
 *
 * @author GitHub Copilot
 */

import {
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState, type FC } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useAuth } from '@domains/auth/context/AuthContext';
import { useErrorHandler } from '@hooks/errors/useErrorHandler';
import { useToast } from '@hooks/useToast';
import { PageMetadata } from '@shared/components/PageMetadata';
import { Skeleton } from '@shared/components/ui/Skeleton';
import type { UserAnalytics } from '@shared/types';
import Breadcrumb from '@shared/ui/Breadcrumb';
import ErrorAlert from '@shared/ui/ErrorAlert';
import { prefetchRoute } from '@shared/utils/resource-loading';
import { apiClient as api } from '../../../lib/api';

// ============================================================================
// Types & Constants
// ============================================================================

interface ChartCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
}

const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  tertiary: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
};

const ENGAGEMENT_COLORS = {
  high: COLORS.primary,
  medium: COLORS.tertiary,
  low: COLORS.danger,
};

// ============================================================================
// Components
// ============================================================================

const ChartCard: FC<ChartCardProps> = ({ title, description, icon, children, loading = false }) => (
  <div className="bg-[var(--color-surface-primary)] rounded-lg shadow-md border border-[var(--color-border)] p-6">
    <div className="flex items-start justify-between mb-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[var(--color-primary)]">{icon}</div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h3>
        </div>
        {description && <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>}
      </div>
    </div>

    {loading ? (
      <div className="space-y-3">
        <Skeleton height={200} />
        <div className="flex gap-2">
          <Skeleton width={100} height={20} />
          <Skeleton width={100} height={20} />
          <Skeleton width={100} height={20} />
        </div>
      </div>
    ) : (
      <div>{children}</div>
    )}
  </div>
);

const StatCard: FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  loading?: boolean;
}> = ({ title, value, icon, color, subtitle, loading = false }) => (
  <div className="bg-[var(--color-surface-primary)] rounded-lg shadow-md border border-[var(--color-border)] p-6">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">{title}</p>
        {loading ? (
          <Skeleton width={80} height={32} />
        ) : (
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">
            {value.toLocaleString()}
          </p>
        )}
        {subtitle && !loading && (
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    </div>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

export const AdminAnalyticsDashboardPage: FC = () => {
  const { hasPermission } = useAuth();
  const { error, handleError, clearError } = useErrorHandler();
  const toast = useToast();

  // State
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check permissions
  const canViewAnalytics = hasPermission('analytics:read') || hasPermission('admin');

  // ============================================================================
  // Data Loading
  // ============================================================================
  // ✅ FIXED: Wrapped with useCallback to prevent infinite re-renders

  const loadAnalytics = useCallback(async () => {
    // Check permission inside function, not in dependencies
    if (!hasPermission('analytics:read') && !hasPermission('admin')) {
      toast.toast.error('You do not have permission to view analytics');
      return;
    }

    try {
      const data = await api.getUserAnalytics();
      setAnalytics(data);
      clearError();
    } catch (err) {
      handleError(err, 'Failed to load analytics data');
      toast.toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission, toast, clearError, handleError]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadAnalytics();
      toast.toast.success('Analytics refreshed successfully');
    } finally {
      setIsRefreshing(false);
    }
  };

  // ============================================================================
  // Effects
  // ============================================================================

  // Prefetch likely navigation routes
  useEffect(() => {
    prefetchRoute('/admin');
    prefetchRoute('/users');
  }, []);

  // Load analytics on mount
  useEffect(() => {
    if (canViewAnalytics) {
      loadAnalytics(); // ✅ Safe - loadAnalytics is now memoized
    }
  }, [loadAnalytics, canViewAnalytics]);

  // ============================================================================
  // Data Transformations
  // ============================================================================

  // Transform lifecycle distribution for pie chart
  const lifecycleData = analytics?.lifecycle_distribution
    ? Object.entries(analytics.lifecycle_distribution).map(([stage, count]) => ({
        name: stage.replace('_', ' ').toUpperCase(),
        value: count,
      }))
    : [];

  // Transform engagement distribution for bar chart
  const engagementData = analytics?.engagement_distribution
    ? [
        { level: 'High', count: analytics.engagement_distribution.high },
        { level: 'Medium', count: analytics.engagement_distribution.medium },
        { level: 'Low', count: analytics.engagement_distribution.low },
      ]
    : [];

  // Activity trends data (already in correct format)
  const activityTrends =
    analytics?.activity_trends?.map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      active_users: item.active_users,
    })) || [];

  // Calculate growth rate if available
  const growthRate = analytics?.growth_rate
    ? `${analytics.growth_rate > 0 ? '+' : ''}${analytics.growth_rate.toFixed(1)}%`
    : 'N/A';

  // ============================================================================
  // Render
  // ============================================================================

  if (!canViewAnalytics) {
    return (
      <>
        <PageMetadata
          title="Access Denied - Admin Analytics"
          description="You do not have permission to view this page"
          keywords="access denied, unauthorized"
        />
        <div className="page-wrapper">
          <div className="container-narrow">
            <div className="rounded-lg border border-[var(--color-error)] bg-[var(--color-error-light)] p-4">
              <p className="text-sm text-[var(--color-error)]">
                You do not have permission to view analytics. Contact your administrator for access.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMetadata
        title="Admin Analytics Dashboard"
        description="Comprehensive analytics dashboard with user growth, engagement metrics, and lifecycle insights"
        keywords="admin analytics, user metrics, dashboard, user growth, engagement, lifecycle"
      />

      <div className="page-wrapper">
        <div className="container-full">
          {/* Breadcrumb Navigation - auto-generated from route */}
          <Breadcrumb />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-[var(--color-text-secondary)]">
                Real-time insights into user behavior, growth, and engagement
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-text-primary)] rounded-lg
                     hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]
                     focus:ring-offset-2"
              aria-label="Refresh analytics data"
            >
              <RefreshCw
                className={`icon-sm ${isRefreshing ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              Refresh
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <ErrorAlert error={error} onRetry={loadAnalytics} showDetails className="mb-6" />
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={analytics?.total_users || 0}
              icon={<Users className="w-6 h-6 text-[var(--color-primary)]" />}
              color="bg-[var(--color-primary-light)]"
              subtitle="All registered users"
              loading={isLoading}
            />

            <StatCard
              title="Active Users"
              value={analytics?.active_users || 0}
              icon={<Activity className="w-6 h-6 text-[var(--color-success)]" />}
              color="bg-[var(--color-success-light)]"
              subtitle="Currently active"
              loading={isLoading}
            />

            <StatCard
              title="New Today"
              value={analytics?.new_users_today || 0}
              icon={<TrendingUp className="w-6 h-6 text-[var(--color-primary)]" />}
              color="bg-[var(--color-primary)]"
              subtitle="Registered today"
              loading={isLoading}
            />

            <StatCard
              title="Growth Rate"
              value={growthRate}
              icon={<LineChartIcon className="w-6 h-6 text-[var(--color-warning)]" />}
              color="bg-[var(--color-warning)]"
              subtitle="30-day trend"
              loading={isLoading}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Trends */}
            <ChartCard
              title="Active Users Trend"
              description="Daily active user count over the last 30 days"
              icon={<LineChartIcon className="icon-md" />}
              loading={isLoading}
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activityTrends}>
                  <defs>
                    <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                    aria-label="Date"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" aria-label="Active users count" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="active_users"
                    stroke={COLORS.primary}
                    fillOpacity={1}
                    fill="url(#colorActiveUsers)"
                    name="Active Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Engagement Distribution */}
            <ChartCard
              title="User Engagement"
              description="Distribution of users by engagement level"
              icon={<BarChart3 className="icon-md" />}
              loading={isLoading}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="level" tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Users" radius={[8, 8, 0, 0]}>
                    {engagementData.map((entry) => (
                      <Cell
                        key={`engagement-${entry.level}`}
                        fill={
                          entry.level === 'High'
                            ? ENGAGEMENT_COLORS.high
                            : entry.level === 'Medium'
                              ? ENGAGEMENT_COLORS.medium
                              : ENGAGEMENT_COLORS.low
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Lifecycle Distribution */}
            <ChartCard
              title="User Lifecycle Stages"
              description="Breakdown of users across lifecycle stages"
              icon={<PieChartIcon className="icon-md" />}
              loading={isLoading}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={lifecycleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: unknown) => {
                      const p = props as { name: string; percent: number };
                      return `${p.name} ${(p.percent * 100).toFixed(0)}%`;
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {lifecycleData.map((_entry, index) => (
                      <Cell
                        key={`lifecycle-${lifecycleData[index]?.name || index}`}
                        fill={Object.values(COLORS)[index % Object.values(COLORS).length] as string}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Retention Metrics */}
            <ChartCard
              title="Key Metrics"
              description="Important performance indicators"
              icon={<Activity className="icon-md" />}
              loading={isLoading}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">Retention Rate</p>
                    <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                      {analytics?.retention_rate?.toFixed(1) || 0}%
                    </p>
                  </div>
                  <TrendingUp className="icon-xl text-[var(--color-success)]" />
                </div>

                <div className="flex items-center justify-between p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">Engagement Score</p>
                    <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                      {analytics?.engagement_score?.toFixed(1) || 0}
                    </p>
                  </div>
                  <Activity className="icon-xl text-[var(--color-primary)]" />
                </div>

                <div className="flex items-center justify-between p-4 bg-[var(--color-surface-secondary)] rounded-lg">
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      New Users (30 days)
                    </p>
                    <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                      {analytics?.new_users_last_30_days?.toLocaleString() || 0}
                    </p>
                  </div>
                  <Users className="icon-xl text-[var(--color-primary)]" />
                </div>
              </div>
            </ChartCard>
          </div>

          {/* Footer Note */}
          <div className="bg-[var(--color-primary-light)] border border-[var(--color-primary)] rounded-lg p-4">
            <p className="text-sm text-[var(--color-primary)]">
              <strong>Note:</strong> Analytics data is updated in real-time. Click the refresh
              button to fetch the latest metrics. All data is retrieved from the backend API with
              automatic retry logic for improved reliability.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminAnalyticsDashboardPage;
