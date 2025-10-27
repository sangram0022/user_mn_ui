/**
 * Health & Monitoring API Service
 * Reference: API_COMPLETE_REFERENCE_PART2_FINAL.md - Health & Monitoring
 * Implements all 11 health check endpoints (41-51)
 */

import { apiClient } from '@lib/api/client';
import type {
  BasicHealthResponse,
  CacheHealthResponse,
  CircuitsHealthResponse,
  DatabaseHealthResponse,
  DetailedHealthResponse,
  EventsHealthResponse,
  EventsHistoryResponse,
  PatternsHealthResponse,
  PingResponse,
  ReadyResponse,
  SystemHealthResponse,
} from '@shared/types/api-complete.types';
import { logger } from '@shared/utils/logger';

/**
 * Health Monitoring Service
 * Provides comprehensive health check and monitoring functionality
 */
export class HealthService {
  /**
   * Basic Health Check
   * GET /health/
   *
   * Always returns healthy status. Used for Kubernetes/AWS liveness probes.
   *
   * @returns Basic health status
   *
   * @example
   * const health = await healthService.getBasicHealth();
   * // { status: "healthy", timestamp: "...", ... }
   */
  async getBasicHealth(): Promise<BasicHealthResponse> {
    try {
      logger.debug('[HealthService] Checking basic health');

      const response = await apiClient.execute<BasicHealthResponse>('/health/', {
        method: 'GET',
      });

      logger.debug('[HealthService] Basic health check completed');

      return response;
    } catch (error) {
      logger.error('[HealthService] Basic health check failed', error as Error);
      throw error;
    }
  }

  /**
   * Lightweight Ping
   * GET /health/ping
   *
   * Lightweight ping for external monitoring tools (Pingdom, UptimeRobot).
   * Rate limit: 120 requests per minute.
   *
   * @returns Ping response
   *
   * @example
   * const ping = await healthService.ping();
   * // { message: "pong", timestamp: "..." }
   */
  async ping(): Promise<PingResponse> {
    try {
      logger.debug('[HealthService] Ping');

      const response = await apiClient.execute<PingResponse>('/health/ping', {
        method: 'GET',
      });

      logger.debug('[HealthService] Ping successful');

      return response;
    } catch (error) {
      logger.error('[HealthService] Ping failed', error as Error);
      throw error;
    }
  }

  /**
   * Readiness Check
   * GET /health/ready
   *
   * Determines if application is ready to accept traffic.
   * Used for Kubernetes/AWS readiness probes.
   * Rate limit: 60 requests per minute.
   *
   * @returns Readiness status
   *
   * @example
   * const ready = await healthService.getReadiness();
   * // { status: "ready", timestamp: "...", ... }
   */
  async getReadiness(): Promise<ReadyResponse> {
    try {
      logger.debug('[HealthService] Checking readiness');

      const response = await apiClient.execute<ReadyResponse>('/health/ready', {
        method: 'GET',
      });

      logger.debug('[HealthService] Readiness check completed', {
        status: response.status,
      });

      return response;
    } catch (error) {
      logger.error('[HealthService] Readiness check failed', error as Error);
      throw error;
    }
  }

  /**
   * Detailed Health Check
   * GET /health/detailed
   *
   * Comprehensive health check with all subsystems.
   * Includes: database, cache, email, storage, dependencies.
   * Rate limit: 10 requests per minute.
   *
   * @returns Detailed health status with subsystem checks
   *
   * @example
   * const health = await healthService.getDetailedHealth();
   * // {
   * //   status: "healthy",
   * //   checks: {
   * //     database: { status: "healthy", connected: true, ... },
   * //     cache: { status: "healthy", hit_rate: 0.95, ... },
   * //     ...
   * //   }
   * // }
   */
  async getDetailedHealth(): Promise<DetailedHealthResponse> {
    try {
      logger.debug('[HealthService] Fetching detailed health');

      const response = await apiClient.execute<DetailedHealthResponse>('/health/detailed', {
        method: 'GET',
      });

      logger.info('[HealthService] Detailed health check completed', {
        status: response.status,
        uptime: response.uptime_seconds,
      });

      return response;
    } catch (error) {
      logger.error('[HealthService] Detailed health check failed', error as Error);
      throw error;
    }
  }

  /**
   * Database Health Check
   * GET /health/db
   *
   * Check database connectivity independently.
   * Rate limit: 30 requests per minute.
   *
   * @returns Database health status
   *
   * @example
   * const dbHealth = await healthService.getDatabaseHealth();
   * // {
   * //   status: "healthy",
   * //   connected: true,
   * //   response_time_ms: 12.45,
   * //   ...
   * // }
   */
  async getDatabaseHealth(): Promise<DatabaseHealthResponse> {
    try {
      logger.debug('[HealthService] Checking database health');

      const response = await apiClient.execute<DatabaseHealthResponse>('/health/db', {
        method: 'GET',
      });

      logger.debug('[HealthService] Database health check completed', {
        status: response.status,
        responseTime: response.response_time_ms,
      });

      return response;
    } catch (error) {
      logger.error('[HealthService] Database health check failed', error as Error);
      throw error;
    }
  }

  /**
   * System Resource Health
   * GET /health/system
   *
   * Monitor CPU, memory, disk usage.
   * Rate limit: 30 requests per minute.
   *
   * @returns System resource metrics
   *
   * @example
   * const system = await healthService.getSystemHealth();
   * // {
   * //   status: "healthy",
   * //   cpu_usage_percent: 45.2,
   * //   memory_usage_percent: 62.8,
   * //   disk_usage_percent: 35.0,
   * //   ...
   * // }
   */
  async getSystemHealth(): Promise<SystemHealthResponse> {
    try {
      logger.debug('[HealthService] Checking system health');

      const response = await apiClient.execute<SystemHealthResponse>('/health/system', {
        method: 'GET',
      });

      logger.debug('[HealthService] System health check completed', {
        status: response.status,
        cpu: response.cpu_usage_percent,
        memory: response.memory_usage_percent,
      });

      return response;
    } catch (error) {
      logger.error('[HealthService] System health check failed', error as Error);
      throw error;
    }
  }

  /**
   * Architecture Patterns Health
   * GET /health/patterns
   *
   * Monitor circuit breakers, cache, and event bus.
   * Rate limit: 30 requests per minute.
   *
   * @returns Patterns health status
   *
   * @example
   * const patterns = await healthService.getPatternsHealth();
   * // {
   * //   status: "healthy",
   * //   circuits: { total: 5, open: 0, ... },
   * //   cache: { backend: "redis", hit_rate: 0.95, ... },
   * //   events: { total_subscribers: 12, ... }
   * // }
   */
  async getPatternsHealth(): Promise<PatternsHealthResponse> {
    try {
      logger.debug('[HealthService] Checking patterns health');

      const response = await apiClient.execute<PatternsHealthResponse>('/health/patterns', {
        method: 'GET',
      });

      logger.debug('[HealthService] Patterns health check completed', {
        status: response.status,
      });

      return response;
    } catch (error) {
      logger.error('[HealthService] Patterns health check failed', error as Error);
      throw error;
    }
  }

  /**
   * Circuit Breakers Health
   * GET /health/patterns/circuits
   *
   * Detailed circuit breaker metrics.
   * Rate limit: 30 requests per minute.
   *
   * @returns Circuit breaker metrics
   *
   * @example
   * const circuits = await healthService.getCircuitsHealth();
   * // {
   * //   circuits: [
   * //     { name: "database", state: "closed", failure_count: 0, ... }
   * //   ],
   * //   healthy_circuits: 5,
   * //   unhealthy_circuits: 0
   * // }
   */
  async getCircuitsHealth(): Promise<CircuitsHealthResponse> {
    try {
      logger.debug('[HealthService] Fetching circuit breaker health');

      const response = await apiClient.execute<CircuitsHealthResponse>(
        '/health/patterns/circuits',
        {
          method: 'GET',
        }
      );

      logger.debug('[HealthService] Circuit breaker health retrieved', {
        healthy: response.healthy_circuits,
        unhealthy: response.unhealthy_circuits,
      });

      return response;
    } catch (error) {
      logger.error('[HealthService] Circuit breaker health check failed', error as Error);
      throw error;
    }
  }

  /**
   * Cache Performance Metrics
   * GET /health/patterns/cache
   *
   * Cache manager performance metrics.
   * Rate limit: 30 requests per minute.
   *
   * @returns Cache performance metrics
   *
   * @example
   * const cache = await healthService.getCacheHealth();
   * // {
   * //   backend: "redis",
   * //   connected: true,
   * //   hit_rate: 0.95,
   * //   size_mb: 128.5,
   * //   redis_status: "healthy"
   * // }
   */
  async getCacheHealth(): Promise<CacheHealthResponse> {
    try {
      logger.debug('[HealthService] Fetching cache health');

      const response = await apiClient.execute<CacheHealthResponse>('/health/patterns/cache', {
        method: 'GET',
      });

      logger.debug('[HealthService] Cache health retrieved', {
        backend: response.backend,
        hitRate: response.hit_rate,
      });

      return response;
    } catch (error) {
      logger.error('[HealthService] Cache health check failed', error as Error);
      throw error;
    }
  }

  /**
   * Event Bus Metrics
   * GET /health/patterns/events
   *
   * Event bus performance metrics.
   * Rate limit: 30 requests per minute.
   *
   * @returns Event bus metrics
   *
   * @example
   * const events = await healthService.getEventsHealth();
   * // {
   * //   total_event_types: 12,
   * //   total_subscribers: 25,
   * //   recent_events: [...]
   * // }
   */
  async getEventsHealth(): Promise<EventsHealthResponse> {
    try {
      logger.debug('[HealthService] Fetching events health');

      const response = await apiClient.execute<EventsHealthResponse>('/health/patterns/events', {
        method: 'GET',
      });

      logger.debug('[HealthService] Events health retrieved', {
        eventTypes: response.total_event_types,
        subscribers: response.total_subscribers,
      });

      return response;
    } catch (error) {
      logger.error('[HealthService] Events health check failed', error as Error);
      throw error;
    }
  }

  /**
   * Recent Events History
   * GET /health/patterns/events/history
   *
   * Recent events from event bus.
   * Rate limit: 30 requests per minute.
   *
   * @param limit - Max events to return (default: 50, max: 100)
   * @returns Recent events history
   *
   * @example
   * const history = await healthService.getEventsHistory(20);
   * // {
   * //   total: 20,
   * //   events: [
   * //     { event_type: "USER_LOGIN", timestamp: "...", data: {...} }
   * //   ]
   * // }
   */
  async getEventsHistory(limit = 50): Promise<EventsHistoryResponse> {
    try {
      logger.debug('[HealthService] Fetching events history', { limit });

      const response = await apiClient.execute<EventsHistoryResponse>(
        `/health/patterns/events/history?limit=${limit}`,
        {
          method: 'GET',
        }
      );

      logger.debug('[HealthService] Events history retrieved', {
        count: response.total,
      });

      return response;
    } catch (error) {
      logger.error('[HealthService] Events history fetch failed', error as Error);
      throw error;
    }
  }

  /**
   * Get Overall Health Status
   *
   * Combines multiple health checks to determine overall system status.
   *
   * @returns Aggregated health status
   *
   * @example
   * const status = await healthService.getOverallStatus();
   * // {
   * //   healthy: true,
   * //   subsystems: { database: true, cache: true, ... },
   * //   message: "All systems operational"
   * // }
   */
  async getOverallStatus(): Promise<{
    healthy: boolean;
    subsystems: Record<string, boolean>;
    message: string;
    timestamp: string;
  }> {
    try {
      logger.debug('[HealthService] Fetching overall status');

      const [detailed, system, patterns] = await Promise.all([
        this.getDetailedHealth(),
        this.getSystemHealth(),
        this.getPatternsHealth(),
      ]);

      const subsystems = {
        database: detailed.checks.database.status === 'healthy',
        cache: detailed.checks.cache.status === 'healthy',
        email: detailed.checks.email.status === 'healthy',
        storage: detailed.checks.storage.status === 'healthy',
        system: system.status === 'healthy',
        patterns: patterns.status === 'healthy',
      };

      const allHealthy = Object.values(subsystems).every((status) => status);

      return {
        healthy: allHealthy,
        subsystems,
        message: allHealthy
          ? 'All systems operational'
          : 'Some subsystems are degraded or unhealthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('[HealthService] Overall status check failed', error as Error);
      throw error;
    }
  }

  /**
   * Check if System is Ready
   *
   * Quick check to determine if system can accept traffic.
   *
   * @returns True if system is ready
   *
   * @example
   * const isReady = await healthService.isReady();
   * if (isReady) {
   *   // Proceed with operations
   * }
   */
  async isReady(): Promise<boolean> {
    try {
      const readiness = await this.getReadiness();
      return readiness.status === 'ready';
    } catch {
      return false;
    }
  }

  /**
   * Monitor System Health
   *
   * Continuously monitor system health at specified interval.
   * Returns a cleanup function to stop monitoring.
   *
   * @param callback - Callback function called with health status
   * @param intervalMs - Polling interval in milliseconds (default: 30000)
   * @returns Cleanup function to stop monitoring
   *
   * @example
   * const stopMonitoring = healthService.monitorHealth(
   *   (health) => console.log('Health:', health.status),
   *   10000 // Check every 10 seconds
   * );
   *
   * // Later, stop monitoring
   * stopMonitoring();
   */
  monitorHealth(
    callback: (health: DetailedHealthResponse) => void,
    intervalMs = 30000
  ): () => void {
    logger.info('[HealthService] Starting health monitoring', { intervalMs });

    const intervalId = setInterval(async () => {
      try {
        const health = await this.getDetailedHealth();
        callback(health);
      } catch (error) {
        logger.error('[HealthService] Health monitoring error', error as Error);
      }
    }, intervalMs);

    // Initial check
    this.getDetailedHealth()
      .then(callback)
      .catch((error) => {
        logger.error('[HealthService] Initial health check error', error as Error);
      });

    return () => {
      logger.info('[HealthService] Stopping health monitoring');
      clearInterval(intervalId);
    };
  }
}

export const healthService = new HealthService();

export default healthService;
