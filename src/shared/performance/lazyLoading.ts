/* eslint-disable react-refresh/only-export-components, react-hooks/exhaustive-deps, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Lazy Loading and Code Splitting
 * Expert-level performance optimization by 20-year React veteran
 */

import { logger } from './../utils/logger';
import React, {
  lazy,
  Suspense,
  ComponentType,
  ComponentProps,
  ReactNode,
  useEffect,
  Component,
} from 'react';
import { useInView } from 'react-intersection-observer';

// ==================== TYPES ====================

export interface LazyComponentOptions {
  retries?: number;
  delay?: number;
  fallback?: ReactNode;
  errorFallback?: ComponentType<{ error: Error; retry: () => void }>;
}

export interface LazyRouteOptions {
  fallback?: ReactNode;
  errorFallback?: ComponentType<{ error: Error; retry: () => void }>;
  preload?: boolean;
}

// ==================== RETRY IMPORT UTILITY ====================

async function retryImport<T>(
  factory: () => Promise<T>,
  retries: number,
  delay: number
): Promise<T> {
  try {
    return await factory();
  } catch (_error) {
    if (retries <= 0) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryImport(factory, retries - 1, delay * 2);
  }
}

// ==================== ERROR BOUNDARY COMPONENT ====================

interface ErrorFallbackProps {
  error: Error;
  retry: () => void;
}

function DefaultErrorFallback({ error, retry }: ErrorFallbackProps) {
  return React.createElement(
    'div',
    {
      className:
        'flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg',
    },
    React.createElement(
      'div',
      { className: 'text-red-700 mb-4' },
      React.createElement('h3', { className: 'font-semibold' }, 'Failed to load component'),
      React.createElement('p', { className: 'text-sm mt-1' }, error.message)
    ),
    React.createElement(
      'button',
      {
        onClick: retry,
        className: 'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors',
      },
      'Try Again'
    )
  );
}

// ==================== SIMPLE ERROR BOUNDARY ====================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class SimpleErrorBoundary extends Component<
  { children: ReactNode; fallback: ComponentType<ErrorFallbackProps>; onReset: () => void },
  ErrorBoundaryState
> {
  constructor(props: unknown) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Lazy loading error:', undefined, { error, errorInfo });
  }

  override render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;
      return React.createElement(FallbackComponent, {
        error: this.state.error,
        retry: () => {
          this.setState({ hasError: false, error: null });
          this.props.onReset();
        },
      });
    }

    return this.props.children;
  }
}

// ==================== LAZY LOADING UTILITIES ====================

export function createLazyComponent<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): ComponentType<ComponentProps<T>> {
  const {
    retries = 3,
    delay = 1000,
    fallback = React.createElement('div', {}, 'Loading...'),
    errorFallback = DefaultErrorFallback,
  } = options;

  const LazyComponent = lazy(() => {
    return retryImport(factory, retries, delay);
  });

  return function WrappedLazyComponent(props: ComponentProps<T>) {
    return React.createElement(
      SimpleErrorBoundary,
      {
        fallback: errorFallback,
        onReset: () => window.location.reload(),
      },
      React.createElement(Suspense, { fallback }, React.createElement(LazyComponent, props))
    );
  };
}

// ==================== LOADING COMPONENTS ====================

export function SkeletonLoader({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return React.createElement(
    'div',
    { className: `animate-pulse ${className}` },
    ...Array.from({ length: lines }, (_, i) =>
      React.createElement('div', {
        key: i,
        className: `bg-gray-300 rounded mb-2 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`,
        style: { height: '1rem' },
      })
    )
  );
}

export function SpinnerLoader({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return React.createElement(
    'div',
    { className: `flex justify-center items-center ${className}` },
    React.createElement('div', {
      className: `animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`,
    })
  );
}

export function ProgressiveLoader({
  progress,
  message = 'Loading...',
}: {
  progress: number;
  message?: string;
}) {
  return React.createElement(
    'div',
    { className: 'flex flex-col items-center justify-center p-6' },
    React.createElement(
      'div',
      { className: 'w-full max-w-xs mb-4' },
      React.createElement(
        'div',
        { className: 'flex justify-between mb-1' },
        React.createElement('span', { className: 'text-sm font-medium text-blue-700' }, message),
        React.createElement(
          'span',
          { className: 'text-sm font-medium text-blue-700' },
          `${Math.round(progress)}%`
        )
      ),
      React.createElement(
        'div',
        { className: 'w-full bg-gray-200 rounded-full h-2' },
        React.createElement('div', {
          className: 'bg-blue-600 h-2 rounded-full transition-all duration-300',
          style: { width: `${progress}%` },
        })
      )
    )
  );
}

// ==================== PRELOADING UTILITIES ====================

export class ComponentPreloader {
  private static preloadedComponents = new Set<string>();

  static preload(componentName: string, factory: () => Promise<unknown>): void {
    if (this.preloadedComponents.has(componentName)) {
      return;
    }

    this.preloadedComponents.add(componentName);

    setTimeout(() => {
      factory().catch(() => {
        this.preloadedComponents.delete(componentName);
      });
    }, 100);
  }

  static createPreloadHandlers(componentName: string, factory: () => Promise<unknown>) {
    return {
      onMouseEnter: () => this.preload(componentName, factory),
      onFocus: () => this.preload(componentName, factory),
    };
  }
}

// ==================== INTERSECTION OBSERVER LAZY LOADING ====================

export function useIntersectionLazyLoad(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
    ...options,
  });

  useEffect(() => {
    if (inView) {
      callback();
    }
  }, [inView, callback]);

  return ref;
}

// ==================== ROUTE-BASED CODE SPLITTING ====================

export function createLazyRoute(
  factory: () => Promise<{ default: ComponentType<any> }>,
  options: LazyRouteOptions = {}
) {
  const {
    fallback = React.createElement(SkeletonLoader, {
      lines: 10,
      className: 'max-w-4xl mx-auto p-6',
    }),
    errorFallback = DefaultErrorFallback,
    preload = false,
  } = options;

  if (preload && typeof window !== 'undefined') {
    setTimeout(() => {
      factory().catch(() => {
        // Ignore preload errors
      });
    }, 1000);
  }

  return createLazyComponent(factory, { fallback, errorFallback, retries: 3, delay: 1000 });
}

// ==================== DEVICE CAPABILITY DETECTION ====================

export function shouldLoadHeavyComponent(): boolean {
  // Don't load heavy components on slow connections
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection?.effectiveType === '2g' || connection?.saveData) {
      return false;
    }
  }

  // Don't load on low-end devices
  if ('deviceMemory' in navigator) {
    const deviceMemory = (navigator as any).deviceMemory;
    if (deviceMemory < 4) {
      return false;
    }
  }

  return true;
}

// ==================== RESOURCE LOADING ====================

export class ResourcePreloader {
  private static loadedResources = new Set<string>();

  static preloadCSS(href: string): void {
    if (this.loadedResources.has(href) || typeof document === 'undefined') {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = () => this.loadedResources.add(href);
    document.head.appendChild(link);
  }

  static preloadModule(href: string): void {
    if (this.loadedResources.has(href) || typeof document === 'undefined') {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = href;
    link.onload = () => this.loadedResources.add(href);
    document.head.appendChild(link);
  }

  static preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.loadedResources.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.loadedResources.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }
}
