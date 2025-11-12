/**
 * QueryLoader Component
 * Integrates React Suspense with TanStack Query for optimal loading UX
 * 
 * Features:
 * - Automatic Suspense integration for loading states
 * - Custom fallback components
 * - PageSkeleton as default fallback
 * - Error boundary integration
 * - Retry functionality
 * - Loading timeout warnings
 * 
 * @example
 * ```tsx
 * <QueryLoader queryKey={['users', userId]}>
 *   <UserProfile userId={userId} />
 * </QueryLoader>
 * 
 * // With custom fallback
 * <QueryLoader 
 *   queryKey={['posts']} 
 *   fallback={<CustomSkeleton />}
 * >
 *   <PostsList />
 * </QueryLoader>
 * ```
 */

import { Suspense, type ReactNode, type ComponentType } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { PageSkeleton } from '@/shared/components/skeletons/Skeletons';
import { logger } from '@/core/logging';

interface QueryLoaderProps {
  /** Child components to render when query succeeds */
  children: ReactNode;
  
  /** Query key for logging and identification */
  queryKey?: readonly unknown[];
  
  /** Custom fallback component for loading state */
  fallback?: ReactNode;
  
  /** Custom error fallback component */
  errorFallback?: ComponentType<ErrorFallbackProps>;
  
  /** Timeout in ms before warning about slow loading (default: 5000ms) */
  loadingTimeout?: number;
  
  /** Callback when loading timeout is reached */
  onLoadingTimeout?: () => void;
  
  /** Callback when error occurs */
  onError?: (error: Error) => void;
  
  /** Enable retry on error (default: true) */
  enableRetry?: boolean;
  
  /** Custom retry button text */
  retryText?: string;
}

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  queryKey?: readonly unknown[];
  retryText?: string;
}

/**
 * Default error fallback component
 */
function DefaultErrorFallback({ 
  error, 
  resetErrorBoundary, 
  queryKey,
  retryText = 'Retry',
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="max-w-md w-full bg-error-50 border border-error-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="shrink-0">
            <svg
              className="h-6 w-6 text-error-600"
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
          <h3 className="text-lg font-semibold text-error-900">
            Something went wrong
          </h3>
        </div>
        
        <p className="text-sm text-error-700 mb-4">
          {error.message || 'An unexpected error occurred while loading data.'}
        </p>
        
        {queryKey && (
          <p className="text-xs text-error-600 mb-4 font-mono">
            Query: {JSON.stringify(queryKey)}
          </p>
        )}
        
        <button
          onClick={resetErrorBoundary}
          className="w-full px-4 py-2 bg-error-600 hover:bg-error-700 text-white rounded-md font-medium transition-colors"
        >
          {retryText}
        </button>
      </div>
    </div>
  );
}

/**
 * QueryLoader component with Suspense and Error Boundary
 */
export function QueryLoader({
  children,
  queryKey,
  fallback = <PageSkeleton />,
  errorFallback: ErrorFallbackComponent = DefaultErrorFallback,
  loadingTimeout = 5000,
  onLoadingTimeout,
  onError,
  enableRetry = true,
  retryText,
}: QueryLoaderProps) {
  const { reset } = useQueryErrorResetBoundary();
  
  // Log loading start
  logger().debug('QueryLoader rendering', { queryKey });
  
  // Setup loading timeout warning
  if (onLoadingTimeout && loadingTimeout > 0) {
    setTimeout(() => {
      logger().warn('QueryLoader loading timeout reached', {
        queryKey,
        timeout: loadingTimeout,
      });
      onLoadingTimeout();
    }, loadingTimeout);
  }
  
  const handleError = (error: Error, info: { componentStack?: string | null }) => {
    logger().error('QueryLoader error boundary caught error', error, {
      queryKey,
      componentStack: info.componentStack,
    });
    
    onError?.(error);
  };
  
  const handleReset = () => {
    logger().info('QueryLoader error boundary reset', { queryKey });
    reset();
  };
  
  return (
    <ErrorBoundary
      onError={handleError}
      onReset={handleReset}
      resetKeys={queryKey ? [queryKey] : undefined}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorFallbackComponent
          error={error}
          resetErrorBoundary={enableRetry ? resetErrorBoundary : () => {}}
          queryKey={queryKey}
          retryText={retryText}
        />
      )}
    >
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * Minimal loading fallback for small components
 */
export function MinimalLoader() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  );
}

/**
 * Inline loading fallback for text content
 */
export function InlineLoader() {
  return (
    <div className="flex items-center gap-2 text-gray-500">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
      <span className="text-sm">Loading...</span>
    </div>
  );
}

/**
 * Card skeleton loader
 */
export function CardLoader() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
  );
}

/**
 * Table skeleton loader
 */
export function TableLoader({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded flex-1" />
            ))}
          </div>
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-b border-gray-200 px-6 py-4">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * List skeleton loader
 */
export function ListLoader({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Form skeleton loader
 */
export function FormLoader({ fields = 4 }: { fields?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4 animate-pulse">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
          <div className="h-10 bg-gray-200 rounded w-full" />
        </div>
      ))}
      <div className="pt-2">
        <div className="h-10 bg-gray-200 rounded w-32" />
      </div>
    </div>
  );
}

/**
 * Grid skeleton loader
 */
export function GridLoader({ items = 6, columns = 3 }: { items?: number; columns?: number }) {
  return (
    <div 
      className="grid gap-4 animate-pulse"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="h-32 bg-gray-200 rounded mb-3" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

