/**
 * Admin Domain - Error Handler
 * 
 * Centralized error handling for admin API operations.
 * Focuses solely on error processing, logging, and structured error handling.
 * 
 * For toast notifications, use: @/domains/admin/utils/toastHelpers
 * For error messages, use: @/core/error/messages
 * 
 * Usage:
 *   import { handleAdminError } from '@/domains/admin/utils/errorHandler';
 *   import { showSuccess, showError } from '@/domains/admin/utils/toastHelpers';
 *   
 *   try {
 *     await createUser(data);
 *     showSuccess('User created successfully');
 *   } catch (error) {
 *     const result = handleAdminError(error, 'Failed to create user');
 *     // Optionally re-throw or handle result
 *   }
 */

import { 
  handleError, 
  extractErrorMessage, 
  extractErrorDetails,
  ERROR_MESSAGES,
} from '../../../core/error';
import { logger } from '../../../core/logging';
import { showError } from './toastHelpers';
import type { ERROR_CODES } from '../types/admin.types';

// ============================================================================
// Error Message Extraction
// ============================================================================

/**
 * Extract error code from error object
 */
function extractErrorCode(error: unknown): string | undefined {
  const details = extractErrorDetails(error);
  return details.code;
}

/**
 * Get user-friendly error message from error code
 * (Re-exported from core for backward compatibility)
 */
export function getErrorMessage(errorCode: string): string {
  if (errorCode in ERROR_MESSAGES) {
    return ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES];
  }
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Extract user-friendly error message from error object
 */
export function extractUserMessage(error: unknown, fallback?: string): string {
  // Try to get error code first
  const errorCode = extractErrorCode(error);
  if (errorCode && errorCode in ERROR_MESSAGES) {
    return ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES];
  }

  // Try to extract message from error object
  const message = extractErrorMessage(error);
  
  // Return message or fallback
  return message || fallback || ERROR_MESSAGES.UNKNOWN_ERROR;
}

// ============================================================================
// Admin Error Handler
// ============================================================================

/**
 * Handle admin API error with toast notification
 * 
 * @param error - The error object
 * @param fallbackMessage - Fallback message if error cannot be parsed
 * @param options - Additional options
 * @returns The error handling result
 * 
 * @example
 * ```typescript
 * try {
 *   await createUser(data);
 * } catch (error) {
 *   handleAdminError(error, 'Failed to create user');
 *   // Optionally re-throw to let caller handle it
 *   throw error;
 * }
 * ```
 */
export function handleAdminError(
  error: unknown,
  fallbackMessage?: string,
  options: {
    showToast?: boolean;
    duration?: number;
    logError?: boolean;
  } = {}
): void {
  const {
    showToast: shouldShowToast = true,
    duration = 5000,
    logError = true,
  } = options;

  // Use core error handler for logging and structured handling
  const result = handleError(error);

  // Get user-friendly message
  const userMessage = extractUserMessage(error, fallbackMessage);

  // Show toast notification
  if (shouldShowToast) {
    showError(userMessage, duration);
  }

  // Log error using centralized logger
  if (logError) {
    logger().error('[Admin Error]', error instanceof Error ? error : undefined, {
      message: userMessage,
      result,
    });
  }
}

/**
 * Handle validation errors with field-level messages
 */
export function handleValidationError(
  error: unknown,
  fallbackMessage: string = 'Validation failed'
): Record<string, string> {
  const details = extractErrorDetails(error);
  
  // Check if error has validation errors object
  if (details.context && typeof details.context === 'object' && 'errors' in details.context) {
    const errors = details.context.errors as Record<string, string>;
    return errors;
  }

  // Show generic validation error
  showError(fallbackMessage);
  
  return {};
}

// ============================================================================
// Error Types for Admin Domain
// ============================================================================

/**
 * Admin-specific error class
 */
export class AdminError extends Error {
  code: keyof typeof ERROR_CODES | string;
  statusCode: number;
  context?: Record<string, unknown>;

  constructor(
    message: string,
    code: keyof typeof ERROR_CODES | string,
    statusCode: number = 500,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AdminError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
  }
}

/**
 * Create admin error
 */
export function createAdminError(
  message: string,
  code: string,
  statusCode: number = 500,
  context?: Record<string, unknown>
): AdminError {
  return new AdminError(message, code, statusCode, context);
}

/**
 * Type guard for AdminError
 */
export function isAdminError(error: unknown): error is AdminError {
  return error instanceof AdminError;
}

// ============================================================================
// Re-exports for backward compatibility
// ============================================================================

// Toast helpers moved to toastHelpers.ts
export { 
  showSuccess, 
  showError, 
  showInfo, 
  showWarning, 
  showToast,
  showSuccessMessage,
  type ToastType,
  type SuccessMessageKey,
} from './toastHelpers';
