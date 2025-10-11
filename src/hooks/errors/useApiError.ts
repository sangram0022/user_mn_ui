/**
 * Centralized API Error Handler Hook
 *
 * This hook provides a consistent way to handle API errors across the application.
 * It automatically maps error codes to user-friendly messages.
 *
 * Usage:
 * ```tsx
 * const { error, showError, clearError } = useApiError();
 *
 * try {
 *   await apiClient.login(credentials);
 * } catch (err) {
 *   showError(err); // Automatically displays user-friendly message
 * }
 *
 * // Display error in UI
 * {error && <ErrorAlert error={error} />}
 * ```
 */

import { getErrorConfig } from '@shared/config/errorMessages';
import { logger } from '@shared/utils/logger';
import { useCallback, useState } from 'react';

export interface ApiErrorState {
  /** Error code from backend */
  code: string;
  /** User-friendly error message (from our config, not backend) */
  message: string;
  /** Optional detailed description */
  description?: string;
  /** Suggested action for the user */
  action?: string;
  /** HTTP status code */
  statusCode?: number;
  /** Whether the error is recoverable */
  recoverable: boolean;
  /** Original error object for debugging */
  originalError?: unknown;
}

export interface UseApiErrorReturn {
  /** Current error state */
  error: ApiErrorState | null;
  /** Display error to user (auto-maps to user-friendly message) */
  showError: (error: unknown, context?: string) => void;
  /** Clear current error */
  clearError: () => void;
  /** Check if there's an active error */
  hasError: boolean;
}

/**
 * Extract error code from various error formats
 */
function extractErrorCode(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;

    // Try various common error code locations
    if (typeof err.code === 'string') return err.code;
    if (typeof err.error_code === 'string') return err.error_code;
    if (typeof err.errorCode === 'string') return err.errorCode;

    // Check nested detail object
    if (err.detail && typeof err.detail === 'object') {
      const detail = err.detail as Record<string, unknown>;
      if (typeof detail.error_code === 'string') return detail.error_code;
      if (typeof detail.code === 'string') return detail.code;
    }

    // Check nested error object
    if (err.error && typeof err.error === 'object') {
      const nestedError = err.error as Record<string, unknown>;
      if (typeof nestedError.code === 'string') return nestedError.code;
      if (typeof nestedError.error_code === 'string') return nestedError.error_code;
    }

    // Fallback to message-based code extraction
    if (typeof err.message === 'string') {
      const msg = err.message.toUpperCase();
      if (msg.includes('UNAUTHORIZED') || msg.includes('401')) return 'UNAUTHORIZED';
      if (msg.includes('FORBIDDEN') || msg.includes('403')) return 'PERMISSION_DENIED';
      if (msg.includes('NOT FOUND') || msg.includes('404')) return 'RESOURCE_NOT_FOUND';
      if (msg.includes('NETWORK')) return 'NETWORK_ERROR';
      if (msg.includes('TIMEOUT')) return 'TIMEOUT';
    }

    // Check status code
    if (typeof err.status === 'number' || typeof err.statusCode === 'number') {
      const status = (err.status || err.statusCode) as number;
      if (status === 401) return 'UNAUTHORIZED';
      if (status === 403) return 'PERMISSION_DENIED';
      if (status === 404) return 'RESOURCE_NOT_FOUND';
      if (status === 429) return 'RATE_LIMIT_EXCEEDED';
      if (status === 500) return 'SERVER_ERROR';
      if (status === 503) return 'SERVICE_UNAVAILABLE';
    }
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Extract status code from error
 */
function extractStatusCode(error: unknown): number | undefined {
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    if (typeof err.status === 'number') return err.status;
    if (typeof err.statusCode === 'number') return err.statusCode;
    if (typeof err.status_code === 'number') return err.status_code;

    if (err.error && typeof err.error === 'object') {
      const nestedError = err.error as Record<string, unknown>;
      if (typeof nestedError.status === 'number') return nestedError.status;
      if (typeof nestedError.statusCode === 'number') return nestedError.statusCode;
      if (typeof nestedError.status_code === 'number') return nestedError.status_code;
    }
  }
  return undefined;
}

/**
 * Centralized API Error Handler Hook
 */
export function useApiError(): UseApiErrorReturn {
  const [error, setError] = useState<ApiErrorState | null>(null);

  const showError = useCallback((errorInput: unknown, context?: string) => {
    // Extract error code from various formats
    const code = extractErrorCode(errorInput);
    const statusCode = extractStatusCode(errorInput);

    // Get user-friendly message from our config (NOT from backend response)
    const errorConfig = getErrorConfig(code);

    // Create error state with our controlled messages
    const errorState: ApiErrorState = {
      code: errorConfig.code,
      message: errorConfig.message,
      description: errorConfig.description,
      action: errorConfig.action,
      statusCode: statusCode || errorConfig.statusCode,
      recoverable: errorConfig.recoverable ?? true,
      originalError: errorInput,
    };

    setError(errorState);

    // Log error for debugging (but don't show backend messages to user)
    logger.error(`[${context || 'API Error'}] ${errorConfig.code}`, {
      code: errorConfig.code,
      statusCode,
      userMessage: errorConfig.message,
      originalError: errorInput,
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    showError,
    clearError,
    hasError: error !== null,
  };
}

/**
 * Legacy compatibility - maps to useApiError
 * @deprecated Use useApiError instead
 */
export function useErrorHandler() {
  const { error, showError, clearError, hasError } = useApiError();

  return {
    error: error
      ? {
          code: error.code,
          message: error.message,
        }
      : null,
    errorMessage: error?.message || null,
    handleError: showError,
    clearError,
    hasError,
  };
}
