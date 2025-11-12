/**
 * Logging Utilities
 * 
 * Convenience functions for common logging patterns.
 * Wraps the core logger with domain-specific helpers.
 * 
 * Benefits:
 * - Consistent logging patterns
 * - Structured metadata
 * - Easy to use across domains
 * - Type-safe
 * 
 * @see src/core/logging/logger.ts
 */

import { logger } from '@/core/logging';
import type { LogContext } from '@/core/logging/types';

/**
 * Log API call with timing information
 * 
 * @example
 * ```typescript
 * logApiCall('GET', '/api/users', 245, { userId: '123' });
 * ```
 */
export function logApiCall(
  method: string,
  url: string,
  duration: number,
  metadata?: Record<string, unknown>
): void {
  logger().debug(`API ${method} ${url}`, {
    method,
    url,
    duration: `${duration.toFixed(2)}ms`,
    ...metadata,
  });
}

/**
 * Log API error with full details
 * 
 * @example
 * ```typescript
 * logApiError('POST', '/api/users', 500, error, { userId: '123' });
 * ```
 */
export function logApiError(
  method: string,
  url: string,
  statusCode: number,
  error: Error | unknown,
  metadata?: Record<string, unknown>
): void {
  logger().error(`API ${method} ${url} failed`, error instanceof Error ? error : undefined, {
    method,
    url,
    statusCode,
    ...metadata,
  });
}

/**
 * Log user action for audit trail
 * 
 * @example
 * ```typescript
 * logUserAction('login', { userId: '123', success: true });
 * logUserAction('delete-user', { userId: '123', targetUserId: '456' });
 * ```
 */
export function logUserAction(
  action: string,
  metadata?: Record<string, unknown>
): void {
  logger().info(`User Action: ${action}`, {
    action,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
}

/**
 * Log authentication event
 * 
 * @example
 * ```typescript
 * logAuthEvent('login-success', { userId: '123', method: 'email' });
 * logAuthEvent('login-failure', { email: 'user@example.com', reason: 'invalid-password' });
 * ```
 */
export function logAuthEvent(
  event: 'login-success' | 'login-failure' | 'logout' | 'token-refresh' | 'session-expired',
  metadata?: Record<string, unknown>
): void {
  logger().info(`Auth: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
}

/**
 * Log validation error
 * 
 * @example
 * ```typescript
 * logValidationError('email', 'Invalid format', { value: 'notanemail' });
 * ```
 */
export function logValidationError(
  field: string,
  message: string,
  metadata?: Record<string, unknown>
): void {
  logger().warn(`Validation error: ${field}`, {
    field,
    message,
    ...metadata,
  });
}

/**
 * Log security event (auth failures, permission denials, etc.)
 * 
 * @example
 * ```typescript
 * logSecurityEvent('permission-denied', { userId: '123', resource: 'users', action: 'delete' });
 * logSecurityEvent('rate-limit-exceeded', { userId: '123', endpoint: '/api/users' });
 * ```
 */
export function logSecurityEvent(
  event: 'permission-denied' | 'rate-limit-exceeded' | 'suspicious-activity' | 'csrf-token-invalid',
  metadata?: Record<string, unknown>
): void {
  logger().warn(`Security: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
}

/**
 * Log data fetch operation
 * 
 * @example
 * ```typescript
 * logDataFetch('users', 'list', { filters: { status: 'active' }, count: 10 });
 * ```
 */
export function logDataFetch(
  resource: string,
  operation: 'list' | 'detail' | 'create' | 'update' | 'delete',
  metadata?: Record<string, unknown>
): void {
  logger().debug(`Data ${operation}: ${resource}`, {
    resource,
    operation,
    ...metadata,
  });
}

/**
 * Log cache operation
 * 
 * @example
 * ```typescript
 * logCacheOperation('hit', 'users-list', { filters: { status: 'active' } });
 * logCacheOperation('miss', 'users-detail-123');
 * ```
 */
export function logCacheOperation(
  type: 'hit' | 'miss' | 'invalidate' | 'set',
  key: string,
  metadata?: Record<string, unknown>
): void {
  logger().debug(`Cache ${type}: ${key}`, {
    type,
    key,
    ...metadata,
  });
}

/**
 * Log navigation event
 * 
 * @example
 * ```typescript
 * logNavigation('/dashboard', '/users', { userId: '123' });
 * ```
 */
export function logNavigation(
  from: string,
  to: string,
  metadata?: Record<string, unknown>
): void {
  logger().debug(`Navigation: ${from} → ${to}`, {
    from,
    to,
    ...metadata,
  });
}

/**
 * Log form submission
 * 
 * @example
 * ```typescript
 * logFormSubmission('login-form', true, { userId: '123' });
 * logFormSubmission('register-form', false, { errors: ['email', 'password'] });
 * ```
 */
export function logFormSubmission(
  formName: string,
  success: boolean,
  metadata?: Record<string, unknown>
): void {
  const level = success ? 'info' : 'warn';
  const message = `Form ${formName}: ${success ? 'success' : 'failed'}`;
  
  if (level === 'info') {
    logger().info(message, { formName, success, ...metadata });
  } else {
    logger().warn(message, { formName, success, ...metadata });
  }
}

/**
 * Log component lifecycle event (mount/unmount)
 * Only logs in development mode for performance
 * 
 * @example
 * ```typescript
 * logComponentLifecycle('UserList', 'mount', { filters: { status: 'active' } });
 * logComponentLifecycle('UserDetail', 'unmount', { userId: '123' });
 * ```
 */
export function logComponentLifecycle(
  componentName: string,
  event: 'mount' | 'unmount' | 'update',
  metadata?: Record<string, unknown>
): void {
  if (import.meta.env.DEV) {
    logger().trace(`Component ${componentName}: ${event}`, {
      component: componentName,
      event,
      ...metadata,
    });
  }
}

/**
 * Log performance metric
 * 
 * @example
 * ```typescript
 * logPerformance('page-load', 1245, { page: '/dashboard' });
 * logPerformance('api-call', 350, { endpoint: '/api/users' });
 * ```
 */
export function logPerformance(
  metric: string,
  duration: number,
  metadata?: Record<string, unknown>
): void {
  logger().debug(`Performance: ${metric} took ${duration.toFixed(2)}ms`, {
    metric,
    duration: `${duration.toFixed(2)}ms`,
    ...metadata,
  });
}

/**
 * Log error with full context
 * Convenience wrapper for logger().error()
 * 
 * @example
 * ```typescript
 * try {
 *   await deleteUser(userId);
 * } catch (error) {
 *   logError('Failed to delete user', error, { userId });
 * }
 * ```
 */
export function logError(
  message: string,
  error: Error | unknown,
  metadata?: Record<string, unknown>
): void {
  logger().error(message, error instanceof Error ? error : undefined, {
    errorType: error instanceof Error ? error.name : typeof error,
    ...metadata,
  });
}

/**
 * Log with custom context
 * Useful for setting context at the start of an operation
 * 
 * @example
 * ```typescript
 * withContext({ userId: '123', sessionId: 'abc' }, () => {
 *   logUserAction('update-profile');
 *   // All subsequent logs will include userId and sessionId
 * });
 * ```
 */
export function withContext(
  context: LogContext,
  fn: () => void | Promise<void>
): void | Promise<void> {
  const log = logger();
  const previousContext = log.getContext();
  
  log.setContext(context);
  
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.finally(() => {
        log.setContext(previousContext);
      });
    }
    log.setContext(previousContext);
    return result;
  } catch (error) {
    log.setContext(previousContext);
    throw error;
  }
}

/**
 * Create a timer for measuring operation duration
 * 
 * @example
 * ```typescript
 * const timer = createTimer('fetch-users');
 * await fetchUsers();
 * timer.end({ count: 10 }); // Logs: "fetch-users took 245ms"
 * ```
 */
export function createTimer(label: string): {
  end: (metadata?: Record<string, unknown>) => void;
} {
  logger().startTimer(label);
  
  return {
    end: (metadata?: Record<string, unknown>) => {
      logger().endTimer(label, metadata);
    },
  };
}

/**
 * Log state change
 * Useful for debugging state management
 * 
 * @example
 * ```typescript
 * logStateChange('userStore', { previousCount: 5, newCount: 10 });
 * ```
 */
export function logStateChange(
  store: string,
  metadata?: Record<string, unknown>
): void {
  if (import.meta.env.DEV) {
    logger().debug(`State change: ${store}`, {
      store,
      ...metadata,
    });
  }
}

/**
 * Log debug information (only in development)
 * 
 * @example
 * ```typescript
 * logDebug('Query invalidated', { queryKey: ['users', 'list'] });
 * ```
 */
export function logDebug(
  message: string,
  metadata?: Record<string, unknown>
): void {
  if (import.meta.env.DEV) {
    logger().debug(message, metadata);
  }
}

/**
 * Export all utilities for convenience
 */
export const loggingUtils = {
  logApiCall,
  logApiError,
  logUserAction,
  logAuthEvent,
  logValidationError,
  logSecurityEvent,
  logDataFetch,
  logCacheOperation,
  logNavigation,
  logFormSubmission,
  logComponentLifecycle,
  logPerformance,
  logError,
  withContext,
  createTimer,
  logStateChange,
  logDebug,
} as const;

export default loggingUtils;
