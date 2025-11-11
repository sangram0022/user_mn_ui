/**
 * Error Reporting Service
 * Centralized error reporting to external monitoring services
 * 
 * Supports: Sentry, CloudWatch, or custom endpoints
 */

import { logger } from '@/core/logging';
import type { ErrorDetails } from './types';

// ========================================
// Configuration
// ========================================

interface ErrorReportingConfig {
  enabled: boolean;
  service: 'sentry' | 'cloudwatch' | 'custom' | 'none';
  sentryDsn?: string;
  customEndpoint?: string;
  environment: string;
  release?: string;
  sampleRate?: number;
}

const config: ErrorReportingConfig = {
  enabled: import.meta.env.PROD, // Only in production
  service: (import.meta.env.VITE_ERROR_REPORTING_SERVICE as 'sentry' | 'cloudwatch' | 'custom') || 'none',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  customEndpoint: import.meta.env.VITE_ERROR_REPORTING_ENDPOINT,
  environment: import.meta.env.MODE || 'development',
  release: import.meta.env.VITE_APP_VERSION,
  sampleRate: parseFloat(import.meta.env.VITE_ERROR_SAMPLE_RATE || '1.0'),
};

// ========================================
// Error Reporting Interface
// ========================================

export interface ErrorReport {
  message: string;
  level: 'error' | 'warning' | 'info';
  error?: Error;
  context?: Record<string, unknown>;
  tags?: Record<string, string>;
  user?: {
    id?: string;
    email?: string;
    username?: string;
  };
}

// ========================================
// Sentry Integration
// ========================================

class SentryReporter {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized || !config.sentryDsn) return;

    try {
      // Check if Sentry SDK is available
      if (typeof window !== 'undefined' && 'Sentry' in window) {
        const Sentry = (window as { Sentry: {
          init: (options: Record<string, unknown>) => void;
          captureException: (error: Error, options?: Record<string, unknown>) => void;
          captureMessage: (message: string, options?: Record<string, unknown>) => void;
          setUser: (user: Record<string, unknown> | null) => void;
        } }).Sentry;

        Sentry.init({
          dsn: config.sentryDsn,
          environment: config.environment,
          release: config.release,
          sampleRate: config.sampleRate,
          tracesSampleRate: 0.1, // Performance monitoring
          beforeSend: (event: Record<string, unknown>) => {
            // Filter out sensitive data
            if (event.request && typeof event.request === 'object') {
              const request = event.request as Record<string, unknown>;
              delete request.cookies;
              delete request.headers;
            }
            return event;
          },
        });

        this.initialized = true;
        logger().info('Sentry error reporting initialized', {
          environment: config.environment,
          context: 'ErrorReporting.Sentry',
        });
      }
    } catch (error) {
      logger().error('Failed to initialize Sentry', error instanceof Error ? error : undefined, {
        context: 'ErrorReporting.Sentry.init',
      });
    }
  }

  report(report: ErrorReport): void {
    if (!this.initialized || typeof window === 'undefined' || !('Sentry' in window)) return;

    try {
      const Sentry = (window as { Sentry: {
        captureException: (error: Error, options?: Record<string, unknown>) => void;
        captureMessage: (message: string, options?: Record<string, unknown>) => void;
      } }).Sentry;

      const options = {
        level: report.level,
        tags: report.tags || {},
        extra: report.context || {},
      };

      if (report.error) {
        Sentry.captureException(report.error, options);
      } else {
        Sentry.captureMessage(report.message, options);
      }
    } catch (error) {
      logger().warn('Failed to report error to Sentry', {
        error: error instanceof Error ? error.message : String(error),
        context: 'ErrorReporting.Sentry.report',
      });
    }
  }

  setUser(user: ErrorReport['user'] | null): void {
    if (!this.initialized || typeof window === 'undefined' || !('Sentry' in window)) return;

    try {
      const Sentry = (window as { Sentry: {
        setUser: (user: Record<string, unknown> | null) => void;
      } }).Sentry;
      // Convert user to Record or null (Sentry doesn't accept undefined)
      Sentry.setUser(user ? user as Record<string, unknown> : null);
    } catch (error) {
      logger().warn('Failed to set Sentry user', {
        error: error instanceof Error ? error.message : String(error),
        context: 'ErrorReporting.Sentry.setUser',
      });
    }
  }
}

// ========================================
// CloudWatch Integration
// ========================================

class CloudWatchReporter {
  async initialize(): Promise<void> {
    // CloudWatch integration would require AWS SDK
    // For now, this is a placeholder for future implementation
    logger().info('CloudWatch error reporting configured (implementation pending)', {
      context: 'ErrorReporting.CloudWatch',
    });
  }

  report(report: ErrorReport): void {
    // CloudWatch Logs integration handled by AWS infrastructure (not implemented client-side)
    // AWS handles error aggregation automatically via CloudWatch RUM
    // See: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-RUM.html
    logger().info('Error reported (AWS CloudWatch RUM handles aggregation)', {
      message: report.message,
      level: report.level,
      context: 'ErrorReporting.CloudWatch',
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setUser(_user: ErrorReport['user'] | null): void {
    // CloudWatch doesn't have user context
  }
}

// ========================================
// Custom Endpoint Integration
// ========================================

class CustomEndpointReporter {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async initialize(): Promise<void> {
    logger().info('Custom error reporting endpoint configured', {
      endpoint: this.endpoint,
      context: 'ErrorReporting.Custom',
    });
  }

  async report(report: ErrorReport): Promise<void> {
    if (!this.endpoint) return;

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: report.message,
          level: report.level,
          error: report.error ? {
            message: report.error.message,
            stack: report.error.stack,
            name: report.error.name,
          } : undefined,
          context: report.context,
          tags: report.tags,
          user: report.user,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error reporting failed: ${response.status}`);
      }
    } catch (error) {
      logger().warn('Failed to report error to custom endpoint', {
        error: error instanceof Error ? error.message : String(error),
        endpoint: this.endpoint,
        context: 'ErrorReporting.Custom.report',
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setUser(_user: ErrorReport['user'] | null): void {
    // User context handled in report payload
  }
}

// ========================================
// Error Reporting Service
// ========================================

class ErrorReportingService {
  private reporter: SentryReporter | CloudWatchReporter | CustomEndpointReporter | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized || !config.enabled) {
      logger().info('Error reporting disabled or already initialized', {
        enabled: config.enabled,
        service: config.service,
        context: 'ErrorReporting.initialize',
      });
      return;
    }

    try {
      switch (config.service) {
        case 'sentry':
          if (config.sentryDsn) {
            this.reporter = new SentryReporter();
            await this.reporter.initialize();
          }
          break;

        case 'cloudwatch':
          this.reporter = new CloudWatchReporter();
          await this.reporter.initialize();
          break;

        case 'custom':
          if (config.customEndpoint) {
            this.reporter = new CustomEndpointReporter(config.customEndpoint);
            await this.reporter.initialize();
          }
          break;

        default:
          logger().info('No error reporting service configured', {
            service: config.service,
            context: 'ErrorReporting.initialize',
          });
      }

      this.initialized = true;
    } catch (error) {
      logger().error('Failed to initialize error reporting', error instanceof Error ? error : undefined, {
        service: config.service,
        context: 'ErrorReporting.initialize',
      });
    }
  }

  report(report: ErrorReport): void {
    if (!config.enabled || !this.reporter) {
      logger().debug('Error reporting skipped (disabled or no reporter)', {
        enabled: config.enabled,
        hasReporter: !!this.reporter,
        context: 'ErrorReporting.report',
      });
      return;
    }

    // Sample rate check
    if (Math.random() > (config.sampleRate || 1.0)) {
      logger().debug('Error reporting skipped (sample rate)', {
        sampleRate: config.sampleRate,
        context: 'ErrorReporting.report',
      });
      return;
    }

    this.reporter.report(report);
  }

  setUser(user: ErrorReport['user'] | null): void {
    if (!this.reporter) return;
    this.reporter.setUser(user);
  }

  // Helper method to report from ErrorDetails
  reportFromDetails(details: ErrorDetails, level: ErrorReport['level'] = 'error'): void {
    // Create Error from details if not already an Error
    const error = details.stack 
      ? Object.assign(new Error(details.message), { stack: details.stack })
      : new Error(details.message);

    this.report({
      message: details.message,
      level,
      error,
      context: details.context,
      tags: {
        code: details.code || 'UNKNOWN',
        statusCode: String(details.statusCode || ''),
      },
    });
  }
}

// ========================================
// Singleton Instance
// ========================================

export const errorReportingService = new ErrorReportingService();

// Auto-initialize in production
if (config.enabled) {
  errorReportingService.initialize().catch((error) => {
    logger().error('Error reporting auto-initialization failed', error instanceof Error ? error : undefined);
  });
}

// ========================================
// Convenience Functions
// ========================================

export function reportError(error: Error, context?: Record<string, unknown>): void {
  errorReportingService.report({
    message: error.message,
    level: 'error',
    error,
    context,
  });
}

export function reportWarning(message: string, context?: Record<string, unknown>): void {
  errorReportingService.report({
    message,
    level: 'warning',
    context,
  });
}

export function reportInfo(message: string, context?: Record<string, unknown>): void {
  errorReportingService.report({
    message,
    level: 'info',
    context,
  });
}

export function setErrorReportingUser(user: ErrorReport['user'] | null): void {
  errorReportingService.setUser(user);
}
