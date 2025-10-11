/**
 * Error Handling Utilities
 * Centralized error handling and formatting
 */

import { ApiError } from '../types/api.types';

export class ErrorHandler {
  /**
   * Map of error codes to user-friendly messages
   */
  private static errorMessages: Record<string, string> = {
    VALIDATION_ERROR: 'Please check your input and try again.',
    INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
    INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action.',
    USER_NOT_FOUND: 'User not found.',
    USER_EXISTS: 'A user with this email already exists.',
    TOKEN_EXPIRED: 'Your session has expired. Please login again.',
    TOKEN_INVALID: 'Invalid or expired token.',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
    EMAIL_NOT_VERIFIED: 'Please verify your email address before logging in.',
    USER_NOT_APPROVED: 'Your account is pending approval.',
    USER_INACTIVE: 'Your account has been deactivated.',
    PASSWORD_TOO_WEAK: 'Password does not meet security requirements.',
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  };

  /**
   * Get user-friendly error message
   * @param error API error object
   */
  static handleApiError(error: ApiError): string {
    return (
      this.errorMessages[error.error_code] || error.message || this.errorMessages.UNKNOWN_ERROR
    );
  }

  /**
   * Extract field-specific validation errors
   * @param error API error object
   */
  static getFieldErrors(error: ApiError): Record<string, string> {
    const fieldErrors: Record<string, string> = {};

    if (error.details?.data && Array.isArray(error.details.data)) {
      error.details.data.forEach((item: unknown) => {
        if (item.field && item.message) {
          fieldErrors[item.field] = item.message;
        }
      });
    }

    return fieldErrors;
  }

  /**
   * Check if error is a network error
   */
  static isNetworkError(error: unknown): boolean {
    return error.status === 0 || error.error_code === 'NETWORK_ERROR';
  }

  /**
   * Check if error is an authentication error
   */
  static isAuthError(error: unknown): boolean {
    return (
      error.status === 401 ||
      error.error_code === 'TOKEN_EXPIRED' ||
      error.error_code === 'TOKEN_INVALID'
    );
  }

  /**
   * Check if error is an authorization error
   */
  static isAuthorizationError(error: unknown): boolean {
    return error.status === 403 || error.error_code === 'INSUFFICIENT_PERMISSIONS';
  }

  /**
   * Check if error is a validation error
   */
  static isValidationError(error: unknown): boolean {
    return error.status === 400 || error.status === 422 || error.error_code === 'VALIDATION_ERROR';
  }

  /**
   * Check if error is a server error
   */
  static isServerError(error: unknown): boolean {
    return error.status >= 500;
  }

  /**
   * Log error to console (development) or monitoring service (production)
   * @param error Error object
   * @param context Additional context
   */
  static logError(error: unknown, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', error, 'Context:', context);
    } else {
      // TODO: Send to monitoring service (e.g., Sentry, LogRocket)
      console.error('Production error:', error.error_code || 'UNKNOWN');
    }
  }

  /**
   * Format error for display in UI
   * @param error Error object
   * @param showDetails Whether to show detailed error info
   */
  static formatErrorForDisplay(error: unknown, showDetails: boolean = false): string {
    const message = this.handleApiError(error);

    if (showDetails && process.env.NODE_ENV === 'development') {
      return `${message}\n\nDetails: ${JSON.stringify(error, null, 2)}`;
    }

    return message;
  }
}
