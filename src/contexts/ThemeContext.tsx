/**
 * Theme Context
 *
 * Provides theme management with:
 * - Light/Dark/System theme modes
 * - Local storage persistence
 * - System preference detection
 * - Smooth theme transitions
 */

/* eslint-disable react-refresh/only-export-components */

import { safeLocalStorage } from '@shared/utils/safeLocalStorage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type EffectiveTheme = 'light' | 'dark';

export interface ThemeContextValue {
  /** Current theme mode (includes 'system' option) */
  theme: ThemeMode;

  /** Actual theme being applied (light or dark) */
  effectiveTheme: EffectiveTheme;

  /** Set theme mode */
  setTheme: (theme: ThemeMode) => void;

  /** Toggle between light and dark */
  toggleTheme: () => void;

  /** Check if currently dark mode */
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'app-theme';
const THEME_ATTRIBUTE = 'data-theme';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  // Get initial theme from localStorage or use default
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return defaultTheme;

    const stored = safeLocalStorage.getItem(storageKey) as ThemeMode | null;
    return stored && ['light', 'dark', 'system'].includes(stored) ? stored : defaultTheme;
  });

  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('light');

  // Get effective theme based on current theme setting and system preference
  const getEffectiveTheme = useCallback((): EffectiveTheme => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }, [theme]);

  // Apply theme to document
  const applyTheme = useCallback((effective: EffectiveTheme) => {
    const root = document.documentElement;

    // Remove existing theme classes/attributes
    root.removeAttribute(THEME_ATTRIBUTE);
    root.classList.remove('light', 'dark');

    // Apply new theme
    root.setAttribute(THEME_ATTRIBUTE, effective);
    root.classList.add(effective);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', effective === 'dark' ? '#111827' : '#ffffff');
    }
  }, []);

  // Update effective theme when theme or system preference changes
  useEffect(() => {
    const updateTheme = () => {
      const effective = getEffectiveTheme();
      setEffectiveTheme(effective);
      applyTheme(effective);
    };

    // Initial theme application
    updateTheme();

    // Listen for system theme changes (only when theme is 'system')
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      // Modern browsers
      const handleChange = () => {
        if (theme === 'system') {
          updateTheme();
        }
      };

      // Try the standard way first
      try {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } catch {
        // Fallback for older browsers
        try {
          mediaQuery.addListener(handleChange);
          return () => mediaQuery.removeListener(handleChange);
        } catch (err) {
          console.warn('Could not add media query listener:', err);
        }
      }
    }

    return undefined;
  }, [theme, getEffectiveTheme, applyTheme]);

  // Set theme and persist to localStorage
  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      setThemeState(newTheme);
      safeLocalStorage.setItem(storageKey, newTheme);
    },
    [storageKey]
  );

  // Toggle between light and dark (skips system)
  const toggleTheme = useCallback(() => {
    setTheme(effectiveTheme === 'light' ? 'dark' : 'light');
  }, [effectiveTheme, setTheme]);

  const value: ThemeContextValue = {
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
    isDark: effectiveTheme === 'dark',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 * @throws {Error} if used outside of ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

/**
 * Hook to get just the effective theme (for components that only need to know if it's dark)
 */
export function useIsDark(): boolean {
  const { isDark } = useTheme();
  return isDark;
}

/**
 * Hook to get theme toggle function (for theme switcher components)
 */
export function useThemeToggle(): () => void {
  const { toggleTheme } = useTheme();
  return toggleTheme;
}
