/**
 * Advanced Theme Context
 *
 * Supports multiple beautiful themes with:
 * - 9 stunning color palettes (Ocean, Forest, Sunset, etc.)
 * - Light/Dark/System theme modes
 * - Local storage persistence
 * - Smooth theme transitions
 * - Theme-aware CSS custom properties
 * - Glassmorphism and modern effects
 */

/* eslint-disable react-refresh/only-export-components */

import { safeLocalStorage } from '@shared/utils/safeLocalStorage';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemePalette =
  | 'ocean'
  | 'forest'
  | 'sunset'
  | 'midnight'
  | 'aurora'
  | 'crimson'
  | 'lavender'
  | 'amber'
  | 'slate';
export type EffectiveTheme = 'light' | 'dark';

export interface ThemeConfig {
  palette: ThemePalette;
  mode: ThemeMode;
}

export interface ThemeContextValue {
  /** Current theme configuration */
  theme: ThemeConfig;

  /** Actual theme being applied (light or dark) */
  effectiveTheme: EffectiveTheme;

  /** Set theme palette */
  setPalette: (palette: ThemePalette) => void;

  /** Set theme mode */
  setMode: (mode: ThemeMode) => void;

  /** Set complete theme configuration */
  setTheme: (config: ThemeConfig) => void;

  /** Toggle between light and dark */
  toggleTheme: () => void;

  /** Check if currently dark mode */
  isDark: boolean;

  /** Get theme-aware colors */
  getThemeColors: () => ThemeColors;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  gradient: string;
  glow: string;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'app-theme-config';
const THEME_ATTRIBUTE = 'data-theme';
const PALETTE_ATTRIBUTE = 'data-palette';

// Default theme configuration
const DEFAULT_THEME: ThemeConfig = {
  palette: 'ocean',
  mode: 'light', // ✅ Changed from 'system' to 'light'
};

// Theme color mappings
const THEME_COLORS: Record<ThemePalette, Record<EffectiveTheme, ThemeColors>> = {
  ocean: {
    light: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#0369a1',
      background: '#f0f9ff',
      surface: '#ffffff',
      text: '#0c4a6e',
      textSecondary: '#075985',
      border: '#bae6fd',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
      glow: '0 0 20px rgba(14, 165, 233, 0.3)',
    },
    dark: {
      primary: '#38bdf8',
      secondary: '#0ea5e9',
      accent: '#0284c7',
      background: '#0c4a6e',
      surface: '#075985',
      text: '#f0f9ff',
      textSecondary: '#bae6fd',
      border: '#0369a1',
      gradient: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%)',
      glow: '0 0 20px rgba(56, 189, 248, 0.3)',
    },
  },
  forest: {
    light: {
      primary: '#22c55e',
      secondary: '#16a34a',
      accent: '#15803d',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: '#14532d',
      textSecondary: '#166534',
      border: '#bbf7d0',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
      glow: '0 0 20px rgba(34, 197, 94, 0.3)',
    },
    dark: {
      primary: '#4ade80',
      secondary: '#22c55e',
      accent: '#16a34a',
      background: '#14532d',
      surface: '#166534',
      text: '#f0fdf4',
      textSecondary: '#bbf7d0',
      border: '#15803d',
      gradient: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)',
      glow: '0 0 20px rgba(74, 222, 128, 0.3)',
    },
  },
  sunset: {
    light: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#c2410c',
      background: '#fff7ed',
      surface: '#ffffff',
      text: '#7c2d12',
      textSecondary: '#9a3412',
      border: '#fed7aa',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
      glow: '0 0 20px rgba(249, 115, 22, 0.3)',
    },
    dark: {
      primary: '#fb923c',
      secondary: '#f97316',
      accent: '#ea580c',
      background: '#7c2d12',
      surface: '#9a3412',
      text: '#fff7ed',
      textSecondary: '#fed7aa',
      border: '#c2410c',
      gradient: 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)',
      glow: '0 0 20px rgba(251, 146, 60, 0.3)',
    },
  },
  midnight: {
    light: {
      primary: '#a855f7',
      secondary: '#9333ea',
      accent: '#7c3aed',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#581c87',
      textSecondary: '#6b21a8',
      border: '#e9d5ff',
      gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #7c3aed 100%)',
      glow: '0 0 20px rgba(168, 85, 247, 0.3)',
    },
    dark: {
      primary: '#c084fc',
      secondary: '#a855f7',
      accent: '#9333ea',
      background: '#581c87',
      surface: '#6b21a8',
      text: '#faf5ff',
      textSecondary: '#e9d5ff',
      border: '#7c3aed',
      gradient: 'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #9333ea 100%)',
      glow: '0 0 20px rgba(192, 132, 252, 0.3)',
    },
  },
  aurora: {
    light: {
      primary: '#14b8a6',
      secondary: '#0d9488',
      accent: '#0f766e',
      background: '#f0fdfa',
      surface: '#ffffff',
      text: '#134e4a',
      textSecondary: '#115e59',
      border: '#99f6e4',
      gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #0f766e 100%)',
      glow: '0 0 20px rgba(20, 184, 166, 0.3)',
    },
    dark: {
      primary: '#2dd4bf',
      secondary: '#14b8a6',
      accent: '#0d9488',
      background: '#134e4a',
      surface: '#115e59',
      text: '#f0fdfa',
      textSecondary: '#99f6e4',
      border: '#0f766e',
      gradient: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 50%, #0d9488 100%)',
      glow: '0 0 20px rgba(45, 212, 191, 0.3)',
    },
  },
  crimson: {
    light: {
      primary: '#ef4444',
      secondary: '#dc2626',
      accent: '#b91c1c',
      background: '#fef2f2',
      surface: '#ffffff',
      text: '#7f1d1d',
      textSecondary: '#991b1b',
      border: '#fecaca',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
      glow: '0 0 20px rgba(239, 68, 68, 0.3)',
    },
    dark: {
      primary: '#f87171',
      secondary: '#ef4444',
      accent: '#dc2626',
      background: '#7f1d1d',
      surface: '#991b1b',
      text: '#fef2f2',
      textSecondary: '#fecaca',
      border: '#b91c1c',
      gradient: 'linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%)',
      glow: '0 0 20px rgba(248, 113, 113, 0.3)',
    },
  },
  lavender: {
    light: {
      primary: '#a855f7',
      secondary: '#9333ea',
      accent: '#7c3aed',
      background: '#faf5ff',
      surface: '#ffffff',
      text: '#581c87',
      textSecondary: '#6b21a8',
      border: '#e9d5ff',
      gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #7c3aed 100%)',
      glow: '0 0 20px rgba(168, 85, 247, 0.3)',
    },
    dark: {
      primary: '#c084fc',
      secondary: '#a855f7',
      accent: '#9333ea',
      background: '#581c87',
      surface: '#6b21a8',
      text: '#faf5ff',
      textSecondary: '#e9d5ff',
      border: '#7c3aed',
      gradient: 'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #9333ea 100%)',
      glow: '0 0 20px rgba(192, 132, 252, 0.3)',
    },
  },
  amber: {
    light: {
      primary: '#f59e0b',
      secondary: '#d97706',
      accent: '#b45309',
      background: '#fffbeb',
      surface: '#ffffff',
      text: '#78350f',
      textSecondary: '#92400e',
      border: '#fde68a',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
      glow: '0 0 20px rgba(245, 158, 11, 0.3)',
    },
    dark: {
      primary: '#fbbf24',
      secondary: '#f59e0b',
      accent: '#d97706',
      background: '#78350f',
      surface: '#92400e',
      text: '#fffbeb',
      textSecondary: '#fde68a',
      border: '#b45309',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
      glow: '0 0 20px rgba(251, 191, 36, 0.3)',
    },
  },
  slate: {
    light: {
      primary: '#64748b',
      secondary: '#475569',
      accent: '#334155',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a',
      textSecondary: '#1e293b',
      border: '#e2e8f0',
      gradient: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
      glow: '0 0 20px rgba(100, 116, 139, 0.3)',
    },
    dark: {
      primary: '#94a3b8',
      secondary: '#64748b',
      accent: '#475569',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#e2e8f0',
      border: '#334155',
      gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 50%, #475569 100%)',
      glow: '0 0 20px rgba(148, 163, 184, 0.3)',
    },
  },
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeConfig;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  // Get initial theme from localStorage or use default
  const [theme, setThemeState] = useState<ThemeConfig>(() => {
    if (typeof window === 'undefined') return defaultTheme;

    const stored = safeLocalStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ThemeConfig;
        // Validate the stored theme
        if (
          parsed &&
          typeof parsed === 'object' &&
          'palette' in parsed &&
          'mode' in parsed &&
          [
            'ocean',
            'forest',
            'sunset',
            'midnight',
            'aurora',
            'crimson',
            'lavender',
            'amber',
            'slate',
          ].includes(parsed.palette) &&
          ['light', 'dark', 'system'].includes(parsed.mode)
        ) {
          return parsed;
        }
      } catch {
        // Invalid stored theme, use default
      }
    }
    return defaultTheme;
  });

  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('light');

  // Get effective theme based on current theme setting and system preference
  const getEffectiveTheme = useCallback((): EffectiveTheme => {
    if (theme.mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme.mode;
  }, [theme.mode]);

  // Apply theme to document
  const applyTheme = useCallback((config: ThemeConfig, effective: EffectiveTheme) => {
    const root = document.documentElement;

    // Validate config and effective theme
    const paletteColors = THEME_COLORS[config.palette];
    if (!paletteColors) {
      // Invalid palette - fallback to ocean without logging in production
      config.palette = 'ocean';
    }

    const colors = THEME_COLORS[config.palette]?.[effective] || THEME_COLORS.ocean.light;

    // Remove existing theme classes/attributes
    root.removeAttribute(THEME_ATTRIBUTE);
    root.removeAttribute(PALETTE_ATTRIBUTE);
    root.classList.remove('light', 'dark', ...Object.keys(THEME_COLORS));

    // Apply new theme
    root.setAttribute(THEME_ATTRIBUTE, effective);
    root.setAttribute(PALETTE_ATTRIBUTE, config.palette);
    root.classList.add(effective, config.palette);

    // Apply CSS custom properties for theme colors
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', colors.primary);
    }
  }, []);

  // Update effective theme when theme or system preference changes
  useEffect(() => {
    const updateTheme = () => {
      const effective = getEffectiveTheme();
      setEffectiveTheme(effective);
      applyTheme(theme, effective);
    };

    // Initial theme application
    updateTheme();

    // Listen for system theme changes (only when theme is 'system')
    if (theme.mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      // Modern browsers
      const handleChange = () => {
        if (theme.mode === 'system') {
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
        } catch {
          // Silent fail in production - media query listener not supported
        }
      }
    }

    return undefined;
  }, [theme, getEffectiveTheme, applyTheme]);

  // Set theme palette
  const setPalette = useCallback(
    (palette: ThemePalette) => {
      const newTheme = { ...theme, palette };
      setThemeState(newTheme);
      safeLocalStorage.setItem(storageKey, JSON.stringify(newTheme));
    },
    [theme, storageKey]
  );

  // Set theme mode
  const setMode = useCallback(
    (mode: ThemeMode) => {
      const newTheme = { ...theme, mode };
      setThemeState(newTheme);
      safeLocalStorage.setItem(storageKey, JSON.stringify(newTheme));
    },
    [theme, storageKey]
  );

  // Set complete theme configuration
  const setTheme = useCallback(
    (config: ThemeConfig) => {
      setThemeState(config);
      safeLocalStorage.setItem(storageKey, JSON.stringify(config));
    },
    [storageKey]
  );

  // Toggle between light and dark (skips system)
  const toggleTheme = useCallback(() => {
    const newMode = effectiveTheme === 'light' ? 'dark' : 'light';
    setMode(newMode);
  }, [effectiveTheme, setMode]);

  // Get theme-aware colors
  const getThemeColors = useCallback(
    (): ThemeColors => THEME_COLORS[theme.palette]?.[effectiveTheme] || THEME_COLORS.ocean.light,
    [theme.palette, effectiveTheme]
  );

  const value: ThemeContextValue = {
    theme,
    effectiveTheme,
    setPalette,
    setMode,
    setTheme,
    toggleTheme,
    isDark: effectiveTheme === 'dark',
    getThemeColors,
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

/**
 * Hook to get current theme colors
 */
export function useThemeColors(): ThemeColors {
  const { getThemeColors } = useTheme();
  return getThemeColors();
}
