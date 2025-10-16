/**
 * Theme Toggle Component
 *
 * A button to toggle between light and dark themes
 */

import { useTheme } from '@contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { effectiveTheme, toggleTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center justify-center gap-2
        px-3 py-2 rounded-lg
        text-sm font-medium
        transition-all duration-200
        bg-gray-100 hover:bg-gray-200
        dark:bg-gray-800 dark:hover:bg-gray-700
        text-gray-900 dark:text-gray-100
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `.trim()}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      {showLabel && <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  );
}

/**
 * Theme Selector Component
 *
 * A dropdown to select between light, dark, and system themes
 */

interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({ className = '' }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`.trim()}>
      <label
        htmlFor="theme-select"
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Theme
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
        className="
          px-3 py-2 rounded-lg
          text-sm
          bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-600
          text-gray-900 dark:text-gray-100
          focus:outline-none focus:ring-2 focus:ring-blue-500
          cursor-pointer
        "
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}
