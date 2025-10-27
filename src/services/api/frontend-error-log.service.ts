/**
 * Frontend Error Logging Service
 * Reference: API_COMPLETE_REFERENCE_PART2_FINAL.md - Frontend Logging (Endpoint 52)
 * POST /logs/frontend-errors
 */

import { apiClient } from '@lib/api/client';
import type { FrontendErrorRequest, FrontendErrorResponse } from '@shared/types/api-complete.types';
import { logger } from '@shared/utils/logger';

interface ErrorLogOptions {
  /**
   * Maximum number of errors to batch before sending
   */
  batchSize?: number;

  /**
   * Time window in milliseconds to wait before sending batched errors
   */
  batchWindow?: number;

  /**
   * Enable error deduplication (prevents logging same error multiple times)
   */
  deduplicate?: boolean;

  /**
   * Deduplication window in milliseconds
   */
  deduplicationWindow?: number;
}

/**
 * Frontend Error Logging Service
 * Logs client-side errors to backend for monitoring and analysis
 */
export class FrontendErrorLogService {
  private errorQueue: FrontendErrorRequest[] = [];
  private batchTimer: number | null = null;
  private errorHashes = new Map<string, number>();
  private options: Required<ErrorLogOptions>;

  constructor(options: ErrorLogOptions = {}) {
    this.options = {
      batchSize: options.batchSize ?? 10,
      batchWindow: options.batchWindow ?? 5000,
      deduplicate: options.deduplicate ?? true,
      deduplicationWindow: options.deduplicationWindow ?? 60000,
    };

    // Setup global error handlers
    this.setupGlobalHandlers();
  }

  /**
   * Log Frontend Error
   * POST /logs/frontend-errors
   *
   * Log a JavaScript error to the backend.
   * Rate limit: 60 requests per minute per IP.
   *
   * @param error - Error object or message
   * @param metadata - Additional context
   * @returns Log response
   *
   * @example
   * try {
   *   // Some code
   * } catch (error) {
   *   await frontendErrorLog.logError(error, {
   *     component: 'UserProfile',
   *     action: 'save',
   *     userId: '123'
   *   });
   * }
   */
  async logError(
    error: Error | string,
    metadata?: Record<string, unknown>
  ): Promise<FrontendErrorResponse | null> {
    try {
      const errorRequest = this.buildErrorRequest(error, 'error', metadata);

      // Check for duplicates
      if (this.options.deduplicate && this.isDuplicate(errorRequest)) {
        logger.debug('[FrontendErrorLog] Duplicate error detected, skipping', {
          message: errorRequest.message,
        });
        return null;
      }

      // Add to queue for batching
      this.errorQueue.push(errorRequest);

      // Send if batch size reached
      if (this.errorQueue.length >= this.options.batchSize) {
        return await this.flushQueue();
      }

      // Otherwise, schedule batch send
      this.scheduleBatchSend();

      return null;
    } catch (err) {
      logger.error('[FrontendErrorLog] Failed to log error', err as Error);
      return null;
    }
  }

  /**
   * Log Warning
   *
   * Log a warning-level event.
   *
   * @param message - Warning message
   * @param metadata - Additional context
   *
   * @example
   * frontendErrorLog.logWarning('API deprecation warning', {
   *   endpoint: '/api/v1/old-endpoint',
   *   deprecatedSince: '2025-01-01'
   * });
   */
  async logWarning(
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<FrontendErrorResponse | null> {
    const errorRequest = this.buildErrorRequest(message, 'warning', metadata);
    this.errorQueue.push(errorRequest);
    this.scheduleBatchSend();
    return null;
  }

  /**
   * Log Info
   *
   * Log an informational event.
   *
   * @param message - Info message
   * @param metadata - Additional context
   *
   * @example
   * frontendErrorLog.logInfo('Feature flag enabled', {
   *   feature: 'new-dashboard',
   *   userId: '123'
   * });
   */
  async logInfo(
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<FrontendErrorResponse | null> {
    const errorRequest = this.buildErrorRequest(message, 'info', metadata);
    this.errorQueue.push(errorRequest);
    this.scheduleBatchSend();
    return null;
  }

  /**
   * Build error request payload
   */
  private buildErrorRequest(
    error: Error | string,
    level: 'error' | 'warning' | 'info',
    metadata?: Record<string, unknown>
  ): FrontendErrorRequest {
    const message = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'object' && 'stack' in error ? error.stack : undefined;

    return {
      message: message.substring(0, 1000),
      stack: stack?.substring(0, 5000),
      url: window.location.href,
      user_agent: navigator.userAgent.substring(0, 500),
      timestamp: new Date().toISOString(),
      level,
      metadata: {
        ...metadata,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        online: navigator.onLine,
        memory:
          'memory' in performance
            ? {
                usedJSHeapSize: (performance as unknown as { memory: { usedJSHeapSize: number } })
                  .memory.usedJSHeapSize,
                totalJSHeapSize: (performance as unknown as { memory: { totalJSHeapSize: number } })
                  .memory.totalJSHeapSize,
              }
            : undefined,
      },
    };
  }

  /**
   * Check if error is a duplicate
   */
  private isDuplicate(errorRequest: FrontendErrorRequest): boolean {
    const hash = this.hashError(errorRequest);
    const now = Date.now();
    const lastSeen = this.errorHashes.get(hash);

    if (lastSeen && now - lastSeen < this.options.deduplicationWindow) {
      return true;
    }

    this.errorHashes.set(hash, now);

    // Cleanup old hashes
    if (this.errorHashes.size > 1000) {
      const oldestAllowed = now - this.options.deduplicationWindow;
      for (const [key, timestamp] of this.errorHashes.entries()) {
        if (timestamp < oldestAllowed) {
          this.errorHashes.delete(key);
        }
      }
    }

    return false;
  }

  /**
   * Create hash from error for deduplication
   */
  private hashError(errorRequest: FrontendErrorRequest): string {
    const parts = [errorRequest.message, errorRequest.level, errorRequest.url];
    return parts.join('::');
  }

  /**
   * Schedule batch send
   */
  private scheduleBatchSend(): void {
    if (this.batchTimer !== null) {
      return;
    }

    this.batchTimer = window.setTimeout(() => {
      this.flushQueue().catch((error) => {
        logger.error('[FrontendErrorLog] Failed to flush queue', error);
      });
    }, this.options.batchWindow);
  }

  /**
   * Flush error queue to backend
   */
  private async flushQueue(): Promise<FrontendErrorResponse | null> {
    if (this.errorQueue.length === 0) {
      return null;
    }

    if (this.batchTimer !== null) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      logger.debug('[FrontendErrorLog] Flushing error queue', {
        count: errors.length,
      });

      // Send most recent error (or batch if backend supports it)
      const response = await apiClient.execute<FrontendErrorResponse>('/logs/frontend-errors', {
        method: 'POST',
        body: JSON.stringify(errors[errors.length - 1]),
      });

      logger.info('[FrontendErrorLog] Errors logged successfully', {
        count: errors.length,
        errorId: response.error_id,
      });

      return response;
    } catch (error) {
      logger.error('[FrontendErrorLog] Failed to send errors', error as Error);

      // Re-queue errors for retry
      this.errorQueue.unshift(...errors);

      return null;
    }
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalHandlers(): void {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.logError(event.error || event.message, {
        type: 'unhandled_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }).catch(() => {
        // Silent failure
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(event.reason || 'Unhandled Promise Rejection', {
        type: 'unhandled_rejection',
        promise: String(event.promise),
      }).catch(() => {
        // Silent failure
      });
    });

    // Send queued errors before page unload
    window.addEventListener('beforeunload', () => {
      if (this.errorQueue.length > 0) {
        // Use sendBeacon for reliable error sending during page unload
        const error = this.errorQueue[this.errorQueue.length - 1];
        const blob = new Blob([JSON.stringify(error)], {
          type: 'application/json',
        });
        navigator.sendBeacon('/api/v1/logs/frontend-errors', blob);
      }
    });
  }

  /**
   * Clear error queue
   *
   * @example
   * frontendErrorLog.clearQueue();
   */
  clearQueue(): void {
    this.errorQueue = [];
    if (this.batchTimer !== null) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * Get queue size
   *
   * @returns Number of queued errors
   *
   * @example
   * const queueSize = frontendErrorLog.getQueueSize();
   */
  getQueueSize(): number {
    return this.errorQueue.length;
  }

  /**
   * Force flush queue immediately
   *
   * @example
   * await frontendErrorLog.flush();
   */
  async flush(): Promise<FrontendErrorResponse | null> {
    return await this.flushQueue();
  }
}

// Export singleton instance
export const frontendErrorLog = new FrontendErrorLogService({
  batchSize: 10,
  batchWindow: 5000,
  deduplicate: true,
  deduplicationWindow: 60000,
});

export default frontendErrorLog;
