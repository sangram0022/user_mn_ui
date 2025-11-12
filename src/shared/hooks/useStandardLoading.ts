/**
 * Standardized Loading State Hook
 * Provides consistent loading state management across components
 * 
 * React Compiler automatically optimizes this - no manual useMemo needed
 */

import { useState } from 'react';
import { useToast } from '@/hooks/useToast';

export interface LoadingState {
  isLoading: boolean;
  error: unknown | null;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Hook for managing standardized loading states
 * Accepts multiple loading states and combines them
 */
export const useStandardLoading = (
  states: (LoadingState | boolean | undefined)[]
): {
  isLoading: boolean;
  hasError: boolean;
  hasSuccess: boolean;
  errors: unknown[];
  firstError: unknown | null;
} => {
  // React Compiler automatically memoizes this calculation
  const normalizedStates = states.map(state => {
    if (typeof state === 'boolean') {
      return { isLoading: state, error: null, isSuccess: !state, isError: false };
    }
    if (state === undefined) {
      return { isLoading: false, error: null, isSuccess: true, isError: false };
    }
    return state;
  });

  const isLoading = normalizedStates.some(state => state.isLoading);
  const hasError = normalizedStates.some(state => state.isError);
  const hasSuccess = normalizedStates.every(state => state.isSuccess);
  const errors = normalizedStates
    .filter(state => state.error)
    .map(state => state.error);

  return {
    isLoading,
    hasError,
    hasSuccess,
    errors,
    firstError: errors[0] || null,
  };
};

/**
 * Hook for managing async operations with loading states
 */
export const useAsyncOperation = <T,>(
  operation: () => Promise<T>,
  options?: {
    onSuccess?: (result: T) => void;
    onError?: (error: unknown) => void;
    successMessage?: string;
    errorMessage?: string;
  }
) => {
  const toast = useToast();
  const [state, setState] = useState<{
    isLoading: boolean;
    result: T | null;
    error: unknown | null;
  }>({
    isLoading: false,
    result: null,
    error: null,
  });

  // React 19: No useCallback needed - Compiler optimizes automatically
  const execute = async () => {
    setState({ isLoading: true, result: null, error: null });

    try {
      const result = await operation();
      setState({ isLoading: false, result, error: null });

      if (options?.onSuccess) {
        options.onSuccess(result);
      }

      if (options?.successMessage) {
        toast.success(options.successMessage);
      }

      return result;
    } catch (error) {
      setState({ isLoading: false, result: null, error });

      if (options?.onError) {
        options.onError(error);
      }

      if (options?.errorMessage) {
        toast.error(options.errorMessage);
      }

      throw error;
    }
  };

  // React 19: No useCallback needed - Compiler optimizes automatically
  const reset = () => {
    setState({ isLoading: false, result: null, error: null });
  };

  return {
    ...state,
    execute,
    reset,
  };
};