/**
 * Global Error Handlers
 * 
 * Sets up window-level error handlers for:
 * - Uncaught exceptions (window.onerror)
 * - Unhandled promise rejections (window.onunhandledrejection)
 * 
 * These ensure all errors are logged even if not caught by React boundaries.
 */

import { logger } from '@/core/logging';
import { isProduction } from '@/core/config';

/**
 * Initialize global error handlers
 * Should be called once in App.tsx during application initialization
 */
export function initializeGlobalErrorHandlers(): void {
  // Handle uncaught exceptions
  window.onerror = (
    message: string | Event,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error
  ): boolean => {
    const errorMessage = error?.message || String(message);
    const stack = error?.stack;

    logger().fatal(
      `Uncaught Exception: ${errorMessage}`,
      error || new Error(errorMessage),
      {
        source,
        lineno,
        colno,
        stack,
        context: 'globalErrorHandler.onerror',
        severity: 'critical',
      }
    );

    // Return true to prevent default error handling
    return true;
  };

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const { reason } = event;

    let error: Error | undefined;
    let message: string;

    if (reason instanceof Error) {
      error = reason;
      message = reason.message;
    } else if (typeof reason === 'string') {
      message = reason;
    } else if (reason && typeof reason === 'object' && 'message' in reason) {
      message = String(reason.message);
    } else {
      message = 'Unknown rejection reason';
    }

    logger().error(
      `Unhandled Promise Rejection: ${message}`,
      error,
      {
        reason,
        context: 'globalErrorHandler.unhandledrejection',
        severity: 'high',
      }
    );

    // Note: We don't call preventDefault() here to allow default rejection handling
  });

  // Log initialization
  logger().debug('Global error handlers initialized', {
    context: 'globalErrorHandler.initialize',
    handlers: ['window.onerror', 'window.onunhandledrejection'],
  });
}

/**
 * Send error report to backend/error tracking service
 * Useful for integrating with services like Sentry, Rollbar, etc.
 */
export async function reportErrorToBackend(
  error: Error | unknown,
  context?: Record<string, unknown>
): Promise<void> {
  // Only report in production
  if (!isProduction()) {
    return;
  }

  try {
    const errorData = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context,
    };

    // Report to external error monitoring service
    try {
      const { errorReportingService } = await import('./errorReporting');
      errorReportingService.report({
        message: errorData.message,
        level: 'error',
        error: error instanceof Error ? error : undefined,
        context: errorData,
      });
    } catch (importErr) {
      logger().warn('Failed to import error reporting service', {
        error: importErr instanceof Error ? importErr.message : String(importErr),
        context: 'globalErrorHandler.reportErrorToBackend.import',
      });
    }

    logger().info('Error reported to monitoring service', {
      message: errorData.message,
      context: 'globalErrorHandler.reportErrorToBackend',
    });
  } catch (e) {
    logger().warn('Failed to report error', {
      error: e instanceof Error ? e.message : String(e),
      context: 'globalErrorHandler.reportErrorToBackend.error',
    });
  }
}

/**
 * Get error statistics from logger
 * Useful for debugging and monitoring
 */
export function getErrorStatistics(): {
  totalErrors: number;
  errorsByLevel: Record<string, number>;
  recentErrors: Array<{ message: string; timestamp: string }>;
} {
  const logs = logger().getLogs();
  const errorLogs = logs.filter((log) => log.level === 'ERROR' || log.level === 'FATAL');

  const errorsByLevel: Record<string, number> = {};
  const recentErrors: Array<{ message: string; timestamp: string }> = [];

  for (const log of errorLogs) {
    // Count by level
    errorsByLevel[log.level] = (errorsByLevel[log.level] || 0) + 1;

    // Track recent errors
    recentErrors.push({
      message: log.message,
      timestamp: log.timestamp,
    });
  }

  return {
    totalErrors: errorLogs.length,
    errorsByLevel,
    recentErrors: recentErrors.slice(-10), // Last 10 errors
  };
}

/**
 * Export all global error handling utilities
 * AWS CloudWatch handles performance monitoring
 */
export const GlobalErrorHandler = {
  initialize: initializeGlobalErrorHandlers,
  reportErrorToBackend,
  getStatistics: getErrorStatistics,
};
