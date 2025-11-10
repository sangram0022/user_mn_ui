/**
 * Standard Error Handler Hook
 * 
 * Provides consistent error handling across the application using the centralized
 * error handling system from src/core/error/errorHandler.ts
 * 
 * @module useStandardErrorHandler
 * @see CODE_AUDIT_FIX_PLAN.md Phase 1.1
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { handleError as coreHandleError, type ErrorHandlingResult } from '@/core/error/errorHandler';
import { logger } from '@/core/logging';

/**
 * Options for error handling behavior
 */
export interface ErrorHandlerOptions {
  /** Whether to show toast notification (default: true) */
  showToast?: boolean;
  
  /** Callback for setting form field errors */
  fieldErrorSetter?: (errors: Record<string, string>) => void;
  
  /** Custom error message to display (overrides default) */
  customMessage?: string;
  
  /** Whether to redirect on 401 errors (default: true) */
  redirectOnAuth?: boolean;
  
  /** Whether to log the error (default: true) */
  logError?: boolean;
  
  /** Additional context for logging */
  context?: Record<string, unknown>;
}

/**
 * Standard Error Handler Hook
 * 
 * Use this hook for consistent error handling across all components.
 * It integrates with the centralized error handling system and provides
 * automatic toast notifications, field error extraction, and auth redirects.
 * 
 * @example
 * ```typescript
 * const handleError = useStandardErrorHandler();
 * 
 * try {
 *   await someOperation();
 * } catch (error) {
 *   handleError(error, { context: { operation: 'someOperation' } });
 * }
 * ```
 */
export function useStandardErrorHandler() {
  const toast = useToast();
  const navigate = useNavigate();

  // Kept: useCallback required - function returned from hook (stable reference for consumers)
  return useCallback(
    (error: unknown, options: ErrorHandlerOptions = {}) => {
      const {
        showToast = true,
        fieldErrorSetter,
        customMessage,
        redirectOnAuth = true,
        logError = true,
        context,
      } = options;

      // Use centralized error handling system
      const result: ErrorHandlingResult = coreHandleError(error);

      // Log error with context
      if (logError) {
        logger().error('Error handled', error instanceof Error ? error : undefined, {
          ...context,
          userMessage: result.userMessage,
          action: result.action,
        });
      }

      // Show toast notification
      if (showToast) {
        const message = customMessage || result.userMessage;
        toast.error(message);
      }

      // Extract and set field errors (for forms)
      if (result.context?.fieldErrors && fieldErrorSetter) {
        fieldErrorSetter(result.context.fieldErrors as Record<string, string>);
      }

      // Redirect to login on 401
      if (result.redirectToLogin && redirectOnAuth) {
        navigate('/login', { 
          state: { from: window.location.pathname } 
        });
      }

      return result;
    },
    [toast, navigate]
  );
}

/**
 * Form Error Handler Hook
 * 
 * Convenience hook specifically for form submissions.
 * Automatically extracts and sets field errors.
 * 
 * @example
 * ```typescript
 * const handleError = useFormErrorHandler();
 * 
 * const onSubmit = async (data) => {
 *   try {
 *     await submitForm(data);
 *     toast.success('Form submitted!');
 *   } catch (error) {
 *     handleError(error, setError); // setError from react-hook-form
 *   }
 * };
 * ```
 */
export function useFormErrorHandler() {
  const handleError = useStandardErrorHandler();

  // Kept: useCallback required - function returned from hook (stable reference for consumers)
  return useCallback(
    (
      error: unknown,
      setFieldErrors: (errors: Record<string, string>) => void,
      options?: Omit<ErrorHandlerOptions, 'fieldErrorSetter'>
    ) => {
      return handleError(error, {
        ...options,
        fieldErrorSetter: setFieldErrors,
      });
    },
    [handleError]
  );
}

/**
 * Silent Error Handler Hook
 * 
 * Error handler that doesn't show toast notifications.
 * Useful for background operations or when you want to handle errors quietly.
 * 
 * @example
 * ```typescript
 * const handleError = useSilentErrorHandler();
 * 
 * try {
 *   await backgroundOperation();
 * } catch (error) {
 *   handleError(error, { context: { operation: 'background' } });
 *   // Error logged but no toast shown
 * }
 * ```
 */
export function useSilentErrorHandler() {
  const handleError = useStandardErrorHandler();

  // Kept: useCallback required - function returned from hook (stable reference for consumers)
  return useCallback(
    (error: unknown, options?: Omit<ErrorHandlerOptions, 'showToast'>) => {
      return handleError(error, {
        ...options,
        showToast: false,
      });
    },
    [handleError]
  );
}
