/**
 * Date Formatting Utilities
 *
 * Common date/time formatting functions extracted from repeated patterns
 * across the codebase for consistency and maintainability.
 *
 * @module dateUtils
 */

/**
 * Formats a date string or Date object to localized date string
 *
 * @param date - Date string or Date object
 * @param locale - Optional locale (defaults to user's locale)
 * @returns Formatted date string
 *
 * @example
 * formatDate('2024-01-15T10:30:00Z') // "1/15/2024"
 */
export function formatDate(date: string | Date, locale?: string): string {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale);
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Formats a date string or Date object to localized time string
 *
 * @param date - Date string or Date object
 * @param locale - Optional locale (defaults to user's locale)
 * @returns Formatted time string
 *
 * @example
 * formatTime('2024-01-15T10:30:00Z') // "10:30:00 AM"
 */
export function formatTime(date: string | Date, locale?: string): string {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString(locale);
  } catch {
    return 'Invalid Time';
  }
}

/**
 * Formats a date string or Date object to localized date and time string
 *
 * @param date - Date string or Date object
 * @param locale - Optional locale (defaults to user's locale)
 * @returns Formatted date and time string
 *
 * @example
 * formatDateTime('2024-01-15T10:30:00Z') // "1/15/2024, 10:30:00 AM"
 */
export function formatDateTime(date: string | Date, locale?: string): string {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString(locale);
  } catch {
    return 'Invalid DateTime';
  }
}

/**
 * Formats a timestamp into separate date and time objects
 * Commonly used in audit logs and activity feeds
 *
 * @param timestamp - Date string or Date object
 * @param locale - Optional locale (defaults to user's locale)
 * @returns Object with separate date and time strings
 *
 * @example
 * formatTimestamp('2024-01-15T10:30:00Z')
 * // { date: "1/15/2024", time: "10:30:00 AM" }
 */
export function formatTimestamp(
  timestamp: string | Date,
  locale?: string
): { date: string; time: string } {
  if (!timestamp) {
    return { date: 'N/A', time: 'N/A' };
  }

  try {
    const dateObj = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return {
      date: dateObj.toLocaleDateString(locale),
      time: dateObj.toLocaleTimeString(locale),
    };
  } catch {
    return { date: 'Invalid Date', time: 'Invalid Time' };
  }
}

/**
 * Formats a date with a relative time string (e.g., "2 hours ago")
 *
 * @param date - Date string or Date object
 * @returns Relative time string
 *
 * @example
 * formatRelativeTime('2024-01-15T10:30:00Z') // "2 hours ago"
 */
export function formatRelativeTime(date: string | Date): string {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 30) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
      return dateObj.toLocaleDateString();
    }
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Formats a date range
 *
 * @param startDate - Start date string or Date object
 * @param endDate - End date string or Date object
 * @param locale - Optional locale (defaults to user's locale)
 * @returns Formatted date range string
 *
 * @example
 * formatDateRange('2024-01-15', '2024-01-20') // "1/15/2024 - 1/20/2024"
 */
export function formatDateRange(
  startDate: string | Date,
  endDate: string | Date,
  locale?: string
): string {
  const start = formatDate(startDate, locale);
  const end = formatDate(endDate, locale);

  if (start === 'N/A' || end === 'N/A') {
    return 'Invalid Date Range';
  }

  return `${start} - ${end}`;
}

/**
 * Checks if a date is valid
 *
 * @param date - Date string or Date object
 * @returns True if valid, false otherwise
 *
 * @example
 * isValidDate('2024-01-15') // true
 * isValidDate('invalid') // false
 */
export function isValidDate(date: string | Date): boolean {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(dateObj.getTime());
  } catch {
    return false;
  }
}
