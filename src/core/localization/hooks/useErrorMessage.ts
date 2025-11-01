// ========================================
// useErrorMessage Hook
// Maps backend error_code to localized messages
// ========================================

import { useTranslation } from 'react-i18next';
import { getErrorMessage, type ErrorCode } from '../locales/en/errors';

/**
 * Backend API Error Response Structure
 */
export interface ApiErrorResponse {
  status_code: number;
  error_code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Hook for handling error messages with localization
 * Maps backend error_code to user-friendly localized messages
 */
export function useErrorMessage() {
  const { t } = useTranslation();

  /**
   * Get localized error message from backend error_code
   * @param errorCode - Backend error_code from API response
   * @param params - Optional interpolation parameters
   * @returns Localized error message
   */
  const getError = (errorCode: string, params?: Record<string, unknown>): string => {
    // Try to get from translation file
    const translationKey = `errors.${errorCode}`;
    const translated = t(translationKey, params);
    
    // If translation exists (not the key itself), return it
    if (translated !== translationKey) {
      return translated;
    }
    
    // Fallback to hardcoded error messages
    return getErrorMessage(errorCode);
  };

  /**
   * Parse error from API response or Error object
   * Handles multiple error response formats
   */
  const parseError = (error: unknown): string => {
    // Handle null/undefined
    if (!error) {
      return t('errors.DEFAULT');
    }

    // Handle string errors
    if (typeof error === 'string') {
      return error;
    }

    // Handle Error objects
    if (error instanceof Error) {
      return error.message || t('errors.UNKNOWN_ERROR');
    }

    // Handle API error response with error_code
    if (typeof error === 'object' && error !== null) {
      const apiError = error as Partial<ApiErrorResponse>;
      
      // Primary: Use error_code for localization
      if (apiError.error_code) {
        return getError(apiError.error_code);
      }
      
      // Secondary: Use message from backend
      if (apiError.message) {
        return apiError.message;
      }
      
      // Handle nested error structures
      if ('error' in apiError && typeof apiError.error === 'object') {
        return parseError(apiError.error);
      }
    }

    // Final fallback
    return t('errors.DEFAULT');
  };

  /**
   * Check if error is authentication related
   */
  const isAuthError = (errorCode: string): boolean => {
    const authErrorCodes: ErrorCode[] = [
      'INVALID_CREDENTIALS',
      'TOKEN_EXPIRED',
      'TOKEN_INVALID',
      'REFRESH_TOKEN_EXPIRED',
      'UNAUTHORIZED',
      'SESSION_EXPIRED',
      'EMAIL_NOT_VERIFIED',
      'ACCOUNT_LOCKED',
    ];
    return authErrorCodes.includes(errorCode as ErrorCode);
  };

  /**
   * Check if error is validation related
   */
  const isValidationError = (errorCode: string): boolean => {
    const validationErrorCodes: ErrorCode[] = [
      'VALIDATION_ERROR',
      'REQUIRED_FIELD_MISSING',
      'INVALID_INPUT',
      'INVALID_FORMAT',
      'INVALID_EMAIL',
      'INVALID_PASSWORD',
      'WEAK_PASSWORD',
      'PASSWORDS_DO_NOT_MATCH',
    ];
    return validationErrorCodes.includes(errorCode as ErrorCode);
  };

  /**
   * Get error severity level
   */
  const getErrorSeverity = (errorCode: string): 'error' | 'warning' | 'info' => {
    const warningCodes: ErrorCode[] = [
      'ACCOUNT_LOCKED',
      'EMAIL_NOT_VERIFIED',
      'PASSWORD_EXPIRED',
      'RATE_LIMIT_EXCEEDED',
    ];
    
    if (warningCodes.includes(errorCode as ErrorCode)) {
      return 'warning';
    }
    
    return 'error';
  };

  return {
    getError,
    parseError,
    isAuthError,
    isValidationError,
    getErrorSeverity,
  };
}

export default useErrorMessage;
