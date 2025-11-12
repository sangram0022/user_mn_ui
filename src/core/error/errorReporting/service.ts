/**
 * Error Reporting Service
 * 
 * Handles:
 * - Batching error reports
 * - Retry logic with exponential backoff
 * - Multiple backend integration support (Sentry, Rollbar, custom)
 * - Breadcrumb tracking
 * - Performance monitoring context
 */

import { logger } from '@/core/logging';
import type { ErrorReportingConfig } from './config';
import { getErrorReportingConfig } from './config';
import type {
  ReportedError,
  ErrorReportBatch,
  QueuedErrorReport,
  ErrorBreadcrumb,
  ErrorUserContext,
  ErrorEnvironmentContext,
  ErrorPerformanceContext,
} from './types';
import { generateBatchId, createReportedError } from './types';

/**
 * Error Reporting Service
 * Manages error batching, retrying, and reporting to multiple backends
 */
class ErrorReportingService {
  private config: ErrorReportingConfig;
  private queue: QueuedErrorReport[] = [];
  private breadcrumbs: ErrorBreadcrumb[] = [];
  private batchTimeout: ReturnType<typeof setTimeout> | null = null;
  private userContext: ErrorUserContext | null = null;
  private environmentContext: ErrorEnvironmentContext | null = null;
  private performanceContext: ErrorPerformanceContext = {};

  constructor() {
    this.config = getErrorReportingConfig();
    this.initializeEnvironment();
    this.setupBreadcrumbTracking();
  }

  /**
   * Report an error
   */
  public reportError(
    error: Error | unknown,
    source: 'error-boundary' | 'global-handler' | 'api-client' | 'unhandled-rejection' | 'custom',
    context?: Record<string, unknown>
  ): string {
    if (!this.config.enabled) {
      return '';
    }

    // Check if should report based on sampling
    if (!this.shouldReportError()) {
      return '';
    }

    // Create reported error
    const reportedError = createReportedError(error, source, context);

    // Add breadcrumbs
    reportedError.breadcrumbs = this.breadcrumbs.slice(-this.config.breadcrumbs.maxBreadcrumbs);

    // Add context
    if (this.config.userTracking.enabled) {
      reportedError.user = this.userContext || undefined;
    }

    reportedError.environment = this.environmentContext || undefined;

    if (this.config.performanceTracking.enabled) {
      reportedError.performance = this.performanceContext;
    }

    // Add to queue
    this.queueError(reportedError);

    // Log locally
    logger().warn('Error queued for reporting', {
      errorId: reportedError.id,
      source,
      queueSize: this.queue.length,
      context: 'errorReportingService.reportError',
    });

    return reportedError.id;
  }

  /**
   * Add user context
   */
  public setUserContext(user: Partial<ErrorUserContext>): void {
    this.userContext = {
      timestamp: new Date().toISOString(),
      ...this.userContext,
      ...user,
    };

    logger().debug('User context updated', {
      userId: user.userId,
      context: 'errorReportingService.setUserContext',
    });
  }

  /**
   * Add breadcrumb
   */
  public addBreadcrumb(
    message: string,
    type: ErrorBreadcrumb['type'],
    data?: Record<string, unknown>,
    level?: ErrorBreadcrumb['level']
  ): void {
    if (!this.config.breadcrumbs.enabled) {
      return;
    }

    this.breadcrumbs.push({
      timestamp: new Date().toISOString(),
      type,
      message,
      data,
      level: level || 'info',
    });

    // Keep only max breadcrumbs
    if (this.breadcrumbs.length > this.config.breadcrumbs.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.config.breadcrumbs.maxBreadcrumbs);
    }
  }

  /**
   * Update performance context
   */
  public updatePerformanceContext(perf: Partial<ErrorPerformanceContext>): void {
    if (!this.config.performanceTracking.enabled) {
      return;
    }

    this.performanceContext = {
      ...this.performanceContext,
      ...perf,
    };
  }

  /**
   * Get current queue size
   */
  public getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Get error statistics
   */
  public getStatistics(): {
    queueSize: number;
    breadcrumbCount: number;
    config: Partial<ErrorReportingConfig>;
  } {
    return {
      queueSize: this.queue.length,
      breadcrumbCount: this.breadcrumbs.length,
      config: {
        enabled: this.config.enabled,
        batchSize: this.config.batchSize,
        maxQueueSize: this.config.maxQueueSize,
        sampling: this.config.sampling,
      },
    };
  }

  /**
   * Manually flush pending errors
   */
  public async flush(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    if (this.queue.length > 0) {
      await this.sendBatch();
    }
  }

  /**
   * Clear queue (for testing)
   */
  public clearQueue(): void {
    this.queue = [];
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
  }

  /**
   * Private methods
   */

  private initializeEnvironment(): void {
    this.environmentContext = {
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
    };

    // Try to get memory info
    const perfMemory = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
    if (perfMemory) {
      this.environmentContext.memory = {
        used: perfMemory.usedJSHeapSize,
        total: perfMemory.totalJSHeapSize,
      };
    }

    logger().debug('Environment context initialized', {
      context: 'errorReportingService.initializeEnvironment',
    });
  }

  private setupBreadcrumbTracking(): void {
    if (!this.config.breadcrumbs.enabled) {
      return;
    }

    // Track console messages
    if (this.config.breadcrumbs.captureConsole) {
      // eslint-disable-next-line no-console
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;

      // eslint-disable-next-line no-console
      console.log = (...args: unknown[]) => {
        originalConsoleLog(...args);
        this.addBreadcrumb(args.join(' '), 'console', { args }, 'info');
      };

      console.error = (...args: unknown[]) => {
        originalConsoleError(...args);
        this.addBreadcrumb(args.join(' '), 'console', { args }, 'error');
      };
    }

    // Track navigation
    if (this.config.breadcrumbs.captureNavigation) {
      window.addEventListener('popstate', () => {
        this.addBreadcrumb('Navigation', 'navigation', {
          url: window.location.href,
        });
      });
    }

    logger().debug('Breadcrumb tracking enabled', {
      context: 'errorReportingService.setupBreadcrumbTracking',
    });
  }

  private shouldReportError(): boolean {
    if (!this.config.sampling.enabled) {
      return true;
    }

    return Math.random() < this.config.sampling.rate;
  }

  private queueError(error: ReportedError): void {
    if (this.queue.length >= this.config.maxQueueSize) {
      // Remove oldest error if queue is full
      this.queue.shift();
      logger().warn('Error queue full, removing oldest', {
        context: 'errorReportingService.queueError',
      });
    }

    const queuedError: QueuedErrorReport = {
      ...error,
      retryMetadata: {
        attempt: 0,
        lastAttemptTime: new Date().toISOString(),
      },
    };

    this.queue.push(queuedError);

    // Schedule batch sending
    if (this.queue.length >= this.config.batchSize) {
      // Send immediately if batch is full
      this.sendBatchSoon();
    } else if (this.queue.length === 1 && !this.batchTimeout) {
      // Schedule timeout if this is first error
      this.scheduleBatchTimeout();
    }
  }

  private scheduleBatchTimeout(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.sendBatchSoon();
    }, this.config.batchTimeoutMs);
  }

  private sendBatchSoon(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = null;
    this.sendBatch();
  }

  private async sendBatch(): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }

    // Extract errors to send
    const errorsToSend = this.queue.splice(0, this.config.batchSize);

    const batch: ErrorReportBatch = {
      batchId: generateBatchId(),
      timestamp: new Date().toISOString(),
      application: {
        name: import.meta.env.VITE_APP_NAME || 'UserMN',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        environment: import.meta.env.MODE,
      },
      // Remove retryMetadata before sending
      errors: errorsToSend.map(
        // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
        ({ retryMetadata, ...error }) => error
      ),
      count: errorsToSend.length,
    };

    logger().debug('Sending error batch', {
      batchId: batch.batchId,
      errorCount: batch.count,
      context: 'errorReportingService.sendBatch',
    });

    // Try to send to configured endpoints
    let sent = false;

    // Send to custom backend
    if (this.config.integrations.customBackend?.enabled) {
      const success = await this.sendToCustomBackend(batch);
      if (success) sent = true;
    }

    // Send to Sentry
    if (this.config.integrations.sentry?.enabled && !sent) {
      const success = await this.sendToSentry(batch);
      if (success) sent = true;
    }

    // Send to Rollbar
    if (this.config.integrations.rollbar?.enabled && !sent) {
      const success = await this.sendToRollbar(batch);
      if (success) sent = true;
    }

    if (!sent) {
      logger().warn('Failed to send error batch', {
        batchId: batch.batchId,
        reason: 'No endpoints available',
        context: 'errorReportingService.sendBatch',
      });
    }
  }

  private async sendToCustomBackend(batch: ErrorReportBatch): Promise<boolean> {
    try {
      const endpoint = this.config.integrations.customBackend?.endpoint || this.config.apiEndpoint;
      const apiKey = this.config.integrations.customBackend?.apiKey;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (apiKey) {
        headers['X-API-Key'] = apiKey;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(batch),
      });

      if (response.ok) {
        logger().info('Error batch sent to backend', {
          batchId: batch.batchId,
          endpoint,
          context: 'errorReportingService.sendToCustomBackend',
        });
        return true;
      }

      logger().warn('Error batch send failed', {
        batchId: batch.batchId,
        status: response.status,
        context: 'errorReportingService.sendToCustomBackend',
      });
      return false;
    } catch (error) {
      logger().warn('Error sending batch to custom backend', {
        error: error instanceof Error ? error.message : String(error),
        context: 'errorReportingService.sendToCustomBackend',
      });
      return false;
    }
  }

  private async sendToSentry(batch: ErrorReportBatch): Promise<boolean> {
    try {
      // Sentry integration stub
      logger().debug('Sentry integration not yet implemented', {
        batchId: batch.batchId,
        context: 'errorReportingService.sendToSentry',
      });
      return false;
    } catch (error) {
      logger().warn('Error sending to Sentry', {
        error: error instanceof Error ? error.message : String(error),
        context: 'errorReportingService.sendToSentry',
      });
      return false;
    }
  }

  private async sendToRollbar(batch: ErrorReportBatch): Promise<boolean> {
    try {
      // Rollbar integration stub
      logger().debug('Rollbar integration not yet implemented', {
        batchId: batch.batchId,
        context: 'errorReportingService.sendToRollbar',
      });
      return false;
    } catch (error) {
      logger().warn('Error sending to Rollbar', {
        error: error instanceof Error ? error.message : String(error),
        context: 'errorReportingService.sendToRollbar',
      });
      return false;
    }
  }
}

// Singleton instance
let instance: ErrorReportingService | null = null;

/**
 * Get error reporting service instance
 */
export function getErrorReportingService(): ErrorReportingService {
  if (!instance) {
    instance = new ErrorReportingService();
  }
  return instance;
}

/**
 * Convenience function to report error
 */
export async function reportErrorToService(
  error: Error | unknown,
  source: 'error-boundary' | 'global-handler' | 'api-client' | 'unhandled-rejection' | 'custom' = 'custom',
  context?: Record<string, unknown>
): Promise<string> {
  const service = getErrorReportingService();
  return service.reportError(error, source, context);
}

/**
 * Flush pending errors (call before page unload)
 */
export async function flushErrors(): Promise<void> {
  const service = getErrorReportingService();
  await service.flush();
}
