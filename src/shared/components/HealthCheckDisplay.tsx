/**
 * Health Check Display Component
 * Shows application health status for debugging and monitoring
 */

import { useHealthCheck } from './useHealthCheck';

export const HealthCheckDisplay = () => {
  const { healthStatus } = useHealthCheck();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Application Health Status</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Overall Status</p>
          <p className={`text-lg font-semibold ${getStatusColor(healthStatus.status)}`}>
            {healthStatus.status.toUpperCase()}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Last Check</p>
          <p className="text-sm">{new Date(healthStatus.timestamp).toLocaleString()}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Version</p>
          <p className="text-sm">{healthStatus.version}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-600">Uptime</p>
           <p className="text-sm">{Math.round((healthStatus.uptime || 0) / 1000)}s</p>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">Component Checks</p>
        <div className="grid grid-cols-2 gap-2">
           {Object.entries(healthStatus.checks || {}).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm capitalize">{key}</span>
            </div>
          ))}
        </div>
      </div>
      
      {healthStatus.metrics && Object.keys(healthStatus.metrics).length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Metrics</p>
          <div className="text-xs space-y-1">
            {healthStatus.metrics.memoryUsage && (
              <p>Memory Usage: {healthStatus.metrics.memoryUsage}%</p>
            )}
            {healthStatus.metrics.responseTime && (
              <p>Response Time: {Math.round(healthStatus.metrics.responseTime)}ms</p>
            )}
            {healthStatus.metrics.errorRate !== undefined && (
              <p>Error Rate: {healthStatus.metrics.errorRate}%</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};