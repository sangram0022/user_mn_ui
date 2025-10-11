/**
 * Logger utility for standardized logging across the application
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  storageKey?: string;
  maxStorageEntries?: number;
}

class Logger {
  private config: LoggerConfig = {
    level: LogLevel.INFO,
    enableConsole: true,
    enableStorage: false,
    enableRemote: false,
    storageKey: 'app_logs',
    maxStorageEntries: 1000,
  };

  private logBuffer: LogEntry[] = [];
  private flushTimeout: NodeJS.Timeout | null = null;

  constructor(config?: Partial<LoggerConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    if (level < this.config.level) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
    };

    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    if (this.config.enableStorage) {
      this.logToStorage(entry);
    }

    if (this.config.enableRemote) {
      this.logToRemote(entry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const { level, message, timestamp, context, error } = entry;
    const prefix = `[${timestamp.toISOString()}] [${LogLevel[level]}]`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, context, error);
        break;
      case LogLevel.INFO:
        console.info(prefix, message, context);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, context);
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, context, error);
        break;
    }
  }

  private logToStorage(entry: LogEntry): void {
    try {
      const existingLogs = this.getStoredLogs();
      const updatedLogs = [...existingLogs, entry];

      // Keep only the most recent logs
      if (updatedLogs.length > this.config.maxStorageEntries!) {
        updatedLogs.splice(0, updatedLogs.length - this.config.maxStorageEntries!);
      }

      localStorage.setItem(this.config.storageKey!, JSON.stringify(updatedLogs));
    } catch (error) {
      console.warn('Failed to store log entry:', error);
    }
  }

  private logToRemote(entry: LogEntry): void {
    this.logBuffer.push(entry);

    // Debounce remote logging
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }

    this.flushTimeout = setTimeout(() => {
      this.flushRemoteLogs();
    }, 1000);
  }

  private async flushRemoteLogs(): Promise<void> {
    if (this.logBuffer.length === 0 || !this.config.remoteEndpoint) {
      return;
    }

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs: logsToSend.map((entry) => ({
            ...entry,
            timestamp: entry.timestamp.toISOString(),
            error: entry.error
              ? {
                  name: entry.error.name,
                  message: entry.error.message,
                  stack: entry.error.stack,
                }
              : undefined,
          })),
        }),
      });
    } catch (error) {
      console.warn('Failed to send logs to remote endpoint:', error);
      // Re-add logs to buffer for retry
      this.logBuffer.unshift(...logsToSend);
    }
  }

  getStoredLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem(this.config.storageKey!);
      if (stored) {
        return JSON.parse(stored).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
      }
    } catch (error) {
      console.warn('Failed to retrieve stored logs:', error);
    }
    return [];
  }

  clearStoredLogs(): void {
    try {
      localStorage.removeItem(this.config.storageKey!);
    } catch (error) {
      console.warn('Failed to clear stored logs:', error);
    }
  }

  private getCurrentUserId(): string | undefined {
    try {
      // Try to get user ID from auth context or local storage
      const authData = localStorage.getItem('auth_user');
      if (authData) {
        const user = JSON.parse(authData);
        return user.id || user.user_id;
      }
    } catch (error) {
      // Silent fail
    }
    return undefined;
  }

  private getSessionId(): string | undefined {
    try {
      // Try to get session ID from sessionStorage
      let sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = this.generateSessionId();
        sessionStorage.setItem('session_id', sessionId);
      }
      return sessionId;
    } catch (error) {
      return undefined;
    }
  }

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }
}

// Create singleton instance
export const logger = new Logger();

// Development vs Production configuration
if (import.meta.env.DEV) {
  logger.configure({
    level: LogLevel.DEBUG,
    enableConsole: true,
    enableStorage: true,
    enableRemote: false,
  });
} else {
  logger.configure({
    level: LogLevel.INFO,
    enableConsole: false,
    enableStorage: true,
    enableRemote: true,
    remoteEndpoint: '/api/logs',
  });
}

export default logger;
