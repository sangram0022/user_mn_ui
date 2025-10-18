/**
 * Infrastructure - Monitoring Layer
 * Handles observability, logging, error tracking, and performance monitoring
 *
 * @module infrastructure/monitoring
 */

// Performance Monitoring
export { performanceMonitor } from './PerformanceMonitor';
export { webVitalsTracker } from './WebVitalsTracker';

// Monitoring Hooks
export {
  useAnalytics,
  useComponentMetrics,
  useErrorBoundary,
  useNetworkMonitoring,
  usePerformance,
  useUserSession,
  useWebVitals,
} from './hooks/useMonitoring';
