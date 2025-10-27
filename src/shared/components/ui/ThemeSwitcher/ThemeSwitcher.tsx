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
        className="flex items-center gap-3 px-4 py-3 bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-secondary)] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
        aria-label="Open theme switcher"
      >
        <div
          className={`w-8 h-8 rounded-lg ${currentThemeOption?.gradient} flex items-center justify-center text-[var(--color-text-primary)] text-sm font-bold shadow-inner`}
        >
          {currentThemeOption?.icon}
        </div>
        <div className="text-left">
          <div className="font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] text-sm">
            {currentThemeOption?.name}
          </div>
          <div className="text-xs text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)]">
            {MODE_OPTIONS.find((m) => m.mode === theme.mode)?.name} Mode
          </div>
        </div>
        <Palette className="icon-sm text-[color:var(--color-text-tertiary)] group-hover:text-[color:var(--color-text-secondary)] dark:group-hover:text-[color:var(--color-text-tertiary)] transition-colors" />
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
          <div className="absolute top-full mt-2 right-0 w-96 bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-secondary)] rounded-2xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-secondary)]">
              <h3 className="text-lg font-bold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-2">
                [PALETTE] Choose Your Theme
              </h3>
              <p className="text-sm text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)]">
                Select a color palette and lighting mode that feels right for you
              </p>
            </div>

            {/* Mode Selector */}
            <div className="p-6 border-b border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-secondary)]">
              <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-4">
                Lighting Mode
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {MODE_OPTIONS.map(({ mode, name, icon: Icon, description }) => (
                  <button
                    key={mode}
                    onClick={() => setMode(mode)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                      theme.mode === mode
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] dark:bg-[var(--color-primary)]/20'
                        : 'border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-primary)] hover:border-[var(--color-border)] dark:hover:border-[var(--color-border)]'
                    }`}
                  >
                    <Icon className="icon-md mb-2 text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)]" />
                    <div className="text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                      {name}
                    </div>
                    <div className="text-xs text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)] mt-1">
                      {description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Palette Selector */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-4">
                Color Palette
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {THEME_OPTIONS.map(({ palette, name, description, icon, gradient }) => (
                  <button
                    key={palette}
                    onClick={() => setPalette(palette)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left group hover:scale-[1.02] ${
                      theme.palette === palette
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] dark:bg-[var(--color-primary)]/20 shadow-lg'
                        : 'border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-primary)] hover:border-[var(--color-border)] dark:hover:border-[var(--color-border)] hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center text-[var(--color-text-primary)] text-lg shadow-lg group-hover:shadow-xl transition-shadow`}
                      >
                        {icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                          {name}
                        </div>
                        <div className="text-sm text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)]">
                          {description}
                        </div>
                      </div>
                      {theme.palette === palette && (
                        <div className="icon-xs bg-[color:var(--color-primary)] rounded-full animate-pulse" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[color:var(--color-background-secondary)] dark:bg-[color:var(--color-background-secondary)] border-t border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-primary)]">
              <div className="text-xs text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)] text-center">
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
