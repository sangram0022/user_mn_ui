/**
 * Error Handling Module
 * 
 * Centralized error handling with logging integration.
 * Provides error types, handlers, and utilities for consistent
 * error management across the application.
 */

// Export error types
export {
  AppError,
  APIError,
  ValidationError,
  NetworkError,
  AuthError,
  PermissionError,
  NotFoundError,
  RateLimitError,
  isAppError,
  isAPIError,
  isValidationError,
  isNetworkError,
  isAuthError,
  extractErrorMessage,
  extractErrorDetails,
} from './types';

// Export error handler
export {
  handleError,
  reportErrorToService,
  createError,
  getErrorSummary,
  type ErrorHandlingResult,
} from './errorHandler';

// Export Error Boundary component
export { ErrorBoundary } from './ErrorBoundary';

// Export global error handlers (AWS CloudWatch handles performance monitoring)
export {
  initializeGlobalErrorHandlers,
  reportErrorToBackend,
  getErrorStatistics,
  GlobalErrorHandler,
} from './globalErrorHandlers';


