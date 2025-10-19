import type { ThemeMode, ThemePalette } from '@contexts/ThemeContext';
import { useTheme } from '@contexts/ThemeContext';
import { Monitor, Moon, Palette, Sun } from 'lucide-react';
import React from 'react';

interface ThemeSwitcherProps {
  className?: string;
}

interface ThemeOption {
  palette: ThemePalette;
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    palette: 'ocean',
    name: 'Ocean',
    description: 'Cool blues and calming waters',
    icon: '[OCEAN]',
    gradient: 'bg-ocean-gradient',
  },
  {
    palette: 'forest',
    name: 'Forest',
    description: 'Rich greens and natural earth tones',
    icon: '[FOREST]',
    gradient: 'bg-forest-gradient',
  },
  {
    palette: 'sunset',
    name: 'Sunset',
    description: 'Warm oranges and golden hues',
    icon: '[SUNSET]',
    gradient: 'bg-sunset-gradient',
  },
  {
    palette: 'midnight',
    name: 'Midnight',
    description: 'Deep blues and mysterious purples',
    icon: '[NIGHT]',
    gradient: 'bg-midnight-gradient',
  },
  {
    palette: 'aurora',
    name: 'Aurora',
    description: 'Vibrant greens and mystical blues',
    icon: '[AURORA]',
    gradient: 'bg-aurora-gradient',
  },
  {
    palette: 'crimson',
    name: 'Crimson',
    description: 'Deep reds and passionate burgundies',
    icon: '[RED]',
    gradient: 'bg-crimson-gradient',
  },
  {
    palette: 'lavender',
    name: 'Lavender',
    description: 'Soft purples and dreamy lavenders',
    icon: '[PURPLE]',
    gradient: 'bg-lavender-gradient',
  },
  {
    palette: 'amber',
    name: 'Amber',
    description: 'Warm yellows and golden ambers',
    icon: '[YELLOW]',
    gradient: 'bg-amber-gradient',
  },
  {
    palette: 'slate',
    name: 'Slate',
    description: 'Modern grays and sophisticated tones',
    icon: '[BLACK]',
    gradient: 'bg-slate-gradient',
  },
];

const MODE_OPTIONS = [
  { mode: 'light' as ThemeMode, name: 'Light', icon: Sun, description: 'Bright and clean' },
  { mode: 'dark' as ThemeMode, name: 'Dark', icon: Moon, description: 'Easy on the eyes' },
  {
    mode: 'system' as ThemeMode,
    name: 'System',
    icon: Monitor,
    description: 'Follows your system',
  },
];

export function ThemeSwitcher({ className = '' }: ThemeSwitcherProps) {
  const { theme, setPalette, setMode } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentThemeOption = THEME_OPTIONS.find((option) => option.palette === theme.palette);

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
        aria-label="Open theme switcher"
      >
        <div
          className={`w-8 h-8 rounded-lg ${currentThemeOption?.gradient} flex items-center justify-center text-white text-sm font-bold shadow-inner`}
        >
          {currentThemeOption?.icon}
        </div>
        <div className="text-left">
          <div className="font-semibold text-gray-900 dark:text-white text-sm">
            {currentThemeOption?.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {MODE_OPTIONS.find((m) => m.mode === theme.mode)?.name} Mode
          </div>
        </div>
        <Palette className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsOpen(false);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Close theme selector"
          />

          {/* Panel */}
          <div className="absolute top-full mt-2 right-0 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                [PALETTE] Choose Your Theme
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select a color palette and lighting mode that feels right for you
              </p>
            </div>

            {/* Mode Selector */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Lighting Mode
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {MODE_OPTIONS.map(({ mode, name, icon: Icon, description }) => (
                  <button
                    key={mode}
                    onClick={() => setMode(mode)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                      theme.mode === mode
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-2 text-gray-600 dark:text-gray-400" />
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Palette Selector */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Color Palette
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {THEME_OPTIONS.map(({ palette, name, description, icon, gradient }) => (
                  <button
                    key={palette}
                    onClick={() => setPalette(palette)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left group hover:scale-[1.02] ${
                      theme.palette === palette
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center text-white text-lg shadow-lg group-hover:shadow-xl transition-shadow`}
                      >
                        {icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">{name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {description}
                        </div>
                      </div>
                      {theme.palette === palette && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Current: <span className="font-medium">{currentThemeOption?.name}</span> in{' '}
                <span className="font-medium">
                  {MODE_OPTIONS.find((m) => m.mode === theme.mode)?.name}
                </span>{' '}
                mode
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ThemeSwitcher;
