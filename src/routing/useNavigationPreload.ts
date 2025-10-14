/**
 * React 19 Enhanced Navigation with Lazy Preloading
 *
 * Provides hover/focus-based preloading for instant navigation
 * Uses React 19's lazy().preload() API for predictive loading
 */

import { routes } from '@routing/config';
import {
  type ComponentType,
  type FocusEvent,
  type LazyExoticComponent,
  type MouseEvent,
} from 'react';

// Type for lazy component with preload
type PreloadableLazy<T extends ComponentType<unknown>> = LazyExoticComponent<T> & {
  preload?: () => Promise<{ default: T }>;
};

interface NavigationPreloadMap {
  [path: string]: {
    component: PreloadableLazy<ComponentType<unknown>>;
    priority: 'critical' | 'high' | 'medium' | 'low';
    predictedRoutes?: string[];
  };
}

/**
 * Build preload map from route configuration
 */
function buildPreloadMap(): NavigationPreloadMap {
  const map: NavigationPreloadMap = {};

  routes.forEach((route) => {
    map[route.path] = {
      component: route.component as PreloadableLazy<ComponentType<unknown>>,
      priority: getPriority(route.path),
      predictedRoutes: getPredictedRoutes(route.path),
    };
  });

  return map;
}

/**
 * Determine route priority for preloading strategy
 */
function getPriority(path: string): 'critical' | 'high' | 'medium' | 'low' {
  // Critical: Authentication and landing pages
  if (path === '/' || path === '/login' || path === '/dashboard') {
    return 'critical';
  }

  // High: Frequently accessed pages
  if (path === '/users' || path === '/profile' || path === '/register') {
    return 'high';
  }

  // Medium: Admin and management pages
  if (path.startsWith('/admin')) {
    return 'medium';
  }

  // Low: Rarely accessed pages
  return 'low';
}

/**
 * Predict likely next routes based on current path
 */
function getPredictedRoutes(currentPath: string): string[] {
  const predictions: Record<string, string[]> = {
    '/': ['/login', '/register', '/dashboard'],
    '/login': ['/dashboard', '/register', '/forgot-password'],
    '/register': ['/login', '/email-confirmation'],
    '/dashboard': ['/users', '/profile', '/admin'],
    '/users': ['/profile', '/admin/roles'],
    '/admin': ['/admin/roles', '/admin/audit', '/admin/users'],
    '/admin/roles': ['/admin/permissions', '/admin/users'],
    '/profile': ['/dashboard', '/users'],
  };

  return predictions[currentPath] || [];
}

/**
 * Preload a single route component
 */
export async function preloadRoute(path: string): Promise<void> {
  const preloadMap = buildPreloadMap();
  const routeConfig = preloadMap[path];

  if (!routeConfig) {
    return;
  }

  const { component } = routeConfig;

  // Check if preload method exists (React 19 feature)
  if (typeof component.preload === 'function') {
    try {
      await component.preload();
    } catch (error) {
      console.warn(`Failed to preload route: ${path}`, error);
    }
  }
}

/**
 * Preload multiple routes in sequence
 */
export async function preloadRoutes(paths: string[]): Promise<void> {
  for (const path of paths) {
    await preloadRoute(path);
  }
}

/**
 * Preload predicted routes based on current location
 */
export async function preloadPredictedRoutes(currentPath: string): Promise<void> {
  const predictedRoutes = getPredictedRoutes(currentPath);

  // Preload in background (non-blocking)
  Promise.all(predictedRoutes.map((path) => preloadRoute(path))).catch(() => {
    // Silently fail - preloading is enhancement, not critical
  });
}

/**
 * React hook for hover/focus preloading
 *
 * @example
 * ```tsx
 * import { useNavigationPreload } from './useNavigationPreload';
 *
 * function NavigationLink({ to, children }) {
 *   const { onMouseEnter, onFocus } = useNavigationPreload(to);
 *
 *   return (
 *     <Link
 *       to={to}
 *       onMouseEnter={onMouseEnter}
 *       onFocus={onFocus}
 *     >
 *       {children}
 *     </Link>
 *   );
 * }
 * ```
 */
export function useNavigationPreload(targetPath: string) {
  const handleMouseEnter = (_event: MouseEvent) => {
    // Preload on hover
    void preloadRoute(targetPath);

    // Also preload predicted next routes
    const predictedRoutes = getPredictedRoutes(targetPath);
    if (predictedRoutes.length > 0) {
      void preloadRoutes(predictedRoutes.slice(0, 2)); // Limit to 2 predictions
    }
  };

  const handleFocus = (_event: FocusEvent) => {
    // Preload on keyboard focus (accessibility)
    void preloadRoute(targetPath);
  };

  return {
    onMouseEnter: handleMouseEnter,
    onFocus: handleFocus,
  };
}

/**
 * Enhanced Link component with automatic preloading
 *
 * @example
 * ```tsx
 * import { Link } from 'react-router-dom';
 * import { useNavigationPreload } from './useNavigationPreload';
 *
 * function NavLink({ to, children }) {
 *   const { onMouseEnter, onFocus } = useNavigationPreload(to);
 *   return <Link to={to} onMouseEnter={onMouseEnter} onFocus={onFocus}>{children}</Link>;
 * }
 * ```
 */

/**
 * Initialize eager preloading strategy
 * Call this in your app initialization to preload critical routes
 *
 * @example
 * ```tsx
 * // In App.tsx or main.tsx
 * import { initializePreloading } from './useNavigationPreload';
 *
 * useEffect(() => {
 *   initializePreloading();
 * }, []);
 * ```
 */
export function initializePreloading(): void {
  const preloadMap = buildPreloadMap();

  // Phase 1: Preload critical routes immediately
  const criticalRoutes = Object.entries(preloadMap)
    .filter(([_, config]) => config.priority === 'critical')
    .map(([path]) => path);

  void preloadRoutes(criticalRoutes);

  // Phase 2: Preload high-priority routes after idle
  if ('requestIdleCallback' in window) {
    (
      window as Window & { requestIdleCallback: (callback: () => void) => number }
    ).requestIdleCallback(() => {
      const highPriorityRoutes = Object.entries(preloadMap)
        .filter(([_, config]) => config.priority === 'high')
        .map(([path]) => path);

      void preloadRoutes(highPriorityRoutes);
    });
  }

  // Phase 3: Preload remaining routes during extended idle time
  if ('requestIdleCallback' in window) {
    (
      window as Window & {
        requestIdleCallback: (callback: () => void, options?: { timeout: number }) => number;
      }
    ).requestIdleCallback(
      () => {
        const remainingRoutes = Object.entries(preloadMap)
          .filter(([_, config]) => config.priority === 'medium' || config.priority === 'low')
          .map(([path]) => path);

        void preloadRoutes(remainingRoutes);
      },
      { timeout: 10000 } // 10 seconds timeout
    );
  }
}

/**
 * Integration instructions:
 *
 * 1. Add to App.tsx:
 * ```tsx
 * import { initializePreloading, preloadPredictedRoutes } from '@routing/useNavigationPreload';
 * import { useLocation } from 'react-router-dom';
 *
 * function App() {
 *   const location = useLocation();
 *
 *   // Initialize on mount
 *   useEffect(() => {
 *     initializePreloading();
 *   }, []);
 *
 *   // Preload predicted routes on navigation
 *   useEffect(() => {
 *     preloadPredictedRoutes(location.pathname);
 *   }, [location.pathname]);
 *
 *   return <Router />;
 * }
 * ```
 *
 * 2. Use in navigation components:
 * ```tsx
 * import { useNavigationPreload } from '@routing/useNavigationPreload';
 *
 * function NavLink({ to, children }) {
 *   const { onMouseEnter, onFocus } = useNavigationPreload(to);
 *
 *   return (
 *     <Link to={to} onMouseEnter={onMouseEnter} onFocus={onFocus}>
 *       {children}
 *     </Link>
 *   );
 * }
 * ```
 *
 * Benefits:
 * - ✅ Instant navigation on hover/focus
 * - ✅ Predictive loading of likely next routes
 * - ✅ Prioritized loading strategy
 * - ✅ Better UX with zero perceived delay
 * - ✅ Accessibility support (keyboard navigation)
 */

export default {
  preloadRoute,
  preloadRoutes,
  preloadPredictedRoutes,
  useNavigationPreload,
  initializePreloading,
};
