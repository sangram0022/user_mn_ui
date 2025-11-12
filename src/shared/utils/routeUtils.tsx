/**
 * Route Utilities for AWS CloudFront Optimization
 * Non-component utilities separated for fast refresh compatibility
 */

import { lazy, type ComponentType } from 'react';
import { ComponentErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';

// ========================================
// Types
// ========================================

interface LazyRouteOptions {
  errorBoundary?: boolean;
}

// ========================================
// Utility Functions
// ========================================

/**
 * Creates a lazy-loaded route component optimized for AWS CloudFront
 * Uses generic type parameter for type-safe props
 * 
 * Note: Props type needs to extend object for React component compatibility
 */
export function createLazyRoute<P extends object = Record<string, never>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyRouteOptions = {}
): ComponentType<P> {
  const { errorBoundary = true } = options;

  // AWS CloudFront handles preloading and chunk optimization
  const LazyComponent = lazy(() => {
    return importFn().catch(() => ({
      default: (() => (
        <div className="flex items-center justify-center min-h-[400px] text-center">
          <div>
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Loading Failed</h2>
            <p className="text-gray-600 mb-4">We couldn't load this page. Please try refreshing.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )) as ComponentType<P>,
    }));
  });

  // Type-safe wrapper component with proper prop typing
  const WrappedComponent: ComponentType<P> = (props: P) => {
    if (errorBoundary) {
      return (
        <ComponentErrorBoundary>
          <LazyComponent {...(props as P)} />
        </ComponentErrorBoundary>
      );
    }
    return <LazyComponent {...(props as P)} />;
  };

  return WrappedComponent;
}