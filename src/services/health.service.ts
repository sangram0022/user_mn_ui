/**
 * Health Check Service
 * Monitors system health and availability
 */

import { API_ENDPOINTS } from '../config/api.config';
import {
  DatabaseHealthStatus,
  DetailedHealthStatus,
  HealthStatus,
  SystemMetrics,
} from '../types/api.types';
import apiService from './api.service';

class HealthService {
  /**
   * Perform basic health check
   */
  async getBasicHealth(): Promise<HealthStatus> {
    return apiService.get<HealthStatus>(API_ENDPOINTS.HEALTH.BASIC);
  }

  /**
   * Check if service is ready to accept requests
   */
  async getReadiness(): Promise<HealthStatus> {
    return apiService.get<HealthStatus>(API_ENDPOINTS.HEALTH.READY);
  }

  /**
   * Get detailed health check with all components
   */
  async getDetailedHealth(): Promise<DetailedHealthStatus> {
    return apiService.get<DetailedHealthStatus>(API_ENDPOINTS.HEALTH.DETAILED);
  }

  /**
   * Check database connectivity and performance
   */
  async getDatabaseHealth(): Promise<DatabaseHealthStatus> {
    return apiService.get<DatabaseHealthStatus>(API_ENDPOINTS.HEALTH.DATABASE);
  }

  /**
   * Get system resource metrics
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    return apiService.get<SystemMetrics>(API_ENDPOINTS.HEALTH.SYSTEM);
  }

  /**
   * Check overall system health status
   * @returns true if all systems are healthy
   */
  async isSystemHealthy(): Promise<boolean> {
    try {
      const health = await this.getDetailedHealth();
      return health.status === 'healthy';
    } catch {
      return false;
    }
  }

  /**
   * Monitor health status with polling
   * @param callback Function to call with health status
   * @param interval Polling interval in milliseconds
   * @returns Cleanup function to stop monitoring
   */
  monitorHealth(
    callback: (status: DetailedHealthStatus) => void,
    interval: number = 30000
  ): () => void {
    const poll = async () => {
      try {
        const status = await this.getDetailedHealth();
        callback(status);
      } catch (error) {
        console.error('Health check failed:', error);
      }
    };

    poll(); // Initial check
    const intervalId = setInterval(poll, interval);

    return () => clearInterval(intervalId);
  }
}

export default new HealthService();
