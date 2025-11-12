/**
 * Error Types and Interfaces
 * 
 * Defines all error types used in the application with proper metadata
 * for logging and error handling. Each error type can be caught and
 * logged with appropriate context.
 */

/**
 * Base error class for all application errors
 * Provides consistent structure for error handling and logging
 */
export class AppError extends Error {
  /** Unique error code for tracking */
  code: string;

  /** HTTP status code (if applicable) */
  statusCode: number;

  /** Context information for logging */
  context: Record<string, unknown>;

  /** Whether error is user-facing */
  isUserFacing: boolean;

  /** Additional metadata */
  metadata?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = 'APP_ERROR',
    statusCode: number = 500,
    context: Record<string, unknown> = {},
    isUserFacing: boolean = false,
    metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    this.isUserFacing = isUserFacing;
    this.metadata = metadata;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * API Error - thrown when API calls fail
 * Includes response data and request details for logging
 */
export class APIError extends AppError {
  /** HTTP response status */
  responseStatus: number;

  /** Response data from API */
  responseData?: Record<string, unknown>;

  /** Request method */
  method: string;

  /** Request URL */
  url: string;

  /** Time taken for request */
  duration?: number;

  constructor(
    message: string,
    responseStatus: number,
    method: string = 'GET',
    url: string = '',
    responseData?: Record<string, unknown>,
    duration?: number
  ) {
    super(
      message,
      `API_ERROR_${responseStatus}`,
      responseStatus,
      { method, url, responseStatus },
      responseStatus >= 500 ? false : true // User-facing if not 5xx
    );
    this.name = 'APIError';
    this.responseStatus = responseStatus;
    this.responseData = responseData;
    this.method = method;
    this.url = url;
    this.duration = duration;

    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Validation Error - thrown when data validation fails
 * Includes field-level validation details
 */
export class ValidationError extends AppError {
  /** Field-level errors */
  errors: Record<string, string[]>;

  /** Values that failed validation */
  invalidValues?: Record<string, unknown>;

  constructor(
    message: string,
    errors: Record<string, string[]>,
    invalidValues?: Record<string, unknown>
  ) {
    super(
      message,
      'VALIDATION_ERROR',
      400,
      { fieldCount: Object.keys(errors).length },
      true // Always user-facing
    );
    this.name = 'ValidationError';
    this.errors = errors;
    this.invalidValues = invalidValues;

    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Network Error - thrown when network connectivity issues occur
 * Includes retry information
 */
export class NetworkError extends AppError {
  /** Number of retry attempts */
  retryCount: number;

  /** Maximum retries allowed */
  maxRetries: number;

  /** Whether to retry */
  shouldRetry: boolean;

  /** Time before retry (milliseconds) */
  retryDelay?: number;

  constructor(
    message: string,
    retryCount: number = 0,
    maxRetries: number = 3,
    shouldRetry: boolean = true,
    retryDelay?: number
  ) {
    super(
      message,
      'NETWORK_ERROR',
      503,
      { retryCount, maxRetries, shouldRetry },
      false // Not user-facing (user should see generic message)
    );
    this.name = 'NetworkError';
    this.retryCount = retryCount;
    this.maxRetries = maxRetries;
    this.shouldRetry = shouldRetry;
    this.retryDelay = retryDelay;

    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Authentication Error - thrown when auth operations fail
 * Includes auth-specific context
 */
export class AuthError extends AppError {
  /** Whether to redirect to login */
  shouldRedirectToLogin: boolean;

  /** Auth action that failed (login, logout, refresh, etc) */
  authAction: 'login' | 'logout' | 'refresh' | 'verify' | 'register';

  constructor(
    message: string,
    authAction: 'login' | 'logout' | 'refresh' | 'verify' | 'register' = 'login',
    shouldRedirectToLogin: boolean = true,
    statusCode: number = 401
  ) {
    super(
      message,
      `AUTH_ERROR_${authAction.toUpperCase()}`,
      statusCode,
      { authAction },
      true // User-facing
    );
    this.name = 'AuthError';
    this.authAction = authAction;
    this.shouldRedirectToLogin = shouldRedirectToLogin;

    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Permission Error - thrown when user lacks required permissions
 */
export class PermissionError extends AppError {
  /** Required permission */
  requiredPermission: string;

  /** User's actual permissions */
  userPermissions: string[];

  constructor(
    message: string,
    requiredPermission: string,
    userPermissions: string[] = []
  ) {
    super(
      message,
      'PERMISSION_ERROR',
      403,
      { requiredPermission, userPermissions },
      true // User-facing
    );
    this.name = 'PermissionError';
    this.requiredPermission = requiredPermission;
    this.userPermissions = userPermissions;

    Object.setPrototypeOf(this, PermissionError.prototype);
  }
}

/**
 * Not Found Error - thrown when resource not found
 */
export class NotFoundError extends AppError {
  /** Resource type that was not found */
  resourceType: string;

  /** Resource identifier */
  resourceId: string;

  constructor(resourceType: string, resourceId: string) {
    super(
      `${resourceType} with ID "${resourceId}" not found`,
      'NOT_FOUND_ERROR',
      404,
      { resourceType, resourceId },
      true // User-facing
    );
    this.name = 'NotFoundError';
    this.resourceType = resourceType;
    this.resourceId = resourceId;

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Rate Limit Error - thrown when rate limit exceeded
 */
export class RateLimitError extends AppError {
  /** Limit that was exceeded */
  limit: number;

  /** Current usage */
  current: number;

  /** Time until limit resets (milliseconds) */
  resetTime?: number;

  constructor(message: string, limit: number, current: number, resetTime?: number) {
    super(
      message,
      'RATE_LIMIT_ERROR',
      429,
      { limit, current, resetTime },
      true // User-facing
    );
    this.name = 'RateLimitError';
    this.limit = limit;
    this.current = current;
    this.resetTime = resetTime;

    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if error is an APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Type guard to check if error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Type guard to check if error is a NetworkError
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Type guard to check if error is an AuthError
 */
export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

/**
 * Extract error message safely from unknown error
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as Record<string, unknown>).message);
  }
  return 'An unknown error occurred';
}

/**
 * Error details extracted from any error
 */
export interface ErrorDetails {
  message: string;
  stack?: string;
  code?: string;
  statusCode?: number;
  context?: Record<string, unknown>;
}

/**
 * Extract error details for logging
 */
export function extractErrorDetails(error: unknown): ErrorDetails {
  if (isAppError(error)) {
    return {
      message: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode,
      context: error.context,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: extractErrorMessage(error),
  };
}
