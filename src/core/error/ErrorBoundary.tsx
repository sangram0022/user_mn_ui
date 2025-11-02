/**
 * React Error Boundary Component
 * 
 * Catches React component errors and logs them with the logging framework.
 * Displays user-friendly error UI and recovery options.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '@/core/logging';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

/**
 * Error Boundary Component
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  private readonly startTime: number;

  constructor(props: Props) {
    super(props);
    this.startTime = performance.now();
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const duration = performance.now() - this.startTime;
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Log the error with full details
    logger().error(
      `React Component Error: ${error.message}`,
      error,
      {
        errorId,
        componentStack: errorInfo.componentStack,
        duration,
        context: 'ErrorBoundary',
      }
    );

    // Update state with error details
    this.setState({
      hasError: true,
      error,
      errorInfo,
      errorId,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry = (): void => {
    logger().info('User triggered error boundary retry', {
      errorId: this.state.errorId,
      context: 'ErrorBoundary.handleRetry',
    });

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private handleReload = (): void => {
    logger().info('User triggered page reload', {
      errorId: this.state.errorId,
      context: 'ErrorBoundary.handleReload',
    });

    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, errorId } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    // Custom fallback provided
    if (fallback) {
      return fallback;
    }

    // Default error UI
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ maxWidth: '600px', textAlign: 'center' }}>
          {/* Error Icon */}
          <div
            style={{
              fontSize: '48px',
              marginBottom: '16px',
              opacity: 0.5,
            }}
          >
            ⚠️
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#333',
            }}
          >
            Something went wrong
          </h1>

          {/* Error Message */}
          <p
            style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '16px',
              lineHeight: '1.5',
            }}
          >
            We've encountered an unexpected error. Our team has been notified. You can try refreshing
            the page or contact support if the problem persists.
          </p>

          {/* Error ID */}
          <div
            style={{
              backgroundColor: '#fff',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '16px',
              border: '1px solid #e0e0e0',
              fontSize: '12px',
              color: '#999',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
            }}
          >
            Error ID: <code>{errorId}</code>
          </div>

          {/* Error Details (Dev Only) */}
          {import.meta.env.DEV && error && (
            <details
              style={{
                textAlign: 'left',
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#fff',
                borderRadius: '4px',
                border: '1px solid #e0e0e0',
                fontSize: '12px',
              }}
            >
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
                Error Details (Development Only)
              </summary>
              <div style={{ marginTop: '8px', color: '#c41c3b' }}>
                <strong>{error.name}</strong>: {error.message}
              </div>
              {errorInfo?.componentStack && (
                <pre
                  style={{
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '200px',
                    color: '#333',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                  }}
                >
                  {errorInfo.componentStack}
                </pre>
              )}
            </details>
          )}

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={this.handleRetry}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0056b3';
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#007bff';
              }}
            >
              Try Again
            </button>

            <button
              onClick={this.handleReload}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#5a6268';
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#6c757d';
              }}
            >
              Reload Page
            </button>
          </div>

          {/* Support Link */}
          <p
            style={{
              marginTop: '16px',
              fontSize: '12px',
              color: '#999',
            }}
          >
            Need help?{' '}
            <a
              href="mailto:support@example.com"
              style={{ color: '#007bff', textDecoration: 'none' }}
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
