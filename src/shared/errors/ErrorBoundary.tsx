/* eslint-disable react-refresh/only-export-components */
/**
 * Advanced Error Boundary System
 * Comprehensive error handling with React 19 patterns and expert-level practices
 */

import type { ErrorInfo, ReactNode } from 'react';
import { Component, ComponentType, useCallback } from 'react';
import { logger } from './../utils/logger';
import { categorizeError, ErrorReportingService, type ErrorDetails } from './errorUtils';

// Error boundary state interface
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  errorId: string;
}

// Error boundary props interface
interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackComponent?: ComponentType<FallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
}

// Fallback component props
interface FallbackProps {
  error: Error;
  resetError: () => void;
  retryCount: number;
  canRetry: boolean;
}

const errorReporter = ErrorReportingService.getInstance();

// Generate unique error ID
function generateErrorId(): string {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Default fallback component
const DefaultFallback: React.FC<FallbackProps> = ({ error, resetError, retryCount, canRetry }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 m-4">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0">
          <svg
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Something went wrong
          </h3>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          We apologize for the inconvenience. The application encountered an unexpected error.
        </p>

        {import.meta.env.DEV && (
          <details className="mt-3">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto max-h-32">
              {error.message}
              {error.stack && `\n\nStack trace:\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {canRetry && (
          <button
            onClick={resetError}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            type="button"
          >
            Try Again {retryCount > 0 && `(${retryCount + 1})`}
          </button>
        )}

        <button
          onClick={() => window.location.reload()}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          type="button"
        >
          Reload Page
        </button>
      </div>

      <div className="mt-4 text-center">
        <a href="/" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
          Return to Home
        </a>
      </div>
    </div>
  </div>
);

// Advanced Error Boundary Class
export class AdvancedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, isolate } = this.props;

    this.setState({ errorInfo });

    // Report error to monitoring service
    const errorDetails: ErrorDetails = {
      errorId: this.state.errorId || generateErrorId(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack || undefined,
      category: categorizeError(error),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
    };

    errorReporter.reportError(errorDetails).catch((reportError) => {
      logger.error('Failed to report error:', undefined, { reportError });
    });

    // Call custom error handler
    onError?.(error, errorInfo);

    // Isolate error if requested
    if (isolate) {
      logger.error('Error boundary isolated error:', undefined, { error, errorInfo });
    }
  }

  override componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;

    if (this.state.hasError && prevProps.children !== this.props.children) {
      if (resetOnPropsChange) {
        this.resetErrorBoundary();
      }
    }

    if (resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  override componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private getUserId(): string | undefined {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).id : undefined;
    } catch {
      return undefined;
    }
  }

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      errorId: '',
    }));
  };

  override render() {
    const { hasError, error, retryCount } = this.state;
    const { fallbackComponent: FallbackComponent = DefaultFallback, maxRetries = 3 } = this.props;

    if (hasError && error) {
      const canRetry = retryCount < maxRetries;

      return (
        <FallbackComponent
          error={error}
          resetError={this.resetErrorBoundary}
          retryCount={retryCount}
          canRetry={canRetry}
        />
      );
    }

    return this.props.children;
  }
}

// Convenient wrapper components
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <AdvancedErrorBoundary maxRetries={3} resetOnPropsChange>
    {children}
  </AdvancedErrorBoundary>
);

export const SectionErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <AdvancedErrorBoundary maxRetries={2} isolate>
    {children}
  </AdvancedErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <AdvancedErrorBoundary maxRetries={1} isolate>
    {children}
  </AdvancedErrorBoundary>
);

// Hook for error handling
export function useErrorHandler() {
  return useCallback((error: Error, errorInfo?: Partial<ErrorInfo>) => {
    const errorDetails: ErrorDetails = {
      errorId: generateErrorId(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack || undefined,
      category: categorizeError(error),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    errorReporter.reportError(errorDetails).catch((reportError) => {
      logger.error('Failed to report error:', undefined, { reportError });
    });
  }, []);
}

// HOC for error boundary
export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <AdvancedErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </AdvancedErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
}

export default AdvancedErrorBoundary;
