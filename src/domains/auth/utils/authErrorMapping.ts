/**
 * Authentication Error Code Mapping
 * 
 * Maps backend error codes to user-friendly messages with contextual actions.
 * All error codes are based on backend auth_api.py exception handling.
 * 
 * Reference: 
 * - Backend: user_mn/src/app/user_core/api/v1/endpoints/auth_api.py
 * - Audit Report: AUTH_API_VALIDATION_AUDIT_REPORT.md - Section 6
 * 
 * @author GitHub Copilot
 * @date November 1, 2025
 */

export type AuthErrorCode =
  // Authentication errors
  | 'INVALID_CREDENTIALS'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'AUTHENTICATION_FAILED'
  
  // User status errors
  | 'USER_NOT_FOUND'
  | 'USER_INACTIVE'
  | 'EMAIL_NOT_VERIFIED'
  | 'USER_ALREADY_EXISTS'
  
  // Validation errors
  | 'VALIDATION_ERROR'
  | 'FIELD_VALIDATION_ERROR'
  | 'INVALID_EMAIL_FORMAT'
  | 'INVALID_PASSWORD_FORMAT'
  | 'PASSWORD_TOO_WEAK'
  
  // Rate limiting
  | 'RATE_LIMIT_EXCEEDED'
  | 'TOO_MANY_REQUESTS'
  
  // Password reset
  | 'PASSWORD_RESET_TOKEN_INVALID'
  | 'PASSWORD_RESET_TOKEN_EXPIRED'
  
  // Generic errors
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE';

/**
 * Action that can be taken in response to an error
 */
export interface ErrorAction {
  label: string;
  type: 'link' | 'button' | 'external';
  action: string; // Route path or function name
  variant?: 'primary' | 'secondary' | 'destructive';
}

/**
 * Error mapping configuration
 */
export interface ErrorMapping {
  code: AuthErrorCode;
  title: string;
  message: string;
  localizationKey: string;
  severity: 'error' | 'warning' | 'info';
  actions?: ErrorAction[];
  statusCode?: number;
}

/**
 * Complete error code mapping
 * Maps backend error codes to user-friendly messages and actions
 */
export const AUTH_ERROR_MAPPINGS: Record<AuthErrorCode, ErrorMapping> = {
  // ============================================================================
  // AUTHENTICATION ERRORS
  // ============================================================================
  
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    title: 'Invalid Credentials',
    message: 'The email or password you entered is incorrect. Please try again.',
    localizationKey: 'errors.auth.invalidCredentials',
    severity: 'error',
    statusCode: 401,
    actions: [
      {
        label: 'Forgot Password?',
        type: 'link',
        action: '/auth/forgot-password',
        variant: 'secondary',
      },
    ],
  },
  
  INVALID_TOKEN: {
    code: 'INVALID_TOKEN',
    title: 'Invalid Token',
    message: 'Your session token is invalid or has been tampered with. Please log in again.',
    localizationKey: 'errors.auth.invalidToken',
    severity: 'error',
    statusCode: 401,
    actions: [
      {
        label: 'Log In',
        type: 'link',
        action: '/auth/login',
        variant: 'primary',
      },
    ],
  },
  
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    title: 'Session Expired',
    message: 'Your session has expired. Please log in again to continue.',
    localizationKey: 'errors.auth.tokenExpired',
    severity: 'warning',
    statusCode: 401,
    actions: [
      {
        label: 'Log In',
        type: 'link',
        action: '/auth/login',
        variant: 'primary',
      },
    ],
  },
  
  AUTHENTICATION_FAILED: {
    code: 'AUTHENTICATION_FAILED',
    title: 'Authentication Failed',
    message: 'We could not authenticate your request. Please try logging in again.',
    localizationKey: 'errors.auth.authenticationFailed',
    severity: 'error',
    statusCode: 401,
    actions: [
      {
        label: 'Log In',
        type: 'link',
        action: '/auth/login',
        variant: 'primary',
      },
    ],
  },
  
  // ============================================================================
  // USER STATUS ERRORS
  // ============================================================================
  
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    title: 'Account Not Found',
    message: 'No account exists with this email address. Would you like to create one?',
    localizationKey: 'errors.auth.userNotFound',
    severity: 'error',
    statusCode: 404,
    actions: [
      {
        label: 'Create Account',
        type: 'link',
        action: '/auth/register',
        variant: 'primary',
      },
    ],
  },
  
  USER_INACTIVE: {
    code: 'USER_INACTIVE',
    title: 'Account Inactive',
    message: 'Your account has been deactivated. Please contact support for assistance.',
    localizationKey: 'errors.auth.userInactive',
    severity: 'error',
    statusCode: 403,
    actions: [
      {
        label: 'Contact Support',
        type: 'external',
        action: 'mailto:support@example.com',
        variant: 'secondary',
      },
    ],
  },
  
  EMAIL_NOT_VERIFIED: {
    code: 'EMAIL_NOT_VERIFIED',
    title: 'Email Not Verified',
    message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
    localizationKey: 'errors.auth.emailNotVerified',
    severity: 'warning',
    statusCode: 403,
    actions: [
      {
        label: 'Resend Verification Email',
        type: 'button',
        action: 'resendVerification',
        variant: 'primary',
      },
    ],
  },
  
  USER_ALREADY_EXISTS: {
    code: 'USER_ALREADY_EXISTS',
    title: 'Account Already Exists',
    message: 'An account with this email address already exists. Would you like to log in?',
    localizationKey: 'errors.auth.userAlreadyExists',
    severity: 'error',
    statusCode: 409,
    actions: [
      {
        label: 'Log In',
        type: 'link',
        action: '/auth/login',
        variant: 'primary',
      },
      {
        label: 'Forgot Password?',
        type: 'link',
        action: '/auth/forgot-password',
        variant: 'secondary',
      },
    ],
  },
  
  // ============================================================================
  // VALIDATION ERRORS
  // ============================================================================
  
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    title: 'Validation Error',
    message: 'Please check your input and try again.',
    localizationKey: 'errors.validation.generic',
    severity: 'error',
    statusCode: 400,
  },
  
  FIELD_VALIDATION_ERROR: {
    code: 'FIELD_VALIDATION_ERROR',
    title: 'Invalid Input',
    message: 'One or more fields contain invalid data. Please review and correct them.',
    localizationKey: 'errors.validation.fieldError',
    severity: 'error',
    statusCode: 400,
  },
  
  INVALID_EMAIL_FORMAT: {
    code: 'INVALID_EMAIL_FORMAT',
    title: 'Invalid Email',
    message: 'Please enter a valid email address (e.g., user@example.com).',
    localizationKey: 'errors.validation.invalidEmail',
    severity: 'error',
    statusCode: 400,
  },
  
  INVALID_PASSWORD_FORMAT: {
    code: 'INVALID_PASSWORD_FORMAT',
    title: 'Invalid Password',
    message: 'Password must be 8-128 characters with uppercase, lowercase, number, and special character.',
    localizationKey: 'errors.validation.invalidPassword',
    severity: 'error',
    statusCode: 400,
  },
  
  PASSWORD_TOO_WEAK: {
    code: 'PASSWORD_TOO_WEAK',
    title: 'Weak Password',
    message: 'Your password is too weak. Please choose a stronger password.',
    localizationKey: 'errors.validation.passwordTooWeak',
    severity: 'warning',
    statusCode: 400,
  },
  
  // ============================================================================
  // RATE LIMITING
  // ============================================================================
  
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    title: 'Too Many Attempts',
    message: 'You have made too many requests. Please wait a few minutes before trying again.',
    localizationKey: 'errors.rateLimit.exceeded',
    severity: 'warning',
    statusCode: 429,
  },
  
  TOO_MANY_REQUESTS: {
    code: 'TOO_MANY_REQUESTS',
    title: 'Too Many Requests',
    message: 'You are making requests too quickly. Please slow down and try again.',
    localizationKey: 'errors.rateLimit.tooMany',
    severity: 'warning',
    statusCode: 429,
  },
  
  // ============================================================================
  // PASSWORD RESET ERRORS
  // ============================================================================
  
  PASSWORD_RESET_TOKEN_INVALID: {
    code: 'PASSWORD_RESET_TOKEN_INVALID',
    title: 'Invalid Reset Link',
    message: 'This password reset link is invalid. Please request a new one.',
    localizationKey: 'errors.passwordReset.invalidToken',
    severity: 'error',
    statusCode: 400,
    actions: [
      {
        label: 'Request New Link',
        type: 'link',
        action: '/auth/forgot-password',
        variant: 'primary',
      },
    ],
  },
  
  PASSWORD_RESET_TOKEN_EXPIRED: {
    code: 'PASSWORD_RESET_TOKEN_EXPIRED',
    title: 'Reset Link Expired',
    message: 'This password reset link has expired. Please request a new one.',
    localizationKey: 'errors.passwordReset.expiredToken',
    severity: 'warning',
    statusCode: 400,
    actions: [
      {
        label: 'Request New Link',
        type: 'link',
        action: '/auth/forgot-password',
        variant: 'primary',
      },
    ],
  },
  
  // ============================================================================
  // GENERIC HTTP ERRORS
  // ============================================================================
  
  BAD_REQUEST: {
    code: 'BAD_REQUEST',
    title: 'Bad Request',
    message: 'Your request could not be processed. Please check your input and try again.',
    localizationKey: 'errors.http.badRequest',
    severity: 'error',
    statusCode: 400,
  },
  
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    title: 'Unauthorized',
    message: 'You are not authorized to perform this action. Please log in and try again.',
    localizationKey: 'errors.http.unauthorized',
    severity: 'error',
    statusCode: 401,
    actions: [
      {
        label: 'Log In',
        type: 'link',
        action: '/auth/login',
        variant: 'primary',
      },
    ],
  },
  
  FORBIDDEN: {
    code: 'FORBIDDEN',
    title: 'Access Denied',
    message: 'You do not have permission to access this resource.',
    localizationKey: 'errors.http.forbidden',
    severity: 'error',
    statusCode: 403,
  },
  
  NOT_FOUND: {
    code: 'NOT_FOUND',
    title: 'Not Found',
    message: 'The requested resource could not be found.',
    localizationKey: 'errors.http.notFound',
    severity: 'error',
    statusCode: 404,
  },
  
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    title: 'Server Error',
    message: 'An unexpected error occurred. Please try again later.',
    localizationKey: 'errors.http.internalServerError',
    severity: 'error',
    statusCode: 500,
  },
  
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    title: 'Service Unavailable',
    message: 'The service is temporarily unavailable. Please try again later.',
    localizationKey: 'errors.http.serviceUnavailable',
    severity: 'error',
    statusCode: 503,
  },
};

/**
 * Get error mapping by error code
 * @param code - Error code from backend
 * @returns Error mapping configuration
 */
export function getErrorMapping(code: string): ErrorMapping | null {
  const normalizedCode = code.toUpperCase().replace(/-/g, '_') as AuthErrorCode;
  return AUTH_ERROR_MAPPINGS[normalizedCode] || null;
}

/**
 * Get error mapping by HTTP status code
 * @param statusCode - HTTP status code
 * @returns Error mapping configuration
 */
export function getErrorMappingByStatus(statusCode: number): ErrorMapping | null {
  const mapping = Object.values(AUTH_ERROR_MAPPINGS).find(
    (m) => m.statusCode === statusCode
  );
  return mapping || null;
}

/**
 * Parse backend error response and return mapped error
 * @param error - Axios error object or error response
 * @returns Mapped error configuration
 */
export function parseAuthError(error: unknown): ErrorMapping {
  const err = error as { 
    response?: { 
      data?: { code?: string; error?: { code?: string }; error_code?: string };
      status?: number;
    };
    code?: string;
    status?: number;
  };
  
  // Extract error code from various response formats
  const errorCode = 
    err?.response?.data?.code ||
    err?.response?.data?.error?.code ||
    err?.response?.data?.error_code ||
    err?.code ||
    null;
  
  // Try to get mapping by error code first
  if (errorCode) {
    const mapping = getErrorMapping(errorCode);
    if (mapping) return mapping;
  }
  
  // Fall back to HTTP status code
  const statusCode = err?.response?.status || err?.status;
  if (statusCode) {
    const mapping = getErrorMappingByStatus(statusCode);
    if (mapping) return mapping;
  }
  
  // Default to generic error
  return AUTH_ERROR_MAPPINGS.INTERNAL_SERVER_ERROR;
}

/**
 * Format error message with context
 * @param error - Axios error or error response
 * @returns Formatted error message
 */
export function formatAuthErrorMessage(error: unknown): string {
  const mapping = parseAuthError(error);
  const err = error as { response?: { data?: { message?: string; detail?: string } }; message?: string };
  
  // If backend provides a custom message, use it
  const backendMessage = 
    err?.response?.data?.message ||
    err?.response?.data?.detail ||
    err?.message;
  
  // Use backend message if it's specific, otherwise use our mapping
  if (backendMessage && backendMessage !== 'Internal Server Error') {
    return backendMessage;
  }
  
  return mapping.message;
}

/**
 * Check if error has suggested actions
 * @param error - Axios error or error response
 * @returns True if error has actions
 */
export function hasErrorActions(error: unknown): boolean {
  const mapping = parseAuthError(error);
  return (mapping.actions?.length || 0) > 0;
}

/**
 * Get error actions for UI
 * @param error - Axios error or error response
 * @returns Array of actions
 */
export function getErrorActions(error: unknown): ErrorAction[] {
  const mapping = parseAuthError(error);
  return mapping.actions || [];
}
