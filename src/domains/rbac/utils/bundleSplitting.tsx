/**
 * ========================================
 * RBAC Dynamic Bundle Splitting (Phase 2)
 * ========================================
 * Smart code splitting based on user roles and permissions
 * Loads only necessary RBAC components and utilities
 * Reduces initial bundle size and improves loading performance
 *
 * Features:
 * - Role-based lazy loading
 * - Permission-specific component bundles
 * - Dynamic import optimization
 * - Bundle size reduction
 * ========================================
 */

import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import type { UserRole, Permission } from '../types/rbac.types';

// ========================================
// Types
// ========================================

interface RoleBundleConfig {
  roles: UserRole[];
  permissions?: Permission[];
  component: () => Promise<{ default: ComponentType<unknown> }>;
}

interface LazyComponentOptions {
  fallback?: React.ReactElement;
  preload?: boolean;
}

// ========================================
// Bundle Loading Cache
// ========================================

const bundleCache = new Map<string, LazyExoticComponent<ComponentType<unknown>>>();
const preloadedBundles = new Set<string>();

// ========================================
// Default Loading Components
// ========================================

// Removed unused DefaultRbacLoadingSpinner

import { DefaultComponentLoadingSpinner } from '../components/LoadingComponents';

// ========================================
// Dynamic RBAC Component Bundles
// ========================================

/**
 * Pre-configured role-based component bundles
 * Components are loaded only when user has required role
 */
export const RBAC_BUNDLES: Record<string, RoleBundleConfig> = {
  // RBAC utility bundles (existing components only)
  // Removed rbacCache bundle until component is implemented
};

// ========================================
// Dynamic Bundle Loader
// ========================================

/**
 * Loads RBAC component bundle based on user roles
 * Uses caching to prevent duplicate loads
 */
export function createRoleBundleLoader(
  bundleKey: keyof typeof RBAC_BUNDLES,
  options: LazyComponentOptions = {}
): LazyExoticComponent<ComponentType<unknown>> {
  const cacheKey = `${bundleKey}_${JSON.stringify(options)}`;
  
  // Return cached bundle if available
  if (bundleCache.has(cacheKey)) {
    return bundleCache.get(cacheKey)!;
  }

  const bundle = RBAC_BUNDLES[bundleKey];
  if (!bundle) {
    throw new Error(`RBAC bundle '${bundleKey}' not found`);
  }

  // Create lazy component
  const LazyComponent = lazy(bundle.component);
  
  // Cache the lazy component
  bundleCache.set(cacheKey, LazyComponent);

  return LazyComponent;
}

/**
 * Higher-order component for role-based lazy loading
 */
export function withRoleBasedLazyLoading<P extends object>(
  bundleKey: keyof typeof RBAC_BUNDLES,
  options: LazyComponentOptions = {}
) {
  const LazyComponent = createRoleBundleLoader(bundleKey, options);
  const fallback = options.fallback || <DefaultComponentLoadingSpinner />;

  return function RoleBasedLazyComponent(props: P) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// ========================================
// Preloading Strategies
// ========================================

/**
 * Preload RBAC bundles based on user roles
 * Call this after user authentication to warm up bundles
 */
export async function preloadRoleBundles(userRoles: UserRole[]): Promise<void> {
  const bundlesToPreload = Object.entries(RBAC_BUNDLES).filter(([, config]) =>
    config.roles.some(role => userRoles.includes(role))
  );

  const preloadPromises = bundlesToPreload.map(async ([bundleKey, config]) => {
    if (preloadedBundles.has(bundleKey)) {
      return; // Already preloaded
    }

    try {
      await config.component();
      preloadedBundles.add(bundleKey);
      
      if (import.meta.env.DEV) {
        console.log(`✅ Preloaded RBAC bundle: ${bundleKey}`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to preload RBAC bundle: ${bundleKey}`, error);
    }
  });

  await Promise.allSettled(preloadPromises);
}

/**
 * Preload bundles for predicted navigation
 * Use this for intelligent preloading based on user behavior
 */
export function preloadPredictedBundles(
  currentRoute: string,
  userRoles: UserRole[]
): void {
  // Prediction logic based on common navigation patterns
  const predictions: Record<string, (keyof typeof RBAC_BUNDLES)[]> = {
    '/dashboard': ['userProfile', 'reportViewer'],
    '/admin': ['userManagement', 'auditLogs', 'rbacCache'],
    '/profile': ['userProfile'],
    '/reports': ['reportViewer'],
  };

  const predictedBundles = predictions[currentRoute] || [];
  
  predictedBundles.forEach(bundleKey => {
    const config = RBAC_BUNDLES[bundleKey];
    if (config.roles.some(role => userRoles.includes(role))) {
      // Preload in background (fire and forget)
      config.component().catch(() => {
        // Silent fail for predictions
      });
    }
  });
}

// ========================================
// Bundle Analytics (Development)
// ========================================

export function getRbacBundleStats() {
  return {
    totalBundles: Object.keys(RBAC_BUNDLES).length,
    cachedBundles: bundleCache.size,
    preloadedBundles: preloadedBundles.size,
    bundleKeys: Object.keys(RBAC_BUNDLES),
    cachedKeys: Array.from(bundleCache.keys()),
    preloadedKeys: Array.from(preloadedBundles),
  };
}

// ========================================
// Cleanup
// ========================================

/**
 * Clear bundle cache (useful for testing or memory management)
 */
export function clearRbacBundleCache(): void {
  bundleCache.clear();
  preloadedBundles.clear();
  
  if (import.meta.env.DEV) {
    console.log('🧹 Cleared RBAC bundle cache');
  }
}