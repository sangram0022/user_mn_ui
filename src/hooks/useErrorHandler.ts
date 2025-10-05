/**
 * Custom hook for error handling with localization and logging
 */

import { useState, useCallback } from 'react';
import { parseApiError, formatErrorForDisplay, isAuthError } from '../utils/errorParser';
import { errorLogger } from '../utils/errorLogger';
import type { ParsedError } from '../types/error';

interface UseErrorHandlerReturn {
  error: ParsedError | null;
  errorMessage: string | null;
  setError: (error: unknown) => void;
  clearError: () => void;
  handleError: (error: unknown, context?: string) => void;
  isAuthenticationError: boolean;
}

/**
 * Hook for managing and displaying errors with automatic parsing, localization, and logging
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setErrorState] = useState<ParsedError | null>(null);

  const setError = useCallback((err: unknown) => {
    if (!err) {
      setErrorState(null);
      return;
    }
    
    const parsed = parseApiError(err);
    setErrorState(parsed);
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const handleError = useCallback((err: unknown, context?: string) => {
    if (!err) return;
    
    const parsed = parseApiError(err);
    setErrorState(parsed);
    
    // Log error to centralized error logger
    errorLogger.log(parsed, context ? { component: context } : undefined);
    
    // Log error for debugging (only in development)
    if (import.meta.env.DEV) {
      console.error('[useErrorHandler]', context || 'Error occurred:', err);
    }
  }, []);

  const errorMessage = error ? error.message : null;
  const isAuthenticationError = error ? isAuthError(error) : false;

  return {
    error,
    errorMessage,
    setError,
    clearError,
    handleError,
    isAuthenticationError,
  };
};

/**
 * Hook for displaying error messages as formatted strings
 */
export const useErrorMessage = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showError = useCallback((error: unknown) => {
    const message = formatErrorForDisplay(error);
    setErrorMessage(message);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    errorMessage,
    showError,
    clearError,
  };
};
