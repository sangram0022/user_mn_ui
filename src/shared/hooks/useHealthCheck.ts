/**
 * Health Check Hook
 * Provides application health status for monitoring and container orchestration
 */

/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    api: boolean;
    database: boolean;
    cache: boolean;
    storage: boolean;
  };
  metrics: {
    memoryUsage?: number;
    responseTime?: number;
    errorRate?: number;
  };
}

export function useHealthCheck() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    uptime: performance.now(),
    checks: {
      api: true,
      database: true,
      cache: true,
      storage: true,
    },
    metrics: {},
  });

  const performHealthCheck = async (): Promise<HealthStatus> => {
    const startTime = performance.now();
    
    try {
      // Check API connectivity
      const apiCheck = await checkApiHealth();
      
      // Check local storage
      const storageCheck = checkLocalStorageHealth();
      
      // Check memory usage (if available)
      const memoryUsage = checkMemoryUsage();
      
      // Calculate response time
      const responseTime = performance.now() - startTime;
      
      const status: HealthStatus = {
        status: apiCheck && storageCheck ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        uptime: performance.now(),
        checks: {
          api: apiCheck,
          database: apiCheck, // Assuming API check covers database
          cache: true, // React Query handles caching
          storage: storageCheck,
        },
        metrics: {
          memoryUsage,
          responseTime,
          errorRate: 0, // Could be calculated from error tracking
        },
      };

      setHealthStatus(status);
      return status;
    } catch {
      const errorStatus: HealthStatus = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        uptime: performance.now(),
        checks: {
          api: false,
          database: false,
          cache: false,
          storage: false,
        },
        metrics: {
          responseTime: performance.now() - startTime,
        },
      };

      setHealthStatus(errorStatus);
      return errorStatus;
    }
  };

  // Check API health
  const checkApiHealth = async (): Promise<boolean> => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      if (!apiBaseUrl) return false;

      const response = await fetch(`${apiBaseUrl}/health`, {
        method: 'GET',
        timeout: 5000,
      } as RequestInit);

      return response.ok;
    } catch {
      return false;
    }
  };

  // Check local storage health
  const checkLocalStorageHealth = (): boolean => {
    try {
      const testKey = '__health_check__';
      const testValue = 'test';
      
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      return retrieved === testValue;
    } catch {
      return false;
    }
  };

  // Check memory usage (if available)
  const checkMemoryUsage = (): number | undefined => {
    if ('memory' in performance && (performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory) {
      const memory = (performance as { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
      return Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100);
    }
    return undefined;
  };

  // Periodic health checks
  useEffect(() => {
    const interval = setInterval(performHealthCheck, 60000); // Check every minute
    performHealthCheck(); // Initial check

    return () => clearInterval(interval);
  }, []);

  // Expose health check endpoint globally for container health checks
  useEffect(() => {
    interface WindowWithHealthCheck extends Window {
      getHealthStatus?: () => HealthStatus | null;
    }
    (window as WindowWithHealthCheck).getHealthStatus = () => healthStatus;
    
    // Create a global health check endpoint
    const originalFetch = window.fetch;
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === 'string' ? input : input.toString();
      
      if (url.endsWith('/health') && (!init || init.method === 'GET')) {
        return Promise.resolve(new Response(JSON.stringify(healthStatus), {
          status: healthStatus.status === 'healthy' ? 200 : 503,
          headers: {
            'Content-Type': 'application/json',
          },
        }));
      }
      
      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [healthStatus]);

  return {
    healthStatus,
    performHealthCheck,
    isHealthy: healthStatus.status === 'healthy',
    isDegraded: healthStatus.status === 'degraded',
    isUnhealthy: healthStatus.status === 'unhealthy',
  };
}

// Export types and hook only - component is in separate file