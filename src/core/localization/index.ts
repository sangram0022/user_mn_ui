/**
 * Localization Module - Central Export
 * 
 * Single import point for all localization functionality.
 * 
 * Usage:
 * ```typescript
 * import { translateError, translateValidation, TRANSLATION_KEYS } from '@/core/localization';
 * ```
 */

// Main i18n instance
export { default as i18n, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_NAMES, type SupportedLanguage } from './i18n';

// Translation keys
export { TRANSLATION_KEYS, type TranslationKey, type TranslationKeyString } from './translationKeys';

// Utilities
export {
  translateError,
  translateValidation,
  formatPlural,
  translateWithContext,
  translateDate,
  translateNumber,
  translateCurrency,
  translateRelativeTime,
  translationExists,
  getNamespaceTranslations,
} from './utilities';
