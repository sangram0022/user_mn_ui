/**
 * Health Monitoring Dashboard Component
 *
 * Displays system health metrics with auto-refresh
 * Shows overall status, database health, and system resources
 *
 * Backend API: GET /health
 */

import { useEffect, useState } from 'react';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  database: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    connections: {
      active: number;
      idle: number;
      total: number;
    };
  };
  system?: {
    memory?: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu?: {
      usage: number;
    };
  };
}

const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

export function HealthMonitoringDashboard() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API client call
      // const response = await apiClient.getHealth();
      // setHealth(response);

      // Simulate API call with mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockHealth: HealthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: 123456,
        version: '1.0.0',
        database: {
          status: 'healthy',
          responseTime: 12,
          connections: {
            active: 5,
            idle: 10,
            total: 15,
          },
        },
        system: {
          memory: {
            used: 512,
            total: 1024,
            percentage: 50,
          },
          cpu: {
            usage: 25,
          },
        },
      };
      setHealth(mockHealth);
      setLastCheck(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: 'healthy' | 'degraded' | 'unhealthy') => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'unhealthy':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: 'healthy' | 'degraded' | 'unhealthy') => {
    switch (status) {
      case 'healthy':
        return (
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'degraded':
        return (
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'unhealthy':
        return (
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.join(' ') || '0m';
  };

  if (loading && !health) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !health) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-600 dark:text-red-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                Health Check Failed
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchHealth}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!health) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            System Health Monitor
          </h2>
          <button
            type="button"
            onClick={fetchHealth}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {lastCheck && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last checked: {lastCheck.toLocaleTimeString()} • Auto-refresh every 30s
          </p>
        )}
      </div>

      {/* Overall Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full ${getStatusColor(health.status)}`}>
            {getStatusIcon(health.status)}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Overall Status: {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              System version {health.version} • Uptime: {formatUptime(health.uptime)}
            </p>
          </div>
        </div>
      </div>

      {/* Component Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Health */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Database</h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                health.database.status
              )}`}
            >
              {health.database.status}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Response Time</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {health.database.responseTime}ms
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Active Connections</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {health.database.connections.active}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Idle Connections</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {health.database.connections.idle}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total Pool Size</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {health.database.connections.total}
              </span>
            </div>
          </div>
        </div>

        {/* System Resources */}
        {health.system && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              System Resources
            </h3>
            <div className="space-y-4">
              {health.system.memory && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Memory Usage</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {health.system.memory.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        health.system.memory.percentage > 80
                          ? 'bg-red-500'
                          : health.system.memory.percentage > 60
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${health.system.memory.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {health.system.memory.used} MB / {health.system.memory.total} MB
                  </p>
                </div>
              )}

              {health.system.cpu && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">CPU Usage</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {health.system.cpu.usage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        health.system.cpu.usage > 80
                          ? 'bg-red-500'
                          : health.system.cpu.usage > 60
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${health.system.cpu.usage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
