// ========================================
// Error Message Utilities
// Maps backend error codes to user-friendly messages
// Single Source of Truth for error messages (i18n ready)
// ========================================

import { AUTH_ERROR_CODES, type AuthErrorCode } from '../types/auth.types';

/**
 * Error Message Map
 * Use these for localization (i18n)
 * Keys match backend message_code values
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Authentication
  [AUTH_ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password',
  [AUTH_ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED]: 'Please verify your email address before logging in',
  [AUTH_ERROR_CODES.AUTH_ACCOUNT_INACTIVE]: 'Your account is inactive. Please contact support.',
  [AUTH_ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS]: 'This email address is already registered',
  [AUTH_ERROR_CODES.AUTH_INVALID_TOKEN]: 'Invalid or expired token',
  [AUTH_ERROR_CODES.AUTH_TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  
  // Validation
  [AUTH_ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again',
  
  // System
  [AUTH_ERROR_CODES.SYSTEM_ERROR]: 'Something went wrong. Please try again later.',
  [AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many attempts. Please try again later.',
  
  // Default fallback
  DEFAULT: 'An unexpected error occurred',
} as const;

/**
 * Get user-friendly error message from error code
 */
export function getErrorMessage(errorCode?: string): string {
  if (!errorCode) {
    return ERROR_MESSAGES.DEFAULT;
  }
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.DEFAULT;
}

/**
 * Format field errors for display
 * Converts backend field_errors format to user-friendly messages
 */
export function formatFieldErrors(fieldErrors?: Record<string, string[]>): Record<string, string> {
  if (!fieldErrors) {
    return {};
  }

  const formatted: Record<string, string> = {};
  
  Object.entries(fieldErrors).forEach(([field, errors]) => {
    // Join multiple errors with line breaks
    formatted[field] = errors.join('\n');
  });

  return formatted;
}

/**
 * Extract error details from API error response
 */
export interface ErrorDetails {
  message: string;
  code?: string;
  fieldErrors?: Record<string, string>;
  requestId?: string;
}

export function extractErrorDetails(error: unknown): ErrorDetails {
  // Handle Axios error
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: {
        data?: {
          message?: string;
          message_code?: string;
          field_errors?: Record<string, string[]>;
          request_id?: string;
          detail?: string;
        };
      };
      message?: string;
    };

    const responseData = axiosError.response?.data;

    if (responseData) {
      return {
        message: responseData.message || responseData.detail || getErrorMessage(responseData.message_code),
        code: responseData.message_code,
        fieldErrors: responseData.field_errors ? formatFieldErrors(responseData.field_errors) : undefined,
        requestId: responseData.request_id,
      };
    }
  }

  // Handle Error object
  if (error instanceof Error) {
    return {
      message: error.message || ERROR_MESSAGES.DEFAULT,
    };
  }

  // Handle string error
  if (typeof error === 'string') {
    return {
      message: error,
    };
  }

  // Fallback
  return {
    message: ERROR_MESSAGES.DEFAULT,
  };
}

/**
 * Check if error is a specific auth error code
 */
export function isAuthError(error: unknown, errorCode: AuthErrorCode): boolean {
  const details = extractErrorDetails(error);
  return details.code === errorCode;
}

/**
 * Check if error is a validation error (422)
 */
export function isValidationError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number } };
    return axiosError.response?.status === 422;
  }
  return false;
}

/**
 * Check if error is unauthorized (401)
 */
export function isUnauthorizedError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number } };
    return axiosError.response?.status === 401;
  }
  return false;
}

/**
 * Check if error is forbidden (403)
 */
export function isForbiddenError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number } };
    return axiosError.response?.status === 403;
  }
  return false;
}

/**
 * Check if error is rate limit exceeded (429)
 */
export function isRateLimitError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number } };
    return axiosError.response?.status === 429;
  }
  return false;
}
