/**
 * Admin Error Boundary
 * 
 * Catches and handles errors in admin pages with user-friendly UI.
 * Provides options to retry, go back, or contact support.
 * 
 * Usage:
 *   <AdminErrorBoundary>
 *     <AdminPage />
 *   </AdminErrorBoundary>
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import { handleError, extractErrorDetails } from '../../../core/error';
import { logger } from '../../../core/logging';

interface Props {
  children: ReactNode;
  /**
   * Fallback component to render when error occurs
   * If not provided, default error UI will be shown
   */
  fallback?: ReactNode;
  /**
   * Callback when error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Whether to show retry button
   */
  showRetry?: boolean;
  /**
   * Whether to show home button
   */
  showHome?: boolean;
  /**
   * Whether to show contact support button
   */
  showSupport?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Admin Error Boundary Component
 * React class component (Error Boundaries must be class components)
 */
export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so next render shows fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to error handler
    const errorDetails = extractErrorDetails(error);
    
    logger().error('Admin Error Boundary caught error', error, {
      componentStack: errorInfo.componentStack,
      errorMessage: errorDetails.message,
      errorCode: errorDetails.code,
      context: 'AdminErrorBoundary.componentDidCatch',
    });

    // Use centralized error handler
    handleError(error);

    // Update state with error info
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    window.location.href = '/admin';
  };

  handleContactSupport = (): void => {
    // In production, this could open a support ticket form
    window.location.href = 'mailto:support@example.com';
  };

  render(): ReactNode {
    const {
      children,
      fallback,
      showRetry = true,
      showHome = true,
      showSupport = true,
    } = this.props;

    const { hasError, error, errorInfo, errorCount } = this.state;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      const errorDetails = error ? extractErrorDetails(error) : null;
      const isRecurring = errorCount > 1;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Something went wrong
            </h1>

            {/* Error Message */}
            <p className="text-gray-600 text-center mb-6">
              {isRecurring
                ? 'This error keeps occurring. Please try a different action or contact support.'
                : "We're sorry, but something unexpected happened. Please try again."}
            </p>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && errorDetails && (
              <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Error Details (Development Only)
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div>
                    <span className="font-medium">Message:</span> {errorDetails.message}
                  </div>
                  {errorDetails.code && (
                    <div>
                      <span className="font-medium">Code:</span> {errorDetails.code}
                    </div>
                  )}
                  {errorDetails.statusCode && (
                    <div>
                      <span className="font-medium">Status:</span> {errorDetails.statusCode}
                    </div>
                  )}
                  {errorInfo?.componentStack && (
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium hover:text-gray-900">
                        Component Stack
                      </summary>
                      <pre className="mt-2 text-xs bg-white p-2 rounded border border-gray-200 overflow-auto max-h-40">
                        {errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              {showRetry && !isRecurring && (
                <Button
                  onClick={this.handleReset}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Try Again
                </Button>
              )}

              {showHome && (
                <Button
                  onClick={this.handleGoHome}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Home size={16} />
                  Go to Dashboard
                </Button>
              )}

              {showSupport && (
                <Button
                  onClick={this.handleContactSupport}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Mail size={16} />
                  Contact Support
                </Button>
              )}
            </div>

            {/* Additional Help */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                If this problem persists, please{' '}
                <button
                  onClick={this.handleContactSupport}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  contact our support team
                </button>{' '}
                with the error details above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Default export for convenience
 */
export default AdminErrorBoundary;
