/**
 * Logging Framework Exports
 * Re-exports all logging functionality from a single entry point
 */

export { Logger, getLogger, logger, globalLogger } from './logger.ts';
export type { LogEntry, LogContext, LogLevel, LoggerConfig, PerformanceMetric } from './types.ts';
export { LOG_LEVELS } from './types.ts';
export {
  DEFAULT_LOGGER_CONFIG,
  shouldLog,
  getColorForLevel,
  getConsoleMethod,
  formatTimestamp,
  getSourceLocation,
} from './config.ts';
export { diagnostic } from './diagnostic.ts';

// Export logging utilities
export {
  logApiCall,
  logApiError,
  logUserAction,
  logAuthEvent,
  logValidationError,
  logSecurityEvent,
  logDataFetch,
  logCacheOperation,
  logNavigation,
  logFormSubmission,
  logComponentLifecycle,
  logPerformance,
  logError,
  withContext,
  createTimer,
  logStateChange,
  logDebug,
  loggingUtils,
} from './utilities.ts';

/**
 * Quick usage examples:
 *
 * Basic logging:
 * ```typescript
 * import { logger } from '@/core/logging';
 *
 * logger().info('User logged in');
 * logger().warn('API response slow', { duration: 5000 });
 * logger().error('Database connection failed', error);
 * ```
 *
 * With context:
 * ```typescript
 * const log = logger();
 * log.setContext({ userId: user.id, sessionId });
 * log.info('User action'); // Will include userId and sessionId
 * ```
 *
 * Performance tracking (development only):
 * ```typescript
 * const log = logger();
 * log.startTimer('api-call');
 * await fetchData();
 * log.endTimer('api-call'); // Logs: Timer [api-call]: 123.45ms
 * ```
 *
 * Error logging:
 * ```typescript
 * try {
 *   riskyOperation();
 * } catch (error) {
 *   logger().error('Operation failed', error as Error);
 * }
 * ```
 *
 * Debugging:
 * ```typescript
 * const log = logger();
 * log.debug('Variable value', { myVar, status: 'processing' });
 * console.log(log.exportLogs()); // Get all logs
 * log.downloadLogs(); // Download logs as JSON
 * ```
 */
