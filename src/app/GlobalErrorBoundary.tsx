/**
 * Global Error Boundary
 *
 * Catches unhandled errors in React component tree.
 * Provides graceful fallback UI and error logging.
 *
 * @author Senior UI/UX Architect
 * @created October 12, 2025
 */

import { logger } from '@shared/utils/logger';
import { AlertCircle } from 'lucide-react';
import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global error boundary for catching unhandled React errors
 *
 * Features:
 * - Catches errors in component tree
 * - Logs errors for monitoring
 * - Provides user-friendly fallback UI
 * - Allows error recovery
 *
 * @example
 * ```tsx
 * <GlobalErrorBoundary>
 *   <App />
 * </GlobalErrorBoundary>
 * ```
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for monitoring
    logger.error('Uncaught error in component tree', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'GlobalErrorBoundary',
    });

    this.setState({ errorInfo });
  }

  private resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private reloadPage = () => {
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-secondary)] px-4">
          <div className="max-w-md w-full bg-[var(--color-surface-primary)] shadow-lg rounded-lg p-6 border border-[var(--color-border)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-[var(--color-error)]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--color-text-secondary)]">
                  Something went wrong
                </h1>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-[var(--color-text-secondary)]">
                We encountered an unexpected error. This has been logged and we&apos;ll investigate.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4">
                  <summary className="text-sm font-medium text-[var(--color-text-secondary)] cursor-pointer hover:text-[var(--color-text-primary)]">
                    Technical Details (Development Only)
                  </summary>
                  <div className="mt-2 p-3 bg-[var(--color-surface-secondary)] rounded border border-[var(--color-border)]">
                    <p className="text-xs font-mono text-[var(--color-error)] break-words">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="mt-2 text-xs text-[var(--color-text-secondary)] overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={this.resetError}
                  className="flex-1 bg-[var(--color-primary)] text-[var(--color-text-primary)] py-2 px-4 rounded-md hover:bg-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 transition-colors text-sm font-medium"
                >
                  Try Again
                </button>
                <button
                  onClick={this.reloadPage}
                  className="flex-1 bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] py-2 px-4 rounded-md hover:bg-[var(--color-surface-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border)] focus:ring-offset-2 transition-colors text-sm font-medium"
                >
                  Reload Page
                </button>
              </div>

              <p className="text-xs text-[var(--color-text-secondary)] text-center mt-4">
                If the problem persists, please contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
