/**
 * Dark Mode Hook
 * Provides dark mode toggle with localStorage persistence and system preference detection
 */

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface UseDarkModeReturn {
  isDark: boolean;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

/**
 * Hook for managing dark mode
 * Respects system preferences and persists to localStorage
 *
 * @example
 * ```tsx
 * const { isDark, toggleTheme } = useDarkMode();
 *
 * return (
 *   <button onClick={toggleTheme}>
 *     {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
 *   </button>
 * );
 * ```
 */
export const useDarkMode = (): UseDarkModeReturn => {
  // Initialize theme from localStorage or system preference
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';

    try {
      const stored = localStorage.getItem('theme') as Theme | null;
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }

      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    // Persist to localStorage
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // Ignore localStorage errors
    }
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't set a preference
      try {
        const stored = localStorage.getItem('theme');
        if (!stored) {
          setThemeState(e.matches ? 'dark' : 'light');
        }
      } catch {
        // Ignore
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }

    return undefined;
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return {
    isDark: theme === 'dark',
    theme,
    toggleTheme,
    setTheme,
  };
};

export default useDarkMode;
