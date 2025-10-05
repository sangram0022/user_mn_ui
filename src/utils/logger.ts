/**
 * Application logging utility.
 * Provides consistent logging behavior and automatically silences logs in production builds.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = import.meta.env.DEV;
const namespace = '[UserMN]';

const emit = (level: LogLevel, ...args: unknown[]): void => {
  if (!isDevelopment && level === 'debug') {
    return;
  }

  const consoleMethod: keyof Console = level === 'info' ? 'log' : level;

  if (typeof console[consoleMethod] === 'function') {
    console[consoleMethod](namespace, ...args);
  }
};

export const logger = {
  debug: (...args: unknown[]) => emit('debug', ...args),
  info: (...args: unknown[]) => emit('info', ...args),
  warn: (...args: unknown[]) => emit('warn', ...args),
  error: (...args: unknown[]) => emit('error', ...args),
};

export default logger;
