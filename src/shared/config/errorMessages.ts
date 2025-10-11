/**
 * Centralized Error Message Configuration
 *
 * This file contains all error messages and their mappings.
 * All error messages should be defined here and not in API responses.
 *
 * Benefits:
 * - Consistent error messages across the application
 * - Easy to update and maintain in one place
 * - Supports internationalization (i18n) in the future
 * - Type-safe error code usage
 */

export interface ErrorMessageConfig {
  /** Error code identifier */
  code: string;
  /** User-friendly message to display */
  message: string;
  /** Optional detailed description */
  description?: string;
  /** Suggested action for the user */
  action?: string;
  /** Whether the error is recoverable by retry */
  recoverable?: boolean;
  /** HTTP status code this typically maps to */
  statusCode?: number;
}

/**
 * Authentication & Authorization Errors
 */
export const AUTH_ERRORS: Record<string, ErrorMessageConfig> = {
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid email or password',
    description: 'The credentials you entered are incorrect.',
    action: 'Please check your email and password and try again.',
    recoverable: true,
    statusCode: 401,
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Authentication required',
    description: 'You need to be logged in to access this resource.',
    action: 'Please log in and try again.',
    recoverable: true,
    statusCode: 401,
  },
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    message: 'Session expired',
    description: 'Your session has expired for security reasons.',
    action: 'Please log in again to continue.',
    recoverable: true,
    statusCode: 401,
  },
  INVALID_TOKEN: {
    code: 'INVALID_TOKEN',
    message: 'Invalid session',
    description: 'Your session token is invalid or has been tampered with.',
    action: 'Please log in again.',
    recoverable: true,
    statusCode: 401,
  },
  PERMISSION_DENIED: {
    code: 'PERMISSION_DENIED',
    message: 'Access denied',
    description: 'You do not have permission to perform this action.',
    action: 'Contact your administrator if you need access.',
    recoverable: false,
    statusCode: 403,
  },
  ACCOUNT_DISABLED: {
    code: 'ACCOUNT_DISABLED',
    message: 'Account disabled',
    description: 'Your account has been disabled.',
    action: 'Please contact support for assistance.',
    recoverable: false,
    statusCode: 403,
  },
  ACCOUNT_LOCKED: {
    code: 'ACCOUNT_LOCKED',
    message: 'Account locked',
    description: 'Your account has been temporarily locked due to multiple failed login attempts.',
    action: 'Please try again later or reset your password.',
    recoverable: true,
    statusCode: 403,
  },
  EMAIL_NOT_VERIFIED: {
    code: 'EMAIL_NOT_VERIFIED',
    message: 'Email verification required',
    description: 'Please verify your email address before logging in.',
    action: 'Check your inbox for the verification link.',
    recoverable: true,
    statusCode: 403,
  },
};

/**
 * Registration & User Management Errors
 */
export const USER_ERRORS: Record<string, ErrorMessageConfig> = {
  EMAIL_ALREADY_EXISTS: {
    code: 'EMAIL_ALREADY_EXISTS',
    message: 'Email already registered',
    description: 'An account with this email address already exists.',
    action: 'Try logging in or use a different email address.',
    recoverable: true,
    statusCode: 409,
  },
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'User not found',
    description: 'No account found with the provided information.',
    action: 'Please check your email address or sign up for a new account.',
    recoverable: true,
    statusCode: 404,
  },
  WEAK_PASSWORD: {
    code: 'WEAK_PASSWORD',
    message: 'Password too weak',
    description: 'Your password does not meet the minimum security requirements.',
    action: 'Use at least 8 characters with a mix of letters, numbers, and symbols.',
    recoverable: true,
    statusCode: 400,
  },
  PASSWORD_MISMATCH: {
    code: 'PASSWORD_MISMATCH',
    message: 'Passwords do not match',
    description: 'The passwords you entered do not match.',
    action: 'Please ensure both password fields are identical.',
    recoverable: true,
    statusCode: 400,
  },
  REGISTRATION_FAILED: {
    code: 'REGISTRATION_FAILED',
    message: 'Registration failed',
    description: 'Unable to create your account at this time.',
    action: 'Please try again or contact support if the problem persists.',
    recoverable: true,
    statusCode: 500,
  },
  PROFILE_UPDATE_FAILED: {
    code: 'PROFILE_UPDATE_FAILED',
    message: 'Failed to update profile',
    description: 'Your profile changes could not be saved.',
    action: 'Please try again later.',
    recoverable: true,
    statusCode: 500,
  },
  PASSWORD_RESET_FAILED: {
    code: 'PASSWORD_RESET_FAILED',
    message: 'Password reset failed',
    description: 'Unable to reset your password.',
    action: 'Please try again or contact support.',
    recoverable: true,
    statusCode: 500,
  },
};

/**
 * Validation Errors
 */
export const VALIDATION_ERRORS: Record<string, ErrorMessageConfig> = {
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    description: 'The data you provided is invalid.',
    action: 'Please check your input and try again.',
    recoverable: true,
    statusCode: 400,
  },
  INVALID_INPUT: {
    code: 'INVALID_INPUT',
    message: 'Invalid input',
    description: 'One or more fields contain invalid data.',
    action: 'Please review and correct the highlighted fields.',
    recoverable: true,
    statusCode: 400,
  },
  REQUIRED_FIELD: {
    code: 'REQUIRED_FIELD',
    message: 'Required field missing',
    description: 'Please fill in all required fields.',
    action: 'Check for any empty required fields and fill them in.',
    recoverable: true,
    statusCode: 400,
  },
  INVALID_EMAIL: {
    code: 'INVALID_EMAIL',
    message: 'Invalid email address',
    description: 'The email address format is not valid.',
    action: 'Please enter a valid email address.',
    recoverable: true,
    statusCode: 400,
  },
  INVALID_FORMAT: {
    code: 'INVALID_FORMAT',
    message: 'Invalid format',
    description: 'The data format is not acceptable.',
    action: 'Please check the format requirements and try again.',
    recoverable: true,
    statusCode: 400,
  },
};

/**
 * Network & Server Errors
 */
export const NETWORK_ERRORS: Record<string, ErrorMessageConfig> = {
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message: 'Network connection failed',
    description: 'Unable to connect to the server.',
    action: 'Please check your internet connection and try again.',
    recoverable: true,
    statusCode: 0,
  },
  TIMEOUT: {
    code: 'TIMEOUT',
    message: 'Request timed out',
    description: 'The server took too long to respond.',
    action: 'Please try again.',
    recoverable: true,
    statusCode: 408,
  },
  SERVER_ERROR: {
    code: 'SERVER_ERROR',
    message: 'Server error',
    description: 'An unexpected error occurred on the server.',
    action: 'Please try again later or contact support.',
    recoverable: true,
    statusCode: 500,
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    description: 'The server encountered an unexpected condition.',
    action: 'Please contact support if this problem persists.',
    recoverable: true,
    statusCode: 500,
  },
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    message: 'Service unavailable',
    description: 'The service is temporarily unavailable.',
    action: 'Please try again in a few moments.',
    recoverable: true,
    statusCode: 503,
  },
  BAD_GATEWAY: {
    code: 'BAD_GATEWAY',
    message: 'Bad gateway',
    description: 'The server received an invalid response.',
    action: 'Please try again later.',
    recoverable: true,
    statusCode: 502,
  },
};

/**
 * Rate Limiting & Resource Errors
 */
export const RESOURCE_ERRORS: Record<string, ErrorMessageConfig> = {
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests',
    description: 'You have made too many requests in a short time.',
    action: 'Please wait a moment before trying again.',
    recoverable: true,
    statusCode: 429,
  },
  RESOURCE_NOT_FOUND: {
    code: 'RESOURCE_NOT_FOUND',
    message: 'Resource not found',
    description: 'The requested resource could not be found.',
    action: 'Please check the URL and try again.',
    recoverable: false,
    statusCode: 404,
  },
  DUPLICATE_ENTRY: {
    code: 'DUPLICATE_ENTRY',
    message: 'Duplicate entry',
    description: 'This entry already exists in the system.',
    action: 'Please use a different value.',
    recoverable: true,
    statusCode: 409,
  },
  CONFLICT: {
    code: 'CONFLICT',
    message: 'Conflict detected',
    description: 'The request conflicts with the current state.',
    action: 'Please refresh and try again.',
    recoverable: true,
    statusCode: 409,
  },
};

/**
 * Generic/Fallback Errors
 */
export const GENERIC_ERRORS: Record<string, ErrorMessageConfig> = {
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    description: 'Something went wrong that we did not anticipate.',
    action: 'Please try again or contact support.',
    recoverable: true,
    statusCode: 500,
  },
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    message: 'Bad request',
    description: 'The request could not be understood by the server.',
    action: 'Please check your input and try again.',
    recoverable: true,
    statusCode: 400,
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'Access forbidden',
    description: 'You do not have access to this resource.',
    action: 'Contact your administrator for access.',
    recoverable: false,
    statusCode: 403,
  },
};

/**
 * All error messages combined
 */
export const ALL_ERROR_MESSAGES: Record<string, ErrorMessageConfig> = {
  ...AUTH_ERRORS,
  ...USER_ERRORS,
  ...VALIDATION_ERRORS,
  ...NETWORK_ERRORS,
  ...RESOURCE_ERRORS,
  ...GENERIC_ERRORS,
};

/**
 * Get error message configuration by code
 */
export function getErrorConfig(code: string): ErrorMessageConfig {
  return (
    ALL_ERROR_MESSAGES[code] ||
    ALL_ERROR_MESSAGES[code.toUpperCase()] || {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      description: 'Something went wrong.',
      action: 'Please try again.',
      recoverable: true,
      statusCode: 500,
    }
  );
}

/**
 * Get error message by code
 */
export function getErrorMessage(code: string): string {
  const config = getErrorConfig(code);
  return config.message;
}

/**
 * Get full error details by code
 */
export function getErrorDetails(code: string): {
  message: string;
  description?: string;
  action?: string;
} {
  const config = getErrorConfig(code);
  return {
    message: config.message,
    description: config.description,
    action: config.action,
  };
}

/**
 * Error categories for easier grouping
 */
export const ERROR_CATEGORIES = {
  AUTH: Object.keys(AUTH_ERRORS),
  USER: Object.keys(USER_ERRORS),
  VALIDATION: Object.keys(VALIDATION_ERRORS),
  NETWORK: Object.keys(NETWORK_ERRORS),
  RESOURCE: Object.keys(RESOURCE_ERRORS),
  GENERIC: Object.keys(GENERIC_ERRORS),
} as const;

/**
 * Check if error is recoverable
 */
export function isRecoverableError(code: string): boolean {
  const config = getErrorConfig(code);
  return config.recoverable ?? true;
}
