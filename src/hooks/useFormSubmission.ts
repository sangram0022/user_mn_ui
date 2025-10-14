/**
 * useFormSubmission Hook
 *
 * Unified form submission handler with proper error handling and loading states.
 * Prevents page refreshes on errors and maintains error state visibility.
 *
 * React 19: No memoization needed - React Compiler handles optimization
 *
 * @author Senior UI/UX Architect
 * @created October 12, 2025
 */

import { ApiError } from '@lib/api/error';
import { logger } from '@shared/utils/logger';
import { useState } from 'react';

export interface FormSubmissionState<T = unknown> {
  isLoading: boolean;
  error: ApiError | null;
  data: T | null;
}

export interface UseFormSubmissionOptions {
  onSuccess?: (data: unknown) => void | Promise<void>;
  onError?: (error: ApiError) => void;
  resetOnSubmit?: boolean;
}

export interface FormSubmissionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * Hook for managing form submission with proper error handling
 *
 * Features:
 * - Automatic loading state management
 * - Error state persistence (no page refresh)
 * - Success/error callbacks
 * - Type-safe API responses
 *
 * @example
 * ```tsx
 * const { isLoading, error, submit, clearError } = useFormSubmission({
 *   onSuccess: () => navigate('/dashboard'),
 * });
 *
 * const handleSubmit = async (e: FormEvent) => {
 *   e.preventDefault();
 *   await submit(() => apiClient.login(credentials));
 * };
 * ```
 */
export function useFormSubmission<T = unknown>(options: UseFormSubmissionOptions = {}) {
  const [state, setState] = useState<FormSubmissionState<T>>({
    isLoading: false,
    error: null,
    data: null,
  });

  const submit = async (apiCall: () => Promise<T>): Promise<FormSubmissionResult<T>> => {
    // Clear previous error and set loading
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: options.resetOnSubmit ? null : prev.error,
    }));

    try {
      const result = await apiCall();

      // Success: Update state with data
      setState({
        isLoading: false,
        error: null,
        data: result,
      });

      // Call success callback if provided
      if (options.onSuccess) {
        await options.onSuccess(result);
      }

      return { success: true, data: result };
    } catch (error) {
      // Error: Extract and set error state
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError({
              status: 500,
              message: error instanceof Error ? error.message : 'Unknown error occurred',
              code: 'UNKNOWN_ERROR',
            });

      setState({
        isLoading: false,
        error: apiError,
        data: null,
      });

      // Call error callback if provided
      if (options.onError) {
        options.onError(apiError);
      }

      // Log error for monitoring (only in development)
      if (import.meta.env.DEV) {
        logger.error('Form submission failed', apiError, {
          errorCode: apiError.code,
          status: apiError.status,
        });
      }

      return { success: false, error: apiError };
    }
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  const reset = () => {
    setState({ isLoading: false, error: null, data: null });
  };

  return {
    ...state,
    submit,
    clearError,
    reset,
  };
}
