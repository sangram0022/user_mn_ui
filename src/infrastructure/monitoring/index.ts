/**
 * Infrastructure - Monitoring Layer
 * Handles observability, logging, error tracking, and performance monitoring
 *
 * @module infrastructure/monitoring
 */

// Logger - Structured logging
export { LogLevel, logger } from './logger';

// Error Tracking
export { errorTracker } from './ErrorTracker';

// Performance Monitoring
export { performanceMonitor } from './PerformanceMonitor';
export { webVitalsTracker } from './WebVitalsTracker';

// Analytics
export { analyticsTracker } from './AnalyticsTracker';

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
