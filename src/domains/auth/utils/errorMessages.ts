// ========================================
// Error Message Utilities
// User-friendly error message formatters
// ========================================

/**
 * Common auth error codes and their user-friendly messages
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  USER_NOT_FOUND: 'No account found with this email address.',
  INCORRECT_PASSWORD: 'The password you entered is incorrect.',
  ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
  ACCOUNT_DISABLED: 'Your account has been disabled. Please contact support.',
  ACCOUNT_NOT_VERIFIED: 'Please verify your email address before logging in.',
  
  // Registration errors
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  USERNAME_TAKEN: 'This username is already taken.',
  WEAK_PASSWORD: 'Your password is too weak. Please choose a stronger password.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  
  // Token errors
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  TOKEN_INVALID: 'Invalid or expired token. Please request a new one.',
  REFRESH_TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  CSRF_TOKEN_INVALID: 'Security token mismatch. Please refresh and try again.',
  
  // Password reset errors
  RESET_TOKEN_EXPIRED: 'This password reset link has expired. Please request a new one.',
  RESET_TOKEN_INVALID: 'Invalid password reset link. Please request a new one.',
  PASSWORD_RECENTLY_USED: 'You cannot reuse a recent password. Please choose a different one.',
  
  // Email verification errors
  VERIFICATION_TOKEN_EXPIRED: 'This verification link has expired. Please request a new one.',
  VERIFICATION_TOKEN_INVALID: 'Invalid verification link. Please request a new one.',
  EMAIL_ALREADY_VERIFIED: 'Your email is already verified.',
  
  // Rate limiting
  TOO_MANY_REQUESTS: 'Too many attempts. Please try again later.',
  RATE_LIMIT_EXCEEDED: 'You have made too many requests. Please wait a few minutes.',
  
  // OAuth errors
  OAUTH_PROVIDER_ERROR: 'Authentication with this provider failed. Please try again.',
  OAUTH_CANCELLED: 'Authentication was cancelled.',
  OAUTH_EMAIL_IN_USE: 'This email is already registered with a different login method.',
  
  // Network errors
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  
  // Validation errors
  VALIDATION_ERROR: 'Please check your input and try again.',
  MISSING_REQUIRED_FIELD: 'Please fill in all required fields.',
  INVALID_INPUT: 'Some information is invalid. Please check and try again.',
  
  // Permission errors
  UNAUTHORIZED: 'You do not have permission to perform this action.',
  FORBIDDEN: 'Access denied.',
  
  // Generic
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

/**
 * HTTP status code to user message mapping
 */
export const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Bad request. Please check your input.',
  401: 'Authentication required. Please log in.',
  403: 'You do not have permission to access this resource.',
  404: 'The requested resource was not found.',
  408: 'Request timed out. Please try again.',
  409: 'This action conflicts with existing data.',
  422: 'The data provided is invalid.',
  429: 'Too many requests. Please slow down.',
  500: 'Internal server error. Please try again later.',
  502: 'Bad gateway. Please try again later.',
  503: 'Service temporarily unavailable. Please try again later.',
  504: 'Gateway timeout. Please try again later.',
};

/**
 * Format error message for display to user
 * 
 * @param error - Error object from API or app
 * @returns User-friendly error message
 * 
 * @example
 * ```ts
 * const error = { code: 'INVALID_CREDENTIALS' };
 * formatErrorMessage(error); // "Invalid email or password. Please try again."
 * ```
 */
export function formatErrorMessage(error: unknown): string {
  // Handle null/undefined
  if (!error) {
    return AUTH_ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message || AUTH_ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  // Handle objects with error properties
  if (typeof error === 'object') {
    const err = error as {
      message?: string;
      code?: string;
      status?: number;
      detail?: string;
      error?: string;
    };

    // Check for error code first
    if (err.code && AUTH_ERROR_MESSAGES[err.code]) {
      return AUTH_ERROR_MESSAGES[err.code];
    }

    // Check for detail field (FastAPI format)
    if (err.detail && typeof err.detail === 'string') {
      return err.detail;
    }

    // Check for message field
    if (err.message) {
      return err.message;
    }

    // Check for error field
    if (err.error && typeof err.error === 'string') {
      return err.error;
    }

    // Check for HTTP status code
    if (err.status && HTTP_ERROR_MESSAGES[err.status]) {
      return HTTP_ERROR_MESSAGES[err.status];
    }
  }

  return AUTH_ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Format validation errors into user-friendly messages
 * 
 * @param errors - Object containing field validation errors
 * @returns Array of formatted error messages
 * 
 * @example
 * ```ts
 * const errors = {
 *   email: 'Invalid email format',
 *   password: 'Password too short'
 * };
 * formatValidationErrors(errors);
 * // ["Email: Invalid email format", "Password: Password too short"]
 * ```
 */
export function formatValidationErrors(
  errors: Record<string, string | string[]>
): string[] {
  const messages: string[] = [];

  for (const [field, error] of Object.entries(errors)) {
    const fieldName = field
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase());

    if (Array.isArray(error)) {
      error.forEach(msg => messages.push(`${fieldName}: ${msg}`));
    } else {
      messages.push(`${fieldName}: ${error}`);
    }
  }

  return messages;
}

/**
 * Check if error is a network error
 * 
 * @param error - Error to check
 * @returns True if error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const err = error as { code?: string; message?: string };
    return (
      err.code === 'NETWORK_ERROR' ||
      err.code === 'ECONNABORTED' ||
      err.code === 'ERR_NETWORK' ||
      err.message?.toLowerCase().includes('network') ||
      false
    );
  }
  return false;
}

/**
 * Check if error is an authentication error
 * 
 * @param error - Error to check
 * @returns True if error is auth-related
 */
export function isAuthError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const err = error as { status?: number; code?: string };
    return (
      err.status === 401 ||
      err.status === 403 ||
      err.code === 'INVALID_CREDENTIALS' ||
      err.code === 'TOKEN_EXPIRED' ||
      err.code === 'UNAUTHORIZED' ||
      false
    );
  }
  return false;
}

/**
 * Get error severity level
 * 
 * @param error - Error to evaluate
 * @returns Severity level: 'error' | 'warning' | 'info'
 */
export function getErrorSeverity(
  error: unknown
): 'error' | 'warning' | 'info' {
  if (typeof error === 'object' && error !== null) {
    const err = error as { status?: number; code?: string };

    // Critical errors
    if (
      err.status === 500 ||
      err.status === 503 ||
      err.code === 'SERVER_ERROR'
    ) {
      return 'error';
    }

    // Warnings
    if (
      err.status === 429 ||
      err.code === 'RATE_LIMIT_EXCEEDED' ||
      err.code === 'TOO_MANY_REQUESTS'
    ) {
      return 'warning';
    }

    // Auth errors (user action required)
    if (isAuthError(error)) {
      return 'warning';
    }
  }

  return 'error';
}
