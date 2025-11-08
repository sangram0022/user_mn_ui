/**
 * useApiError Hook
 * 
 * Standardized API error handling for consistent UX across the application.
 * 
 * Features:
 * - Maps field-level validation errors to form state
 * - Displays general error messages via toast notifications
 * - Handles authentication errors (redirects to login)
 * - Network error detection and user-friendly messaging
 * - Consistent error logging
 * 
 * @example
 * ```tsx
 * const { handleApiError } = useApiError();
 * 
 * try {
 *   await someApiCall();
 * } catch (error) {
 *   const fieldErrors = handleApiError(error);
 *   setFieldErrors(fieldErrors);
 * }
 * ```
 */

import { useNavigate } from 'react-router-dom';
import { logger } from '@/core/logging';
import { useToast } from '@/hooks/useToast';
import { APIError } from '@/core/error/types';

interface FieldErrors {
  [key: string]: string;
}

interface UseApiErrorReturn {
  /**
   * Handles API errors consistently across the application
   * 
   * @param error - The error to handle (Error | APIError | unknown)
   * @returns Field-level errors to display in form (empty object if no field errors)
   */
  handleApiError: (error: unknown) => FieldErrors;
}

/**
 * Hook for consistent API error handling
 */
export function useApiError(): UseApiErrorReturn {
  const navigate = useNavigate();
  const toast = useToast();

  const handleApiError = (error: unknown): FieldErrors => {
    // Log the error
    logger().error('API Error occurred', error instanceof Error ? error : new Error(String(error)), {
      context: 'useApiError',
    });

    // Handle APIError instances (from our error system)
    if (error instanceof APIError) {
      // Authentication errors - redirect to login
      if (error.statusCode === 401) {
        logger().info('Authentication error, redirecting to login', {
          context: 'useApiError',
        });
        toast.error('Your session has expired. Please log in again.');
        navigate('/login', { replace: true });
        return {};
      }

      // Authorization errors
      if (error.statusCode === 403) {
        toast.error("You don't have permission to perform this action.");
        return {};
      }

      // Validation errors (400) - Extract field-level errors
      if (error.statusCode === 400 && error.responseData) {
        const fieldErrors: FieldErrors = {};
        const responseData = error.responseData;
        
        // Check if responseData contains field-level errors
        if (typeof responseData === 'object' && responseData !== null) {
          // Format 1: { field_errors: { field_name: "error message" } }
          if ('field_errors' in responseData && typeof responseData.field_errors === 'object') {
            const fields = responseData.field_errors as Record<string, string>;
            Object.assign(fieldErrors, fields);
          }
          // Format 2: { errors: { field_name: "error message" } }
          else if ('errors' in responseData && typeof responseData.errors === 'object') {
            const fields = responseData.errors as Record<string, string>;
            Object.assign(fieldErrors, fields);
          }
          // Format 3: Direct field errors in responseData
          else {
            // Assume all string values in responseData are field errors
            Object.entries(responseData).forEach(([key, value]) => {
              if (typeof value === 'string') {
                fieldErrors[key] = value;
              }
            });
          }
        }

        // If we have field errors, don't show general toast
        if (Object.keys(fieldErrors).length > 0) {
          return fieldErrors;
        }

        // No field errors, show general validation error
        toast.error(error.message || 'Please check your input and try again.');
        return {};
      }

      // Server errors (500+)
      if (error.statusCode >= 500) {
        toast.error('A server error occurred. Please try again later.');
        return {};
      }

      // Other API errors - show message
      toast.error(error.message || 'An error occurred. Please try again.');
      return {};
    }

    // Handle standard Error instances
    if (error instanceof Error) {
      // Network errors
      if (error.message.toLowerCase().includes('network') || 
          error.message.toLowerCase().includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.');
        return {};
      }

      // Generic error
      toast.error(error.message || 'An unexpected error occurred.');
      return {};
    }

    // Handle string errors
    if (typeof error === 'string') {
      toast.error(error);
      return {};
    }

    // Unknown error type
    toast.error('An unexpected error occurred. Please try again.');
    return {};
  };

  return { handleApiError };
}

export default useApiError;
