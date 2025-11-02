/**
 * Logger Configuration
 * Environment-aware configuration for lightweight logging
 * Optimized for performance with minimal overhead
 */

import type { LoggerConfig, LogLevel } from './types.ts';
import { LOG_LEVELS } from './types.ts';

/** Get environment name from current environment */
const getEnvironment = (): 'development' | 'staging' | 'production' => {
  if (typeof window === 'undefined') return 'production';
  
  const isDev = import.meta.env.MODE === 'development';
  const isStaging = import.meta.env.MODE === 'staging';
  
  return isDev ? 'development' : isStaging ? 'staging' : 'production';
};

/** Get minimum log level based on environment */
const getLogLevel = (): LogLevel => {
  const env = getEnvironment();
  
  switch (env) {
    case 'development':
      return LOG_LEVELS.DEBUG;
    case 'staging':
      return LOG_LEVELS.INFO;
    case 'production':
      return LOG_LEVELS.WARN;
    default:
      return LOG_LEVELS.INFO;
  }
};

/** Default logger configuration - optimized for performance */
export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  environment: getEnvironment(),
  level: getLogLevel(),
  console: true, // Always log to console in development, errors only in production
  persistence: false, // Disabled by default to reduce memory usage
  maxLogs: 100, // Keep only recent logs in memory
  performanceTracking: import.meta.env.MODE === 'development', // Only in development
  structured: import.meta.env.MODE !== 'development', // Structured format in production
};

/** Log level hierarchy - lower values = higher priority */
const LOG_LEVEL_HIERARCHY: Record<LogLevel, number> = {
  FATAL: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
  TRACE: 5,
};

/**
 * Check if a log level should be displayed based on configured minimum level
 * @param level - Log level to check
 * @param minLevel - Minimum log level
 * @returns true if log should be displayed
 */
export const shouldLog = (level: LogLevel, minLevel: LogLevel): boolean => {
  return LOG_LEVEL_HIERARCHY[level] <= LOG_LEVEL_HIERARCHY[minLevel];
};

/**
 * Get color for console output based on log level (development only)
 * @param level - Log level
 * @returns CSS color string
 */
export const getColorForLevel = (level: LogLevel): string => {
  const colors: Record<LogLevel, string> = {
    FATAL: '#FF0000', // Red
    ERROR: '#FF3333', // Bright red
    WARN: '#FFA500', // Orange
    INFO: '#0066CC', // Blue
    DEBUG: '#00AA00', // Green
    TRACE: '#999999', // Gray
  };
  return colors[level];
};

/**
 * Get console method for log level
 * @param level - Log level
 * @returns console method name
 */
export const getConsoleMethod = (
  level: LogLevel
): 'log' | 'warn' | 'error' => {
  switch (level) {
    case LOG_LEVELS.ERROR:
    case LOG_LEVELS.FATAL:
      return 'error';
    case LOG_LEVELS.WARN:
      return 'warn';
    default:
      return 'log';
  }
};

/**
 * Format timestamp for logs
 * @returns ISO timestamp string
 */
export const formatTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Get source location from stack trace
 * @returns source location string
 */
export const getSourceLocation = (): string => {
  const stack = new Error().stack || '';
  const lines = stack.split('\n');
  
  if (lines.length > 3) {
    const callerLine = lines[3]; // Skip Error, formatTimestamp, getSourceLocation
    const match = callerLine.match(/at (.+) \(([^)]+)\)/);
    if (match) {
      const [, funcName, location] = match;
      return `${funcName} (${location})`;
    }
  }
  
  return 'unknown';
};
