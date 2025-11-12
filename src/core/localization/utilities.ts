/**
 * Localization Utilities
 * 
 * Helper functions for common localization patterns.
 * Provides type-safe wrappers around i18next functions.
 */

import { t } from 'i18next';
import { TRANSLATION_KEYS } from './translationKeys';

/**
 * Translate error code to user-friendly message
 * 
 * @example
 * ```typescript
 * const message = translateError('UNAUTHORIZED');
 * // "You are not authorized to perform this action"
 * ```
 */
export function translateError(errorCode: string, params?: Record<string, unknown>): string {
  const key = `errors.${errorCode}`;
  const translated = t(key, params);
  
  // Fallback to UNKNOWN error if translation not found
  if (translated === key) {
    return t(TRANSLATION_KEYS.errors.UNKNOWN, { defaultValue: 'An unknown error occurred' });
  }
  
  return translated;
}

/**
 * Translate validation error with field name
 * 
 * @example
 * ```typescript
 * const message = translateValidation('email', 'required');
 * // "Email is required"
 * 
 * const message2 = translateValidation('password', 'minLength', { count: 8 });
 * // "Password must be at least 8 characters"
 * ```
 */
export function translateValidation(
  fieldKey: string,
  ruleKey: string,
  params?: Record<string, unknown>
): string {
  const fieldName = t(`fields.${fieldKey}`, { defaultValue: fieldKey });
  const validationKey = `validation.${ruleKey}`;
  
  return t(validationKey, { 
    field: fieldName,
    ...params,
  });
}

/**
 * Format plural with count
 * Handles pluralization rules automatically
 * 
 * @example
 * ```typescript
 * const message = formatPlural('users.count', 0);
 * // "No users"
 * 
 * const message2 = formatPlural('users.count', 1);
 * // "1 user"
 * 
 * const message3 = formatPlural('users.count', 5);
 * // "5 users"
 * ```
 */
export function formatPlural(key: string, count: number, params?: Record<string, unknown>): string {
  return t(key, { count, ...params });
}

/**
 * Translate with context
 * Allows different translations based on context
 * 
 * @example
 * ```typescript
 * const message = translateWithContext('button.delete', 'user');
 * // "Delete User"
 * 
 * const message2 = translateWithContext('button.delete', 'file');
 * // "Delete File"
 * ```
 */
export function translateWithContext(
  key: string,
  context: string,
  params?: Record<string, unknown>
): string {
  return t(key, { context, ...params });
}

/**
 * Translate date format based on locale
 * 
 * @example
 * ```typescript
 * const date = new Date('2025-01-15');
 * const formatted = translateDate(date, 'short');
 * // "01/15/2025" (en-US)
 * // "15/01/2025" (en-GB)
 * ```
 */
export function translateDate(
  date: Date,
  format: 'short' | 'long' | 'full' = 'short',
  locale?: string
): string {
  const localeToUse = locale || document.documentElement.lang || 'en-US';
  
  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  };
  
  const options = formatOptions[format];
  
  return new Intl.DateTimeFormat(localeToUse, options).format(date);
}

/**
 * Translate number format based on locale
 * 
 * @example
 * ```typescript
 * const formatted = translateNumber(1234.56);
 * // "1,234.56" (en-US)
 * // "1.234,56" (de-DE)
 * ```
 */
export function translateNumber(
  number: number,
  options?: Intl.NumberFormatOptions,
  locale?: string
): string {
  const localeToUse = locale || document.documentElement.lang || 'en-US';
  return new Intl.NumberFormat(localeToUse, options).format(number);
}

/**
 * Translate currency amount
 * 
 * @example
 * ```typescript
 * const formatted = translateCurrency(1234.56, 'USD');
 * // "$1,234.56" (en-US)
 * // "1.234,56 $" (de-DE)
 * ```
 */
export function translateCurrency(
  amount: number,
  currency: string,
  locale?: string
): string {
  return translateNumber(amount, {
    style: 'currency',
    currency,
  }, locale);
}

/**
 * Translate relative time
 * 
 * @example
 * ```typescript
 * const date = new Date(Date.now() - 3600000); // 1 hour ago
 * const formatted = translateRelativeTime(date);
 * // "1 hour ago"
 * ```
 */
export function translateRelativeTime(date: Date, locale?: string): string {
  const localeToUse = locale || document.documentElement.lang || 'en-US';
  const rtf = new Intl.RelativeTimeFormat(localeToUse, { numeric: 'auto' });
  
  const now = Date.now();
  const diff = date.getTime() - now;
  const absDiff = Math.abs(diff);
  
  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) {
    return rtf.format(diff > 0 ? years : -years, 'year');
  }
  if (months > 0) {
    return rtf.format(diff > 0 ? months : -months, 'month');
  }
  if (days > 0) {
    return rtf.format(diff > 0 ? days : -days, 'day');
  }
  if (hours > 0) {
    return rtf.format(diff > 0 ? hours : -hours, 'hour');
  }
  if (minutes > 0) {
    return rtf.format(diff > 0 ? minutes : -minutes, 'minute');
  }
  return rtf.format(diff > 0 ? seconds : -seconds, 'second');
}

/**
 * Check if translation key exists
 * Useful for conditional rendering
 * 
 * @example
 * ```typescript
 * if (translationExists('users.deleteSuccess')) {
 *   showMessage(t('users.deleteSuccess'));
 * }
 * ```
 */
export function translationExists(key: string): boolean {
  const translated = t(key);
  return translated !== key;
}

/**
 * Get all translations for a namespace
 * Useful for populating dropdowns, etc.
 * 
 * @example
 * ```typescript
 * const roles = getNamespaceTranslations('roles');
 * // { admin: "Administrator", user: "User", ... }
 * ```
 * 
 * @deprecated Not implemented yet - will be added in future version
 */
export function getNamespaceTranslations(namespace: string): Record<string, string> {
  // TODO: Implement based on i18n setup
  if (namespace) {
    // Placeholder for future implementation
  }
  return {};
}
