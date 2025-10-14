/**
 * Localization Context Types and Creation
 *
 * Separate file for context creation to support React Fast Refresh
 *
 * @author GitHub Copilot
 */

import { createContext } from 'react';
import type { LocaleCode, MessageBundle } from '../types/localization.types';

// ============================================================================
// Context Types
// ============================================================================

export interface LocalizationContextState {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  messages: MessageBundle;
  isRTL: boolean;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// Context Creation
// ============================================================================

export const LocalizationContext = createContext<LocalizationContextState>({
  locale: 'en',
  setLocale: () => {},
  messages: {},
  isRTL: false,
  isLoading: false,
  error: null,
});

// ============================================================================
// Hook for consuming context
// ============================================================================

import { useContext } from 'react';

/**
 * Hook for consuming localization context
 */
export function useLocalizationContext(): LocalizationContextState {
  const context = useContext(LocalizationContext);

  if (!context) {
    throw new Error('useLocalizationContext must be used within a LocalizationProvider');
  }

  return context;
}
