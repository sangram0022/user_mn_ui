/**
 * Health Check Page Component
 * Displays application health status including dependency checks
 */

import type { HealthCheckResponse } from '@shared/services/health.service';
import { getBasicHealth, getDetailedHealth } from '@shared/services/health.service';
import { useEffect, useState } from 'react';

export function HealthPage() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true);
        // Get detailed health with dependency checks
        const healthData = await getDetailedHealth();
        setHealth(healthData);
        setError(null);
      } catch (err) {
        // Fallback to basic health if detailed check fails
        setHealth(getBasicHealth());
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    // Re-check health every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container-narrow">
          <div className="card-base">
            <h1>Health Check</h1>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const statusColor = {
    healthy: '#22c55e',
    degraded: '#eab308',
    unhealthy: '#ef4444',
  };

  return (
    <div className="page-wrapper">
      <div className="container-narrow">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-6">
          [HEALTH] Application Health
        </h1>

        <div className="stack-lg">
          <div
            className="card-base"
            style={{
              borderLeft: `4px solid ${statusColor[health?.status || 'unhealthy']}`,
            }}
          >
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              Status:{' '}
              <span
                style={{
                  color: statusColor[health?.status || 'unhealthy'],
                  textTransform: 'uppercase',
                }}
              >
                {health?.status || 'unknown'}
              </span>
            </h2>
          </div>

          <div className="card-base bg-[#f0f9ff]">
            <div className="stack-sm">
              <p className="text-[var(--color-text-primary)]">
                <strong>Service:</strong> {health?.service}
              </p>
              <p className="text-[var(--color-text-primary)]">
                <strong>Version:</strong> {health?.version}
              </p>
              <p className="text-[var(--color-text-primary)]">
                <strong>Environment:</strong> {health?.environment || 'unknown'}
              </p>
              <p className="text-[var(--color-text-primary)]">
                <strong>Uptime:</strong> {Math.round((health?.uptime_ms || 0) / 1000)}s
              </p>
              <p className="text-[var(--color-text-primary)]">
                <strong>Last Updated:</strong> {health?.timestamp}
              </p>
            </div>
          </div>

          {health?.dependencies && (
            <div className="card-base">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                Dependencies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(health.dependencies).map(([name, status]) => (
                  <div
                    key={name}
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: status === 'ok' ? '#f0fdf4' : '#fef2f2',
                      borderColor: status === 'ok' ? '#86efac' : '#fca5a5',
                    }}
                  >
                    <div className="font-bold mb-2 capitalize text-[var(--color-text-primary)]">
                      {name.replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div
                      className="text-sm font-bold"
                      style={{
                        color: status === 'ok' ? '#16a34a' : '#dc2626',
                      }}
                    >
                      {status === 'ok' ? '[OK]' : '[ERROR]'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="card-base bg-[#fef2f2] border-l-4 border-[#ef4444]">
              <p className="text-[var(--color-text-primary)]">[WARNING] Warning: {error}</p>
            </div>
          )}

          <div className="card-base bg-[#1e293b] text-[#e2e8f0]">
            <pre className="overflow-auto text-sm">{JSON.stringify(health, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthPage;
