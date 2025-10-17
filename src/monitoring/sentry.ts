/**
 * Sentry Error Tracking Integration
 * Provides production-grade error monitoring and reporting
 */

import * as Sentry from '@sentry/react';

export function initSentry(): void {
  // Only initialize in production
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE || 'production',
      release: import.meta.env.VITE_VERSION || '1.0.0',

      // Performance Monitoring
      tracesSampleRate: import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE
        ? parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE)
        : 0.1,

      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

      // Integration
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      // Filter sensitive data before sending
      beforeSend(event) {
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['Cookie'];
          delete event.request.headers['X-CSRF-Token'];
        }

        // Remove sensitive data from query strings
        if (event.request?.url) {
          const url = new URL(event.request.url);
          url.searchParams.delete('token');
          url.searchParams.delete('password');
          url.searchParams.delete('api_key');
          event.request.url = url.toString();
        }

        // Remove sensitive breadcrumb data
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
            if (breadcrumb.data) {
              const sanitizedData = { ...breadcrumb.data };
              delete sanitizedData.password;
              delete sanitizedData.token;
              delete sanitizedData.apiKey;
              return { ...breadcrumb, data: sanitizedData };
            }
            return breadcrumb;
          });
        }

        return event;
      },

      // Ignore known non-critical errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'originalCreateNotification',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        'atomicFindClose',

        // Network errors
        'Network request failed',
        'NetworkError',
        'Failed to fetch',

        // Non-errors
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        'Non-Error promise rejection captured',

        // React development warnings
        'Warning: ',
      ],

      // Don't report errors from these URLs
      denyUrls: [
        // Browser extensions
        /extensions\//i,
        /^chrome:\/\//i,
        /^chrome-extension:\/\//i,
        /^moz-extension:\/\//i,

        // Third-party scripts
        /google-analytics\.com/i,
        /googletagmanager\.com/i,
      ],
    });

    // Set user context if available
    const authData = localStorage.getItem('auth');
    if (authData) {
      try {
        const { user } = JSON.parse(authData);
        if (user) {
          Sentry.setUser({
            id: user.id,
            email: user.email,
            username: user.username,
          });
        }
      } catch {
        // Silent fail - don't crash app if parsing fails
      }
    }
  }
}

/**
 * Capture an exception manually
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
}

/**
 * Capture a message manually
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>
): void {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, unknown>,
  category?: string
): void {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      message,
      data,
      category: category || 'app',
      level: 'info',
      timestamp: Date.now() / 1000,
    });
  }
}

/**
 * Set user context
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser(user);
  }
}

/**
 * Clear user context (on logout)
 */
export function clearUser(): void {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser(null);
  }
}

/**
 * Create a span for performance monitoring
 */
export function startSpan(name: string, op: string, callback: () => void): void {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.startSpan({ name, op }, callback);
  } else {
    callback();
  }
}
