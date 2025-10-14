/**
 * Localization Provider Component
 *
 * Provider component for localization context with message loading
 * and locale management functionality.
 *
 * @author GitHub Copilot
 */

import { useEffect, useState, type FC, type ReactNode } from 'react';
import type { LocaleCode, MessageBundle } from '../types/localization.types';
import { LocalizationContext, type LocalizationContextState } from './LocalizationContext';

// ============================================================================
// Provider Props
// ============================================================================

interface LocalizationProviderProps {
  children: ReactNode;
  defaultLocale?: LocaleCode;
  fallbackLocale?: LocaleCode;
}

// ============================================================================
// RTL Language Detection
// ============================================================================

const RTL_LANGUAGES: LocaleCode[] = ['ar'];

function isRTLLanguage(locale: LocaleCode): boolean {
  return RTL_LANGUAGES.includes(locale);
}

// ============================================================================
// Simple logger
// ============================================================================

const logger = {
  debug: (message: string, data?: unknown) => console.debug(`[Localization] ${message}`, data),
  info: (message: string, data?: unknown) => console.info(`[Localization] ${message}`, data),
  error: (message: string, data?: unknown) => console.error(`[Localization] ${message}`, data),
};

// ============================================================================
// Message Loading
// ============================================================================

async function loadLocaleMessages(locale: LocaleCode): Promise<MessageBundle> {
  try {
    // Load all message bundles for the locale
    const [common, admin, features, errors] = await Promise.all([
      import(`../locales/${locale}/common.json`).catch(() => ({ default: { messages: {} } })),
      import(`../locales/${locale}/admin.json`).catch(() => ({ default: {} })),
      import(`../locales/${locale}/features.json`).catch(() => ({ default: {} })),
      import(`../locales/${locale}/errors.json`).catch(() => ({ default: {} })),
    ]);

    // Merge all message bundles
    const messages: MessageBundle = {
      ...(common.default?.messages || {}),
      ...(admin.default || {}),
      ...(features.default || {}),
      ...(errors.default || {}),
    };

    logger.debug('Loaded messages for locale:', { locale, messageKeys: Object.keys(messages) });

    return messages;
  } catch (error) {
    logger.error('Failed to load locale messages:', { locale, error });
    throw error;
  }
}

// ============================================================================
// Locale Detection
// ============================================================================

function detectUserLocale(): LocaleCode {
  // Try localStorage first
  const storedLocale = localStorage.getItem('user-locale') as LocaleCode;
  if (
    storedLocale &&
    ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'hi', 'ar'].includes(storedLocale)
  ) {
    return storedLocale;
  }

  // Try browser language
  const browserLang = navigator.language.split('-')[0] as LocaleCode;
  if (['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'hi', 'ar'].includes(browserLang)) {
    return browserLang;
  }

  // Default to English
  return 'en';
}

function saveUserLocale(locale: LocaleCode): void {
  localStorage.setItem('user-locale', locale);
}

// ============================================================================
// Localization Provider Component
// ============================================================================

export const LocalizationProvider: FC<LocalizationProviderProps> = ({
  children,
  defaultLocale,
  fallbackLocale = 'en',
}) => {
  const [locale, setCurrentLocale] = useState<LocaleCode>(defaultLocale || detectUserLocale());
  const [messages, setMessages] = useState<MessageBundle>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isRTL = isRTLLanguage(locale);

  // Load messages when locale changes
  useEffect(() => {
    let isCancelled = false;

    async function loadMessages() {
      setIsLoading(true);
      setError(null);

      try {
        const localeMessages = await loadLocaleMessages(locale);

        if (!isCancelled) {
          setMessages(localeMessages);
          setIsLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          logger.error('Failed to load messages:', { locale, error: err });

          // Try fallback locale
          if (locale !== fallbackLocale) {
            try {
              const fallbackMessages = await loadLocaleMessages(fallbackLocale);
              setMessages(fallbackMessages);
              setError(`Failed to load ${locale} messages, using ${fallbackLocale} as fallback`);
            } catch {
              setError(`Failed to load messages for ${locale} and fallback ${fallbackLocale}`);
              setMessages({});
            }
          } else {
            setError(`Failed to load messages for ${locale}`);
            setMessages({});
          }

          setIsLoading(false);
        }
      }
    }

    loadMessages();

    return () => {
      isCancelled = true;
    };
  }, [locale, fallbackLocale]);

  // Update document attributes for RTL support
  useEffect(() => {
    document.documentElement.setAttribute('lang', locale);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

    // Add CSS class for styling
    document.documentElement.classList.toggle('rtl', isRTL);

    return () => {
      document.documentElement.classList.remove('rtl');
    };
  }, [locale, isRTL]);

  // Locale setter with persistence
  const setLocale = (newLocale: LocaleCode) => {
    logger.info('Changing locale:', { from: locale, to: newLocale });
    setCurrentLocale(newLocale);
    saveUserLocale(newLocale);
  };

  const contextValue: LocalizationContextState = {
    locale,
    setLocale,
    messages,
    isRTL,
    isLoading,
    error,
  };

  return (
    <LocalizationContext.Provider value={contextValue}>{children}</LocalizationContext.Provider>
  );
};

// Hook is exported from LocalizationContext.ts to avoid fast refresh issues

// ============================================================================
// Default Export
// ============================================================================

export default LocalizationProvider;
