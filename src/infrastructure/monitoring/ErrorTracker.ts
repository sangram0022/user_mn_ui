/**
 * Error tracking and monitoring utility
 */

import { logger } from './logger';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  timestamp?: Date;
  stackTrace?: string;
  additionalData?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  error: Error;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  handled: boolean;
  timestamp: Date;
}

export type ErrorHandler = (report: ErrorReport) => void;

class ErrorTracker {
  private errorHandlers: ErrorHandler[] = [];
  private errorReports: ErrorReport[] = [];
  private maxReports = 100;
  private isInitialized = false;

  constructor() {
    this.setupGlobalErrorHandlers();
  }

  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;
    logger.info('ErrorTracker initialized');
  }

  private setupGlobalErrorHandlers(): void {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError(
        new Error(event.message),
        {
          component: 'GlobalErrorHandler',
          action: 'uncaught_error',
          url: event.filename,
          additionalData: {
            lineNumber: event.lineno,
            columnNumber: event.colno,
          },
        },
        'high',
        false
      );
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));

      this.trackError(
        error,
        {
          component: 'GlobalErrorHandler',
          action: 'unhandled_promise_rejection',
          additionalData: {
            reason: event.reason,
          },
        },
        'high',
        false
      );
    });

    // Handle React error boundaries (if available)
    const globalWindow = window as any;
    if (globalWindow.ReactErrorBoundary) {
      globalWindow.ReactErrorBoundary.onError = (error: Error, errorInfo: any) => {
        this.trackError(
          error,
          {
            component: 'ReactErrorBoundary',
            action: 'component_error',
            additionalData: errorInfo,
          },
          'critical',
          true
        );
      };
    }
  }

  trackError(
    error: Error,
    context: ErrorContext = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    handled = true
  ): string {
    const report: ErrorReport = {
      id: this.generateErrorId(),
      error,
      context: {
        ...context,
        timestamp: new Date(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        stackTrace: error.stack,
      },
      severity,
      handled,
      timestamp: new Date(),
    };

    // Store the report
    this.errorReports.unshift(report);
    if (this.errorReports.length > this.maxReports) {
      this.errorReports = this.errorReports.slice(0, this.maxReports);
    }

    // Log the error
    logger.error(`Error tracked: ${error.message}`, error, {
      errorId: report.id,
      severity,
      handled,
      component: context.component,
      action: context.action,
    });

    // Notify error handlers
    this.errorHandlers.forEach((handler) => {
      try {
        handler(report);
      } catch (handlerError) {
        console.warn('Error handler failed:', handlerError);
      }
    });

    return report.id;
  }

  trackApiError(
    error: Error,
    endpoint: string,
    method: string,
    status?: number,
    context: Partial<ErrorContext> = {}
  ): string {
    return this.trackError(
      error,
      {
        ...context,
        component: 'ApiClient',
        action: 'api_error',
        additionalData: {
          endpoint,
          method,
          status,
          ...context.additionalData,
        },
      },
      status && status >= 500 ? 'high' : 'medium',
      true
    );
  }

  trackUserError(error: Error, action: string, context: Partial<ErrorContext> = {}): string {
    return this.trackError(
      error,
      {
        ...context,
        action,
        additionalData: {
          userAction: action,
          ...context.additionalData,
        },
      },
      'low',
      true
    );
  }

  trackValidationError(
    field: string,
    value: any,
    rule: string,
    context: Partial<ErrorContext> = {}
  ): string {
    const error = new Error(`Validation failed for field '${field}': ${rule}`);

    return this.trackError(
      error,
      {
        ...context,
        component: 'Validation',
        action: 'validation_error',
        additionalData: {
          field,
          value,
          rule,
          ...context.additionalData,
        },
      },
      'low',
      true
    );
  }

  addErrorHandler(handler: ErrorHandler): void {
    this.errorHandlers.push(handler);
  }

  removeErrorHandler(handler: ErrorHandler): void {
    const index = this.errorHandlers.indexOf(handler);
    if (index > -1) {
      this.errorHandlers.splice(index, 1);
    }
  }

  getErrorReports(filter?: {
    severity?: string[];
    handled?: boolean;
    component?: string;
    since?: Date;
  }): ErrorReport[] {
    let reports = [...this.errorReports];

    if (filter) {
      if (filter.severity) {
        reports = reports.filter((report) => filter.severity!.includes(report.severity));
      }

      if (filter.handled !== undefined) {
        reports = reports.filter((report) => report.handled === filter.handled);
      }

      if (filter.component) {
        reports = reports.filter((report) => report.context.component === filter.component);
      }

      if (filter.since) {
        reports = reports.filter((report) => report.timestamp >= filter.since!);
      }
    }

    return reports;
  }

  clearErrorReports(): void {
    this.errorReports = [];
    logger.info('Error reports cleared');
  }

  getErrorStats(): {
    total: number;
    handled: number;
    unhandled: number;
    bySeverity: Record<string, number>;
    byComponent: Record<string, number>;
  } {
    const stats = {
      total: this.errorReports.length,
      handled: 0,
      unhandled: 0,
      bySeverity: {} as Record<string, number>,
      byComponent: {} as Record<string, number>,
    };

    this.errorReports.forEach((report) => {
      if (report.handled) {
        stats.handled++;
      } else {
        stats.unhandled++;
      }

      stats.bySeverity[report.severity] = (stats.bySeverity[report.severity] || 0) + 1;

      const component = report.context.component || 'Unknown';
      stats.byComponent[component] = (stats.byComponent[component] || 0) + 1;
    });

    return stats;
  }

  private generateErrorId(): string {
    return 'error_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }
}

// Create singleton instance
export const errorTracker = new ErrorTracker();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  errorTracker.initialize();
}

export default errorTracker;
