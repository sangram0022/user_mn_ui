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
 * import { errorLogger } from '../utils/errorLogger';
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

import type { ParsedError } from '../types/error';

/**
 * Error log entry structure
 */
export interface ErrorLogEntry {
  timestamp: string;
  error: ParsedError;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  additionalContext?: Record<string, unknown>;
  performance?: {
    memoryUsage?: number;
    timestamp: number;
  };
}

/**
 * Error Logger Class
 * Singleton pattern for centralized error logging
 */
class ErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private readonly maxLogs = 100; // Keep last 100 errors in memory
  private readonly apiEndpoint = '/api/v1/logs/frontend-errors';
  private retryQueue: ErrorLogEntry[] = [];
  private isProcessingQueue = false;

  /**
   * Log an error with optional context
   * 
   * @param error - Parsed error object
   * @param context - Additional context information
   */
  log(error: ParsedError, context?: Record<string, unknown>): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      error,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      additionalContext: context,
      performance: this.getPerformanceData()
    };

    // Add to in-memory logs
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Console logging for development
    if (import.meta.env.DEV) {
      this.logToConsole(entry);
    }

    // Send to backend API
    this.sendToBackend(entry);
  }

  /**
   * Log to browser console (development only)
   */
  private logToConsole(entry: ErrorLogEntry): void {
    const style = 'color: #ef4444; font-weight: bold;';
    console.group(`%c[Error Logger] ${entry.error.code}`, style);
    console.error('Message:', entry.error.message);
    console.error('Severity:', entry.error.severity);
    console.error('Timestamp:', entry.timestamp);
    console.error('URL:', entry.url);
    if (entry.error.details) {
      console.error('Details:', entry.error.details);
    }
    if (entry.additionalContext) {
      console.error('Context:', entry.additionalContext);
    }
    console.groupEnd();
  }

  /**
   * Send error log to backend API
   */
  private async sendToBackend(entry: ErrorLogEntry): Promise<void> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
        // Don't wait too long for logging to complete
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`Failed to log error: ${response.status}`);
      }

      // Process retry queue if there are pending logs
      if (this.retryQueue.length > 0) {
        this.processRetryQueue();
      }
    } catch (err) {
      // Silently fail - don't want logging to break the app
      if (import.meta.env.DEV) {
        console.warn('[Error Logger] Failed to send error log to backend:', err);
      }

      // Add to retry queue
      this.retryQueue.push(entry);

      // Limit retry queue size
      if (this.retryQueue.length > 50) {
        this.retryQueue.shift();
      }
    }
  }

  /**
   * Process retry queue for failed log submissions
   */
  private async processRetryQueue(): Promise<void> {
    if (this.isProcessingQueue || this.retryQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.retryQueue.length > 0) {
      const entry = this.retryQueue.shift();
      if (entry) {
        try {
          await this.sendToBackend(entry);
          // Small delay between retries
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch {
          // Put it back at the end of the queue
          this.retryQueue.push(entry);
          break;
        }
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Get user ID from storage (if available)
   */
  private getUserId(): string | undefined {
    try {
      const authData = localStorage.getItem('auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.user?.id?.toString();
      }
    } catch {
      // Ignore errors
    }
    return undefined;
  }

  /**
   * Get session ID from storage
   */
  private getSessionId(): string | undefined {
    try {
      return sessionStorage.getItem('sessionId') || undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Get performance data
   */
  private getPerformanceData(): ErrorLogEntry['performance'] {
    try {
      const performance = window.performance as Performance & {
        memory?: { usedJSHeapSize: number };
      };
      const memory = performance.memory;

      return {
        memoryUsage: memory ? memory.usedJSHeapSize : undefined,
        timestamp: performance.now()
      };
    } catch {
      return {
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get all logged errors
   */
  getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by error code
   */
  getLogsByCode(code: string): ErrorLogEntry[] {
    return this.logs.filter(log => log.error.code === code);
  }

  /**
   * Get logs filtered by severity
   */
  getLogsBySeverity(severity: 'error' | 'warning' | 'info'): ErrorLogEntry[] {
    return this.logs.filter(log => log.error.severity === severity);
  }

  /**
   * Get recent logs (last N entries)
   */
  getRecentLogs(count: number = 10): ErrorLogEntry[] {
    return this.logs.slice(-count);
  }

  /**
   * Clear all error logs
   */
  clearLogs(): void {
    this.logs = [];
    if (import.meta.env.DEV) {
      console.log('[Error Logger] Logs cleared');
    }
  }

  /**
   * Get error statistics
   */
  getStatistics(): {
    total: number;
    byCode: Record<string, number>;
    bySeverity: Record<string, number>;
    recentErrors: number;
  } {
    const now = Date.now();
    const oneHourAgo = now - 3600000; // 1 hour in milliseconds

    const byCode: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let recentErrors = 0;

    this.logs.forEach(log => {
      // Count by code
      byCode[log.error.code] = (byCode[log.error.code] || 0) + 1;

      // Count by severity
      const severity = log.error.severity || 'error';
      bySeverity[severity] = (bySeverity[severity] || 0) + 1;

      // Count recent errors (last hour)
      const logTime = new Date(log.timestamp).getTime();
      if (logTime > oneHourAgo) {
        recentErrors++;
      }
    });

    return {
      total: this.logs.length,
      byCode,
      bySeverity,
      recentErrors
    };
  }

  /**
   * Export logs as JSON (for debugging)
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Download logs as a file (for debugging)
   */
  downloadLogs(): void {
    const dataStr = this.exportLogs();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

// Make it available on window for debugging in development
if (import.meta.env.DEV) {
  (window as unknown as { errorLogger: ErrorLogger }).errorLogger = errorLogger;
  console.log('[Error Logger] Debug interface available at window.errorLogger');
}
