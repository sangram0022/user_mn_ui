import { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStats, useGrowthAnalytics, useAuditLogs } from '../hooks';
import type { TimePeriod } from '../types';
import { ChartSkeleton } from '../../../shared/components/loading/Skeletons';
import UserStatusChart from '../components/UserStatusChart';
import RegistrationTrendsChart from '../components/RegistrationTrendsChart';
import {
  DashboardHeader,
  DashboardStatsCards,
  TopRolesCard,
  GeographicCard,
  DeviceStatsCard,
  GrowthPredictionsCard,
  RecentActivityTable,
  type RoleData,
  type GeoData,
  type DeviceData,
} from './dashboard/components';

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function DashboardPage() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: statsData, refetch: refetchStats, isLoading: statsLoading } = useAdminStats();
  const {
    data: growthData,
    refetch: refetchGrowth,
    isLoading: growthLoading,
  } = useGrowthAnalytics({ period: selectedPeriod === 'all' ? '1y' : selectedPeriod as '30d' | '90d' | '6m' | '1y' });
  const {
    data: auditData,
    refetch: refetchAudit,
    isLoading: auditLoading,
  } = useAuditLogs({
    page: 1,
    page_size: 5,
  });

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchStats();
      refetchGrowth();
      refetchAudit();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [autoRefresh, refetchStats, refetchGrowth, refetchAudit]);

  const stats = statsData;
  const growth = growthData;
  const recentLogs = auditData?.logs || [];

  const isLoading = statsLoading || growthLoading || auditLoading;

  // Prepare role distribution data
  const roleData = stats
    ? Object.entries(stats.roles.distribution)
        .map(([name, users]) => ({
          name,
          users: users as number,
        }))
        .slice(0, 5)
    : [];

  // Prepare geographic distribution data
  const geoData = stats?.geography.top_countries.map((country) => ({
    country: country.country,
    users: country.users,
    percentage: parseFloat(country.percentage),
  })) || [];

  // Prepare device statistics
  const deviceStats = stats?.devices.platforms || { desktop: 0, mobile: 0, tablet: 0, unknown: 0 };
  const deviceData = [
    { name: 'Desktop', value: (deviceStats as Record<string, number>).desktop || 0 },
    { name: 'Mobile', value: (deviceStats as Record<string, number>).mobile || 0 },
    { name: 'Tablet', value: (deviceStats as Record<string, number>).tablet || 0 },
  ].filter((item) => item.value > 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        autoRefresh={autoRefresh}
        selectedPeriod={selectedPeriod}
        onAutoRefreshChange={setAutoRefresh}
        onPeriodChange={setSelectedPeriod}
      />

      <DashboardStatsCards
        totalUsers={stats?.users.total || 0}
        activeUsers={stats?.users?.by_status?.active || 0}
        todayRegistrations={stats?.registrations.total_this_period || 0}
        pendingApprovals={stats?.registrations.pending || 0}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Status Breakdown</h2>
          <Suspense fallback={<ChartSkeleton />}>
            <UserStatusChart stats={stats} />
          </Suspense>
        </div>

        {/* Registration Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Registration Trends</h2>
          <Suspense fallback={<ChartSkeleton />}>
            <RegistrationTrendsChart growth={growth} />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopRolesCard roleData={roleData as RoleData[]} />
        <GeographicCard geoData={geoData as GeoData[]} />
        <DeviceStatsCard
          deviceData={deviceData as DeviceData[]}
          total={deviceStats.desktop + deviceStats.mobile + deviceStats.tablet}
        />
      </div>

      {growth?.predictions && (
        <GrowthPredictionsCard
          next7Days={growth.predictions.next_7_days}
          next30Days={growth.predictions.next_30_days}
        />
      )}

      <RecentActivityTable
        logs={recentLogs}
        onViewAll={() => navigate('/admin/audit-logs')}
      />
    </div>
  );
}
