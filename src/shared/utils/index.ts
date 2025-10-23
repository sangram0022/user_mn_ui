// Shared utilities barrel export
// Advanced performance utilities (preload, prefetch, adaptive loading, etc.)
export * from './advanced-performance';

// API utilities
export * from './apiMessages';

// Utility functions
export * from './classNames';
export * from './dateUtils';
export * from './error';
export * from './error-handler';
export * from './formValidation';
export * from './logger';

// Performance monitoring (metrics collection, web vitals)
export {
  performanceMonitor,
  PerformanceUtils,
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

// Validation utilities
export * from './validation';
