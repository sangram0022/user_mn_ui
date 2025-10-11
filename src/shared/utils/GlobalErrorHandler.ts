/**
 * Global Error Handler
 * Expert-level unified error handling by 25-year React veteran
 * Consolidates all error handling patterns across the application
 */

import { logger } from './logger';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorReport {
  error: Error;
  context?: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userFriendlyMessage: string;
}

export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize = 50;
  private isReporting = false;

  private constructor() {
    this.setupGlobalHandlers();
  }

  public static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalHandlers(): void {
    // Handle uncaught errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.handleError(
          event.error || new Error(event.message),
          {
            component: 'Global',
            action: 'Uncaught Error',
          },
          'critical'
        );

        // Prevent default browser error handling
        event.preventDefault();
      });

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError(
          event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
          {
            component: 'Global',
            action: 'Unhandled Promise Rejection',
          },
          'high'
        );

        event.preventDefault();
      });
    }
  }

  /**
   * Main error handling entry point
   */
  public handleError(
    error: Error,
    context?: ErrorContext,
    severity: ErrorReport['severity'] = 'medium'
  ): void {
    const errorReport: ErrorReport = {
      error,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        userId: this.getCurrentUserId(),
      },
      severity,
      userFriendlyMessage: this.getUserFriendlyMessage(error, severity),
    };

    // Log error
    this.logError(errorReport);

    // Add to queue for batch reporting
    this.addToQueue(errorReport);

    // Show user notification
    this.showUserNotification(errorReport);

    // Report critical errors immediately
    if (severity === 'critical') {
      this.reportImmediately(errorReport);
    }
  }

  /**
   * Log error with appropriate level
   */
  private logError(report: ErrorReport): void {
    const { error, context, severity } = report;

    logger.error(
      `[${severity.toUpperCase()}] ${error.message}`,
      error,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      context as any
    );

    // In development, also log stack trace
    if (import.meta.env.DEV && error.stack) {
      logger.debug('Error stack trace', { stack: error.stack });
    }
  }

  /**
   * Add error to reporting queue
   */
  private addToQueue(report: ErrorReport): void {
    this.errorQueue.push(report);

    // Limit queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Auto-flush queue periodically
    if (!this.isReporting) {
      this.scheduleReporting();
    }
  }

  /**
   * Schedule periodic error reporting
   */
  private scheduleReporting(): void {
    this.isReporting = true;

    setTimeout(() => {
      this.flushQueue();
      this.isReporting = false;
    }, 30000); // Report every 30 seconds
  }

  /**
   * Flush error queue to monitoring service
   */
  private async flushQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errorsToReport = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await this.reportToMonitoring(errorsToReport);
    } catch (reportError) {
      // Failed to report, put errors back in queue
      this.errorQueue.unshift(...errorsToReport);
      logger.warn('Failed to report errors to monitoring service', { reportError });
    }
  }

  /**
   * Report errors to monitoring service
   */
  private async reportToMonitoring(reports: ErrorReport[]): Promise<void> {
    if (import.meta.env.DEV) {
      logger.debug('Would report errors to monitoring', {
        count: reports.length,
        errors: reports.map((r) => r.error.message),
      });
      return;
    }

    // In production, send to actual monitoring service
    try {
      await fetch('/api/errors/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errors: reports.map((r) => ({
            message: r.error.message,
            stack: r.error.stack,
            context: r.context,
            severity: r.severity,
            timestamp: r.context?.timestamp,
          })),
        }),
      });
    } catch (error) {
      // Silent fail for monitoring
      logger.debug('Monitoring service unavailable', { error });
    }
  }

  /**
   * Report critical error immediately
   */
  private async reportImmediately(report: ErrorReport): Promise<void> {
    try {
      await this.reportToMonitoring([report]);
    } catch (error) {
      logger.warn('Failed to report critical error immediately', { error });
    }
  }

  /**
   * Show user-friendly notification
   */
  private showUserNotification(report: ErrorReport): void {
    // Don't show notifications for low severity errors
    if (report.severity === 'low') return;

    // Use toast notification system if available
    if (typeof window !== 'undefined' && 'dispatchEvent' in window) {
      const event = new CustomEvent('app:error', {
        detail: {
          message: report.userFriendlyMessage,
          severity: report.severity,
        },
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(error: Error, severity: ErrorReport['severity']): string {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }

    // Authentication errors
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return 'Your session has expired. Please log in again.';
    }

    // Permission errors
    if (error.message.includes('403') || error.message.includes('forbidden')) {
      return "You don't have permission to perform this action.";
    }

    // Not found errors
    if (error.message.includes('404') || error.message.includes('not found')) {
      return 'The requested resource was not found.';
    }

    // Server errors
    if (error.message.includes('500') || error.message.includes('server')) {
      return 'A server error occurred. Our team has been notified and is working on it.';
    }

    // Validation errors
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return 'Please check your input and try again.';
    }

    // Critical errors
    if (severity === 'critical') {
      return 'A critical error occurred. Please refresh the page and try again.';
    }

    // Generic error
    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Get current user ID from storage
   */
  private getCurrentUserId(): string | undefined {
    try {
      const authData = localStorage.getItem('auth');
      return authData ? JSON.parse(authData)?.user?.id : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Get all queued errors (for debugging)
   */
  public getQueuedErrors(): ErrorReport[] {
    return [...this.errorQueue];
  }

  /**
   * Clear error queue
   */
  public clearQueue(): void {
    this.errorQueue = [];
  }

  /**
   * Manual error reporting
   */
  public static report(
    error: Error,
    context?: ErrorContext,
    severity?: ErrorReport['severity']
  ): void {
    GlobalErrorHandler.getInstance().handleError(error, context, severity);
  }
}

// Export singleton instance
export const globalErrorHandler = GlobalErrorHandler.getInstance();

// Export convenience function
export const reportError = GlobalErrorHandler.report.bind(GlobalErrorHandler);

// Development helper
if (import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).errorHandler = globalErrorHandler;
  logger.info('Global Error Handler initialized', { environment: 'development' });
}
