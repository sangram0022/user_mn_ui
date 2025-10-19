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
      <div style={styles.container}>
        <h1>Health Check</h1>
        <p>Loading...</p>
      </div>
    );
  }

  const statusColor = {
    healthy: '#22c55e',
    degraded: '#eab308',
    unhealthy: '#ef4444',
  };

  return (
    <div style={styles.container}>
      <h1>🏥 Application Health</h1>

      <div
        style={{
          ...styles.status,
          borderLeft: `4px solid ${statusColor[health?.status || 'unhealthy']}`,
        }}
      >
        <h2>
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

      <div style={styles.info}>
        <p>
          <strong>Service:</strong> {health?.service}
        </p>
        <p>
          <strong>Version:</strong> {health?.version}
        </p>
        <p>
          <strong>Environment:</strong> {health?.environment || 'unknown'}
        </p>
        <p>
          <strong>Uptime:</strong> {Math.round((health?.uptime_ms || 0) / 1000)}s
        </p>
        <p>
          <strong>Last Updated:</strong> {health?.timestamp}
        </p>
      </div>

      {health?.dependencies && (
        <div style={styles.dependencies}>
          <h3>Dependencies</h3>
          <div style={styles.dependencyGrid}>
            {Object.entries(health.dependencies).map(([name, status]) => (
              <div
                key={name}
                style={{
                  ...styles.dependency,
                  backgroundColor: status === 'ok' ? '#f0fdf4' : '#fef2f2',
                  borderColor: status === 'ok' ? '#86efac' : '#fca5a5',
                }}
              >
                <div style={styles.dependencyName}>{name.replace(/([A-Z])/g, ' $1')}</div>
                <div
                  style={{
                    ...styles.dependencyStatus,
                    color: status === 'ok' ? '#16a34a' : '#dc2626',
                  }}
                >
                  {status === 'ok' ? '✓ OK' : '✗ ERROR'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={styles.error}>
          <p>⚠️ Warning: {error}</p>
        </div>
      )}

      <pre style={styles.json}>{JSON.stringify(health, null, 2)}</pre>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  status: {
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '0.5rem',
  },
  info: {
    padding: '1rem',
    backgroundColor: '#f0f9ff',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
  },
  dependencies: {
    marginBottom: '1rem',
  },
  dependencyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  dependency: {
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid',
  },
  dependencyName: {
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    textTransform: 'capitalize',
  },
  dependencyStatus: {
    fontSize: '0.875rem',
    fontWeight: 'bold',
  },
  error: {
    padding: '1rem',
    backgroundColor: '#fef2f2',
    borderRadius: '0.5rem',
    borderLeft: '4px solid #ef4444',
    marginBottom: '1rem',
  },
  json: {
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    padding: '1rem',
    borderRadius: '0.5rem',
    overflow: 'auto',
    fontSize: '0.875rem',
  },
} as const;

export default HealthPage;
