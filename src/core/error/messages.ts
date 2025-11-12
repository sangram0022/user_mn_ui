/**
 * Error Messages - Single Source of Truth
 * 
 * Centralized error messages for the entire application.
 * All error codes and their user-friendly messages are defined here.
 * 
 * Benefits:
 * - Single source of truth for error messages
 * - Easy to update messages across the app
 * - Ready for i18n/localization
 * - Type-safe error code references
 * 
 * Usage:
 *   import { getErrorMessage, ERROR_MESSAGES } from '@/core/error/messages';
 *   
 *   const message = getErrorMessage('USER_001'); // 'User not found'
 */

/**
 * Error Message Map
 * Maps error codes to user-friendly messages
 */
export const ERROR_MESSAGES = {
  // ============================================================================
  // Authentication Errors (AUTH_001 - AUTH_020)
  // ============================================================================
  AUTH_001: 'Invalid credentials',
  AUTH_002: 'Token expired',
  AUTH_003: 'Invalid token',
  AUTH_004: 'Session expired',
  AUTH_005: 'Unauthorized access',
  AUTH_006: 'Account locked',
  AUTH_007: 'Password reset required',
  AUTH_008: 'Multi-factor authentication required',
  AUTH_009: 'Invalid email or password',
  AUTH_010: 'Please verify your email address before logging in',
  AUTH_011: 'Your account is inactive. Please contact support.',
  AUTH_012: 'This email address is already registered',
  AUTH_013: 'Your session has expired. Please log in again.',

  // ============================================================================
  // User Errors (USER_001 - USER_020)
  // ============================================================================
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

  // ============================================================================
  // Role Errors (ROLE_001 - ROLE_020)
  // ============================================================================
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

  // ============================================================================
  // Permission Errors (PERM_001 - PERM_020)
  // ============================================================================
  PERM_001: 'Permission denied',
  PERM_002: 'Insufficient privileges',
  PERM_003: 'Missing required permission',
  PERM_004: 'Invalid permission scope',
  PERM_005: 'Permission not found',

  // ============================================================================
  // Analytics Errors (ANALYTICS_001 - ANALYTICS_020)
  // ============================================================================
  ANALYTICS_001: 'Analytics data not available',
  ANALYTICS_002: 'Invalid date range',
  ANALYTICS_003: 'Invalid time period',
  ANALYTICS_004: 'Analytics calculation failed',
  ANALYTICS_005: 'No data for selected period',

  // ============================================================================
  // Audit Errors (AUDIT_001 - AUDIT_020)
  // ============================================================================
  AUDIT_001: 'Audit log not found',
  AUDIT_002: 'Invalid audit filters',
  AUDIT_003: 'Export format not supported',
  AUDIT_004: 'Export generation failed',
  AUDIT_005: 'Too many results to export',

  // ============================================================================
  // Validation Errors (VALIDATION_001 - VALIDATION_020)
  // ============================================================================
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
  VALIDATION_ERROR: 'Please check your input and try again',

  // ============================================================================
  // System Errors (SYSTEM_001 - SYSTEM_020)
  // ============================================================================
  SYSTEM_001: 'Internal server error',
  SYSTEM_002: 'Service unavailable',
  SYSTEM_003: 'Database error',
  SYSTEM_004: 'Cache error',
  SYSTEM_005: 'External service error',
  SYSTEM_006: 'Rate limit exceeded',
  SYSTEM_007: 'Maintenance mode',
  SYSTEM_008: 'Resource exhausted',
  SYSTEM_ERROR: 'Something went wrong. Please try again later.',

  // ============================================================================
  // Network Errors
  // ============================================================================
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',

  // ============================================================================
  // Rate Limit Errors
  // ============================================================================
  RATE_LIMIT_EXCEEDED: 'Too many attempts. Please try again later.',

  // ============================================================================
  // Generic Fallback
  // ============================================================================
  DEFAULT: 'An unexpected error occurred',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

/**
 * Type for error message keys
 */
export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

/**
 * Get user-friendly error message from error code
 * 
 * @param errorCode - The error code to look up
 * @returns User-friendly error message
 * 
 * @example
 * ```typescript
 * const message = getErrorMessage('USER_001'); // 'User not found'
 * const message = getErrorMessage('INVALID_CODE'); // 'An unexpected error occurred'
 * ```
 */
export function getErrorMessage(errorCode?: string): string {
  if (!errorCode) {
    return ERROR_MESSAGES.DEFAULT;
  }
  
  // Type-safe lookup
  if (errorCode in ERROR_MESSAGES) {
    return ERROR_MESSAGES[errorCode as ErrorMessageKey];
  }
  
  return ERROR_MESSAGES.DEFAULT;
}

/**
 * Check if error code exists in ERROR_MESSAGES
 */
export function isValidErrorCode(code: string): code is ErrorMessageKey {
  return code in ERROR_MESSAGES;
}

// ============================================================================
// Success Messages
// ============================================================================

/**
 * Success Message Map
 * Maps operation types to success messages
 */
export const SUCCESS_MESSAGES = {
  // ============================================================================
  // User Operations
  // ============================================================================
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

  // ============================================================================
  // Role Operations
  // ============================================================================
  ROLE_CREATED: 'Role created successfully',
  ROLE_UPDATED: 'Role updated successfully',
  ROLE_DELETED: 'Role deleted successfully',
  ROLE_ASSIGNED: 'Role assigned successfully',
  ROLE_REVOKED: 'Role revoked successfully',
  ROLES_ASSIGNED: 'Roles assigned successfully',

  // ============================================================================
  // Analytics Operations
  // ============================================================================
  ANALYTICS_EXPORTED: 'Analytics exported successfully',
  ANALYTICS_REFRESHED: 'Analytics refreshed successfully',

  // ============================================================================
  // Audit Operations
  // ============================================================================
  AUDIT_EXPORTED: 'Audit logs exported successfully',
  AUDIT_CLEARED: 'Audit logs cleared successfully',

  // ============================================================================
  // Settings Operations
  // ============================================================================
  SETTINGS_UPDATED: 'Settings updated successfully',
  SETTINGS_RESET: 'Settings reset to defaults',

  // ============================================================================
  // Generic Success Messages
  // ============================================================================
  OPERATION_SUCCESS: 'Operation completed successfully',
  CHANGES_SAVED: 'Changes saved successfully',
  DATA_EXPORTED: 'Data exported successfully',
  
  // ============================================================================
  // Auth Operations
  // ============================================================================
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTER_SUCCESS: 'Registration successful',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email',
  PASSWORD_CHANGED: 'Password changed successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
} as const;

/**
 * Type for success message keys
 */
export type SuccessMessageKey = keyof typeof SUCCESS_MESSAGES;

/**
 * Get success message from key
 * 
 * @param key - The success message key
 * @returns Success message
 * 
 * @example
 * ```typescript
 * const message = getSuccessMessage('USER_CREATED'); // 'User created successfully'
 * ```
 */
export function getSuccessMessage(key: SuccessMessageKey): string {
  return SUCCESS_MESSAGES[key];
}

/**
 * Check if success message key exists
 */
export function isValidSuccessKey(key: string): key is SuccessMessageKey {
  return key in SUCCESS_MESSAGES;
}

// ============================================================================
// Export All
// ============================================================================

export default {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  getErrorMessage,
  getSuccessMessage,
  isValidErrorCode,
  isValidSuccessKey,
};
