/**
 * @deprecated This hook is deprecated and will be removed in a future version.
 * 
 * **Migration Guide:**
 * Replace useApiError with useStandardErrorHandler for consistent error handling.
 * 
 * BEFORE:
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
 * 
 * AFTER:
 * ```tsx
 * import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
 * 
 * const handleError = useStandardErrorHandler();
 * 
 * try {
 *   await someApiCall();
 * } catch (error) {
 *   handleError(error);
 * }
 * ```
 * 
 * For form-specific error handling:
 * ```tsx
 * import { useFormErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
 * 
 * const handleError = useFormErrorHandler();
 * const [fieldErrors, setFieldErrors] = useState({});
 * 
 * try {
 *   await someApiCall();
 * } catch (error) {
 *   handleError(error, setFieldErrors);
 * }
 * ```
 * 
 * @see useStandardErrorHandler - The replacement hook with enhanced features
 */

import { useStandardErrorHandler } from './useStandardErrorHandler';
import { logger } from '@/core/logging';

interface FieldErrors {
  [key: string]: string;
}

interface UseApiErrorReturn {
  /**
   * @deprecated Use useStandardErrorHandler instead
   */
  handleApiError: (error: unknown) => FieldErrors;
}

/**
 * @deprecated Hook for consistent API error handling - DEPRECATED
 * 
 * This hook delegates to useStandardErrorHandler and will be removed in a future version.
 * Please migrate to useStandardErrorHandler directly.
 */
export function useApiError(): UseApiErrorReturn {
  // Show deprecation warning in development
  if (import.meta.env.DEV) {
    logger().warn(
      '⚠️  useApiError is deprecated! Please migrate to useStandardErrorHandler.',
      {
        context: 'useApiError.deprecation',
        migrationGuide: "import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';",
        stack: new Error().stack,
      }
    );
  }

  // Delegate to the standard error handler
  const handleError = useStandardErrorHandler();

  const handleApiError = (error: unknown): FieldErrors => {
    // Call standard error handler (which handles all error types, logging, redirects, toasts)
    handleError(error);
    
    // Return empty field errors (standard handler manages form errors via callback)
    // For form error handling, use useFormErrorHandler instead
    return {};
  };

  return { handleApiError };
}

// Keep default export for backward compatibility during migration
export default useApiError;
