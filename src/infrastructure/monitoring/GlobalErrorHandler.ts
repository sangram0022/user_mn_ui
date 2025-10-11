/**
 * Global error handler that provides a unified interface for handling errors
 */

import { ErrorContext, errorTracker } from './ErrorTracker';
import { logger } from './logger';

export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private isInitialized = false;

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    this.setupErrorHandlers();
    this.isInitialized = true;
    logger.info('GlobalErrorHandler initialized');
  }

  private setupErrorHandlers(): void {
    // Set up a global error handler for the error tracker
    errorTracker.addErrorHandler((report) => {
      this.handleErrorReport(report);
    });
  }

  private handleErrorReport(report: any): void {
    // Log critical errors immediately
    if (report.severity === 'critical') {
      this.handleCriticalError(report);
    }

    // Send to analytics if configured
    this.sendToAnalytics(report);

    // Store for debugging if in development
    if (import.meta.env.DEV) {
      this.storeForDebugging(report);
    }
  }

  private handleCriticalError(report: any): void {
    logger.error(`CRITICAL ERROR: ${report.error.message}`, report.error, {
      errorId: report.id,
      component: report.context.component,
      action: report.context.action,
    });

    // In production, you might want to notify external services
    if (!import.meta.env.DEV) {
      this.notifyExternalService(report);
    }
  }

  private sendToAnalytics(report: any): void {
    try {
      // Send error analytics
      const globalWindow = window as any;
      if (globalWindow.gtag) {
        globalWindow.gtag('event', 'exception', {
          description: report.error.message,
          fatal: report.severity === 'critical',
          error_id: report.id,
          component: report.context.component,
        });
      }

      // Custom analytics tracking
      this.trackErrorEvent(report);
    } catch (error) {
      logger.warn('Failed to send error analytics');
    }
  }

  private trackErrorEvent(report: any): void {
    // Custom error tracking logic
    const errorEvent = {
      type: 'error',
      errorId: report.id,
      message: report.error.message,
      severity: report.severity,
      component: report.context.component,
      action: report.context.action,
      timestamp: report.timestamp.toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Store in localStorage for batch sending
    try {
      const errorEvents = JSON.parse(localStorage.getItem('error_events') || '[]');
      errorEvents.push(errorEvent);

      // Keep only last 50 events
      if (errorEvents.length > 50) {
        errorEvents.splice(0, errorEvents.length - 50);
      }

      localStorage.setItem('error_events', JSON.stringify(errorEvents));
    } catch (error) {
      logger.warn('Failed to store error event');
    }
  }

  private storeForDebugging(report: any): void {
    try {
      const debugErrors = JSON.parse(localStorage.getItem('debug_errors') || '[]');
      debugErrors.unshift({
        ...report,
        timestamp: report.timestamp.toISOString(),
      });

      // Keep only last 20 errors for debugging
      if (debugErrors.length > 20) {
        debugErrors.splice(20);
      }

      localStorage.setItem('debug_errors', JSON.stringify(debugErrors));
    } catch (error) {
      console.warn('Failed to store debug error:', error);
    }
  }

  private notifyExternalService(report: any): void {
    // Implement external service notification (e.g., Sentry, Bugsnag)
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorId: report.id,
          message: report.error.message,
          stack: report.error.stack,
          severity: report.severity,
          context: report.context,
          timestamp: report.timestamp.toISOString(),
        }),
      }).catch(() => {
        logger.warn('Failed to notify external error service');
      });
    } catch (error) {
      logger.warn('Failed to notify external error service');
    }
  }

  // Utility methods for manual error handling

  handleAsyncError = (error: Error, context?: ErrorContext): void => {
    errorTracker.trackError(
      error,
      {
        ...context,
        component: context?.component || 'AsyncOperation',
        action: context?.action || 'async_error',
      },
      'medium',
      true
    );
  };

  handleApiError = (error: Error, endpoint: string, method: string, status?: number): void => {
    errorTracker.trackApiError(error, endpoint, method, status);
  };

  handleUserError = (error: Error, action: string, context?: ErrorContext): void => {
    errorTracker.trackUserError(error, action, context);
  };

  handleValidationError = (
    field: string,
    value: any,
    rule: string,
    context?: ErrorContext
  ): void => {
    errorTracker.trackValidationError(field, value, rule, context);
  };

  // Utility for error boundaries
  handleReactError = (error: Error, errorInfo: any): void => {
    errorTracker.trackError(
      error,
      {
        component: 'ReactErrorBoundary',
        action: 'component_error',
        additionalData: {
          componentStack: errorInfo.componentStack,
          errorBoundary: errorInfo.errorBoundary,
        },
      },
      'critical',
      true
    );
  };

  // Get error statistics
  getErrorStats(): any {
    return errorTracker.getErrorStats();
  }

  // Clear stored errors
  clearErrors(): void {
    errorTracker.clearErrorReports();
    localStorage.removeItem('error_events');
    localStorage.removeItem('debug_errors');
  }
}

// Create and export singleton instance
export const globalErrorHandler = GlobalErrorHandler.getInstance();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  globalErrorHandler.initialize();
}

export default globalErrorHandler;
