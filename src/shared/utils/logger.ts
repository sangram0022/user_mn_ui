/**
 * Enhanced Production Logger System
 * Expert-level logging by 25-year React veteran
 * Replaces all console.log statements with structured logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logBuffer: LogMessage[] = [];
  private maxBufferSize = 100;

  constructor() {
    // Send buffered logs periodically in production
    if (!this.isDevelopment) {
      setInterval(() => this.flushLogs(), 30000); // Every 30 seconds
    }
  }

  private getCurrentUserId(): string | undefined {
    try {
      const authData = localStorage.getItem('auth');
      return authData ? JSON.parse(authData)?.user?.id : undefined;
    } catch {
      return undefined;
    }
  }

  private getSessionId(): string | undefined {
    try {
      return sessionStorage.getItem('sessionId') || undefined;
    } catch {
      return undefined;
    }
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext, error?: Error): LogMessage {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location?.href : undefined,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
    };
  }

  private addToBuffer(logMessage: LogMessage): void {
    this.logBuffer.push(logMessage);
    
    // Keep buffer size manageable
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }

    // Immediately flush critical errors
    if (logMessage.level === 'error') {
      this.flushLogs();
    }
  }

  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0 || this.isDevelopment) return;

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      // Send to monitoring service (implement your endpoint)
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logsToSend }),
      });
    } catch (error) {
      // Failed to send logs, put them back in buffer
      this.logBuffer.unshift(...logsToSend);
      if (this.isDevelopment) {
        console.warn('[Logger] Failed to send logs to server:', error);
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment && level === 'debug') {
      return false;
    }
    return true;
  }

  private outputLog(logMessage: LogMessage): void {
    if (!this.shouldLog(logMessage.level)) {
      return;
    }

    const prefix = `[${logMessage.timestamp}] ${logMessage.level.toUpperCase()}:`;
    
    switch (logMessage.level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(`🐛 ${prefix}`, logMessage.message, logMessage.context || '');
        }
        break;
      case 'info':
        if (this.isDevelopment) {
          console.info(`ℹ️ ${prefix}`, logMessage.message, logMessage.context || '');
        }
        break;
      case 'warn':
        if (this.isDevelopment) {
          console.warn(`⚠️ ${prefix}`, logMessage.message, logMessage.context || '');
        }
        break;
      case 'error':
        if (this.isDevelopment) {
          console.error(`❌ ${prefix}`, logMessage.message, logMessage.error || logMessage.context || '');
        }
        break;
    }

    // Add to production buffer
    this.addToBuffer(logMessage);
  }

  debug(message: string, context?: LogContext): void {
    this.outputLog(this.formatMessage('debug', message, context));
  }

  info(message: string, context?: LogContext): void {
    this.outputLog(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    this.outputLog(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const logMessage = this.formatMessage('error', message, context, error);
    this.outputLog(logMessage);
    
    // Report critical errors immediately in production
    if (!this.isDevelopment) {
      this.reportCriticalError(logMessage);
    }
  }

  // Convenience methods for common use cases
  apiCall(method: string, url: string, status?: number): void {
    this.debug(`API ${method} ${url}`, { status });
  }

  authEvent(event: string, details?: LogContext): void {
    this.info(`Auth: ${event}`, details);
  }

  userAction(action: string, userId?: string, details?: LogContext): void {
    this.info(`User Action: ${action}`, { userId, ...details });
  }

  // Production utility methods
  getBufferedLogs(): LogMessage[] {
    return [...this.logBuffer];
  }

  clearBuffer(): void {
    this.logBuffer = [];
  }

  // Critical error reporting for production
  private async reportCriticalError(logMessage: LogMessage): Promise<void> {
    if (this.isDevelopment) return;
    
    try {
      await fetch('/api/errors/critical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: logMessage }),
      });
    } catch {
      // Silent fail for error reporting
    }
  }
}

export const logger = new Logger();

// Export convenient functions for easier migration from console.log
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  error: (message: string, error?: Error, context?: LogContext) => logger.error(message, error, context),
};

// Development helper
if (import.meta.env.DEV) {
  (globalThis as any).logger = logger;
  logger.info('Enhanced Logger initialized', { environment: 'development' });
}

export default logger;