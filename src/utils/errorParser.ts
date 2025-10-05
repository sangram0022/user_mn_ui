/**
 * API Error Parser Utility
 * Parses backend error responses and maps them to localized messages
 */

import type { ApiErrorResponse, ParsedError } from '../types/error';
import errorMessages from '../locales/en/errors.json';

/**
 * Check if response is an API error response
 */
export const isApiErrorResponse = (error: unknown): error is ApiErrorResponse => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as ApiErrorResponse).error === 'object'
  );
};

/**
 * Extract error code from various error formats
 */
const extractErrorCode = (error: unknown): string => {
  if (isApiErrorResponse(error)) {
    const { message } = error.error;
    
    // If message is an object with error_code
    if (typeof message === 'object' && message !== null && 'error_code' in message) {
      return (message as { error_code: string }).error_code;
    }
    
    // If message is a string, try to extract code from it
    if (typeof message === 'string') {
      return 'UNKNOWN_ERROR';
    }
  }
  
  // Check for HTTP status codes
  if (typeof error === 'object' && error !== null) {
    if ('status' in error) {
      const status = (error as { status: number }).status;
      return mapStatusCodeToError(status);
    }
    if ('code' in error && typeof (error as { code: string }).code === 'string') {
      return (error as { code: string }).code;
    }
  }
  
  return 'UNKNOWN_ERROR';
};

/**
 * Map HTTP status codes to error codes
 */
const mapStatusCodeToError = (statusCode: number): string => {
  const statusMap: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'RESOURCE_NOT_FOUND',
    429: 'RATE_LIMIT_EXCEEDED',
    500: 'INTERNAL_ERROR',
    502: 'SERVICE_UNAVAILABLE',
    503: 'SERVICE_UNAVAILABLE',
    504: 'TIMEOUT',
  };
  
  return statusMap[statusCode] || 'UNKNOWN_ERROR';
};

/**
 * Get localized error message for error code
 */
export const getErrorMessage = (errorCode: string): string => {
  const message = errorMessages[errorCode as keyof typeof errorMessages];
  return message || errorMessages.DEFAULT;
};

/**
 * Parse API error response into standardized format
 */
export const parseApiError = (error: unknown): ParsedError => {
  // Handle API error response format
  if (isApiErrorResponse(error)) {
    const { message, status_code, path, timestamp } = error.error;
    
    let errorCode = 'UNKNOWN_ERROR';
    let errorMessage = '';
    let details: unknown[] = [];
    
    if (typeof message === 'object' && message !== null) {
      errorCode = message.error_code || errorCode;
      errorMessage = message.message || '';
      details = message.data || [];
    } else if (typeof message === 'string') {
      errorMessage = message;
    }
    
    // Get localized message
    const localizedMessage = getErrorMessage(errorCode);
    
    return {
      code: errorCode,
      message: localizedMessage || errorMessage || getErrorMessage('DEFAULT'),
      statusCode: status_code,
      path,
      timestamp,
      details,
    };
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    const errorCode = extractErrorCode(error);
    return {
      code: errorCode,
      message: getErrorMessage(errorCode),
      statusCode: 500,
    };
  }
  
  // Handle network errors
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const errorMessage = (error as { message: string }).message;
    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
      return {
        code: 'NETWORK_ERROR',
        message: getErrorMessage('NETWORK_ERROR'),
        statusCode: 0,
      };
    }
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      code: 'UNKNOWN_ERROR',
      message: error || getErrorMessage('DEFAULT'),
      statusCode: 500,
    };
  }
  
  // Default fallback
  return {
    code: 'UNKNOWN_ERROR',
    message: getErrorMessage('DEFAULT'),
    statusCode: 500,
  };
};

/**
 * Format error for display
 */
export const formatErrorForDisplay = (error: unknown): string => {
  const parsed = parseApiError(error);
  return parsed.message;
};

/**
 * Check if error is authentication related
 */
export const isAuthError = (error: unknown): boolean => {
  const parsed = parseApiError(error);
  const authCodes = [
    'INVALID_CREDENTIALS',
    'UNAUTHORIZED',
    'TOKEN_EXPIRED',
    'INVALID_TOKEN',
    'EMAIL_NOT_VERIFIED',
  ];
  return authCodes.includes(parsed.code);
};

/**
 * Check if error requires user action
 */
export const requiresUserAction = (error: unknown): boolean => {
  const parsed = parseApiError(error);
  const actionCodes = [
    'VALIDATION_ERROR',
    'INVALID_INPUT',
    'EMAIL_NOT_VERIFIED',
    'WEAK_PASSWORD',
  ];
  return actionCodes.includes(parsed.code);
};

/**
 * Get error severity level
 */
export const getErrorSeverity = (error: unknown): 'error' | 'warning' | 'info' => {
  const parsed = parseApiError(error);
  
  // Critical errors
  const criticalCodes = [
    'ACCOUNT_DISABLED',
    'ACCOUNT_LOCKED',
    'PERMISSION_DENIED',
    'FORBIDDEN',
  ];
  if (criticalCodes.includes(parsed.code)) {
    return 'error';
  }
  
  // Warning level
  const warningCodes = [
    'RATE_LIMIT_EXCEEDED',
    'EMAIL_NOT_VERIFIED',
    'WEAK_PASSWORD',
  ];
  if (warningCodes.includes(parsed.code)) {
    return 'warning';
  }
  
  // Info level
  const infoCodes = ['VALIDATION_ERROR', 'INVALID_INPUT'];
  if (infoCodes.includes(parsed.code)) {
    return 'info';
  }
  
  return 'error';
};
