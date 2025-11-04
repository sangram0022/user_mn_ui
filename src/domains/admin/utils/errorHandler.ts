/**
 * Admin Domain - Error Handler
 * 
 * Centralized error handling for all admin API operations.
 * Maps API error codes to user-friendly messages and handles toast notifications.
 * 
 * Usage:
 *   import { handleAdminError, showSuccess } from '@/domains/admin/utils/errorHandler';
 *   
 *   try {
 *     await createUser(data);
 *     showSuccess('User created successfully');
 *   } catch (error) {
 *     handleAdminError(error, 'Failed to create user');
 *   }
 */

import { useNotificationStore } from '../../../store/notificationStore';
import type { ToastType } from '../../../store/notificationStore';
import { handleError, extractErrorMessage, extractErrorDetails } from '../../../core/error';
import type { ERROR_CODES } from '../types/admin.types';

// ============================================================================
// Error Code to Message Mapping
// ============================================================================

const ERROR_MESSAGES: Record<string, string> = {
  // User errors (USER_001 - USER_020)
  USER_001: 'User not found',
  USER_002: 'Email address already exists',
  USER_003: 'User already approved',
  USER_004: 'User already rejected',
  USER_005: 'Invalid user status transition',
  USER_006: 'Cannot delete system user',
  USER_007: 'User is inactive',
  USER_008: 'User account is suspended',
  USER_009: 'User email not verified',
  USER_010: 'Invalid user data',

  // Role errors (ROLE_001 - ROLE_020)
  ROLE_001: 'Role not found',
  ROLE_002: 'Role name already exists',
  ROLE_003: 'Cannot delete system role',
  ROLE_004: 'Cannot modify system role',
  ROLE_005: 'Invalid role level',
  ROLE_006: 'Role has assigned users',
  ROLE_007: 'Invalid permission format',
  ROLE_008: 'Permission not found',
  ROLE_009: 'Role hierarchy violation',
  ROLE_010: 'Invalid role data',

  // Permission errors (PERM_001 - PERM_020)
  PERM_001: 'Permission denied',
  PERM_002: 'Insufficient privileges',
  PERM_003: 'Missing required permission',
  PERM_004: 'Invalid permission scope',
  PERM_005: 'Permission not found',

  // Analytics errors (ANALYTICS_001 - ANALYTICS_020)
  ANALYTICS_001: 'Analytics data not available',
  ANALYTICS_002: 'Invalid date range',
  ANALYTICS_003: 'Invalid time period',
  ANALYTICS_004: 'Analytics calculation failed',
  ANALYTICS_005: 'No data for selected period',

  // Audit errors (AUDIT_001 - AUDIT_020)
  AUDIT_001: 'Audit log not found',
  AUDIT_002: 'Invalid audit filters',
  AUDIT_003: 'Export format not supported',
  AUDIT_004: 'Export generation failed',
  AUDIT_005: 'Too many results to export',

  // Auth errors (AUTH_001 - AUTH_020)
  AUTH_001: 'Invalid credentials',
  AUTH_002: 'Token expired',
  AUTH_003: 'Invalid token',
  AUTH_004: 'Session expired',
  AUTH_005: 'Unauthorized access',
  AUTH_006: 'Account locked',
  AUTH_007: 'Password reset required',
  AUTH_008: 'Multi-factor authentication required',

  // Validation errors (VALIDATION_001 - VALIDATION_020)
  VALIDATION_001: 'Invalid input data',
  VALIDATION_002: 'Required field missing',
  VALIDATION_003: 'Invalid email format',
  VALIDATION_004: 'Invalid password format',
  VALIDATION_005: 'Password too weak',
  VALIDATION_006: 'Invalid phone number',
  VALIDATION_007: 'Invalid date format',
  VALIDATION_008: 'Value out of range',
  VALIDATION_009: 'Invalid file format',
  VALIDATION_010: 'File too large',

  // System errors (SYSTEM_001 - SYSTEM_020)
  SYSTEM_001: 'Internal server error',
  SYSTEM_002: 'Service unavailable',
  SYSTEM_003: 'Database error',
  SYSTEM_004: 'Cache error',
  SYSTEM_005: 'External service error',
  SYSTEM_006: 'Rate limit exceeded',
  SYSTEM_007: 'Maintenance mode',
  SYSTEM_008: 'Resource exhausted',

  // Network errors
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  
  // Generic fallback
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

// ============================================================================
// Toast Notification Helpers
// ============================================================================

/**
 * Show success toast notification
 */
export function showSuccess(message: string, duration?: number): void {
  useNotificationStore.getState().addToast({
    type: 'success',
    message,
    duration,
  });
}

/**
 * Show error toast notification
 */
export function showError(message: string, duration?: number): void {
  useNotificationStore.getState().addToast({
    type: 'error',
    message,
    duration,
  });
}

/**
 * Show info toast notification
 */
export function showInfo(message: string, duration?: number): void {
  useNotificationStore.getState().addToast({
    type: 'info',
    message,
    duration,
  });
}

/**
 * Show warning toast notification
 */
export function showWarning(message: string, duration?: number): void {
  useNotificationStore.getState().addToast({
    type: 'warning',
    message,
    duration,
  });
}

/**
 * Show toast based on type
 */
export function showToast(type: ToastType, message: string, duration?: number): void {
  useNotificationStore.getState().addToast({
    type,
    message,
    duration,
  });
}

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
 */
export function getErrorMessage(errorCode: string): string {
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Extract user-friendly error message from error object
 */
export function extractUserMessage(error: unknown, fallback?: string): string {
  // Try to get error code first
  const errorCode = extractErrorCode(error);
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode];
  }

  // Try to extract message from error object
  const message = extractErrorMessage(error);
  
  // Check if message matches any of our known error messages
  if (message && Object.values(ERROR_MESSAGES).includes(message)) {
    return message;
  }

  // Return fallback or generic message
  return fallback || ERROR_MESSAGES.UNKNOWN_ERROR;
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

  // Log to console in development
  if (logError && import.meta.env.DEV) {
    console.error('[Admin Error]', {
      message: userMessage,
      error,
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

/**
 * Handle success response with toast notification
 */
export function handleSuccess(message: string, duration?: number): void {
  showSuccess(message, duration);
}

// ============================================================================
// Operation-specific Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
  // User operations
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  USER_APPROVED: 'User approved successfully',
  USER_REJECTED: 'User rejected successfully',
  USER_ACTIVATED: 'User activated successfully',
  USER_SUSPENDED: 'User suspended successfully',
  USERS_BULK_APPROVED: 'Users approved successfully',
  USERS_BULK_REJECTED: 'Users rejected successfully',
  USERS_BULK_DELETED: 'Users deleted successfully',

  // Role operations
  ROLE_CREATED: 'Role created successfully',
  ROLE_UPDATED: 'Role updated successfully',
  ROLE_DELETED: 'Role deleted successfully',
  ROLE_ASSIGNED: 'Role assigned successfully',
  ROLE_REVOKED: 'Role revoked successfully',
  ROLES_ASSIGNED: 'Roles assigned successfully',

  // Analytics operations
  ANALYTICS_EXPORTED: 'Analytics exported successfully',
  ANALYTICS_REFRESHED: 'Analytics refreshed successfully',

  // Audit operations
  AUDIT_EXPORTED: 'Audit logs exported successfully',
  AUDIT_CLEARED: 'Audit logs cleared successfully',

  // Settings operations
  SETTINGS_UPDATED: 'Settings updated successfully',
  SETTINGS_RESET: 'Settings reset to defaults',

  // Generic
  OPERATION_SUCCESS: 'Operation completed successfully',
  CHANGES_SAVED: 'Changes saved successfully',
  DATA_EXPORTED: 'Data exported successfully',
} as const;

/**
 * Type for success message keys
 */
export type SuccessMessageKey = keyof typeof SUCCESS_MESSAGES;

/**
 * Show predefined success message
 */
export function showSuccessMessage(key: SuccessMessageKey, duration?: number): void {
  showSuccess(SUCCESS_MESSAGES[key], duration);
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
// Export Everything
// ============================================================================

export {
  ERROR_MESSAGES,
  type ToastType,
};
