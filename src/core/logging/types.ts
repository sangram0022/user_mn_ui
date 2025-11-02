/**
 * Logging Framework - Type Definitions
 * Industry-standard logging types for structured logging across the application
 * Lightweight, zero-dependency implementation for optimal performance
 */

/** Log severity levels following RFC 5424 standard */
export const LOG_LEVELS = {
  /** System is unusable - application cannot continue */
  FATAL: 'FATAL',
  /** Action must be taken immediately - critical condition */
  ERROR: 'ERROR',
  /** Warning condition - potentially harmful situation */
  WARN: 'WARN',
  /** Informational message */
  INFO: 'INFO',
  /** Detailed information for debugging */
  DEBUG: 'DEBUG',
  /** Even more detailed debug information */
  TRACE: 'TRACE',
} as const;

export type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];

/** Log context for structured logging */
export interface LogContext {
  /** User ID for tracking user-specific issues */
  userId?: string;
  /** Session ID for tracking user sessions */
  sessionId?: string;
  /** Request ID for tracking API requests */
  requestId?: string;
  /** Additional custom context */
  [key: string]: unknown;
}

/** Structured log entry */
export interface LogEntry {
  /** Timestamp when log was created */
  timestamp: string;
  /** Log level */
  level: LogLevel;
  /** Log message */
  message: string;
  /** Error object if applicable */
  error?: Error | null;
  /** Structured context data */
  context?: LogContext;
  /** Source module/file */
  source?: string;
  /** Stack trace for errors */
  stack?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/** Logger configuration */
export interface LoggerConfig {
  /** Current environment: 'development', 'staging', 'production' */
  environment: 'development' | 'staging' | 'production';
  /** Minimum log level to output */
  level: LogLevel;
  /** Enable console output */
  console: boolean;
  /** Enable localStorage persistence (for debugging) */
  persistence: boolean;
  /** Max log entries to keep in memory */
  maxLogs: number;
  /** Enable performance tracking */
  performanceTracking: boolean;
  /** Enable structured logging format */
  structured: boolean;
}

/** Performance metric */
export interface PerformanceMetric {
  /** Metric name */
  name: string;
  /** Duration in milliseconds */
  duration: number;
  /** Start timestamp */
  startTime: number;
  /** End timestamp */
  endTime: number;
}
