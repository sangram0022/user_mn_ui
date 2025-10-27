/**
 * SIMPLIFIED LIGHT THEME CONTEXT
 *
 *  Professional Light Theme Only
 * - Single, professional light theme
 * - Optimized for readability and accessibility
 * - Tailwind CSS integration
 * - No dark mode switching overhead
 * - Cleaner, more maintainable code
 */

/* eslint-disable react-refresh/only-export-components */
/**
 * SIMPLIFIED LIGHT THEME CONTEXT - React 19 Optimized
 *
 * ✅ React 19 Features:
 * - Removed all useMemo/useCallback (React Compiler handles it)
 * - Uses use() hook for context consumption
 * - Single source of truth: storageService
 * - Zero manual optimization needed
 */

import { storageService } from '@shared/services/storage.service';
import type React from 'react';
import { createContext, use, useEffect, useState } from 'react';

//  LIGHT THEME ONLY - Single professional palette
export type ThemePalette = 'professional'; // Simplified to single theme
export type EffectiveTheme = 'light'; // Always light

export interface ThemeConfig {
  palette: ThemePalette;
  mode: 'light'; //  Fixed to light only
}

export interface ThemeContextValue {
  /** Current theme configuration (light only) */
  theme: ThemeConfig;

  /** Actual theme being applied (always light) */
  effectiveTheme: EffectiveTheme;

  /** Set theme palette (no-op for light-only) */
  setPalette: (palette: ThemePalette) => void;

  /** Set theme mode (always light) */
  setMode: (mode: 'light') => void;

  /** Set complete theme configuration */
  setTheme: (config: ThemeConfig) => void;

  /** Toggle theme (no-op for light-only) */
  toggleTheme: () => void;

  /** Check if currently dark mode (always false) */
  isDark: false;

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

// Palette colors interface - same structure as ThemeColors but for each mode
export type PaletteColors = Record<'light' | 'dark', ThemeColors>;

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_ATTRIBUTE = 'data-theme';
const PALETTE_ATTRIBUTE = 'data-palette';

//  LIGHT THEME ONLY - Single professional configuration
const DEFAULT_THEME: ThemeConfig = {
  palette: 'professional',
  mode: 'light',
};

//  PROFESSIONAL LIGHT THEME ONLY - Clean, modern, professional colors
// Professional light theme palette only
const THEME_PALETTES: Record<ThemePalette, PaletteColors> = {
  professional: {
    light: {
      primary: '#0066cc',
      secondary: '#0052a3',
      accent: '#003d7a',
      background: '#f8fafb',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      gradient: 'linear-gradient(135deg, #0066cc 0%, #0052a3 50%, #003d7a 100%)',
      glow: '0 0 20px rgba(0, 102, 204, 0.3)',
    },
    dark: {
      primary: '#0066cc',
      secondary: '#0052a3',
      accent: '#003d7a',
      background: '#f8fafb',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      gradient: 'linear-gradient(135deg, #0066cc 0%, #0052a3 50%, #003d7a 100%)',
      glow: '0 0 20px rgba(0, 102, 204, 0.3)',
    },
  },
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeConfig;
}

export function ThemeProvider({ children, defaultTheme = DEFAULT_THEME }: ThemeProviderProps) {
  // ✅ Single source of truth: storageService
  // Get initial theme from centralized storage or use default
  const [theme, setThemeState] = useState<ThemeConfig>(() => {
    if (typeof window === 'undefined') return defaultTheme;

    // Use centralized storage service
    const stored = storageService.getTheme();
    if (stored) {
      // Validate the stored theme
      if (
        [
          'professional',
          'forest',
          'sunset',
          'midnight',
          'aurora',
          'crimson',
          'lavender',
          'amber',
          'slate',
        ].includes(stored.palette) &&
        stored.mode === 'light'
      ) {
        return stored;
      }
    }
    return defaultTheme;
  });

  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('light');

  // ✅ React 19: Get effective theme - always light (no useCallback needed)
  const getEffectiveTheme = (): EffectiveTheme => 'light';

  // ✅ React 19: Apply theme to document (no useCallback needed)
  const applyTheme = (config: ThemeConfig, effective: EffectiveTheme) => {
    const root = document.documentElement;

    // Validate config and effective theme
    const paletteColors = THEME_PALETTES[config.palette];
    if (!paletteColors) {
      // Invalid palette - fallback to professional without logging in production
      config.palette = 'professional';
    }

    const colors = THEME_PALETTES[config.palette]?.light || THEME_PALETTES.professional.light;

    // Remove existing theme classes/attributes
    root.removeAttribute(THEME_ATTRIBUTE);
    root.removeAttribute(PALETTE_ATTRIBUTE);
    root.classList.remove(
      'light',
      'dark',
      'professional',
      'forest',
      'sunset',
      'midnight',
      'aurora',
      'crimson',
      'lavender',
      'amber',
      'slate'
    );

    // Apply new theme
    root.setAttribute(THEME_ATTRIBUTE, effective);
    root.setAttribute(PALETTE_ATTRIBUTE, config.palette);
    root.classList.add(effective, config.palette);

    // Apply CSS custom properties for theme colors
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value as string);
    });

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', colors.primary);
    }
  };

  // Update effective theme when theme or system preference changes
  useEffect(() => {
    const updateTheme = () => {
      const effective = getEffectiveTheme();
      setEffectiveTheme(effective);
      applyTheme(theme, effective);
    };

    // Initial theme application
    updateTheme();

    // Light theme only - no system preference listening needed
    return undefined;
  }, [theme, getEffectiveTheme, applyTheme]);

  // ✅ React 19: Set theme palette (no useCallback needed)
  const setPalette = (palette: ThemePalette) => {
    const newTheme = { ...theme, palette };
    setThemeState(newTheme);
    // ✅ Use centralized storage service
    storageService.setTheme(newTheme);
  };

  // ✅ React 19: Set theme mode - NO-OP since mode is always 'light'
  const setMode = (): void => {
    // Mode is fixed to 'light' - this is a no-op for light theme only
  };

  // ✅ React 19: Set complete theme configuration (no useCallback needed)
  const setTheme = (config: ThemeConfig) => {
    // Ensure mode is always 'light'
    const lightConfig = { ...config, mode: 'light' as const };
    setThemeState(lightConfig);
    // ✅ Use centralized storage service
    storageService.setTheme(lightConfig);
  };

  // ✅ React 19: Toggle theme - NO-OP since we're light theme only
  const toggleTheme = () => {
    // No-op: light theme only
  };

  // ✅ React 19: Get theme-aware colors (no useCallback needed)
  const getThemeColors = (): ThemeColors =>
    THEME_PALETTES[theme.palette]?.light || THEME_PALETTES.professional.light;

  // ✅ React 19: Context value (no useMemo needed - React Compiler optimizes)
  const value: ThemeContextValue = {
    theme,
    effectiveTheme,
    setPalette,
    setMode,
    setTheme,
    toggleTheme,
    isDark: false,
    getThemeColors,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 * React 19: Uses use() hook for cleaner API
 * @throws {Error} if used outside of ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = use(ThemeContext);

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
