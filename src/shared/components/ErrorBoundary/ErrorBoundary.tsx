import { logger } from '@shared/utils/logger';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

/**
 * Props for ErrorBoundary component
 */
export interface ErrorBoundaryProps {
  /** Content to render when no error */
  children: ReactNode;
  /** Custom fallback UI when error occurs */
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode);
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Name of the boundary for logging purposes */
  boundaryName?: string;
  /** Whether to show reset button */
  showResetButton?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component following React 19 best practices
 *
 * Catches JavaScript errors in child component tree, logs errors,
 * and displays fallback UI instead of crashing the entire component tree.
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={<ErrorFallback onRetry={refetch} />}
 *   onError={(error) => logger.error('Component failed', error)}
 *   boundaryName="UserTable"
 * >
 *   <UserTable users={users} />
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

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, boundaryName } = this.props;

    // Log error to monitoring service
    logger.error(
      `[ErrorBoundary${boundaryName ? `:${boundaryName}` : ''}] Component error caught`,
      error,
      {
        componentStack: errorInfo.componentStack,
      }
    );

    // Call custom error handler if provided
    onError?.(error, errorInfo);

    // Update state with error info
    this.setState({ errorInfo });
  }

  /**
   * Reset error boundary state to retry rendering
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  override render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, boundaryName, showResetButton = true } = this.props;

    if (hasError && error) {
      // If custom fallback is a function, call it with error details
      if (typeof fallback === 'function') {
        return fallback(error, errorInfo!, this.handleReset);
      }

      // If custom fallback element is provided, render it
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          onReset={this.handleReset}
          boundaryName={boundaryName}
          showResetButton={showResetButton}
        />
      );
    }

    return children;
  }
}

/**
 * Default fallback UI for error boundary
 */
interface DefaultErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  boundaryName?: string;
  showResetButton: boolean;
}

function DefaultErrorFallback({
  error,
  errorInfo,
  onReset,
  boundaryName,
  showResetButton,
}: DefaultErrorFallbackProps) {
  const isDevelopment = import.meta.env.DEV;

  return (
    <div
      className="flex min-h-[400px] items-center justify-center p-8"
      role="alert"
      aria-live="assertive"
    >
      <div className="w-full max-w-2xl rounded-lg border border-red-200 bg-red-50 p-8 shadow-sm dark:border-red-800 dark:bg-red-950/20">
        {/* Error Icon and Title */}
        <div className="mb-6 flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-100">
              {boundaryName ? `${boundaryName} Error` : 'Something went wrong'}
            </h2>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              We encountered an unexpected error. The error has been logged and our team has been
              notified.
            </p>
          </div>
        </div>

        {/* Error Details (Development Only) */}
        {isDevelopment && (
          <div className="mb-6 space-y-4">
            <div className="rounded-md bg-red-100 p-4 dark:bg-red-900/30">
              <h3 className="mb-2 font-mono text-sm font-semibold text-red-900 dark:text-red-200">
                Error Message:
              </h3>
              <pre className="overflow-x-auto text-xs text-red-800 dark:text-red-300">
                {error.message}
              </pre>
            </div>

            {error.stack && (
              <details className="rounded-md bg-red-100 p-4 dark:bg-red-900/30">
                <summary className="cursor-pointer font-mono text-sm font-semibold text-red-900 dark:text-red-200">
                  Stack Trace
                </summary>
                <pre className="mt-2 overflow-x-auto text-xs text-red-800 dark:text-red-300">
                  {error.stack}
                </pre>
              </details>
            )}

            {errorInfo?.componentStack && (
              <details className="rounded-md bg-red-100 p-4 dark:bg-red-900/30">
                <summary className="cursor-pointer font-mono text-sm font-semibold text-red-900 dark:text-red-200">
                  Component Stack
                </summary>
                <pre className="mt-2 overflow-x-auto text-xs text-red-800 dark:text-red-300">
                  {errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {showResetButton && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600"
              aria-label="Try again to recover from error"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try Again
            </button>

            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-700 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-950"
              aria-label="Reload the entire page"
            >
              Reload Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Lightweight error fallback for specific components
 */
export interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
  message?: string;
  componentName?: string;
}

export function ErrorFallback({
  error,
  onRetry,
  message = 'Failed to load this component',
  componentName,
}: ErrorFallbackProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/20"
      role="alert"
    >
      <AlertTriangle className="mb-4 h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
      <h3 className="mb-2 text-lg font-semibold text-red-900 dark:text-red-100">
        {componentName || 'Component Error'}
      </h3>
      <p className="mb-4 text-center text-sm text-red-700 dark:text-red-300">
        {message}
        {error && import.meta.env.DEV && (
          <span className="mt-2 block font-mono text-xs">{error.message}</span>
        )}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600"
          aria-label={`Retry loading ${componentName || 'component'}`}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try Again
        </button>
      )}
    </div>
  );
}
