/**
 * Infrastructure - Monitoring Layer
 * Handles observability, logging, error tracking, and performance monitoring
 *
 * @module infrastructure/monitoring
 */

// Logger - Structured logging delegates to shared utilities
export { logger } from '@shared/utils/logger';
export type { LogContext, LogLevel, LogMessage } from '@shared/utils/logger';

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
