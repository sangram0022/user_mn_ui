/**
 * Frontend Error Logger Service
 * Automatically logs frontend errors to backend for monitoring and debugging
 * Reference: API_INTEGRATION_GUIDE.md - Section 8. Frontend Error Logging
 */

import { apiClient } from '@lib/api/client';
import type { FrontendErrorRequest } from '@shared/types';
import { logger } from '@shared/utils/logger';

type ErrorSeverity = 'error' | 'warning' | 'info';

interface ErrorLogOptions {
  severity?: ErrorSeverity;
  metadata?: Record<string, unknown>;
  skipBackend?: boolean; // For testing or when backend is unavailable
}

/**
 * Frontend Error Logger
 * Centralizes error logging to backend API
 */
export class ErrorLoggerService {
  private queue: FrontendErrorRequest[] = [];
  private isProcessing = false;
  private maxQueueSize = 50;
  private flushInterval = 5000; // 5 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Start periodic flush
    this.startPeriodicFlush();

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushSync();
      });
    }
  }

  /**
   * Log an error to the backend
   */
  async logError(error: Error | string, options: ErrorLogOptions = {}): Promise<void> {
    const { severity = 'error', metadata = {}, skipBackend = false } = options;

    const errorPayload: FrontendErrorRequest = {
      message: typeof error === 'string' ? error : error.message,
      stack: error instanceof Error ? error.stack : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
      severity,
      metadata,
    };

    // Log locally
    if (import.meta.env.DEV) {
      logger.error(`[ErrorLogger] ${errorPayload.message}`);
    }

    if (skipBackend) {
      return;
    }

    // Add to queue
    this.queue.push(errorPayload);

    // Flush if queue is full
    if (this.queue.length >= this.maxQueueSize) {
      await this.flush();
    }
  }

  /**
   * Log API error (wrapper for API-specific errors)
   */
  async logApiError(
    endpoint: string,
    method: string,
    statusCode: number,
    error: Error | string,
    options: ErrorLogOptions = {}
  ): Promise<void> {
    const metadata = {
      ...options.metadata,
      endpoint,
      method,
      statusCode,
      errorType: 'api_error',
    };

    await this.logError(error, { ...options, metadata });
  }

  /**
   * Log React component error (for error boundaries)
   */
  async logComponentError(
    componentName: string,
    error: Error,
    errorInfo?: { componentStack?: string },
    options: ErrorLogOptions = {}
  ): Promise<void> {
    const metadata = {
      ...options.metadata,
      componentName,
      componentStack: errorInfo?.componentStack,
      errorType: 'component_error',
    };

    await this.logError(error, { ...options, metadata });
  }

  /**
   * Flush queued errors to backend
   */
  private async flush(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const errors = [...this.queue];
    this.queue = [];

    try {
      // Send errors in batch (one by one for now, could be optimized to batch API)
      await Promise.allSettled(
        errors.map((errorPayload) =>
          apiClient.logFrontendError(errorPayload).catch((err) => {
            if (import.meta.env.DEV) {
              logger.warn('[ErrorLogger] Failed to send error to backend');
            }
            console.warn('[ErrorLogger] Failed to send error to backend', err);
            // Re-queue failed errors (with limit to prevent infinite growth)
            if (this.queue.length < this.maxQueueSize) {
              this.queue.push(errorPayload);
            }
          })
        )
      );
    } catch (err) {
      if (import.meta.env.DEV) {
        logger.warn('[ErrorLogger] Batch error logging failed');
      }
      console.warn('[ErrorLogger] Batch error logging failed', err);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Synchronous flush (for page unload)
   */
  private flushSync(): void {
    if (this.queue.length === 0) {
      return;
    }

    // Use sendBeacon for reliable delivery during page unload
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const errors = [...this.queue];
      this.queue = [];

      errors.forEach((errorPayload) => {
        const blob = new Blob([JSON.stringify(errorPayload)], {
          type: 'application/json',
        });
        navigator.sendBeacon('/api/v1/logs/frontend-errors', blob);
      });
    }
  }

  /**
   * Start periodic flush timer
   */
  private startPeriodicFlush(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Stop periodic flush timer
   */
  stopPeriodicFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Clear error queue
   */
  clearQueue(): void {
    this.queue = [];
  }
}

// Singleton instance
export const errorLoggerService = new ErrorLoggerService();

/**
 * Global error handler
 * Automatically logs unhandled errors to backend
 */
export function setupGlobalErrorHandler(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Catch unhandled errors
  window.addEventListener('error', (event) => {
    errorLoggerService.logError(event.error || event.message, {
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        errorType: 'unhandled_error',
      },
    });
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorLoggerService.logError(event.reason, {
      metadata: {
        promise: String(event.promise),
        errorType: 'unhandled_rejection',
      },
    });
  });
}

export default errorLoggerService;
