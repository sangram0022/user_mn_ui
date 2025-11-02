// ========================================
// RBAC Performance Utilities
// ========================================
// Monitoring and debugging tools for RBAC performance
// ========================================

import { endpointCache, permissionCache } from './endpointCache';

/**
 * Get cache statistics for debugging/monitoring
 */
export function getRbacPerformanceStats() {
  return {
    endpointCache: endpointCache.getStats(),
    permissionCache: permissionCache.getStats(),
  };
}

/**
 * Clear all RBAC caches (useful for testing)
 */
export function clearRbacCaches() {
  endpointCache.clearCache();
  permissionCache.clear();
}

/**
 * React hook for cache statistics (debugging)
 */
export function useRbacPerformanceStats() {
  return getRbacPerformanceStats();
}