/**
 * Localization Context Types and Creation
 *
 * Separate file for context creation to support React Fast Refresh
 * React 19: Uses use() hook for consuming context
 *
 * @author GitHub Copilot
 */

import { createContext, use } from 'react';
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
// Hook for consuming context - React 19: use() hook
// ============================================================================

/**
 * Hook for consuming localization context
 * React 19: Uses use() hook for cleaner API and can be called conditionally
 */
export function useLocalizationContext(): LocalizationContextState {
  return use(LocalizationContext);
}
