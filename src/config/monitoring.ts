/**
 * Sentry Error Monitoring Configuration
 *
 * Provides comprehensive error tracking, performance monitoring, and session replay
 * for production environment. Filters sensitive data and integrates with React 19.
 *
 * Features:
 * - Error tracking with source maps
 * - Performance monitoring
 * - Session replay on errors
 * - Breadcrumb tracking
 * - Sensitive data filtering
 * - User context (non-PII)
 *
 * @module monitoring
 */

import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry monitoring
 * Only runs in production with valid DSN
 */
export function initializeMonitoring(): void {
  // Only initialize in production
  if (!import.meta.env.PROD) {
    console.log('🔍 Monitoring: Development mode - Sentry disabled');
    return;
  }

  // Check for Sentry DSN
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  if (!sentryDsn || sentryDsn.includes('your-sentry-dsn')) {
    console.warn('⚠️  Monitoring: Sentry DSN not configured');
    return;
  }

  try {
    Sentry.init({
      dsn: sentryDsn,
      environment: import.meta.env.VITE_APP_ENV || 'production',
      release: `user-management-ui@${import.meta.env.VITE_VERSION || '1.0.0'}`,

      // Performance Monitoring
      tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '0.1'),

      // Session Replay
      replaysSessionSampleRate: parseFloat(
        import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE || '0.1'
      ),
      replaysOnErrorSampleRate: parseFloat(
        import.meta.env.VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || '1.0'
      ),

      // Integrations
      integrations: [
        // Browser Tracing for performance monitoring
        Sentry.browserTracingIntegration({
          tracePropagationTargets: [import.meta.env.VITE_BACKEND_URL, /^\/api\//],
        }),

        // Session Replay for debugging
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
          maskAllInputs: true,
        }),

        // React Error Boundary integration
        Sentry.reactRouterV6BrowserTracingIntegration({
          useEffect: React.useEffect,
        }),
      ],

      // Filtering and data scrubbing
      beforeSend(event) {
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['Cookie'];
          delete event.request.headers['X-CSRF-Token'];
        }

        // Remove sensitive cookies
        if (event.request?.cookies) {
          event.request.cookies = {};
        }

        // Filter sensitive data from breadcrumbs
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
            if (breadcrumb.data) {
              // Remove PII
              delete breadcrumb.data.email;
              delete breadcrumb.data.password;
              delete breadcrumb.data.token;
              delete breadcrumb.data.accessToken;
              delete breadcrumb.data.refreshToken;
              delete breadcrumb.data.phoneNumber;
              delete breadcrumb.data.ssn;

              // Mask sensitive values
              if (breadcrumb.data.username) {
                breadcrumb.data.username = maskEmail(breadcrumb.data.username);
              }
            }
            return breadcrumb;
          });
        }

        // Filter sensitive extra data
        if (event.extra) {
          delete event.extra.password;
          delete event.extra.token;
          delete event.extra.accessToken;
        }

        return event;
      },

      // Filter sensitive breadcrumbs
      beforeBreadcrumb(breadcrumb) {
        // Don't log console.log messages
        if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
          return null;
        }

        // Filter authentication requests
        if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
          if (
            breadcrumb.data?.url?.includes('login') ||
            breadcrumb.data?.url?.includes('password')
          ) {
            breadcrumb.data.url = breadcrumb.data.url.replace(/\?.*/, '?[FILTERED]');
          }
        }

        return breadcrumb;
      },

      // Ignore common non-critical errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'chrome-extension://',
        'moz-extension://',

        // Network errors (handled by app)
        'Network request failed',
        'NetworkError',
        'Failed to fetch',
        'Load failed',

        // React hydration (non-critical)
        'Hydration failed',
        'There was an error while hydrating',

        // ResizeObserver (browser quirk)
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',

        // Non-Error promise rejections
        'Non-Error promise rejection captured',

        // User cancelled operations
        'Request aborted',
        'User cancelled',
        'AbortError',

        // Script loading (CDN issues)
        'Loading chunk',
        'Loading CSS chunk',

        // iOS Safari quirks
        'SecurityError: The operation is insecure',

        // Firefox private browsing
        'NS_ERROR_FILE_ACCESS_DENIED',
      ],

      // Ignore URLs (third-party scripts)
      denyUrls: [
        // Chrome extensions
        /extensions\//i,
        /^chrome:\/\//i,
        /^moz-extension:\/\//i,

        // Browser internal scripts
        /^webkit-masked-url/i,

        // Ad blockers
        /^https?:\/\/.*adblock/i,
      ],

      // Sample rate for all events
      sampleRate: 1.0,

      // Enable automatic session tracking
      autoSessionTracking: true,

      // Attach stack traces to all errors
      attachStacktrace: true,

      // Maximum breadcrumbs to keep
      maxBreadcrumbs: 50,

      // Debug mode (only in development)
      debug: import.meta.env.DEV,
    });

    console.log('✅ Monitoring: Sentry initialized successfully');

    // Set initial context
    Sentry.setTag('app_version', import.meta.env.VITE_VERSION || '1.0.0');
    Sentry.setTag('environment', import.meta.env.VITE_APP_ENV || 'production');
  } catch (error) {
    console.error('❌ Monitoring: Failed to initialize Sentry:', error);
  }
}

/**
 * Set user context for error tracking (non-PII only)
 */
export function setUserContext(userId: string, role?: string): void {
  if (!import.meta.env.PROD) return;

  Sentry.setUser({
    id: userId,
    role: role,
    // Don't include email or other PII
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext(): void {
  if (!import.meta.env.PROD) return;

  Sentry.setUser(null);
}

/**
 * Log custom event/breadcrumb
 */
export function logEvent(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, unknown>
): void {
  if (!import.meta.env.PROD) return;

  Sentry.addBreadcrumb({
    message,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Capture exception manually
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (!import.meta.env.PROD) {
    console.error('Error captured:', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Mask email addresses for privacy
 */
function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;

  const [localPart, domain] = email.split('@');
  const maskedLocal = localPart.slice(0, 2) + '***';
  return `${maskedLocal}@${domain}`;
}

/**
 * Create a performance transaction
 */
export function startTransaction(name: string, op: string): Sentry.Transaction | null {
  if (!import.meta.env.PROD) return null;

  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Measure performance of an operation
 */
export async function measurePerformance<T>(name: string, operation: () => Promise<T>): Promise<T> {
  const transaction = startTransaction(name, 'custom');

  try {
    const result = await operation();
    transaction?.finish();
    return result;
  } catch (error) {
    transaction?.setStatus('internal_error');
    transaction?.finish();
    throw error;
  }
}

export default initializeMonitoring;
