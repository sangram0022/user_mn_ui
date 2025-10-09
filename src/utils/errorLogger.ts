/**
 * Error Logging Utility
 * 
 * Provides centralized error logging for the application.
 * Logs errors to console (development), backend API, and optionally to third-party services.
 * 
 * Features:
 * - In-memory error storage (last 100 errors)
 * - Automatic backend API logging
 * - Development console logging
 * - Context enrichment (user agent, URL, session info)
 * - Performance tracking
 * 
 * @example
 * ```typescript
 * import { errorLogger } from '@shared/utils/error';
 * 
 * // Log an error with additional context
 * errorLogger.log(parsedError, {
 *   component: 'LoginPage',
 *   action: 'submit',
 *   attemptNumber: 3
 * });
 * 
 * // Get all logged errors
 * const errors = errorLogger.getLogs();
 * 
 * // Clear error logs
 * errorLogger.clearLogs();
 * ```
 */

export * from '@shared/utils/error';
