/**
 * Modern Error Boundary with React 19 Features
 * Centralized error handling with recovery strategies
 */

import { type ReactNode, type ErrorInfo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { logger } from '@/core/logging';
import { APIError } from '@/core/error';

// ========================================
// Error Boundary Props
// ========================================

interface ModernErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  level?: 'app' | 'page' | 'component';
  resetKeys?: Array<string | number>;
}

// ========================================
// Error Recovery Strategies
// ========================================

const ERROR_RECOVERY_STRATEGIES = {
  network: {
    canRecover: (error: Error) => {
      return error.message.includes('fetch') || 
             error.message.includes('network') ||
             (error instanceof APIError && [408, 429, 500, 502, 503, 504].includes(error.statusCode));
    },
    retryDelay: (retryCount: number) => Math.min(1000 * Math.pow(2, retryCount), 10000),
    maxRetries: 3,
  },
  
  render: {
    canRecover: (error: Error) => {
      return error.message.includes('Minified React error') ||
             error.message.includes('Cannot read property') ||
             error.message.includes('Cannot access before initialization');
    },
    retryDelay: () => 1000,
    maxRetries: 2,
  },
  
  validation: {
    canRecover: (error: Error) => {
      return error.name === 'ValidationError' ||
             error.message.includes('Invalid') ||
             error.message.includes('required');
    },
    retryDelay: () => 0,
    maxRetries: 0, // Don't auto-retry validation errors
  },
} as const;

// ========================================
// Error Categorization
// ========================================

function categorizeError(error: Error): keyof typeof ERROR_RECOVERY_STRATEGIES {
  if (ERROR_RECOVERY_STRATEGIES.network.canRecover(error)) return 'network';
  if (ERROR_RECOVERY_STRATEGIES.render.canRecover(error)) return 'render';
  if (ERROR_RECOVERY_STRATEGIES.validation.canRecover(error)) return 'validation';
  return 'render'; // Default fallback
}

// ========================================
// Error Fallback Components
// ========================================

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  retryCount: number;
  maxRetries: number;
  level: 'app' | 'page' | 'component';
}

function ComponentErrorFallback({ error, resetErrorBoundary, retryCount, maxRetries }: ErrorFallbackProps) {
  const category = categorizeError(error);
  const canRetry = retryCount < maxRetries && ERROR_RECOVERY_STRATEGIES[category].maxRetries > 0;

  return (
    <div className="min-h-[200px] flex items-center justify-center p-6 border border-red-200 rounded-lg bg-red-50">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Component Error
        </h3>
        
        <p className="text-sm text-red-700 mb-4">
          {error.message || 'Something went wrong with this component'}
        </p>
        
        {canRetry && (
          <button
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try Again ({maxRetries - retryCount} attempts left)
          </button>
        )}
        
        {!canRetry && (
          <p className="text-xs text-red-600 mt-2">
            Please refresh the page or contact support if the problem persists.
          </p>
        )}
      </div>
    </div>
  );
}

function PageErrorFallback({ error, resetErrorBoundary, retryCount, maxRetries }: ErrorFallbackProps) {
  const category = categorizeError(error);
  const canRetry = retryCount < maxRetries && ERROR_RECOVERY_STRATEGIES[category].maxRetries > 0;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gray-50">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Oops! Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-6">
          We encountered an error while loading this page. 
          {canRetry ? ' We\'ll try to recover automatically.' : ' Please try refreshing the page.'}
        </p>
        
        <div className="space-y-3">
          {canRetry && (
            <button
              onClick={resetErrorBoundary}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Try Again ({maxRetries - retryCount} attempts left)
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-6 py-3 ml-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Refresh Page
          </button>
        </div>
        
        {import.meta.env.MODE === 'development' && (
          <details className="mt-6 text-left bg-gray-100 rounded-md p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap wrap-break-word">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

function AppErrorFallback({ resetErrorBoundary }: Omit<ErrorFallbackProps, 'error'>) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-red-50">
      <div className="text-center max-w-lg">
        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-red-900 mb-4">
          Application Error
        </h1>
        
        <p className="text-red-700 mb-8 text-lg">
          A critical error occurred. Please refresh the page or contact support.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-8 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Reload Application
          </button>
          
          <button
            onClick={resetErrorBoundary}
            className="w-full sm:w-auto px-6 py-3 ml-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// Modern Error Boundary Component
// ========================================

export function ModernErrorBoundary({
  children,
  fallback,
  onError,
  maxRetries = 3,
  level = 'component',
  resetKeys = [],
}: ModernErrorBoundaryProps) {
  
  const handleError = (error: Error, errorInfo?: ErrorInfo) => {
    // Generate unique error ID for tracking
    const errorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Enhanced error logging
    logger().error(
      `Error Boundary (${level})`,
      error,
      {
        errorId,
        level,
        errorInfo,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        context: 'ErrorBoundary',
      }
    );
    
    // Call custom error handler
    onError?.(error, errorInfo!);
    
    // Report to error tracking service (if configured)
    if (typeof window !== 'undefined' && 'Sentry' in window) {
      (window as { Sentry: { captureException: (error: Error, options?: Record<string, unknown>) => void } }).Sentry.captureException(error, {
        tags: { errorBoundary: level, errorId },
        extra: { errorInfo, resetKeys },
      });
    }
  };
  
  const handleReset = (details: { reason: string }) => {
    logger().info(`Error Boundary Reset (${level})`, {
      reason: details.reason,
      level,
      context: 'ErrorBoundary.reset',
    });
  };
  
  // Choose appropriate fallback based on level
  const getFallbackComponent = () => {
    if (fallback) return fallback;
    
    switch (level) {
      case 'app':
        return AppErrorFallback;
      case 'page':
        return PageErrorFallback;
      case 'component':
      default:
        return ComponentErrorFallback;
    }
  };
  
  return (
    <ErrorBoundary
      FallbackComponent={(props) => {
        const FallbackComponent = getFallbackComponent();
        if (typeof FallbackComponent === 'function') {
          return <FallbackComponent {...props} maxRetries={maxRetries} level={level} retryCount={0} />;
        }
        return FallbackComponent as ReactNode;
      }}
      onError={handleError}
      onReset={handleReset}
      resetKeys={resetKeys}
    >
      {children}
    </ErrorBoundary>
  );
}

// ========================================
// Convenience Components for Different Levels
// ========================================

export const AppErrorBoundary = ({ children, ...props }: Omit<ModernErrorBoundaryProps, 'level'>) => (
  <ModernErrorBoundary level="app" maxRetries={1} {...props}>
    {children}
  </ModernErrorBoundary>
);

export const PageErrorBoundary = ({ children, ...props }: Omit<ModernErrorBoundaryProps, 'level'>) => (
  <ModernErrorBoundary level="page" maxRetries={2} {...props}>
    {children}
  </ModernErrorBoundary>
);

export const ComponentErrorBoundary = ({ children, ...props }: Omit<ModernErrorBoundaryProps, 'level'>) => (
  <ModernErrorBoundary level="component" maxRetries={3} {...props}>
    {children}
  </ModernErrorBoundary>
);

export default ModernErrorBoundary;