/**
 * Advanced Performance Optimization Utilities
 * 20-year React expert implementation with enterprise-grade performance patterns
 */

import { logger } from './../utils/logger';
import { lazy, Suspense, memo, useMemo, useCallback, useTransition, startTransition, useState } from 'react';
import type { ComponentType,
  ReactElement,
  PropsWithChildren,
  MemoExoticComponent } from 'react';
import { useInView } from 'react-intersection-observer';

// ==================== LAZY LOADING UTILITIES ====================

export interface LazyLoadOptions { fallback?: ReactElement;
  errorBoundary?: boolean;
  retryDelay?: number;
  maxRetries?: number;
  preload?: boolean; }

export class LazyLoadingManager { private static loadedModules = new Map<string, any>();
  private static loadingPromises = new Map<string, Promise<any>>();
  private static retryAttempts = new Map<string, number>();

  /**
   * Create a lazy-loaded component with advanced error handling and retries
   */
  static createLazyComponent<T extends ComponentType<any>>(
    importFunction: () => Promise<{ default: T }>,
    options: LazyLoadOptions = {}
  ): ComponentType<ComponentProps<T>> { const {
      fallback = <div>Loading...</div>,
      errorBoundary = true,
      retryDelay = 1000,
      maxRetries = 3
    } = options;

    const LazyComponent = lazy(async () => { const moduleKey = importFunction.toString();
      
      // Return cached module if available
      if (this.loadedModules.has(moduleKey)) {
        return this.loadedModules.get(moduleKey);
      }

      // Return existing promise if module is currently loading
      if (this.loadingPromises.has(moduleKey)) { return this.loadingPromises.get(moduleKey);
      }

      const loadWithRetry = async (): Promise<{ default: T }> => { const attempts = this.retryAttempts.get(moduleKey) || 0;
        
        try {
          const module = await importFunction();
          this.loadedModules.set(moduleKey, module);
          this.retryAttempts.delete(moduleKey);
          this.loadingPromises.delete(moduleKey);
          return module;
        } catch (error) {
          logger.error(`Failed to load module (attempt ${attempts + 1}):`, error);
          
          if (attempts < maxRetries) { this.retryAttempts.set(moduleKey, attempts + 1);
            await new Promise(resolve => setTimeout(resolve, retryDelay * (attempts + 1)));
            return loadWithRetry();
          } else {
            this.retryAttempts.delete(moduleKey);
            this.loadingPromises.delete(moduleKey);
            throw new Error(`Failed to load module after ${maxRetries} attempts: ${error}`);
          }
        }
      };

      const loadingPromise = loadWithRetry();
      this.loadingPromises.set(moduleKey, loadingPromise);
      return loadingPromise;
    });

    const WrappedComponent = (props: ComponentProps<T>) => {
      if (errorBoundary) {
        return (
          <ErrorBoundary>
            <Suspense fallback={fallback}>
              <LazyComponent {...props} />
            </Suspense>
          </ErrorBoundary>
        );
      }

      return (
        <Suspense fallback={fallback}>
          <LazyComponent {...props} />
        </Suspense>
      );
    };

    // Add preload method to component
    (WrappedComponent as any).preload = () => { const moduleKey = importFunction.toString();
      if (!this.loadedModules.has(moduleKey) && !this.loadingPromises.has(moduleKey)) {
        importFunction().then(module => {
          this.loadedModules.set(moduleKey, module);
        }).catch(console.error);
      }
    };

    return WrappedComponent;
  }

  /**
   * Preload multiple components
   */
  static preloadComponents(components: Array<{ preload: () => void }>): void { components.forEach(component => {
      if (component.preload) {
        component.preload();
      }
    });
  }
}

// ==================== CODE SPLITTING UTILITIES ====================

export interface RouteConfig { path: string;
  component: () => Promise<{ default: ComponentType<any> }>;
  preload?: boolean;
  priority?: 'high' | 'medium' | 'low';
  chunk?: string;
}

export class CodeSplittingManager { private static routeComponents = new Map<string, ComponentType<any>>();
  private static preloadQueue: string[] = [];

  /**
   * Create route-based code splitting configuration
   */
  static createRouteComponents(routes: RouteConfig[]): Map<string, ComponentType<any>> {
    routes.forEach(route => {
      const LazyComponent = LazyLoadingManager.createLazyComponent(
        route.component,
        {
          fallback: <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }
      );

      this.routeComponents.set(route.path, LazyComponent);

      // Add to preload queue if specified
      if (route.preload && route.priority === 'high') { this.preloadQueue.push(route.path);
      }
    });

    // Preload high-priority routes
    this.preloadHighPriorityRoutes();

    return this.routeComponents;
  }

  /**
   * Preload high-priority routes
   */
  private static preloadHighPriorityRoutes(): void { // Use requestIdleCallback for better performance
    const preloadInIdle = () => {
      this.preloadQueue.forEach(path => {
        const component = this.routeComponents.get(path);
        if (component && (component as any).preload) {
          (component as any).preload();
        }
      });
    };

    if ('requestIdleCallback' in window) { requestIdleCallback(preloadInIdle);
    } else { setTimeout(preloadInIdle, 0);
    }
  }

  /**
   * Get component for route
   */
  static getRouteComponent(path: string): ComponentType<any> | undefined { return this.routeComponents.get(path);
  }
}

// ==================== MEMOIZATION UTILITIES ====================

export interface MemoOptions { equalityFn?: (prevProps: any, nextProps: any) => boolean;
  displayName?: string; }

export class MemoizationManager {
  /**
   * Enhanced memo with debugging capabilities
   */
  static memoComponent<T extends ComponentType<any>>(
    component: T,
    options: MemoOptions = {}
  ): MemoExoticComponent<T> { const { equalityFn, displayName } = options;

    const MemoizedComponent = memo(component, (prevProps, nextProps) => { if (equalityFn) {
        return equalityFn(prevProps, nextProps);
      }

      // Deep comparison for object props
      return this.deepEqual(prevProps, nextProps);
    });

    if (displayName) { MemoizedComponent.displayName = displayName;
    }

    return MemoizedComponent;
  }

  /**
   * Deep equality check for props
   */
  private static deepEqual(obj1: any, obj2: any): boolean { if (obj1 === obj2) return true;
    
    if (obj1 == null || obj2 == null) return obj1 === obj2;
    
    if (typeof obj1 !== typeof obj2) return false;
    
    if (typeof obj1 !== 'object') return obj1 === obj2;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!this.deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
  }

  /**
   * Create optimized callback with dependencies analysis
   */
  static useOptimizedCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: React.DependencyList,
    options: { debugName?: string } = {}
  ): T { const { debugName } = options;

    return useCallback(
      (...args: Parameters<T>) => {
        if (process.env.NODE_ENV === 'development' && debugName) {
          logger.debug(`Executing callback: ${debugName}`, args);
        }
        return callback(...args);
      },
      deps
    ) as T;
  }

  /**
   * Create optimized memo with performance tracking
   */
  static useOptimizedMemo<T>(
    factory: () => T,
    deps: React.DependencyList,
    options: { debugName?: string } = {}
  ): T { const { debugName } = options;

    return useMemo(() => {
      const start = performance.now();
      const result = factory();
      const end = performance.now();

      if (process.env.NODE_ENV === 'development' && debugName) {
        logger.debug(`Memo computation: ${debugName} took ${end - start}ms`);
      }

      return result;
    }, deps);
  }
}

// ==================== VIRTUAL SCROLLING ====================

export interface VirtualScrollProps { items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => ReactElement;
  overscan?: number;
  className?: string; }

export const VirtualScroll: React.FC<VirtualScrollProps> = memo(({ items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '' }) => { const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1
  );

  const paddingTop = visibleStart * itemHeight;
  const paddingBottom = (items.length - visibleEnd - 1) * itemHeight;

  const visibleItems = useMemo(
    () => items.slice(
      Math.max(0, visibleStart - overscan),
      Math.min(items.length, visibleEnd + overscan + 1)
    ),
    [items, visibleStart, visibleEnd, overscan]
  );

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ paddingTop, paddingBottom }}>
        {visibleItems.map((item, index) => 
          renderItem(item, visibleStart - overscan + index)
        )}
      </div>
    </div>
  );
});

VirtualScroll.displayName = 'VirtualScroll';

// ==================== IMAGE OPTIMIZATION ====================

export interface OptimizedImageProps { src: string;
  alt: string;
  width?: number;
  height?: number;
  placeholder?: string;
  className?: string;
  lazy?: boolean;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  onLoad?: () => void;
  onError?: (error: Event) => void; }

export const OptimizedImage: React.FC<OptimizedImageProps> = memo(({ src,
  alt,
  width,
  height,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGM0Y0RjYiLz48L3N2Zz4=',
  className = '',
  lazy = true,
  quality = 80,
  format = 'webp',
  onLoad,
  onError }) => { const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { ref: imgRef, inView } = useInView({ threshold: 0.1,
    triggerOnce: true,
    skip: !lazy
  });
  const isInView = !lazy || inView;

  const handleLoad = useCallback(() => { setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((error: React.SyntheticEvent<HTMLImageElement>) => { setIsLoading(false);
    setHasError(true);
    onError?.(error.nativeEvent);
  }, [onError]);

  const optimizedSrc = useMemo(() => { if (!isInView) return placeholder;
    
    // Add optimization parameters if src supports them
    const url = new URL(src, window.location.origin);
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    url.searchParams.set('q', quality.toString());
    url.searchParams.set('f', format);
    
    return url.toString();
  }, [src, isInView, width, height, quality, format, placeholder]);

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${ isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading={lazy ? 'lazy' : 'eager'}
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// ==================== TRANSITION UTILITIES ====================

export class TransitionManager { /**
   * Use transition for non-urgent updates
   */
  static useSmartTransition() {
    const [isPending, startTransition] = useTransition();

    const executeWithTransition = useCallback((callback: () => void) => {
      startTransition(() => {
        callback();
      });
    }, []);

    return { isPending, executeWithTransition };
  }

  /**
   * Batch multiple state updates
   */
  static batchUpdates(updates: Array<() => void>): void { startTransition(() => {
      updates.forEach(update => update());
    });
  }

  /**
   * Prioritize urgent vs non-urgent updates
   */
  static prioritizeUpdates(
    urgentUpdates: Array<() => void>,
    nonUrgentUpdates: Array<() => void>
  ): void { // Execute urgent updates immediately
    urgentUpdates.forEach(update => update());

    // Execute non-urgent updates in transition
    if (nonUrgentUpdates.length > 0) {
      startTransition(() => {
        nonUrgentUpdates.forEach(update => update());
      });
    }
  }
}

// ==================== ERROR BOUNDARY FOR LAZY COMPONENTS ====================

interface ErrorBoundaryState { hasError: boolean;
  error?: Error; }

class ErrorBoundary extends Component<
  PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren<{}>) { super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState { return {
      hasError: true,
      error
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { logger.error('Lazy component loading error:', undefined, { error, errorInfo  });
    
    // Report to monitoring service in production
    if (process.env.NODE_ENV === 'production') { // Implementation depends on your monitoring service
      logger.error('Component failed to load:', undefined, { error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
       });
    }
  }

  override render() { if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <h3 className="text-red-800 font-semibold mb-2">
            Component Failed to Load
          </h3>
          <p className="text-red-600 text-sm mb-3">
            There was an error loading this component. Please try refreshing the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ==================== EXPORTS ====================

export const performanceUtils = { lazyLoading: LazyLoadingManager,
  codeSplitting: CodeSplittingManager,
  memoization: MemoizationManager,
  transitions: TransitionManager,
  VirtualScroll,
  OptimizedImage };

export default performanceUtils;