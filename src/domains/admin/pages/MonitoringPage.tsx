import { useState, useEffect } from 'react';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';

interface SystemMetric {
  label: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  icon: string;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  uptime: string;
  response_time: string;
  last_check: string;
}

const INITIAL_METRICS: SystemMetric[] = [
  { label: 'CPU Usage', value: 45, unit: '%', status: 'healthy', icon: '⚙️' },
  { label: 'Memory Usage', value: 62, unit: '%', status: 'healthy', icon: '💾' },
  { label: 'Disk Usage', value: 78, unit: '%', status: 'warning', icon: '💿' },
  { label: 'Network I/O', value: 34, unit: 'MB/s', status: 'healthy', icon: '🌐' },
];

const SERVICES: ServiceStatus[] = [
  {
    name: 'API Server',
    status: 'online',
    uptime: '99.98%',
    response_time: '45ms',
    last_check: '2 min ago',
  },
  {
    name: 'Database',
    status: 'online',
    uptime: '99.95%',
    response_time: '12ms',
    last_check: '1 min ago',
  },
  {
    name: 'Cache Server',
    status: 'online',
    uptime: '99.99%',
    response_time: '3ms',
    last_check: '30 sec ago',
  },
  {
    name: 'Background Jobs',
    status: 'degraded',
    uptime: '98.5%',
    response_time: '120ms',
    last_check: '5 min ago',
  },
  {
    name: 'Email Service',
    status: 'online',
    uptime: '99.9%',
    response_time: '200ms',
    last_check: '3 min ago',
  },
];

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<SystemMetric[]>(INITIAL_METRICS);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time metric updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) => {
          // Simulate random fluctuations
          const change = (Math.random() - 0.5) * 10;
          const newValue = Math.max(0, Math.min(100, metric.value + change));
          
          // Determine status based on value
          let status: 'healthy' | 'warning' | 'critical' = 'healthy';
          if (newValue > 80) status = 'critical';
          else if (newValue > 60) status = 'warning';

          return {
            ...metric,
            value: Math.round(newValue * 10) / 10,
            status,
          };
        })
      );
      setLastUpdate(new Date());
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusBadge = (status: 'online' | 'degraded' | 'offline') => {
    switch (status) {
      case 'online':
        return <Badge variant="success">Online</Badge>;
      case 'degraded':
        return <Badge variant="warning">Degraded</Badge>;
      case 'offline':
        return <Badge variant="danger">Offline</Badge>;
    }
  };

  const getMetricColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
    }
  };

  const getMetricBgColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100';
      case 'warning':
        return 'bg-yellow-100';
      case 'critical':
        return 'bg-red-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
          <p className="mt-1 text-sm text-gray-600">
            Real-time system health and performance metrics
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
            Auto-refresh
          </label>
          <Button variant="outline" onClick={() => setLastUpdate(new Date())}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Last Update */}
      <div className="text-sm text-gray-500">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className={`text-3xl font-bold mt-2 ${getMetricColor(metric.status)}`}>
                  {metric.value}
                  <span className="text-base ml-1">{metric.unit}</span>
                </p>
                <div className="mt-2">
                  <Badge
                    variant={
                      metric.status === 'healthy'
                        ? 'success'
                        : metric.status === 'warning'
                          ? 'warning'
                          : 'danger'
                    }
                    size="sm"
                  >
                    {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div
                className={`h-12 w-12 ${getMetricBgColor(metric.status)} rounded-lg flex items-center justify-center`}
              >
                <span className="text-2xl">{metric.icon}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    metric.status === 'healthy'
                      ? 'bg-green-500'
                      : metric.status === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Status */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Service Status</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uptime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Check
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {SERVICES.map((service) => (
                <tr key={service.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{service.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(service.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {service.uptime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {service.response_time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.last_check}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert('Service details coming soon!')}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">High Disk Usage</p>
              <p className="text-sm text-yellow-700">Disk usage is at 78%. Consider cleaning up old files.</p>
              <p className="text-xs text-yellow-600 mt-1">Triggered 15 minutes ago</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => alert('Acknowledge coming soon!')}>
              Acknowledge
            </Button>
          </div>

          <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900">Background Jobs Degraded</p>
              <p className="text-sm text-yellow-700">Background job processor response time increased to 120ms.</p>
              <p className="text-xs text-yellow-600 mt-1">Triggered 5 minutes ago</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => alert('Acknowledge coming soon!')}>
              Acknowledge
            </Button>
          </div>

          <div className="text-center py-4 text-sm text-gray-500">
            No critical alerts at this time
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Placeholder Page</h3>
            <p className="text-sm text-blue-700">
              This is a dummy monitoring page showing simulated real-time data. Actual system monitoring
              integration will be implemented in future updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
