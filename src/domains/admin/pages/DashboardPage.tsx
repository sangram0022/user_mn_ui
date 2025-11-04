import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStats, useGrowthAnalytics, useAuditLogs } from '../hooks';
import type { TimePeriod } from '../types';
import Button from '../../../shared/components/ui/Button';
import Badge from '../../../shared/components/ui/Badge';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const PERIOD_OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' },
];

const STATUS_COLORS = {
  active: '#10b981',
  inactive: '#6b7280',
  pending: '#f59e0b',
  suspended: '#ef4444',
  deleted: '#991b1b',
};

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

  // Prepare pie chart data for user status breakdown
  const statusData = stats?.users?.by_status
    ? [
        { name: 'Active', value: stats.users.by_status.active || 0, color: STATUS_COLORS.active },
        { name: 'Inactive', value: stats.users.by_status.inactive || 0, color: STATUS_COLORS.inactive },
        { name: 'Pending', value: stats.users.by_status.pending_approval || 0, color: STATUS_COLORS.pending },
        { name: 'Suspended', value: stats.users.by_status.suspended || 0, color: STATUS_COLORS.suspended },
      ].filter((item) => item.value > 0)
    : [];

  // Prepare line chart data for registration trends
  const trendData =
    growth?.time_series?.map((trend) => ({
      date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      registrations: trend.new_users,
      activations: 0, // Not in API response
    })) || [];

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

  const getSeverityBadge = (severity: string): 'danger' | 'warning' | 'info' | 'success' => {
    switch (severity) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'success';
    }
  };

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Overview of system statistics and recent activity
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            Auto-refresh (5 min)
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as TimePeriod)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.users.total || 0}</p>
            </div>
            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-primary-600">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.users?.by_status?.active || 0}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-green-600">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Registrations</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.registrations.total_this_period || 0}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-blue-600">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.registrations.pending || 0}
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-yellow-600">⏳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Status Breakdown</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine
                  label
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Registration Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Registration Trends</h2>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Registrations"
                />
                <Line
                  type="monotone"
                  dataKey="activations"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Activations"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Roles */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Roles by User Count</h2>
          {roleData.length > 0 ? (
            <div className="space-y-3">
              {roleData.map((role, index) => (
                <div key={role.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">{role.name}</span>
                  </div>
                  <Badge variant="info">{role.users} users</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No role data available</p>
          )}
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h2>
          {geoData.length > 0 ? (
            <div className="space-y-3">
              {geoData.slice(0, 5).map((geo) => (
                <div key={geo.country} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{geo.country}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${geo.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16 text-right">
                      {geo.users} ({geo.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No geographic data available</p>
          )}
        </div>

        {/* Device Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Distribution</h2>
          {deviceData.length > 0 ? (
            <div className="space-y-4">
              {deviceData.map((device) => {
                const total = deviceStats.desktop + deviceStats.mobile + deviceStats.tablet;
                const percentage = total > 0 ? ((device.value / total) * 100).toFixed(1) : 0;
                return (
                  <div key={device.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{device.name}</span>
                      <span className="text-sm text-gray-600">
                        {device.value} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No device data available</p>
          )}
        </div>
      </div>

      {/* Growth Predictions */}
      {growth?.predictions && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Growth Predictions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Next 7 Days</p>
              <p className="text-2xl font-bold text-gray-900">
                +{growth.predictions.next_7_days.expected_new_users} users
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Confidence: {growth.predictions.next_7_days.confidence}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Next 30 Days</p>
              <p className="text-2xl font-bold text-gray-900">
                +{growth.predictions.next_30_days.expected_new_users} users
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Confidence: {growth.predictions.next_30_days.confidence}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/audit-logs')}>
            View All Logs
          </Button>
        </div>
        {recentLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentLogs.map((log) => (
                  <tr key={log.audit_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{log.action}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.user_id}</div>
                      <div className="text-xs text-gray-500">{log.ip_address || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{log.resource_type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getSeverityBadge(log.severity)}>
                        {log.severity}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={log.outcome === null ? 'secondary' : 'primary'}>
                        {log.outcome || 'N/A'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
        )}
      </div>
    </div>
  );
}
