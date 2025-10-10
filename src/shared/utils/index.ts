/**
 * Shared utilities barrel export
 */

// Type guards
export * from './typeGuards';

// Caching utilities
export * from './cache';

// Advanced performance monitoring
export * from './advancedPerformance';

// Re-export commonly used utilities
export { TypeGuards } from './typeGuards';
export { CacheUtils, MemoryCache, useCache } from './cache';
export { advancedPerformanceMonitor, 
  AdvancedPerformanceMonitor,
  useAdvancedRenderPerformance,
  useAdvancedApiPerformance } from './advancedPerformance';

// Re-export design system for convenience
export * from '../design';