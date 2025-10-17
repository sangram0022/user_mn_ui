import { useTheme } from '@contexts/ThemeContext';
import { Palette } from 'lucide-react';
import React, { useState } from 'react';

/**
 * ThemeSelector - Dropdown to select color palette
 * Compact version for Header
 */
export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const palettes: Array<{
    id:
      | 'ocean'
      | 'forest'
      | 'sunset'
      | 'midnight'
      | 'aurora'
      | 'crimson'
      | 'lavender'
      | 'amber'
      | 'slate';
    name: string;
    preview: string;
  }> = [
    { id: 'ocean', name: 'Ocean', preview: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)' },
    { id: 'forest', name: 'Forest', preview: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { id: 'sunset', name: 'Sunset', preview: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)' },
    {
      id: 'midnight',
      name: 'Midnight',
      preview: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
    },
    { id: 'aurora', name: 'Aurora', preview: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' },
    {
      id: 'crimson',
      name: 'Crimson',
      preview: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    },
    {
      id: 'lavender',
      name: 'Lavender',
      preview: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
    },
    { id: 'amber', name: 'Amber', preview: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    { id: 'slate', name: 'Slate', preview: 'linear-gradient(135deg, #64748b 0%, #475569 100%)' },
  ];

  const currentPalette = palettes.find((p) => p.id === theme.palette) || palettes[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        style={{
          background: 'var(--theme-surface)',
          border: `1px solid var(--theme-border)`,
          color: 'var(--theme-text)',
        }}
        aria-label="Change theme"
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline text-sm font-medium">{currentPalette.name}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <button
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
            aria-label="Close theme selector"
            tabIndex={-1}
          />

          {/* Dropdown */}
          <div
            className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl py-2 z-50 border"
            style={{
              background: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--theme-border)' }}>
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--theme-textSecondary)' }}
              >
                Choose Theme
              </p>
            </div>
            <div className="py-1 max-h-96 overflow-y-auto">
              {palettes.map((palette) => {
                const isActive = theme.palette === palette.id;
                return (
                  <button
                    key={palette.id}
                    onClick={() => {
                      setTheme({ ...theme, palette: palette.id });
                      setIsOpen(false);
                    }}
                    className="w-full px-3 py-2 flex items-center space-x-3 transition-colors"
                    style={{
                      background: isActive
                        ? 'rgba(var(--theme-primary-rgb, 59, 130, 246), 0.1)'
                        : 'transparent',
                      color: isActive ? 'var(--theme-primary)' : 'var(--theme-text)',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg border-2 flex-shrink-0"
                      style={{
                        background: palette.preview,
                        borderColor: isActive ? 'var(--theme-primary)' : 'var(--theme-border)',
                      }}
                    />
                    <span className="text-sm font-medium">{palette.name}</span>
                    {isActive && <span className="ml-auto text-xs font-semibold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
