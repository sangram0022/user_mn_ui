/**
 * Centralized Error Handler
 * 
 * Handles all application errors with consistent logging, context propagation,
 * and error recovery strategies. Integrates with the logging framework for
 * detailed error tracking across the application.
 */

import { logger } from '@/core/logging';
import {
  AppError,
  APIError,
  ValidationError,
  NetworkError,
  AuthError,
  PermissionError,
  NotFoundError,
  RateLimitError,
  extractErrorDetails,
  extractErrorMessage,
  isAppError,
  isAPIError,
  isValidationError,
  isNetworkError,
  isAuthError,
} from './types';

/**
 * Error handling result with recovery recommendations
 */
export interface ErrorHandlingResult {
  /** Whether error was handled successfully */
  handled: boolean;

  /** Error message shown to user */
  userMessage: string;

  /** Recommended action */
  action?: 'retry' | 'redirect' | 'reload' | 'contact_support';

  /** Retry delay in milliseconds */
  retryDelay?: number;

  /** Whether to redirect to login */
  redirectToLogin?: boolean;

  /** Additional context for UI */
  context?: Record<string, unknown>;
}

/**
 * Get user-friendly error message based on error type
 */
function getUserMessage(error: unknown): string {
  if (isValidationError(error)) {
    const fieldCount = Object.keys(error.errors).length;
    return `Please fix ${fieldCount} validation error${fieldCount !== 1 ? 's' : ''}`;
  }

  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.';
  }

  if (isAuthError(error)) {
    if (error.authAction === 'login') {
      return 'Invalid credentials. Please try again.';
    }
    if (error.authAction === 'refresh') {
      return 'Your session has expired. Please log in again.';
    }
    return 'Authentication failed. Please try again.';
  }

  if (isPermissionError(error)) {
    return 'You do not have permission to perform this action.';
  }

  if (isNotFoundError(error)) {
    return `The requested ${error.resourceType} was not found.`;
  }

  if (isRateLimitError(error)) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  if (isAPIError(error)) {
    if (error.responseStatus >= 500) {
      return 'Server error. Please try again later.';
    }
    if (error.responseStatus === 400) {
      return 'Invalid request. Please check your input.';
    }
    return 'Request failed. Please try again.';
  }

  if (isAppError(error) && error.isUserFacing) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Handle API error with logging and recovery strategy
 */
function handleAPIError(error: APIError): ErrorHandlingResult {
  const logLevel = error.responseStatus >= 500 ? 'error' : 'warn';
  const log = logger();

  if (logLevel === 'error') {
    log.error(`API Error: ${error.method} ${error.url}`, new Error(error.message), {
      statusCode: error.responseStatus,
      duration: error.duration,
      responseData: error.responseData,
      context: 'errorHandler.handleAPIError',
    });
  } else {
    log.warn(`API Warning: ${error.method} ${error.url}`, {
      statusCode: error.responseStatus,
      duration: error.duration,
      responseData: error.responseData,
      context: 'errorHandler.handleAPIError',
    });
  }

  // Determine recovery action based on status
  let action: ErrorHandlingResult['action'] = 'retry';
  let retryDelay: number | undefined;

  if (error.responseStatus === 401) {
    return {
      handled: true,
      userMessage: getUserMessage(error),
      action: 'redirect',
      redirectToLogin: true,
    };
  }

  if (error.responseStatus === 403) {
    return {
      handled: true,
      userMessage: getUserMessage(error),
      action: 'contact_support',
    };
  }

  if (error.responseStatus === 404) {
    return {
      handled: true,
      userMessage: getUserMessage(error),
      action: undefined,
    };
  }

  if (error.responseStatus === 429) {
    // Rate limit - suggest longer retry
    retryDelay = 5000;
    action = 'retry';
  }

  if (error.responseStatus >= 500) {
    action = 'retry';
    retryDelay = 2000;
  }

  return {
    handled: true,
    userMessage: getUserMessage(error),
    action,
    retryDelay,
  };
}

/**
 * Handle validation error with logging
 */
function handleValidationError(error: ValidationError): ErrorHandlingResult {
  logger().warn('Validation Error', {
    fieldCount: Object.keys(error.errors).length,
    errors: error.errors,
    context: 'errorHandler.handleValidationError',
  });

  return {
    handled: true,
    userMessage: getUserMessage(error),
    context: {
      errors: error.errors,
      invalidValues: error.invalidValues,
    },
  };
}

/**
 * Handle network error with retry strategy
 */
function handleNetworkError(error: NetworkError): ErrorHandlingResult {
  logger().error('Network Error', error, {
    retryCount: error.retryCount,
    maxRetries: error.maxRetries,
    shouldRetry: error.shouldRetry,
    context: 'errorHandler.handleNetworkError',
  });

  return {
    handled: true,
    userMessage: getUserMessage(error),
    action: error.shouldRetry && error.retryCount < error.maxRetries ? 'retry' : 'contact_support',
    retryDelay: error.retryDelay,
  };
}

/**
 * Handle authentication error
 */
function handleAuthError(error: AuthError): ErrorHandlingResult {
  logger().error('Authentication Error', error, {
    authAction: error.authAction,
    shouldRedirect: error.shouldRedirectToLogin,
    context: 'errorHandler.handleAuthError',
  });

  return {
    handled: true,
    userMessage: getUserMessage(error),
    redirectToLogin: error.shouldRedirectToLogin,
    action: error.shouldRedirectToLogin ? 'redirect' : undefined,
  };
}

/**
 * Handle generic app error
 */
function handleAppError(error: AppError): ErrorHandlingResult {
  const level = error.statusCode >= 500 ? 'error' : 'warn';
  const log = logger();

  const metadata = {
    code: error.code,
    statusCode: error.statusCode,
    context: error.context,
    metadata: error.metadata,
    userFacing: error.isUserFacing,
  };

  if (level === 'error') {
    log.error(`Application Error: ${error.code}`, new Error(error.message), metadata);
  } else {
    log.warn(`Application Warning: ${error.code}`, metadata);
  }

  return {
    handled: true,
    userMessage: getUserMessage(error),
    action: error.statusCode >= 500 ? 'retry' : undefined,
  };
}

/**
 * Handle generic error (not AppError)
 */
function handleGenericError(error: unknown): ErrorHandlingResult {
  const details = extractErrorDetails(error);
  const message = details.message || 'Unknown error';

  logger().error('Unhandled Error', error instanceof Error ? error : new Error(message), {
    errorType: error instanceof Error ? error.name : typeof error,
    context: 'errorHandler.handleGenericError',
  });

  return {
    handled: true,
    userMessage: 'An unexpected error occurred. Please try again.',
    action: 'contact_support',
  };
}

/**
 * Main error handler - routes to specific handler based on error type
 */
export function handleError(error: unknown): ErrorHandlingResult {
  try {
    // Set error context for all subsequent logs
    logger().setContext({
      errorType: error instanceof Error ? error.name : typeof error,
      timestamp: new Date().toISOString(),
    });

    // Route to specific handler
    if (isAPIError(error)) {
      return handleAPIError(error);
    }

    if (isValidationError(error)) {
      return handleValidationError(error);
    }

    if (isNetworkError(error)) {
      return handleNetworkError(error);
    }

    if (isAuthError(error)) {
      return handleAuthError(error);
    }

    if (isAppError(error)) {
      return handleAppError(error);
    }

    // Generic error
    return handleGenericError(error);
  } catch (handlingError) {
    // Fallback if error handler itself fails
    logger().fatal('Error Handler Failed', handlingError instanceof Error ? handlingError : undefined, {
      originalError: extractErrorMessage(error),
      context: 'errorHandler.handleError.fallback',
    });

    return {
      handled: false,
      userMessage: 'A critical error occurred. Please refresh the page.',
      action: 'reload',
    };
  } finally {
    // Clear error context
    logger().clearContext();
  }
}

/**
 * Handle and log error to external service
 * (Stub for integration with error tracking services like Sentry)
 */
export function reportErrorToService(
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (import.meta.env.MODE !== 'production') {
    return; // Only report in production
  }

  try {
    const details = extractErrorDetails(error);

    // This stub can be integrated with error tracking services
    // Examples: Sentry, Rollbar, LogRocket, etc.
    logger().error('Error reported to external service', error instanceof Error ? error : undefined, {
      message: details.message,
      code: details.code,
      context: { ...details.context, ...context },
      userReported: true,
    });

    // Report to external error monitoring service (async, fire-and-forget)
    import('./errorReporting')
      .then(({ errorReportingService }) => {
        errorReportingService.reportFromDetails(details, 'error');
      })
      .catch((importErr) => {
        logger().warn('Failed to import error reporting service', { 
          error: extractErrorMessage(importErr),
          context: 'errorHandler.reportError',
        });
      });
  } catch (err) {
    logger().warn('Failed to report error to service', { error: extractErrorMessage(err) });
  }
}

/**
 * Create and throw an error with consistent structure
 */
export function createError(
  message: string,
  code: string = 'APP_ERROR',
  statusCode: number = 500,
  context: Record<string, unknown> = {}
): AppError {
  return new AppError(message, code, statusCode, context);
}

/**
 * Type guard for NotFoundError
 */
function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

/**
 * Type guard for RateLimitError
 */
function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}

/**
 * Type guard for PermissionError
 */
function isPermissionError(error: unknown): error is PermissionError {
  return error instanceof PermissionError;
}

/**
 * Get error summary for logging
 */
export function getErrorSummary(error: unknown): string {
  const details = extractErrorDetails(error);
  const code = details.code ? ` [${details.code}]` : '';
  const status = details.statusCode ? ` (${details.statusCode})` : '';
  return `${details.message}${code}${status}`;
}

/**
 * Export all error types for convenience
 */
export {
  AppError,
  APIError,
  ValidationError,
  NetworkError,
  AuthError,
  PermissionError,
  NotFoundError,
  RateLimitError,
  extractErrorDetails,
  extractErrorMessage,
};
