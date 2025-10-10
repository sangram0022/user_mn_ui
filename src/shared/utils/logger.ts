/**
 * Application Logger
 * Provides structured logging with different levels and contexts
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
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, context?: LogContext, error?: Error): LogMessage {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error
    };
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
        console.debug(prefix, logMessage.message, logMessage.context || '');
        break;
      case 'info':
        console.info(prefix, logMessage.message, logMessage.context || '');
        break;
      case 'warn':
        console.warn(prefix, logMessage.message, logMessage.context || '');
        break;
      case 'error':
        console.error(prefix, logMessage.message, logMessage.error || logMessage.context || '');
        break;
    }
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
    this.outputLog(this.formatMessage('error', message, context, error));
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
}

export const logger = new Logger();
export default logger;