// Shared utilities barrel export
// Advanced performance utilities (preload, prefetch, adaptive loading, etc.)
export * from './advanced-performance';

// API utilities
export * from './apiMessages';

// Utility functions
export * from './classNames';
export * from './dateUtils';
export * from './error-handler';
export * from './error';
export * from './formValidation';
export * from './logger';

// Performance monitoring (metrics collection, web vitals)
export {
  PerformanceUtils,
  usePerformanceMonitor,
  useResizeObserver,
  useDebouncedValue,
  useStableCallback,
  usePagination,
  useVirtualList,
  useLargeDataset,
  performanceMonitor,
} from './performance';

// Rate limiting
export * from './rateLimiter';

// Resource loading utilities (re-export avoiding conflicts with advanced-performance)
export {
  preloadFont,
  preloadImage,
  preloadStylesheet,
  preloadScript,
  preloadData,
  preloadFonts,
  preloadCriticalResources,
  prefetchRoute,
  prefetchScript,
  preinitScript,
  preinitStylesheet,
  preconnectOrigin,
  usePreloadResources,
  usePrefetchRoute,
} from './resource-loading';

// Storage utilities
export * from './safeLocalStorage';

// Security utilities
export * from './sanitization';

// User utilities
export * from './user';

// Validation utilities
export * from './validation';
