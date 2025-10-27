// Shared utilities barrel export
// Advanced performance utilities (preload, prefetch, adaptive loading, etc.)
export * from './advanced-performance';

// API utilities
export * from './apiMessages';

// Array utilities (groupBy, sortBy, unique, chunk, etc.)
export * from './array';

// Async utilities (debounce, throttle, retry, delay, etc.)
export * from './async';

// Utility functions
export * from './classNames';
export * from './dateUtils';
export * from './env';
export * from './error';
export * from './error-handler';
export * from './logger';

// String utilities (capitalize, truncate, slugify, etc.)
export * from './string';

// URL and query parameter utilities
export * from './url';

// Performance monitoring (metrics collection, web vitals)
export {
  PerformanceUtils,
  performanceMonitor,
  useDebouncedValue,
  useLargeDataset,
  usePagination,
  usePerformanceMonitor,
  useResizeObserver,
  useStableCallback,
  useVirtualList,
} from './performance';

// Rate limiting
export * from './rateLimiter';

// Resource loading utilities (re-export avoiding conflicts with advanced-performance)
export {
  preconnectOrigin,
  prefetchRoute,
  prefetchScript,
  preinitScript,
  preinitStylesheet,
  preloadCriticalResources,
  preloadData,
  preloadFont,
  preloadFonts,
  preloadImage,
  preloadScript,
  preloadStylesheet,
  usePrefetchRoute,
  usePreloadResources,
} from './resource-loading';

// Storage utilities
export * from './safeLocalStorage';
export * from './safeSessionStorage';

// Security utilities
export * from './sanitization';

// User utilities
export * from './user';

// Role-based permission utilities
export * from './rolePermissions';

// Validation utilities
export * from './validation';
