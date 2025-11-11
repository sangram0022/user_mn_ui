/**
 * Date Formatting Utilities
 * Single source of truth for all date formatting
 * 
 * @module dateFormatters
 * @example
 * import { formatShortDate, formatRelativeTime } from '@/shared/utils/dateFormatters';
 * 
 * console.log(formatShortDate(user.createdAt)); // "Jan 15, 2024"
 * console.log(formatRelativeTime(user.lastLogin)); // "2 days ago"
 */

// ============================================================================
// Types
// ============================================================================

export type DateInput = Date | string | number;

export interface DateFormatOptions {
  locale?: string;
  timeZone?: string;
}

// ============================================================================
// Core Date Formatters
// ============================================================================

/**
 * Format date in short format
 * 
 * @param date - Date to format (Date object, ISO string, or timestamp)
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 * 
 * @example
 * formatShortDate('2024-01-15T10:30:00Z') // "Jan 15, 2024"
 * formatShortDate(new Date()) // "Nov 3, 2025"
 */
export function formatShortDate(
  date: DateInput, 
  options: DateFormatOptions = {}
): string {
  const d = parseDate(date);
  const locale = options.locale || 'en-US';
  
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: options.timeZone,
  });
}

/**
 * Format date with time
 * 
 * @param date - Date to format
 * @returns Formatted date-time string (e.g., "Jan 15, 2024 10:30 AM")
 * 
 * @example
 * formatDateTime('2024-01-15T10:30:00Z') // "Jan 15, 2024 10:30 AM"
 */
export function formatDateTime(
  date: DateInput,
  options: DateFormatOptions = {}
): string {
  const d = parseDate(date);
  const locale = options.locale || 'en-US';
  
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: options.timeZone,
  });
}

/**
 * Format date in long format
 * 
 * @param date - Date to format
 * @returns Formatted date string (e.g., "Monday, January 15, 2024")
 * 
 * @example
 * formatLongDate('2024-01-15') // "Monday, January 15, 2024"
 */
export function formatLongDate(
  date: DateInput,
  options: DateFormatOptions = {}
): string {
  const d = parseDate(date);
  const locale = options.locale || 'en-US';
  
  return d.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: options.timeZone,
  });
}

/**
 * Format time only
 * 
 * @param date - Date to format
 * @returns Formatted time string (e.g., "10:30 AM")
 * 
 * @example
 * formatTime('2024-01-15T10:30:00Z') // "10:30 AM"
 */
export function formatTime(
  date: DateInput,
  options: DateFormatOptions = {}
): string {
  const d = parseDate(date);
  const locale = options.locale || 'en-US';
  
  return d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: options.timeZone,
  });
}

// ============================================================================
// Relative Time Formatters
// ============================================================================

/**
 * Format relative time
 * 
 * @param date - Date to format
 * @returns Human-readable relative time (e.g., "2 days ago", "Yesterday")
 * 
 * @example
 * formatRelativeTime(new Date(Date.now() - 86400000)) // "Yesterday"
 * formatRelativeTime(new Date(Date.now() - 172800000)) // "2 days ago"
 */
export function formatRelativeTime(date: DateInput): string {
  const d = parseDate(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  const years = Math.floor(diffDays / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

/**
 * Format time ago in short format
 * 
 * @param date - Date to format
 * @returns Short relative time (e.g., "2m", "3h", "5d")
 * 
 * @example
 * formatTimeAgo(new Date(Date.now() - 120000)) // "2m"
 * formatTimeAgo(new Date(Date.now() - 7200000)) // "2h"
 */
export function formatTimeAgo(date: DateInput): string {
  const d = parseDate(date);
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffSeconds < 60) return `${diffSeconds}s`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h`;
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d`;
  if (diffSeconds < 2592000) return `${Math.floor(diffSeconds / 604800)}w`;
  return formatShortDate(d);
}

// ============================================================================
// Special Format Utilities
// ============================================================================

/**
 * Format date for Excel export
 * 
 * @param date - Date to format
 * @returns Excel-friendly date string (YYYY-MM-DD HH:MM)
 * 
 * @example
 * formatExcelDate(new Date()) // "2025-11-03 10:30"
 */
export function formatExcelDate(date: DateInput): string {
  const d = parseDate(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Format date for API (ISO 8601)
 * 
 * @param date - Date to format
 * @returns ISO 8601 date string
 * 
 * @example
 * formatISODate(new Date()) // "2025-11-03T10:30:00.000Z"
 */
export function formatISODate(date: DateInput): string {
  const d = parseDate(date);
  return d.toISOString();
}

/**
 * Format date for filename (safe characters)
 * 
 * @param date - Date to format
 * @returns Filename-safe date string (YYYY-MM-DD)
 * 
 * @example
 * formatFilenameDate(new Date()) // "2025-11-03"
 */
export function formatFilenameDate(date: DateInput): string {
  const d = parseDate(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ============================================================================
// Date Validation and Parsing
// ============================================================================

/**
 * Parse date from various input types
 * 
 * @param date - Date input (Date, string, or timestamp)
 * @returns Date object
 * @throws Error if date is invalid
 * 
 * @example
 * parseDate('2024-01-15') // Date object
 * parseDate(1705334400000) // Date object
 * parseDate(new Date()) // Date object (passthrough)
 */
export function parseDate(date: DateInput): Date {
  if (date instanceof Date) {
    if (isNaN(date.getTime())) {
      throw new Error('Invalid Date object');
    }
    return date;
  }
  
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date input: ${date}`);
  }
  
  return parsed;
}

/**
 * Check if date is valid
 * 
 * @param date - Date to check
 * @returns True if date is valid
 * 
 * @example
 * isValidDate('2024-01-15') // true
 * isValidDate('invalid') // false
 */
export function isValidDate(date: DateInput): boolean {
  try {
    parseDate(date);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if date is today
 * 
 * @param date - Date to check
 * @returns True if date is today
 * 
 * @example
 * isToday(new Date()) // true
 * isToday(new Date(Date.now() - 86400000)) // false
 */
export function isToday(date: DateInput): boolean {
  const d = parseDate(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

/**
 * Check if date is within last N days
 * 
 * @param date - Date to check
 * @param days - Number of days to check
 * @returns True if date is within last N days
 * 
 * @example
 * isWithinDays(new Date(), 7) // true
 * isWithinDays(new Date(Date.now() - 604800000), 7) // true
 */
export function isWithinDays(date: DateInput, days: number): boolean {
  const d = parseDate(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
}

/**
 * Check if date is in the past
 * 
 * @param date - Date to check
 * @returns True if date is in the past
 * 
 * @example
 * isInPast(new Date(Date.now() - 86400000)) // true
 * isInPast(new Date(Date.now() + 86400000)) // false
 */
export function isInPast(date: DateInput): boolean {
  const d = parseDate(date);
  return d.getTime() < Date.now();
}

/**
 * Check if date is in the future
 * 
 * @param date - Date to check
 * @returns True if date is in the future
 * 
 * @example
 * isInFuture(new Date(Date.now() + 86400000)) // true
 * isInFuture(new Date(Date.now() - 86400000)) // false
 */
export function isInFuture(date: DateInput): boolean {
  const d = parseDate(date);
  return d.getTime() > Date.now();
}

// ============================================================================
// Duration and Countdown Formatters
// ============================================================================

/**
 * Format duration from milliseconds to human-readable string
 * 
 * @param milliseconds - Duration in milliseconds
 * @returns Human-readable duration (e.g., "2 minutes 30 seconds", "5 seconds")
 * 
 * @example
 * formatDuration(90000) // "1 minute 30 seconds"
 * formatDuration(5000) // "5 seconds"
 * formatDuration(3600000) // "1 hour"
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return days === 1 ? '1 day' : `${days} days`;
  if (hours > 0) return hours === 1 ? '1 hour' : `${hours} hours`;
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    if (remainingSeconds > 0) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ${remainingSeconds} ${remainingSeconds === 1 ? 'second' : 'seconds'}`;
    }
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  }
  return seconds === 1 ? '1 second' : `${seconds} seconds`;
}

/**
 * Format countdown time in MM:SS or HH:MM:SS format
 * 
 * @param seconds - Time remaining in seconds
 * @returns Formatted countdown (e.g., "1:30", "0:05", "1:23:45")
 * 
 * @example
 * formatCountdown(90) // "1:30"
 * formatCountdown(5) // "0:05"
 * formatCountdown(3665) // "1:01:05"
 */
export function formatCountdown(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Alias for formatDuration for backward compatibility
 * @deprecated Use formatDuration instead
 */
export const formatTimeRemaining = formatDuration;

// ============================================================================
// Constants
// ============================================================================

export const DATE_FORMAT_CONSTANTS = {
  DAY_MS: 24 * 60 * 60 * 1000,
  HOUR_MS: 60 * 60 * 1000,
  MINUTE_MS: 60 * 1000,
  SECOND_MS: 1000,
} as const;
