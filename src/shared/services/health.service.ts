/**
 * Health Check Service
 * Provides production-grade health check with dependency verification
 *
 * Exposed at:
 * - GET /health (simple status)
 * - GET /health/detailed (with dependency checks)
 */

import { getEnv } from '@config/env.validation';

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  service: 'user-management-ui';
  version: string;
  uptime_ms: number;
  dependencies?: {
    api: 'ok' | 'error';
    localStorage: 'ok' | 'error';
    sessionStorage: 'ok' | 'error';
  };
  environment?: string;
}

const startTime = Date.now();

/**
 * Check API backend connectivity
 */
async function checkApiHealth(): Promise<boolean> {
  try {
    const env = getEnv();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${env.VITE_API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
      credentials: 'include', // Include cookies for auth check
    });

    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Check local storage
 */
function checkLocalStorage(): boolean {
  try {
    const testKey = '__health_check_local__';
    localStorage.setItem(testKey, 'ok');
    const result = localStorage.getItem(testKey) === 'ok';
    localStorage.removeItem(testKey);
    return result;
  } catch {
    return false;
  }
}

/**
 * Check session storage
 */
function checkSessionStorage(): boolean {
  try {
    const testKey = '__health_check_session__';
    sessionStorage.setItem(testKey, 'ok');
    const result = sessionStorage.getItem(testKey) === 'ok';
    sessionStorage.removeItem(testKey);
    return result;
  } catch {
    return false;
  }
}

/**
 * Get basic health status (used by load balancers)
 */
export function getBasicHealth(): HealthCheckResponse {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'user-management-ui',
    version: import.meta.env.VITE_VERSION || '1.0.0',
    uptime_ms: Date.now() - startTime,
  };
}

/**
 * Get detailed health status with dependency checks
 */
export async function getDetailedHealth(): Promise<HealthCheckResponse> {
  const apiOk = await checkApiHealth();
  const localStorageOk = checkLocalStorage();
  const sessionStorageOk = checkSessionStorage();

  const allOk = apiOk && localStorageOk && sessionStorageOk;
  const someOk = apiOk || localStorageOk || sessionStorageOk;

  return {
    status: allOk ? 'healthy' : someOk ? 'degraded' : 'unhealthy',
    timestamp: new Date().toISOString(),
    service: 'user-management-ui',
    version: import.meta.env.VITE_VERSION || '1.0.0',
    uptime_ms: Date.now() - startTime,
    environment: import.meta.env.VITE_APP_ENV || 'unknown',
    dependencies: {
      api: apiOk ? 'ok' : 'error',
      localStorage: localStorageOk ? 'ok' : 'error',
      sessionStorage: sessionStorageOk ? 'ok' : 'error',
    },
  };
}

export default {
  getBasicHealth,
  getDetailedHealth,
};
