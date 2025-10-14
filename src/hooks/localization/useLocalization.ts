/**
 * Enhanced Localization Hook
 *
 * Provides comprehensive localization functionality including:
 * - Message interpolation with variables
 * - Formatted date/time/number display
 * - Error message handling from API responses
 * - Performance optimized with caching
 * - Type-safe message keys
 *
 * @author GitHub Copilot
 */

import { useCallback, useMemo } from 'react';
import { useLocalizationContext } from '../../contexts/LocalizationContext';
import type {
  ApiResponseWithMessage,
  DateFormatOptions,
  LocaleCode,
  MessageInterpolation,
  MessageKey,
  NumberFormatOptions,
  ValidationError,
} from '../../types/localization.types';

// ============================================================================
// Message Cache (for future use)
// ============================================================================

// Removed temporarily - will be implemented when needed for performance optimization

// ============================================================================
// Message Interpolation
// ============================================================================

interface InterpolationData {
  [key: string]: string | number | boolean | null | undefined;
}

function interpolateMessage(
  message: string,
  data?: InterpolationData,
  options?: { escapeValue?: boolean }
): string {
  if (!data || typeof message !== 'string') {
    return message;
  }

  const { escapeValue = true } = options || {};

  return message.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = data[key];

    if (value === null || value === undefined) {
      console.warn(`[Localization] Missing interpolation value for key: ${key}`);
      return match; // Return original placeholder if value is missing
    }

    let stringValue = String(value);

    // Basic XSS protection if escapeValue is true
    if (escapeValue && typeof value === 'string') {
      stringValue = stringValue
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }

    return stringValue;
  });
}

// ============================================================================
// Message Resolution
// ============================================================================

function getNestedMessage(messages: Record<string, unknown>, keyPath: string): string | undefined {
  if (!messages || typeof messages !== 'object') {
    return undefined;
  }

  const keys = keyPath.split('.');
  let current = messages as Record<string, unknown>;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key] as Record<string, unknown>;
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

// ============================================================================
// Localization Hook Interface
// ============================================================================

export interface UseLocalizationReturn {
  /** Current locale */
  locale: LocaleCode;

  /** Change locale */
  setLocale: (locale: LocaleCode) => void;

  /** Is right-to-left language */
  isRTL: boolean;

  /** Translate a message by key */
  t: (key: string, interpolation?: InterpolationData) => string;

  /** Format message with interpolation */
  formatMessage: (messageKey: MessageKey, interpolation?: MessageInterpolation) => string;

  /** Format API response message */
  formatApiMessage: (response: ApiResponseWithMessage) => string;

  /** Format validation errors */
  formatValidationErrors: (errors: ValidationError[]) => Record<string, string>;

  /** Format date */
  formatDate: (date: Date, options?: DateFormatOptions) => string;

  /** Format time */
  formatTime: (date: Date) => string;

  /** Format number */
  formatNumber: (number: number, options?: NumberFormatOptions) => string;

  /** Format currency */
  formatCurrency: (amount: number, currency?: string) => string;

  /** Format percentage */
  formatPercent: (value: number) => string;

  /** Format relative time (e.g., "2 hours ago") */
  formatRelativeTime: (date: Date) => string;

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: string | null;
}

// ============================================================================
// Main Localization Hook
// ============================================================================

export function useLocalization(): UseLocalizationReturn {
  const context = useLocalizationContext();
  const { locale, setLocale, messages, isRTL, isLoading, error } = context;

  /**
   * Translate a message by key with optional interpolation
   */
  const t = useCallback(
    (key: string, interpolation?: InterpolationData): string => {
      try {
        // Get message from loaded messages
        const message = getNestedMessage(messages, key);

        if (!message) {
          console.warn(`[Localization] Missing translation for key: ${key}`);
          return key; // Return key as fallback
        }

        // Apply interpolation if provided
        if (interpolation) {
          return interpolateMessage(message, interpolation);
        }

        return message;
      } catch (err) {
        console.error(`[Localization] Translation error for key: ${key}`, err);
        return key; // Return key as fallback
      }
    },
    [messages]
  );

  /**
   * Format message with type-safe key and interpolation
   */
  const formatMessage = useCallback(
    (messageKey: MessageKey, interpolation?: MessageInterpolation): string => {
      return t(messageKey, interpolation);
    },
    [t]
  );

  /**
   * Format API response message
   */
  const formatApiMessage = useCallback(
    (response: ApiResponseWithMessage): string => {
      try {
        // Check for messageKey in response
        if (response.messageKey) {
          return t(response.messageKey, response.messageData as InterpolationData);
        }

        // Fallback to direct message
        if (response.message) {
          return response.message;
        }

        // Default fallback
        return t('messages.default');
      } catch (err) {
        console.error('[Localization] Failed to format API message:', err);
        return response.message || 'An error occurred';
      }
    },
    [t]
  );

  /**
   * Format validation errors
   */
  const formatValidationErrors = useCallback(
    (errors: ValidationError[]): Record<string, string> => {
      const formattedErrors: Record<string, string> = {};

      for (const error of errors) {
        try {
          let message: string;

          if (error.messageKey) {
            message = t(error.messageKey, error.messageData);
          } else {
            message = error.message;
          }

          formattedErrors[error.field] = message;
        } catch (err) {
          console.error('[Localization] Failed to format validation error:', err);
          formattedErrors[error.field] = error.message || 'Invalid input';
        }
      }

      return formattedErrors;
    },
    [t]
  );

  // Memoized formatters
  const formatters = useMemo(
    () => ({
      date: new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      dateShort: new Intl.DateTimeFormat(locale, {
        year: '2-digit',
        month: 'short',
        day: 'numeric',
      }),
      time: new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
      }),
      number: new Intl.NumberFormat(locale),
      currency: new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
      }),
      percent: new Intl.NumberFormat(locale, {
        style: 'percent',
      }),
      relativeTime: new Intl.RelativeTimeFormat(locale, {
        numeric: 'auto',
      }),
    }),
    [locale]
  );

  /**
   * Format date with options
   */
  const formatDate = useCallback(
    (date: Date, options?: DateFormatOptions): string => {
      if (options) {
        const formatter = new Intl.DateTimeFormat(locale, options);
        return formatter.format(date);
      }
      return formatters.date.format(date);
    },
    [locale, formatters.date]
  );

  /**
   * Format time
   */
  const formatTime = useCallback(
    (date: Date): string => {
      return formatters.time.format(date);
    },
    [formatters.time]
  );

  /**
   * Format number with options
   */
  const formatNumber = useCallback(
    (number: number, options?: NumberFormatOptions): string => {
      if (options) {
        const formatter = new Intl.NumberFormat(locale, options);
        return formatter.format(number);
      }
      return formatters.number.format(number);
    },
    [locale, formatters.number]
  );

  /**
   * Format currency
   */
  const formatCurrency = useCallback(
    (amount: number, currency = 'USD'): string => {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      });
      return formatter.format(amount);
    },
    [locale]
  );

  /**
   * Format percentage
   */
  const formatPercent = useCallback(
    (value: number): string => {
      return formatters.percent.format(value / 100);
    },
    [formatters.percent]
  );

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  const formatRelativeTime = useCallback(
    (date: Date): string => {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (Math.abs(diffInSeconds) < 60) {
        return formatters.relativeTime.format(-diffInSeconds, 'second');
      }

      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (Math.abs(diffInMinutes) < 60) {
        return formatters.relativeTime.format(-diffInMinutes, 'minute');
      }

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (Math.abs(diffInHours) < 24) {
        return formatters.relativeTime.format(-diffInHours, 'hour');
      }

      const diffInDays = Math.floor(diffInHours / 24);
      if (Math.abs(diffInDays) < 30) {
        return formatters.relativeTime.format(-diffInDays, 'day');
      }

      const diffInMonths = Math.floor(diffInDays / 30);
      if (Math.abs(diffInMonths) < 12) {
        return formatters.relativeTime.format(-diffInMonths, 'month');
      }

      const diffInYears = Math.floor(diffInMonths / 12);
      return formatters.relativeTime.format(-diffInYears, 'year');
    },
    [formatters.relativeTime]
  );

  return {
    locale,
    setLocale,
    isRTL,
    t,
    formatMessage,
    formatApiMessage,
    formatValidationErrors,
    formatDate,
    formatTime,
    formatNumber,
    formatCurrency,
    formatPercent,
    formatRelativeTime,
    isLoading,
    error,
  };
}

// ============================================================================
// Default Export
// ============================================================================

export default useLocalization;
