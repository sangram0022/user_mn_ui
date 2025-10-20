/**
 * Error Mapper Utility
 *
 * Maps backend error codes to localized user-friendly messages.
 * This ensures all error messages are localized and never display raw backend messages.
 *
 * Requirements from backend API:
 * - Backend sends error_code (e.g., "INVALID_CREDENTIALS")
 * - UI maps error_code to localized message from errors.json
 * - Supports validation error arrays
 * - Supports rate limit retry_after
 */

import type { BackendApiErrorResponse, BackendValidationError } from '../types/api-backend.types';

/**
 * Get localized error messages from the errors.json file
 * In a real i18n setup, this would use useTranslation() hook
 * For utility usage, we'll import the translations directly
 */
import errorsEn from '../../locales/en/errors.json';

const errorMessages = errorsEn.errors;

/**
 * Maps a backend error code to a localized message
 *
 * @param errorCode - The error code from the backend API (e.g., "INVALID_CREDENTIALS")
 * @param params - Optional parameters for message interpolation (e.g., {retry_after: 60})
 * @returns Localized error message
 *
 * @example
 * ```typescript
 * // Simple error
 * mapErrorCodeToMessage('INVALID_CREDENTIALS')
 * // Returns: "Invalid email or password. Please check your credentials and try again."
 *
 * // Error with parameters
 * mapErrorCodeToMessage('RATE_LIMIT_EXCEEDED', { retry_after: 60 })
 * // Returns: "Too many requests. Please wait 60 seconds before trying again."
 * ```
 */
export function mapErrorCodeToMessage(
  errorCode: string,
  params?: Record<string, string | number>
): string {
  // Get the message template from error messages
  const messageTemplate = errorMessages[errorCode as keyof typeof errorMessages];

  // If error code not found, return a default message
  if (!messageTemplate) {
    console.warn(`Unknown error code: ${errorCode}. Using default error message.`);
    return errorMessages.DEFAULT;
  }

  // If no parameters, return the message as-is
  if (!params) {
    return messageTemplate;
  }

  // Replace placeholders with actual values
  // Supports {{param_name}} syntax
  let message = messageTemplate;
  Object.entries(params).forEach(([key, value]) => {
    message = message.replace(`{{${key}}}`, String(value));
  });

  return message;
}

/**
 * Maps a backend ApiError to a localized message
 * Handles error_code, message fallback, and retry_after
 *
 * @param error - The API error object from the backend
 * @returns Localized error message
 *
 * @example
 * ```typescript
 * const apiError: BackendApiErrorResponse = {
 *   error_code: 'RATE_LIMIT_EXCEEDED',
 *   message: 'Rate limit exceeded',
 *   status_code: 429,
 *   timestamp: '2025-01-01T00:00:00Z',
 *   request_id: 'req-123',
 *   retry_after: 60
 * };
 *
 * mapApiErrorToMessage(apiError)
 * // Returns: "Too many requests. Please wait 60 seconds before trying again."
 * ```
 */
export function mapApiErrorToMessage(error: BackendApiErrorResponse): string {
  // If error_code exists, use it for localization
  if (error.error_code) {
    const params: Record<string, string | number> = {};

    // Add retry_after if present (for rate limiting)
    if (error.retry_after) {
      params.retry_after = error.retry_after;
    }

    return mapErrorCodeToMessage(error.error_code, params);
  }

  // Fallback: if no error_code but has message (shouldn't happen with proper backend)
  if (error.message) {
    console.warn('API error without error_code. This should not happen in production.');
    return error.message;
  }

  // Ultimate fallback
  return errorMessages.UNKNOWN_ERROR;
}

/**
 * Maps validation errors to localized messages
 * Backend sends validation errors as an array of {field, code, message}
 *
 * @param validationErrors - Array of validation errors from backend
 * @returns Object mapping field names to localized error messages
 *
 * @example
 * ```typescript
 * const errors: BackendValidationError[] = [
 *   { field: 'email', code: 'INVALID_EMAIL', message: 'Invalid email' },
 *   { field: 'password', code: 'WEAK_PASSWORD', message: 'Weak password' }
 * ];
 *
 * mapValidationErrors(errors)
 * // Returns: {
 * //   email: "Please enter a valid email address.",
 * //   password: "Password does not meet security requirements. Please use a stronger password."
 * // }
 * ```
 */
export function mapValidationErrors(
  validationErrors: BackendValidationError[]
): Record<string, string> {
  const mappedErrors: Record<string, string> = {};

  validationErrors.forEach((error) => {
    // Use code for localization
    if (error.code) {
      // Extract parameters from message if present
      // Backend may send: FIELD_TOO_LONG with message containing max length
      const params: Record<string, string | number> = {};

      // Check for common parameter patterns
      const maxMatch = error.message?.match(/maximum (\d+)/);
      if (maxMatch) {
        params.max = parseInt(maxMatch[1], 10);
      }

      const minMatch = error.message?.match(/minimum (\d+)/);
      if (minMatch) {
        params.min = parseInt(minMatch[1], 10);
      }

      mappedErrors[error.field] = mapErrorCodeToMessage(error.code, params);
    } else {
      // Fallback to raw message (shouldn't happen)
      mappedErrors[error.field] = error.message;
    }
  });

  return mappedErrors;
}

/**
 * Helper to check if an error is a validation error (has errors array)
 *
 * @param error - The API error object
 * @returns True if error contains validation errors
 */
export function isValidationError(error: BackendApiErrorResponse): boolean {
  return Array.isArray(error.errors) && error.errors.length > 0;
}

/**
 * Extract and format all error messages from an ApiError
 * Combines general error message with validation errors if present
 *
 * @param error - The API error object from backend
 * @returns Object containing main message and optional field errors
 *
 * @example
 * ```typescript
 * const error: BackendApiErrorResponse = {
 *   error_code: 'VALIDATION_ERROR',
 *   message: 'Validation failed',
 *   status_code: 422,
 *   timestamp: '2025-01-01T00:00:00Z',
 *   request_id: 'req-123',
 *   errors: [
 *     { field: 'email', code: 'INVALID_EMAIL', message: 'Invalid email' }
 *   ]
 * };
 *
 * formatErrorMessages(error)
 * // Returns: {
 * //   message: "Please check your input and try again.",
 * //   fieldErrors: { email: "Please enter a valid email address." }
 * // }
 * ```
 */
export function formatErrorMessages(error: BackendApiErrorResponse): {
  message: string;
  fieldErrors?: Record<string, string>;
} {
  const message = mapApiErrorToMessage(error);

  if (isValidationError(error)) {
    const fieldErrors = mapValidationErrors(error.errors!);
    return { message, fieldErrors };
  }

  return { message };
}

/**
 * Create a user-friendly error message for display in toast notifications
 * Combines main message with field errors if present
 *
 * @param error - The API error object
 * @returns Single formatted error message for display
 *
 * @example
 * ```typescript
 * const error: BackendApiErrorResponse = {
 *   error_code: 'VALIDATION_ERROR',
 *   message: 'Validation failed',
 *   status_code: 422,
 *   timestamp: '2025-01-01T00:00:00Z',
 *   request_id: 'req-123',
 *   errors: [{ field: 'email', code: 'INVALID_EMAIL', message: 'Invalid' }]
 * };
 *
 * getDisplayErrorMessage(error)
 * // Returns: "Please check your input and try again.\n• Email: Please enter a valid email address."
 * ```
 */
export function getDisplayErrorMessage(error: BackendApiErrorResponse): string {
  const { message, fieldErrors } = formatErrorMessages(error);

  if (!fieldErrors || Object.keys(fieldErrors).length === 0) {
    return message;
  }

  // Combine main message with field-specific errors
  const fieldErrorMessages = Object.entries(fieldErrors)
    .map(([field, msg]) => `• ${field}: ${msg}`)
    .join('\n');

  return `${message}\n${fieldErrorMessages}`;
}

/**
 * Hook-friendly version for use in React components
 * Returns error mapper functions that can be used with i18n context
 *
 * @returns Object with all error mapping functions
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const errorMapper = useErrorMapper();
 *
 *   try {
 *     await api.login(credentials);
 *   } catch (error) {
 *     const message = errorMapper.mapApiError(error);
 *     toast.error(message);
 *   }
 * }
 * ```
 */
export function useErrorMapper() {
  return {
    mapErrorCode: mapErrorCodeToMessage,
    mapApiError: mapApiErrorToMessage,
    mapValidationErrors,
    formatErrors: formatErrorMessages,
    getDisplayMessage: getDisplayErrorMessage,
    isValidationError,
  };
}

// Export default for convenience
export default {
  mapErrorCode: mapErrorCodeToMessage,
  mapApiError: mapApiErrorToMessage,
  mapValidationErrors,
  formatErrors: formatErrorMessages,
  getDisplayMessage: getDisplayErrorMessage,
  isValidationError,
};
