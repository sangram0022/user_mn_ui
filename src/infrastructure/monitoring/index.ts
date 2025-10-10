/**
 * Infrastructure - Monitoring Layer
 * Handles observability, logging, error tracking, and performance monitoring
 * 
 * @module infrastructure/monitoring
 */

// Logger - Structured logging
export { logger } from './logger';
export type { LogLevel, LogContext, LoggerOptions } from './logger';

// Error Tracking
export { ErrorTracker } from './ErrorTracker';
export { GlobalErrorHandler } from './GlobalErrorHandler';
export type { ErrorReport, ErrorSeverity } from './types';

// Performance Monitoring
export { PerformanceMonitor } from './PerformanceMonitor';
export { WebVitalsTracker } from './WebVitalsTracker';
export type { 
  PerformanceMetrics,
  WebVitalsMetrics,
  PerformanceEntry 
} from './types';

// Analytics
export { AnalyticsTracker } from './AnalyticsTracker';
export type { 
  AnalyticsEvent,
  UserProperties,
  TrackingOptions 
} from './types';

// Monitoring Hooks
export { useErrorTracking } from './hooks/useErrorTracking';
export { usePerformanceMonitoring } from './hooks/usePerformanceMonitoring';
export { useAnalytics } from './hooks/useAnalytics';
