/**
 * Centralized Error Handler
 *
 * Provides consistent error handling across the application with integrated
 * logging, toast notifications, and error transformation.
 *
 * @module utils/error-handler
 * @example
 * ```typescript
 * import { handleApiError, handleErrorBoundaryError } from '@shared/utils/error-handler';
 *
 * // API error handling with toast
 * try {
 *   await fetchData();
 * } catch (error) {
 *   handleApiError(error, 'Failed to fetch data', { toast });
 * }
 *
 * // Error boundary handling
 * class ErrorBoundary extends Component {
 *   componentDidCatch(error: Error, info: ErrorInfo) {
 *     handleErrorBoundaryError(error, info);
 *   }
 * }
 * ```
 */

import { logger } from '@shared/utils/logger';

interface ErrorHandlerOptions {
  toast?: {
    error: (message: string) => void;
    warning: (message: string) => void;
  };
  fallbackMessage?: string;
  logLevel?: 'error' | 'warn' | 'info';
  rethrow?: boolean;
  onError?: (error: Error) => void;
}

interface ApiErrorResponse {
  message?: string;
  detail?: string;
  errors?: Array<{ field: string; message: string }>;
  status?: number;
}

/**
 * Extract user-friendly message from error object
 *
 * @param error - Error object, string, or API error response
 * @returns Human-readable error message
 *
 * @example
 * ```typescript
 * const message = getErrorMessage(new Error('Network failed')); // "Network failed"
 * const apiMsg = getErrorMessage({ detail: 'Invalid token' }); // "Invalid token"
 * ```
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const apiError = error as ApiErrorResponse;

    // Check for API error response
    if (apiError.detail) return apiError.detail;
    if (apiError.message) return apiError.message;

    // Check for validation errors
    if (apiError.errors && Array.isArray(apiError.errors) && apiError.errors.length > 0) {
      return apiError.errors.map((e) => `${e.field}: ${e.message}`).join(', ');
    }
  }

  return 'An unexpected error occurred';
}

/**
 * Determine if error is a network error
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('NetworkError') ||
      error.name === 'NetworkError'
    );
  }
  return false;
}

/**
 * Determine if error is an authentication error
 */
function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const apiError = error as ApiErrorResponse;
    return apiError.status === 401 || apiError.status === 403;
  }
  return false;
}

/**
 * Handle API errors consistently with logging and user notifications
 *
 * @param error - Error object from API call
 * @param context - Additional context string for logging
 * @param options - Configuration options including toast, logging, and callbacks
 * @returns Processed error message
 * @throws Re-throws error if options.rethrow is true
 *
 * @example
 * ```typescript
 * try {
 *   await apiClient.getUsers();
 * } catch (error) {
 *   handleApiError(error, 'Failed to fetch users', {
 *     toast: { error: toast.error },
 *     fallbackMessage: 'Unable to load users. Please try again.',
 *     logLevel: 'error',
 *     onError: (err) => trackError(err)
 *   });
 * }
 * ```
 */
export function handleApiError(error: unknown, options: ErrorHandlerOptions = {}): void {
  const {
    toast,
    fallbackMessage = 'Operation failed',
    logLevel = 'error',
    rethrow = false,
    onError,
  } = options;

  // Extract error message
  const errorMessage = getErrorMessage(error);
  const finalMessage = errorMessage || fallbackMessage;
  const errorObj = error instanceof Error ? error : new Error(String(error));

  // Log error
  if (logLevel === 'error') {
    logger.error('API Error', errorObj, { message: finalMessage });
  } else if (logLevel === 'warn') {
    logger.warn('API Warning', { message: finalMessage });
  } else {
    logger.info('API Info', { message: finalMessage });
  }

  // Show toast notification
  if (toast) {
    // Special handling for auth errors
    if (isAuthError(error)) {
      toast.error('Authentication required. Please log in again.');
    }
    // Special handling for network errors
    else if (isNetworkError(error)) {
      toast.error('Network error. Please check your connection and try again.');
    }
    // Regular errors
    else {
      toast.error(finalMessage);
    }
  }

  // Call custom error handler
  if (onError && error instanceof Error) {
    onError(error);
  }

  // Rethrow if requested
  if (rethrow) {
    throw error;
  }
}

/**
 * Create an error handler bound to a toast instance
 *
 * @example
 * ```tsx
 * const handleError = createErrorHandler(toast);
 *
 * try {
 *   await apiCall();
 * } catch (error) {
 *   handleError(error, 'Failed to load users');
 * }
 * ```
 */
export function createErrorHandler(toast: ErrorHandlerOptions['toast']) {
  return (
    error: unknown,
    fallbackMessage?: string,
    options?: Omit<ErrorHandlerOptions, 'toast' | 'fallbackMessage'>
  ) => {
    handleApiError(error, {
      ...options,
      toast,
      fallbackMessage,
    });
  };
}

/**
 * Error boundary error handler
 */
export function handleErrorBoundaryError(error: Error, errorInfo: React.ErrorInfo): void {
  logger.error('React Error Boundary', error, {
    info: JSON.stringify(errorInfo),
  });

  // Send to error tracking service (Sentry, etc.) if configured
  if (import.meta.env.PROD) {
    // TODO: Send to error tracking service
  }
}

export default handleApiError;
