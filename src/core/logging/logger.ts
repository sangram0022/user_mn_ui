/**
 * Core Logger Implementation
 * Lightweight, industry-standard logging framework
 * Zero external dependencies, optimized for performance
 *
 * Features:
 * - RFC 5424 compliant log levels
 * - Structured logging support
 * - Context propagation (userId, sessionId, requestId)
 * - Performance tracking (development only)
 * - Memory-efficient (bounded log storage)
 * - Console integration with color coding
 * - Lazy initialization
 */

import type { LogEntry, LogContext, LogLevel, LoggerConfig } from './types.ts';
import { LOG_LEVELS } from './types.ts';
import {
  DEFAULT_LOGGER_CONFIG,
  shouldLog,
  getColorForLevel,
  getConsoleMethod,
  formatTimestamp,
  getSourceLocation,
} from './config.ts';

/**
 * Global logger instance
 * Lazy loaded on first use to minimize startup impact
 */
let loggerInstance: Logger | null = null;

/**
 * Logger class - core logging functionality
 * Designed for minimal overhead and maximum flexibility
 */
export class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private context: LogContext = {};
  private performanceMarkers: Map<string, number> = new Map();

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_LOGGER_CONFIG, ...config };
  }

  /**
   * Set context for all subsequent logs
   * Useful for tracking user/session/request
   * @param context - Context to add
   */
  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Get current context
   */
  getContext(): LogContext {
    return { ...this.context };
  }

  /**
   * Log at FATAL level - system is unusable
   */
  fatal(message: string, error?: Error | null, metadata?: Record<string, unknown>): void {
    this.log(LOG_LEVELS.FATAL, message, error, metadata);
  }

  /**
   * Log at ERROR level - immediate action needed
   */
  error(message: string, error?: Error | null, metadata?: Record<string, unknown>): void {
    this.log(LOG_LEVELS.ERROR, message, error, metadata);
  }

  /**
   * Log at WARN level - potentially harmful situation
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log(LOG_LEVELS.WARN, message, null, metadata);
  }

  /**
   * Log at INFO level - informational message
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    this.log(LOG_LEVELS.INFO, message, null, metadata);
  }

  /**
   * Log at DEBUG level - detailed debugging information
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log(LOG_LEVELS.DEBUG, message, null, metadata);
  }

  /**
   * Log at TRACE level - very detailed debugging
   */
  trace(message: string, metadata?: Record<string, unknown>): void {
    this.log(LOG_LEVELS.TRACE, message, null, metadata);
  }

  /**
   * Core logging method
   * @private
   */
  private log(
    level: LogLevel,
    message: string,
    error: Error | null | undefined = null,
    metadata?: Record<string, unknown>
  ): void {
    // Performance optimization: skip if level should not be logged
    if (!shouldLog(level, this.config.level)) {
      return;
    }

    // Create structured log entry
    const entry: LogEntry = {
      timestamp: formatTimestamp(),
      level,
      message,
      context: Object.keys(this.context).length > 0 ? this.context : undefined,
      source: this.config.environment === 'development' ? getSourceLocation() : undefined,
      error: error || undefined,
      stack: error?.stack,
      metadata: metadata && Object.keys(metadata).length > 0 ? metadata : undefined,
    };

    // Store in memory (bounded)
    if (this.config.persistence) {
      this.logs.push(entry);
      // Keep only recent logs to avoid memory leak
      if (this.logs.length > this.config.maxLogs) {
        this.logs.shift();
      }
    }

    // Output to console (if enabled)
    if (this.config.console) {
      this.outputToConsole(entry);
    }

    // Send to error tracking service in production (if configured)
    if (
      this.config.environment === 'production' &&
      (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.FATAL)
    ) {
      this.reportToErrorService(entry);
    }
  }

  /**
   * Output formatted log to console
   * @private
   */
  private outputToConsole(entry: LogEntry): void {
    const method = getConsoleMethod(entry.level);
    const color = getColorForLevel(entry.level);
    const prefix = `[${entry.level}] ${entry.timestamp}`;

    // Build log output
    const output: unknown[] = [];

    if (this.config.environment === 'development') {
      // Colored output in development
      output.push(`%c${prefix}`, `color: ${color}; font-weight: bold;`);
    } else {
      // Plain output in production
      output.push(prefix);
    }

    output.push(entry.message);

    if (entry.context) {
      output.push('Context:', entry.context);
    }

    if (entry.metadata) {
      output.push('Metadata:', entry.metadata);
    }

    if (entry.error) {
      output.push('Error:', entry.error.message);
      if (entry.stack && this.config.environment === 'development') {
        output.push('Stack:', entry.stack);
      }
    }

    if (entry.source && this.config.environment === 'development') {
      output.push('Source:', entry.source);
    }

    // Output to appropriate console method
    // Allow console logging for logger module
    const consoleObj = console as unknown as Record<string, (...args: unknown[]) => void>;
    consoleObj[method](...output);
  }

  /**
   * Report error to error tracking service (stub for integration)
   * @private
   */
  private reportToErrorService(entry: LogEntry): void {
    // This would integrate with services like Sentry, Rollbar, etc.
    // For now, it's a stub that can be extended
    if (entry.level === LOG_LEVELS.ERROR || entry.level === LOG_LEVELS.FATAL) {
      // Example: send to error tracking service
      // Avoid logging here to prevent infinite loops
      void entry;
    }
  }

  /**
   * Start performance timer
   * Only functional in development mode
   * @param label - Unique label for this timer
   */
  startTimer(label: string): void {
    if (!this.config.performanceTracking) return;
    this.performanceMarkers.set(label, performance.now());
  }

  /**
   * End performance timer and log duration
   * Only logs in development mode
   * @param label - Label to stop
   * @param metadata - Additional metadata
   */
  endTimer(
    label: string,
    metadata?: Record<string, unknown>
  ): number | undefined {
    if (!this.config.performanceTracking) return undefined;

    const startTime = this.performanceMarkers.get(label);
    if (!startTime) {
      this.warn(`Timer "${label}" not found`);
      return undefined;
    }

    const duration = performance.now() - startTime;
    this.debug(`Timer [${label}]: ${duration.toFixed(2)}ms`, {
      ...metadata,
      duration: `${duration.toFixed(2)}ms`,
    });

    this.performanceMarkers.delete(label);
    return duration;
  }

  /**
   * Get all stored logs
   * @returns Copy of logs array
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear stored logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs in JSON format for debugging
   * @returns JSON string of all logs
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Download logs as JSON file (browser only)
   */
  downloadLogs(): void {
    if (typeof window === 'undefined') return;

    const logs = this.exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Check if a log level is enabled
   */
  isLevelEnabled(level: LogLevel): boolean {
    return shouldLog(level, this.config.level);
  }
}

/**
 * Get or create global logger instance
 * Lazy initialization for minimal startup overhead
 * @param config - Optional configuration overrides
 * @returns Global logger instance
 */
export function getLogger(config?: Partial<LoggerConfig>): Logger {
  if (!loggerInstance) {
    loggerInstance = new Logger(config);
  }
  return loggerInstance;
}

/**
 * Convenience function to get logger with default config
 */
export function logger(): Logger {
  return getLogger();
}

/**
 * Export singleton instance with type-safe proxy
 */
export const globalLogger: Logger = new Proxy(new Logger(), {
  get: (_target: Logger, prop: string | symbol): unknown => {
    if (typeof prop === 'string') {
      const log = getLogger();
      const value = (log as unknown as Record<string, unknown>)[prop];
      return value;
    }
    return undefined;
  },
}) as unknown as Logger;
