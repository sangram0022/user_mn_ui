/**
 * Diagnostic Logger
 * 
 * Specialized logger for development diagnostic tools.
 * Outputs to BOTH console (for immediate visibility) AND structured logs (for persistence).
 * 
 * Use this instead of direct console.* calls in diagnostic utilities.
 * 
 * Features:
 * - Dual output: Browser console + structured logging
 * - DEV-only: Automatically disabled in production
 * - Prefix: [DIAGNOSTIC] tag for easy filtering
 * - Type-safe: Proper TypeScript interfaces
 * 
 * @example
 * ```typescript
 * import { diagnostic } from '@/core/logging/diagnostic';
 * 
 * // Info/debug messages
 * diagnostic.log('✅ Access Token Found', { userId: '123' });
 * 
 * // Warnings
 * diagnostic.warn('⚠️ Token lacks permission', { required: 'admin:read' });
 * 
 * // Errors
 * diagnostic.error('❌ API request failed', error, { endpoint: '/api/users' });
 * ```
 */

import { logger } from './logger';

/**
 * Diagnostic logger for development tools
 * Outputs to both console and structured logs
 */
export const diagnostic = {
  /**
   * Log diagnostic information
   * Console: console.log with [DIAGNOSTIC] prefix
   * Structured: logger().debug
   * 
   * @param message - Diagnostic message (use emoji prefixes: ✅ ❌ ⚠️)
   * @param data - Optional contextual data
   */
  log: (message: string, data?: Record<string, unknown> | unknown): void => {
    if (import.meta.env.MODE === 'development') {
      // Console output for immediate visibility
      if (data !== undefined) {
        // eslint-disable-next-line no-console
        console.log(`[DIAGNOSTIC] ${message}`, data);
      } else {
        // eslint-disable-next-line no-console
        console.log(`[DIAGNOSTIC] ${message}`);
      }
      
      // Structured log for persistence
      logger().debug(`[DIAGNOSTIC] ${message}`, data ? { data } : undefined);
    }
  },

  /**
   * Log diagnostic errors
   * Console: console.error with [DIAGNOSTIC ERROR] prefix
   * Structured: logger().error
   * 
   * @param message - Error message (use ❌ emoji prefix)
   * @param error - Optional Error object
   * @param data - Optional contextual data
   */
  error: (
    message: string,
    error?: Error | unknown,
    data?: Record<string, unknown>
  ): void => {
    if (import.meta.env.MODE === 'development') {
      // Console output for immediate visibility (red styling)
      if (error && data) {
        console.error(`[DIAGNOSTIC ERROR] ${message}`, error, data);
      } else if (error) {
        console.error(`[DIAGNOSTIC ERROR] ${message}`, error);
      } else if (data) {
        console.error(`[DIAGNOSTIC ERROR] ${message}`, data);
      } else {
        console.error(`[DIAGNOSTIC ERROR] ${message}`);
      }
      
      // Structured log for persistence
      const context: Record<string, unknown> = {};
      if (error) context.error = error;
      if (data) context.data = data;
      logger().error(
        `[DIAGNOSTIC] ${message}`,
        error instanceof Error ? error : undefined,
        Object.keys(context).length > 0 ? context : undefined
      );
    }
  },

  /**
   * Log diagnostic warnings
   * Console: console.warn with [DIAGNOSTIC WARNING] prefix
   * Structured: logger().warn
   * 
   * @param message - Warning message (use ⚠️ emoji prefix)
   * @param data - Optional contextual data
   */
  warn: (message: string, data?: Record<string, unknown> | unknown): void => {
    if (import.meta.env.MODE === 'development') {
      // Console output for immediate visibility (yellow styling)
      if (data !== undefined) {
        console.warn(`[DIAGNOSTIC WARNING] ${message}`, data);
      } else {
        console.warn(`[DIAGNOSTIC WARNING] ${message}`);
      }
      
      // Structured log for persistence
      logger().warn(`[DIAGNOSTIC] ${message}`, data ? { data } : undefined);
    }
  },

  /**
   * Clear console (DEV only)
   * Used at the start of diagnostic runs for clean output
   */
  clear: (): void => {
    if (import.meta.env.MODE === 'development') {
      // eslint-disable-next-line no-console
      console.clear();
    }
  },
};
