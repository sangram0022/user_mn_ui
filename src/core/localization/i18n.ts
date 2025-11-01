/**
 * ========================================
 * i18n Configuration - Industry Standard
 * ========================================
 * 
 * Simple, flat structure using JSON files in /public/locales
 * This is the approach used by:
 * - Google, Facebook, Airbnb, Stripe, etc.
 * - Scalable to thousands of keys
 * - Easy to manage and maintain
 * - Fast loading with code splitting
 * 
 * Structure:
 * /public/locales/
 *   /en/
 *     translation.json  <- All translations in one flat file
 *   /es/
 *     translation.json
 *   /fr/
 *     translation.json
 * 
 * Usage:
 * const { t } = useTranslation();
 * t('auth.login.title')       // "Welcome Back"
 * t('common.save')            // "Save"
 * t('validation.required')    // "This field is required"
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Supported languages
export const SUPPORTED_LANGUAGES = ['en'] as const;
export const DEFAULT_LANGUAGE = 'en';
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Language display names
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  // Add more: es: 'Español', fr: 'Français', etc.
};

// Initialize i18next
i18n
  .use(HttpBackend) // Load translations from /public/locales
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass to React
  .init({
    // Default language
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    
    // Load translations from public folder
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // Single namespace for simplicity
    ns: ['translation'],
    defaultNS: 'translation',
    
    // Language detection
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    
    // Interpolation
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    // React options
    react: {
      useSuspense: false, // Load synchronously for simplicity
    },
    
    // Development
    debug: false, // Set to true for debugging
    
    // Key separator for nested keys
    keySeparator: '.',
    
    // Return key if missing (for debugging)
    returnNull: false,
    returnEmptyString: false,
  });

export default i18n;
