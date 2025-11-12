/**
 * Admin Domain - Toast Notification Helpers
 * 
 * Centralized toast notification utilities for admin operations.
 * Provides convenient wrappers around the notification store with admin-specific defaults.
 * 
 * Usage:
 *   import { showSuccess, showError } from '@/domains/admin/utils/toastHelpers';
 *   
 *   showSuccess('User created successfully');
 *   showError('Failed to delete user');
 */

import { useNotificationStore } from '../../../store/notificationStore';
import type { ToastType } from '../../../store/notificationStore';
import { SUCCESS_MESSAGES, type SuccessMessageKey } from '../../../core/error';

// ============================================================================
// Toast Notification Helpers
// ============================================================================

/**
 * Show success toast notification
 * Default duration: 3000ms for admin success messages
 */
export function showSuccess(message: string, duration: number = 3000): void {
  useNotificationStore.getState().addToast({
    type: 'success',
    message,
    duration,
  });
}

/**
 * Show error toast notification
 * Default duration: 5000ms for admin error messages (longer to ensure users see it)
 */
export function showError(message: string, duration: number = 5000): void {
  useNotificationStore.getState().addToast({
    type: 'error',
    message,
    duration,
  });
}

/**
 * Show info toast notification
 * Default duration: 4000ms for admin info messages
 */
export function showInfo(message: string, duration: number = 4000): void {
  useNotificationStore.getState().addToast({
    type: 'info',
    message,
    duration,
  });
}

/**
 * Show warning toast notification
 * Default duration: 4000ms for admin warning messages
 */
export function showWarning(message: string, duration: number = 4000): void {
  useNotificationStore.getState().addToast({
    type: 'warning',
    message,
    duration,
  });
}

/**
 * Show toast based on type with custom duration
 */
export function showToast(type: ToastType, message: string, duration?: number): void {
  useNotificationStore.getState().addToast({
    type,
    message,
    duration,
  });
}

/**
 * Show predefined success message using SuccessMessageKey
 * 
 * @example
 * ```typescript
 * showSuccessMessage('USER_CREATED'); // "User created successfully"
 * showSuccessMessage('USER_UPDATED'); // "User updated successfully"
 * ```
 */
export function showSuccessMessage(key: SuccessMessageKey, duration?: number): void {
  showSuccess(SUCCESS_MESSAGES[key], duration);
}

// ============================================================================
// Export Types
// ============================================================================

export type { ToastType, SuccessMessageKey };
