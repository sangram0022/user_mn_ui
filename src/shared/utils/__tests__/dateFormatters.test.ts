/**
 * Unit tests for dateFormatters utility functions
 * Tests all date formatting functions with edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatShortDate,
  formatLongDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  formatTimeAgo,
  formatExcelDate,
  formatISODate,
  formatFilenameDate,
  parseDate,
  isValidDate,
  isToday,
  isWithinDays,
  isInPast,
  isInFuture,
  DATE_FORMAT_CONSTANTS,
  type DateInput,
} from '../dateFormatters';

describe('dateFormatters', () => {
  let testDate: Date;

  beforeEach(() => {
    // Use a fixed date for consistent testing
    testDate = new Date('2024-01-15T10:30:00Z');
  });

  describe('formatShortDate', () => {
    it('should format date as MM/DD/YYYY', () => {
      const result = formatShortDate(testDate);
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it('should handle null date', () => {
      expect(formatShortDate(null)).toBe('N/A');
    });

    it('should handle undefined date', () => {
      expect(formatShortDate(undefined)).toBe('N/A');
    });

    it('should handle string date', () => {
      const result = formatShortDate('2024-01-15');
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it('should handle timestamp', () => {
      const result = formatShortDate(testDate.getTime());
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it('should handle invalid date string', () => {
      expect(formatShortDate('invalid-date')).toBe('Invalid date');
    });

    it('should handle custom locale', () => {
      const result = formatShortDate(testDate, 'en-GB');
      expect(result).toBeTruthy();
    });
  });

  describe('formatLongDate', () => {
    it('should format date in long format', () => {
      const result = formatLongDate(testDate);
      expect(result).toContain('January');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should handle null date', () => {
      expect(formatLongDate(null)).toBe('N/A');
    });

    it('should handle undefined date', () => {
      expect(formatLongDate(undefined)).toBe('N/A');
    });

    it('should handle invalid date', () => {
      expect(formatLongDate('not-a-date')).toBe('Invalid date');
    });

    it('should handle custom locale', () => {
      const result = formatLongDate(testDate, 'fr-FR');
      expect(result).toBeTruthy();
    });
  });

  describe('formatDateTime', () => {
    it('should format date with time', () => {
      const result = formatDateTime(testDate);
      expect(result).toBeTruthy();
      // Should contain date and time components
      expect(result.length).toBeGreaterThan(10);
    });

    it('should handle null date', () => {
      expect(formatDateTime(null)).toBe('N/A');
    });

    it('should handle undefined date', () => {
      expect(formatDateTime(undefined)).toBe('N/A');
    });

    it('should handle invalid date', () => {
      expect(formatDateTime('bad-date')).toBe('Invalid date');
    });

    it('should use custom format options', () => {
      const result = formatDateTime(testDate, 'en-US', {
        hour12: false,
      });
      expect(result).toBeTruthy();
    });
  });

  describe('formatRelativeTime', () => {
    it('should format recent date as "just now"', () => {
      const recent = new Date(Date.now() - 30000); // 30 seconds ago
      const result = formatRelativeTime(recent);
      expect(result).toBe('just now');
    });

    it('should format minutes ago', () => {
      const minutes = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      const result = formatRelativeTime(minutes);
      expect(result).toContain('minute');
    });

    it('should format hours ago', () => {
      const hours = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
      const result = formatRelativeTime(hours);
      expect(result).toContain('hour');
    });

    it('should format days ago', () => {
      const days = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      const result = formatRelativeTime(days);
      expect(result).toContain('day');
    });

    it('should handle null date', () => {
      expect(formatRelativeTime(null)).toBe('N/A');
    });

    it('should handle future dates', () => {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      const result = formatRelativeTime(future);
      expect(result).toContain('in');
    });
  });

  describe('formatTimeAgo', () => {
    it('should format seconds ago', () => {
      const recent = new Date(Date.now() - 30000); // 30 seconds ago
      const result = formatTimeAgo(recent);
      expect(result).toBe('30 seconds ago');
    });

    it('should format 1 second correctly', () => {
      const oneSecond = new Date(Date.now() - 1000);
      const result = formatTimeAgo(oneSecond);
      expect(result).toBe('1 second ago');
    });

    it('should format minutes ago', () => {
      const minutes = new Date(Date.now() - 5 * 60 * 1000);
      const result = formatTimeAgo(minutes);
      expect(result).toBe('5 minutes ago');
    });

    it('should format 1 minute correctly', () => {
      const oneMinute = new Date(Date.now() - 60 * 1000);
      const result = formatTimeAgo(oneMinute);
      expect(result).toBe('1 minute ago');
    });

    it('should format hours ago', () => {
      const hours = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const result = formatTimeAgo(hours);
      expect(result).toBe('3 hours ago');
    });

    it('should format days ago', () => {
      const days = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const result = formatTimeAgo(days);
      expect(result).toBe('2 days ago');
    });

    it('should format months ago', () => {
      const months = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
      const result = formatTimeAgo(months);
      expect(result).toBe('1 month ago');
    });

    it('should format years ago', () => {
      const years = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);
      const result = formatTimeAgo(years);
      expect(result).toBe('1 year ago');
    });

    it('should handle null date', () => {
      expect(formatTimeAgo(null)).toBe('N/A');
    });

    it('should handle invalid date', () => {
      expect(formatTimeAgo('invalid')).toBe('Invalid date');
    });
  });

  describe('parseDate', () => {
    it('should parse Date object', () => {
      const result = parseDate(testDate);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(testDate.getTime());
    });

    it('should parse timestamp', () => {
      const timestamp = testDate.getTime();
      const result = parseDate(timestamp);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(timestamp);
    });

    it('should parse ISO string', () => {
      const isoString = testDate.toISOString();
      const result = parseDate(isoString);
      expect(result).toBeInstanceOf(Date);
    });

    it('should handle null', () => {
      expect(parseDate(null)).toBeNull();
    });

    it('should handle undefined', () => {
      expect(parseDate(undefined)).toBeNull();
    });

    it('should handle invalid string', () => {
      expect(parseDate('not-a-date')).toBeNull();
    });

    it('should handle invalid number', () => {
      expect(parseDate(NaN)).toBeNull();
    });
  });

  describe('isToday', () => {
    it('should return true for current date', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(isToday(tomorrow)).toBe(false);
    });

    it('should handle null date', () => {
      expect(isToday(null)).toBe(false);
    });

    it('should handle invalid date', () => {
      expect(isToday('invalid')).toBe(false);
    });
  });

  describe('isWithinDays', () => {
    it('should return true for date within range', () => {
      const withinRange = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      expect(isWithinDays(withinRange, 7)).toBe(true);
    });

    it('should return false for date outside range', () => {
      const outsideRange = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      expect(isWithinDays(outsideRange, 7)).toBe(false);
    });

    it('should handle today', () => {
      expect(isWithinDays(new Date(), 1)).toBe(true);
    });

    it('should handle null date', () => {
      expect(isWithinDays(null, 7)).toBe(false);
    });

    it('should handle zero days', () => {
      expect(isWithinDays(new Date(), 0)).toBe(true);
    });
  });

  describe('isInPast', () => {
    it('should return true for past date', () => {
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isInPast(past)).toBe(true);
    });

    it('should return false for future date', () => {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(isInPast(future)).toBe(false);
    });

    it('should handle null date', () => {
      expect(isInPast(null)).toBe(false);
    });

    it('should handle invalid date', () => {
      expect(isInPast('bad-date')).toBe(false);
    });
  });

  describe('isInFuture', () => {
    it('should return true for future date', () => {
      const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(isInFuture(future)).toBe(true);
    });

    it('should return false for past date', () => {
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isInFuture(past)).toBe(false);
    });

    it('should handle null date', () => {
      expect(isInFuture(null)).toBe(false);
    });
  });

  describe('getDaysDifference', () => {
    it('should calculate days difference', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-10');
      expect(getDaysDifference(date1, date2)).toBe(9);
    });

    it('should handle negative difference', () => {
      const date1 = new Date('2024-01-10');
      const date2 = new Date('2024-01-01');
      expect(getDaysDifference(date1, date2)).toBe(-9);
    });

    it('should handle same date', () => {
      const date = new Date('2024-01-01');
      expect(getDaysDifference(date, date)).toBe(0);
    });

    it('should handle null dates', () => {
      expect(getDaysDifference(null, new Date())).toBe(0);
      expect(getDaysDifference(new Date(), null)).toBe(0);
    });
  });

  describe('getMonthsDifference', () => {
    it('should calculate months difference', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-04-15');
      expect(getMonthsDifference(date1, date2)).toBe(3);
    });

    it('should handle year boundary', () => {
      const date1 = new Date('2023-11-15');
      const date2 = new Date('2024-02-15');
      expect(getMonthsDifference(date1, date2)).toBe(3);
    });

    it('should handle null dates', () => {
      expect(getMonthsDifference(null, new Date())).toBe(0);
    });
  });

  describe('getYearsDifference', () => {
    it('should calculate years difference', () => {
      const date1 = new Date('2020-01-15');
      const date2 = new Date('2024-01-15');
      expect(getYearsDifference(date1, date2)).toBe(4);
    });

    it('should handle same year', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-12-15');
      expect(getYearsDifference(date1, date2)).toBe(0);
    });

    it('should handle null dates', () => {
      expect(getYearsDifference(null, new Date())).toBe(0);
    });
  });

  describe('formatDuration', () => {
    it('should format milliseconds', () => {
      expect(formatDuration(500)).toBe('500ms');
    });

    it('should format seconds', () => {
      expect(formatDuration(5000)).toBe('5s');
    });

    it('should format minutes', () => {
      expect(formatDuration(5 * 60 * 1000)).toBe('5m');
    });

    it('should format hours', () => {
      expect(formatDuration(3 * 60 * 60 * 1000)).toBe('3h');
    });

    it('should format days', () => {
      expect(formatDuration(2 * 24 * 60 * 60 * 1000)).toBe('2d');
    });

    it('should format combined durations', () => {
      const duration = 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000 + 30 * 60 * 1000;
      const result = formatDuration(duration);
      expect(result).toContain('2d');
      expect(result).toContain('3h');
      expect(result).toContain('30m');
    });

    it('should handle zero duration', () => {
      expect(formatDuration(0)).toBe('0ms');
    });

    it('should handle negative duration', () => {
      expect(formatDuration(-1000)).toBe('0ms');
    });
  });

  describe('formatISODate', () => {
    it('should format date as ISO string', () => {
      const result = formatISODate(testDate);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });

    it('should handle null date', () => {
      expect(formatISODate(null)).toBe('N/A');
    });

    it('should handle invalid date', () => {
      expect(formatISODate('not-a-date')).toBe('Invalid date');
    });

    it('should parse string date first', () => {
      const result = formatISODate('2024-01-15');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('DATE_FORMAT_CONSTANTS', () => {
    it('should have correct day milliseconds', () => {
      expect(DATE_FORMAT_CONSTANTS.DAY_IN_MS).toBe(24 * 60 * 60 * 1000);
    });

    it('should have correct hour milliseconds', () => {
      expect(DATE_FORMAT_CONSTANTS.HOUR_IN_MS).toBe(60 * 60 * 1000);
    });

    it('should have correct minute milliseconds', () => {
      expect(DATE_FORMAT_CONSTANTS.MINUTE_IN_MS).toBe(60 * 1000);
    });

    it('should have correct second milliseconds', () => {
      expect(DATE_FORMAT_CONSTANTS.SECOND_IN_MS).toBe(1000);
    });
  });
});
