/**
 * Route Preloader - Ultra-Fast Navigation System
 *
 * Implements aggressive prefetching and caching for zero-delay navigation:
 * - Eager preloading of all routes in idle time
 * - Component-level caching with memory management
 * - Predictive preloading based on user behavior
 * - Network-aware loading strategy
 *
 * Performance Goal: <10ms navigation time
 *
 * @author Senior React Performance Engineer
 * @version 2.0.0
 */

import { routes } from '@routing/config';
import { logger } from '@shared/utils/logger';
import type { ComponentType } from 'react';
import { useEffect, type FC, type ReactNode } from 'react';

interface PreloadedRoute {
  path: string;
  component: ComponentType;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface NavigationPrediction {
  fromPath: string;
  toPath: string;
  probability: number;
  count: number;
}

class RoutePreloader {
  private static instance: RoutePreloader;
  private preloadedRoutes: Map<string, PreloadedRoute> = new Map();
  private preloadingRoutes: Set<string> = new Set();
  private navigationHistory: NavigationPrediction[] = [];
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_SIZE = 20; // Maximum cached routes
  private isEagerLoadingComplete = false;

  private constructor() {
    this.initializePreloading();
  }

  static getInstance(): RoutePreloader {
    if (!RoutePreloader.instance) {
      RoutePreloader.instance = new RoutePreloader();
    }
    return RoutePreloader.instance;
  }

  /**
   * Initialize aggressive preloading strategy
   */
  private initializePreloading(): void {
    if (typeof window === 'undefined') return;

    // Phase 1: Immediate critical routes (0ms delay)
    this.preloadCriticalRoutes();

    // Phase 2: High-priority routes (after initial paint)
    requestAnimationFrame(() => {
      this.preloadHighPriorityRoutes();
    });

    // Phase 3: All remaining routes during idle time
    if ('requestIdleCallback' in window) {
      this.scheduleEagerLoading();
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        void this.eagerLoadAllRoutes();
      }, 2000);
    }

    // Monitor network for adaptive loading
    this.monitorNetworkConditions();

    // Load navigation predictions from storage
    this.loadNavigationPredictions();
  }

  /**
   * Preload critical routes immediately (dashboard, login)
   */
  private preloadCriticalRoutes(): void {
    const criticalPaths = ['/', '/dashboard', '/login'];

    criticalPaths.forEach((path) => {
      void this.preloadRoute(path, true); // force = true for critical routes
    });
  }

  /**
   * Preload high-priority routes (profile, users, common pages)
   */
  private preloadHighPriorityRoutes(): void {
    const highPriorityPaths = ['/profile', '/users', '/settings'];

    highPriorityPaths.forEach((path) => {
      void this.preloadRoute(path);
    });
  }

  /**
   * Schedule eager loading of all routes during browser idle time
   */
  private scheduleEagerLoading(): void {
    if (typeof window === 'undefined' || !('requestIdleCallback' in window)) return;

    const requestIdleCallback = (
      window as Window & {
        requestIdleCallback: (callback: () => void, options?: { timeout: number }) => number;
      }
    ).requestIdleCallback;

    requestIdleCallback(
      () => {
        void this.eagerLoadAllRoutes();
      },
      { timeout: 5000 }
    );
  }

  /**
   * Eagerly load all routes in the background
   */
  private async eagerLoadAllRoutes(): Promise<void> {
    if (this.isEagerLoadingComplete) return;

    logger.info('[RoutePreloader] Starting eager loading of all routes');

    const routesToLoad = routes
      .map((r) => r.path)
      .filter((path) => !this.preloadedRoutes.has(path));

    // Load in batches to avoid overwhelming the browser
    const BATCH_SIZE = 3;
    for (let i = 0; i < routesToLoad.length; i += BATCH_SIZE) {
      const batch = routesToLoad.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map((path) =>
          this.preloadRoute(path).catch(() => {
            // Silently fail individual routes
          })
        )
      );

      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.isEagerLoadingComplete = true;
    logger.info('[RoutePreloader] Eager loading complete', {
      cachedRoutes: this.preloadedRoutes.size,
      totalRoutes: routes.length,
    });
  }

  /**
   * Monitor network conditions and adjust loading strategy
   */
  private monitorNetworkConditions(): void {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) return;

    const connection = (
      navigator as Navigator & {
        connection?: {
          effectiveType: string;
          saveData: boolean;
          addEventListener: (event: string, handler: () => void) => void;
        };
      }
    ).connection;
    if (!connection) return;

    const updateStrategy = () => {
      const effectiveType = connection.effectiveType;
      const saveData = connection.saveData;

      if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
        // Disable eager loading on slow connections
        logger.info('[RoutePreloader] Slow connection detected, limiting preloading');
      } else if (effectiveType === '4g') {
        // Aggressive preloading on fast connections
        if (!this.isEagerLoadingComplete) {
          void this.eagerLoadAllRoutes();
        }
      }
    };

    connection.addEventListener('change', updateStrategy);
    updateStrategy();
  }

  /**
   * Preload a specific route with caching
   */
  async preloadRoute(path: string, force = false): Promise<void> {
    // Check cache first
    const cached = this.preloadedRoutes.get(path);
    if (cached && !force) {
      // Update access stats
      cached.accessCount++;
      cached.lastAccessed = Date.now();
      return;
    }

    // Skip if already preloading
    if (this.preloadingRoutes.has(path) && !force) {
      return;
    }

    // Find route config
    const route = routes.find((r) => r.path === path);
    if (!route) {
      return;
    }

    this.preloadingRoutes.add(path);

    try {
      const lazyComponent = route.component as {
        preload?: () => Promise<{ default: ComponentType }>;
        _result?: ComponentType;
      };

      // Method 1: Check if already loaded by React
      if (lazyComponent._result) {
        this.cacheRoute(path, lazyComponent._result);
        return;
      }

      // Method 2: Use preload function if available
      if (typeof lazyComponent.preload === 'function') {
        const module = await lazyComponent.preload();
        this.cacheRoute(path, module.default);
        return;
      }

      // Method 3: Import the component dynamically
      // Since we don't have direct access to the import, we'll skip this route
      logger.debug('[RoutePreloader] No preload method available for route', { path });
    } catch (error) {
      logger.warn('[RoutePreloader] Failed to preload route', { path, error: String(error) });
    } finally {
      this.preloadingRoutes.delete(path);
    }
  }

  /**
   * Cache a loaded route
   */
  private cacheRoute(path: string, component: ComponentType): void {
    this.preloadedRoutes.set(path, {
      path,
      component,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
    });

    // Manage cache size
    if (this.preloadedRoutes.size > this.MAX_CACHE_SIZE) {
      this.evictLeastUsedRoute();
    }
  }

  /**
   * Evict least recently used route from cache
   */
  private evictLeastUsedRoute(): void {
    let leastUsed: PreloadedRoute | null = null;
    let leastUsedScore = Infinity;

    for (const cached of this.preloadedRoutes.values()) {
      // Calculate score: lower is worse (less valuable)
      // Factor in both access count and recency
      const recencyScore = (Date.now() - cached.lastAccessed) / 1000; // seconds
      const score = cached.accessCount / (1 + recencyScore / 3600); // favor recent access

      if (score < leastUsedScore) {
        leastUsedScore = score;
        leastUsed = cached;
      }
    }

    if (leastUsed) {
      this.preloadedRoutes.delete(leastUsed.path);
      logger.debug('[RoutePreloader] Evicted route from cache', {
        path: leastUsed.path,
        accessCount: leastUsed.accessCount,
      });
    }
  }

  /**
   * Preload multiple routes
   */
  async preloadRoutes(paths: string[]): Promise<void> {
    await Promise.all(paths.map((path) => this.preloadRoute(path)));
  }

  /**
   * Check if a route is preloaded
   */
  isPreloaded(path: string): boolean {
    return this.preloadedRoutes.has(path);
  }

  /**
   * Get preloaded component
   */
  getPreloadedComponent(path: string): ComponentType | null {
    const cached = this.preloadedRoutes.get(path);
    if (cached) {
      cached.accessCount++;
      cached.lastAccessed = Date.now();
      return cached.component;
    }
    return null;
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [path, cached] of this.preloadedRoutes.entries()) {
      if (now - cached.timestamp > this.CACHE_DURATION) {
        this.preloadedRoutes.delete(path);
      }
    }
  }

  /**
   * Record navigation for predictive preloading
   */
  recordNavigation(fromPath: string, toPath: string): void {
    const existing = this.navigationHistory.find(
      (nav) => nav.fromPath === fromPath && nav.toPath === toPath
    );

    if (existing) {
      existing.count++;
      existing.probability = Math.min(existing.count / 10, 0.95);
    } else {
      this.navigationHistory.push({
        fromPath,
        toPath,
        count: 1,
        probability: 0.1,
      });
    }

    // Keep only recent patterns
    if (this.navigationHistory.length > 100) {
      this.navigationHistory = this.navigationHistory
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 100);
    }

    this.saveNavigationPredictions();
  }

  /**
   * Preload likely next routes based on current location
   */
  preloadLikelyNextRoutes(currentPath: string): void {
    const predictions = this.navigationHistory
      .filter((nav) => nav.fromPath === currentPath)
      .filter((nav) => nav.probability > 0.3)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);

    predictions.forEach((prediction) => {
      void this.preloadRoute(prediction.toPath);
    });
  }

  /**
   * Load navigation predictions from localStorage
   */
  private loadNavigationPredictions(): void {
    try {
      const stored = localStorage.getItem('nav_predictions');
      if (stored) {
        this.navigationHistory = JSON.parse(stored) as NavigationPrediction[];
      }
    } catch (error) {
      logger.warn('[RoutePreloader] Failed to load navigation predictions', {
        error: String(error),
      });
    }
  }

  /**
   * Save navigation predictions to localStorage
   */
  private saveNavigationPredictions(): void {
    try {
      localStorage.setItem('nav_predictions', JSON.stringify(this.navigationHistory));
    } catch (error) {
      logger.warn('[RoutePreloader] Failed to save navigation predictions', {
        error: String(error),
      });
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cachedRoutes: this.preloadedRoutes.size,
      preloadingRoutes: this.preloadingRoutes.size,
      totalRoutes: routes.length,
      eagerLoadingComplete: this.isEagerLoadingComplete,
      navigationPatterns: this.navigationHistory.length,
    };
  }
}

// Export singleton instance
export const routePreloader = RoutePreloader.getInstance();

/**
 * Hook to trigger route preloading on app mount
 */
export const RoutePreloadTrigger: FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Trigger preloading (already done in constructor, but this ensures it)
    void routePreloader.preloadRoute('/');

    // Log cache stats in development
    if (import.meta.env.DEV) {
      const logStats = () => {
        logger.info('[RoutePreloader] Cache stats', routePreloader.getCacheStats());
      };

      const interval = setInterval(logStats, 10000);
      return () => clearInterval(interval);
    }

    return undefined;
  }, []);

  return children;
};

export default routePreloader;
