/**
 * Monitoring Types
 */

// Error Tracking
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  context?: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

// Performance Monitoring
export interface PerformanceMetrics {
  renderTime: number;
  componentMount: number;
  memoryUsage: number;
  interactionDelay: number;
  coreWebVitals: WebVitalsMetrics;
}

export interface WebVitalsMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
}

export interface PerformanceEntry {
  name: string;
  duration: number;
  startTime: number;
  entryType: string;
}

// Analytics
export interface AnalyticsEvent {
  name: string;
  category: string;
  label?: string;
  value?: number;
  properties?: Record<string, unknown>;
  timestamp: number;
}

export interface UserProperties {
  userId?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

export interface TrackingOptions {
  immediate?: boolean;
  batch?: boolean;
  persist?: boolean;
}
