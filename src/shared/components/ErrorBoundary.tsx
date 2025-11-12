/**
 * Error Boundary Component
 * 
 * React Error Boundary for catching and handling component errors.
 * Prevents entire app crashes due to component failures.
 * 
 * Features:
 * - Catches errors in component tree
 * - Logs errors with full context
 * - Reports to error tracking service
 * - Provides user-friendly fallback UI
 * - Reset mechanism for recovery
 * - Development vs production behavior
 * 
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger, logError } from '@/core/logging';
import { reportErrorToService } from '@/core/error';
import { isDevelopment } from '@/core/config';

/**
 * Error Boundary Props
 */
export interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  
  /** Custom fallback UI (optional) */
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /** Name of the boundary for logging */
  boundaryName?: string;
  
  /** Whether to show error details in production */
  showDetailsInProduction?: boolean;
}

/**
 * Error Boundary State
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * 
 * Wraps components to catch and handle errors gracefully.
 * 
 * @example
 * ```typescript
 * // Wrap entire app
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * 
 * // Wrap specific feature
 * <ErrorBoundary
 *   boundaryName="UserList"
 *   fallback={<UserListError />}
 * >
 *   <UserList />
 * </ErrorBoundary>
 * 
 * // With custom fallback
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <h2>Something went wrong</h2>
 *       <button onClick={reset}>Try again</button>
 *     </div>
 *   )}
 * >
 *   <FeatureComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state when error occurs
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log and report error
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, boundaryName = 'ErrorBoundary' } = this.props;

    // Update state with error info
    this.setState({ errorInfo });

    // Set logging context
    logger().setContext({
      boundaryName,
      componentStack: errorInfo.componentStack,
    });

    // Log error
    logError(`Error caught in ${boundaryName}`, error, {
      componentStack: errorInfo.componentStack,
      errorMessage: error.message,
      errorName: error.name,
      errorStack: error.stack,
    });

    // Report to error tracking service (production only)
    if (!isDevelopment()) {
      reportErrorToService(error, {
        boundaryName,
        componentStack: errorInfo.componentStack,
      });
    }

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // Clear logging context
    logger().clearContext();
  }

  /**
   * Reset error state
   */
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, boundaryName, showDetailsInProduction } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.resetError);
        }
        return fallback;
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          resetError={this.resetError}
          boundaryName={boundaryName}
          showDetails={isDevelopment() || showDetailsInProduction}
        />
      );
    }

    return children;
  }
}

/**
 * Default Error Fallback Component
 */
interface DefaultErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  resetError: () => void;
  boundaryName?: string;
  showDetails?: boolean;
}

function DefaultErrorFallback({
  error,
  errorInfo,
  resetError,
  boundaryName = 'Application',
  showDetails = false,
}: DefaultErrorFallbackProps): React.ReactElement {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {/* Error Icon */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full mb-6">
          <svg
            className="w-8 h-8 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
          {boundaryName} Error
        </h1>

        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          {isDevelopment()
            ? 'An error occurred while rendering this component.'
            : 'Something went wrong. Please try again or contact support if the problem persists.'}
        </p>

        {/* Error Details (Development/Debug Mode) */}
        {showDetails && (
          <div className="mb-8 space-y-4">
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                Error: {error.name}
              </h3>
              <p className="text-sm text-red-800 dark:text-red-200 font-mono break-all">
                {error.message}
              </p>
            </div>

            {error.stack && (
              <details className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <summary className="cursor-pointer font-semibold text-gray-900 dark:text-gray-100">
                  Stack Trace
                </summary>
                <pre className="mt-2 text-xs text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap break-all">
                  {error.stack}
                </pre>
              </details>
            )}

            {errorInfo?.componentStack && (
              <details className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <summary className="cursor-pointer font-semibold text-gray-900 dark:text-gray-100">
                  Component Stack
                </summary>
                <pre className="mt-2 text-xs text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={resetError}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
          >
            Reload Page
          </button>

          {!isDevelopment() && (
            <button
              onClick={() => (window.location.href = '/')}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
            >
              Go Home
            </button>
          )}
        </div>

        {/* Support Info (Production) */}
        {!isDevelopment() && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              If this problem persists, please contact support with the error details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ErrorBoundary;
