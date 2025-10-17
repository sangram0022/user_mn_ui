import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * ThemeTestPage - Professional Theme System Showcase
 *
 * Design Principles (25 years experience):
 * 1. Consistent button hierarchy: Primary > Secondary > Outline > Ghost
 * 2. Proper contrast ratios for accessibility (WCAG AA)
 * 3. Visual rhythm through consistent spacing
 * 4. Professional color combinations
 * 5. Clear typography hierarchy
 */
export default function ThemeTestPage(): React.JSX.Element {
  const { theme, setTheme, setMode } = useTheme();

  const palettes: Array<
    | 'ocean'
    | 'forest'
    | 'sunset'
    | 'midnight'
    | 'aurora'
    | 'crimson'
    | 'lavender'
    | 'amber'
    | 'slate'
  > = ['ocean', 'forest', 'sunset', 'midnight', 'aurora', 'crimson', 'lavender', 'amber', 'slate'];

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--theme-background)' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with proper typography hierarchy */}
        <header className="text-center space-y-3">
          <h1
            className="text-5xl font-bold tracking-tight"
            style={{ color: 'var(--theme-primary)' }}
          >
            Theme System Showcase
          </h1>
          <p className="text-lg" style={{ color: 'var(--theme-textSecondary)' }}>
            Professional design system with consistent color combinations
          </p>
        </header>

        {/* Theme Controls Section */}
        <section
          className="p-8 rounded-2xl shadow-lg"
          style={{
            background: 'var(--theme-surface)',
            border: `1px solid var(--theme-border)`,
          }}
        >
          <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--theme-text)' }}>
            Theme Controls
          </h2>

          <div className="space-y-6">
            {/* Palette Selector - Consistent Active/Inactive States */}
            <div>
              <label
                className="block text-sm font-semibold mb-3 uppercase tracking-wide"
                style={{ color: 'var(--theme-textSecondary)' }}
              >
                Color Palette — {theme.palette}
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {palettes.map((palette) => {
                  const isActive = theme.palette === palette;
                  return (
                    <button
                      key={palette}
                      onClick={() => setTheme({ ...theme, palette })}
                      className="px-5 py-3 rounded-xl font-semibold transition-all duration-200 capitalize transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{
                        background: isActive ? 'var(--theme-primary)' : 'transparent',
                        color: isActive ? 'var(--theme-onPrimary)' : 'var(--theme-text)',
                        border: `2px solid ${isActive ? 'var(--theme-primary)' : 'var(--theme-border)'}`,
                        boxShadow: isActive ? '0 4px 14px rgba(0,0,0,0.15)' : 'none',
                      }}
                    >
                      {palette}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode Selector - Consistent Toggle Style */}
            <div>
              <label
                className="block text-sm font-semibold mb-3 uppercase tracking-wide"
                style={{ color: 'var(--theme-textSecondary)' }}
              >
                Display Mode — {theme.mode}
              </label>
              <div
                className="inline-flex gap-0 rounded-xl overflow-hidden shadow-md"
                style={{ border: `1px solid var(--theme-border)` }}
              >
                {(['light', 'dark', 'system'] as const).map((mode, index) => {
                  const isActive = theme.mode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => setMode(mode)}
                      className="px-8 py-3 font-semibold transition-all duration-200 capitalize focus:outline-none relative"
                      style={{
                        background: isActive ? 'var(--theme-primary)' : 'var(--theme-surface)',
                        color: isActive ? 'var(--theme-onPrimary)' : 'var(--theme-text)',
                        borderRight: index < 2 ? `1px solid var(--theme-border)` : 'none',
                        zIndex: isActive ? 10 : 1,
                      }}
                    >
                      {mode}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Button Hierarchy Showcase */}
        <section
          className="p-8 rounded-2xl shadow-lg"
          style={{
            background: 'var(--theme-surface)',
            border: `1px solid var(--theme-border)`,
          }}
        >
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--theme-text)' }}>
            Button System
          </h2>
          <p className="mb-6 text-base" style={{ color: 'var(--theme-textSecondary)' }}>
            Consistent hierarchy with proper visual weight and clear affordances
          </p>

          <div className="space-y-8">
            {/* Primary Buttons - Highest Priority Actions */}
            <div>
              <h3
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: 'var(--theme-text)' }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: 'var(--theme-primary)' }}
                ></span>
                Primary Buttons — Call to Action
              </h3>
              <div className="flex flex-wrap gap-4">
                <button
                  className="px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    background: 'var(--theme-primary)',
                    color: 'var(--theme-onPrimary)',
                  }}
                >
                  Primary Action
                </button>
                <button
                  className="px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    background: 'var(--theme-gradient)',
                    color: 'var(--theme-onPrimary)',
                  }}
                >
                  Gradient Primary
                </button>
                <button
                  className="px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-md opacity-60 cursor-not-allowed"
                  style={{
                    background: 'var(--theme-primary)',
                    color: 'var(--theme-onPrimary)',
                  }}
                  disabled
                >
                  Disabled
                </button>
              </div>
            </div>

            {/* Secondary Buttons - Supporting Actions */}
            <div>
              <h3
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: 'var(--theme-text)' }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: 'var(--theme-secondary)' }}
                ></span>
                Secondary Buttons — Supporting Actions
              </h3>
              <div className="flex flex-wrap gap-4">
                <button
                  className="px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    background: 'var(--theme-secondary)',
                    color: 'var(--theme-onPrimary)',
                  }}
                >
                  Secondary Action
                </button>
                <button
                  className="px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    background: 'var(--theme-accent)',
                    color: 'var(--theme-onPrimary)',
                  }}
                >
                  Accent Action
                </button>
              </div>
            </div>

            {/* Outline Buttons - Subtle Actions */}
            <div>
              <h3
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: 'var(--theme-text)' }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full border-2"
                  style={{ borderColor: 'var(--theme-primary)' }}
                ></span>
                Outline Buttons — Subtle Actions
              </h3>
              <div className="flex flex-wrap gap-4">
                <button
                  className="px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    background: 'transparent',
                    color: 'var(--theme-primary)',
                    border: '2px solid var(--theme-primary)',
                  }}
                >
                  Outline Primary
                </button>
                <button
                  className="px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    background: 'transparent',
                    color: 'var(--theme-secondary)',
                    border: '2px solid var(--theme-secondary)',
                  }}
                >
                  Outline Secondary
                </button>
                <button
                  className="px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    background: 'transparent',
                    color: 'var(--theme-accent)',
                    border: '2px solid var(--theme-accent)',
                  }}
                >
                  Outline Accent
                </button>
              </div>
            </div>

            {/* Ghost Buttons - Minimal Actions */}
            <div>
              <h3
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: 'var(--theme-text)' }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full opacity-40"
                  style={{ background: 'var(--theme-primary)' }}
                ></span>
                Ghost Buttons — Minimal Actions
              </h3>
              <div className="flex flex-wrap gap-4">
                <button
                  className="px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    background: 'transparent',
                    color: 'var(--theme-primary)',
                    border: 'none',
                  }}
                >
                  Ghost Primary
                </button>
                <button
                  className="px-8 py-4 rounded-xl font-semibold transition-all duration-200 hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    background: 'transparent',
                    color: 'var(--theme-text)',
                    border: 'none',
                  }}
                >
                  Ghost Text
                </button>
              </div>
            </div>

            {/* Button Sizes */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
                Size Variants
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none"
                  style={{
                    background: 'var(--theme-primary)',
                    color: 'var(--theme-onPrimary)',
                  }}
                >
                  Small
                </button>
                <button
                  className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none"
                  style={{
                    background: 'var(--theme-primary)',
                    color: 'var(--theme-onPrimary)',
                  }}
                >
                  Medium
                </button>
                <button
                  className="px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none"
                  style={{
                    background: 'var(--theme-primary)',
                    color: 'var(--theme-onPrimary)',
                  }}
                >
                  Large
                </button>
                <button
                  className="px-12 py-5 rounded-xl text-lg font-bold transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 focus:outline-none"
                  style={{
                    background: 'var(--theme-primary)',
                    color: 'var(--theme-onPrimary)',
                  }}
                >
                  Extra Large
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Cards & Typography */}
        <section
          className="p-8 rounded-2xl shadow-lg"
          style={{
            background: 'var(--theme-surface)',
            border: `1px solid var(--theme-border)`,
          }}
        >
          <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--theme-text)' }}>
            Cards & Typography
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Primary Card',
                desc: 'Uses primary theme color for accents',
                color: 'primary',
              },
              {
                title: 'Secondary Card',
                desc: 'Uses secondary theme color for accents',
                color: 'secondary',
              },
              {
                title: 'Accent Card',
                desc: 'Uses accent theme color for highlights',
                color: 'accent',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border"
                style={{
                  background: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center"
                  style={{
                    background: `var(--theme-${card.color})`,
                  }}
                >
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--theme-text)' }}>
                  {card.title}
                </h3>
                <p
                  className="text-sm mb-4 leading-relaxed"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  {card.desc}
                </p>
                <button
                  className="w-full px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  style={{
                    background: `var(--theme-${card.color})`,
                    color: 'var(--theme-onPrimary)',
                  }}
                >
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Color Palette Reference */}
        <section
          className="p-8 rounded-2xl shadow-lg"
          style={{
            background: 'var(--theme-surface)',
            border: `1px solid var(--theme-border)`,
          }}
        >
          <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--theme-text)' }}>
            Color Palette
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Primary', var: '--theme-primary', textColor: 'var(--theme-onPrimary)' },
              { name: 'Secondary', var: '--theme-secondary', textColor: 'var(--theme-onPrimary)' },
              { name: 'Accent', var: '--theme-accent', textColor: 'var(--theme-onPrimary)' },
              { name: 'Background', var: '--theme-background', textColor: 'var(--theme-text)' },
              { name: 'Surface', var: '--theme-surface', textColor: 'var(--theme-text)' },
              { name: 'Text', var: '--theme-text', textColor: 'var(--theme-background)' },
              {
                name: 'Text Secondary',
                var: '--theme-textSecondary',
                textColor: 'var(--theme-background)',
              },
              { name: 'Border', var: '--theme-border', textColor: 'var(--theme-text)' },
            ].map((color) => (
              <div
                key={color.name}
                className="p-6 rounded-xl text-center shadow-md border"
                style={{
                  background: `var(${color.var})`,
                  borderColor: 'var(--theme-border)',
                }}
              >
                <div className="font-bold text-base mb-1" style={{ color: color.textColor }}>
                  {color.name}
                </div>
                <div className="text-xs font-mono opacity-80" style={{ color: color.textColor }}>
                  {color.var}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Alerts & Messages */}
        <section
          className="p-8 rounded-2xl shadow-lg"
          style={{
            background: 'var(--theme-surface)',
            border: `1px solid var(--theme-border)`,
          }}
        >
          <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--theme-text)' }}>
            Alerts & Messages
          </h2>

          <div className="space-y-4">
            <div
              className="p-5 rounded-xl border-l-4 shadow-sm"
              style={{
                background: 'var(--theme-surface)',
                borderColor: 'var(--theme-primary)',
                borderLeftWidth: '4px',
                borderTopWidth: '1px',
                borderRightWidth: '1px',
                borderBottomWidth: '1px',
                borderStyle: 'solid',
                borderTopColor: 'var(--theme-border)',
                borderRightColor: 'var(--theme-border)',
                borderBottomColor: 'var(--theme-border)',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'var(--theme-primary)', color: 'var(--theme-onPrimary)' }}
                >
                  ℹ
                </div>
                <div>
                  <h4 className="font-bold mb-1" style={{ color: 'var(--theme-text)' }}>
                    Information Alert
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--theme-textSecondary)' }}>
                    This is an informational message using the primary theme color
                  </p>
                </div>
              </div>
            </div>

            <div
              className="p-5 rounded-xl border-l-4 shadow-sm"
              style={{
                background: 'var(--theme-surface)',
                borderColor: 'var(--theme-accent)',
                borderLeftWidth: '4px',
                borderTopWidth: '1px',
                borderRightWidth: '1px',
                borderBottomWidth: '1px',
                borderStyle: 'solid',
                borderTopColor: 'var(--theme-border)',
                borderRightColor: 'var(--theme-border)',
                borderBottomColor: 'var(--theme-border)',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'var(--theme-accent)', color: 'var(--theme-onPrimary)' }}
                >
                  ✓
                </div>
                <div>
                  <h4 className="font-bold mb-1" style={{ color: 'var(--theme-text)' }}>
                    Success Message
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--theme-textSecondary)' }}>
                    Action completed successfully using the accent theme color
                  </p>
                </div>
              </div>
            </div>

            <div
              className="p-5 rounded-xl border-l-4 shadow-sm"
              style={{
                background: 'var(--theme-surface)',
                borderColor: 'var(--theme-secondary)',
                borderLeftWidth: '4px',
                borderTopWidth: '1px',
                borderRightWidth: '1px',
                borderBottomWidth: '1px',
                borderStyle: 'solid',
                borderTopColor: 'var(--theme-border)',
                borderRightColor: 'var(--theme-border)',
                borderBottomColor: 'var(--theme-border)',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'var(--theme-secondary)', color: 'var(--theme-onPrimary)' }}
                >
                  ⚠
                </div>
                <div>
                  <h4 className="font-bold mb-1" style={{ color: 'var(--theme-text)' }}>
                    Warning Notice
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--theme-textSecondary)' }}>
                    Please review this information using the secondary theme color
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gradient Showcase */}
        <section
          className="p-12 rounded-2xl text-center shadow-2xl"
          style={{
            background: 'var(--theme-gradient)',
            color: 'var(--theme-onPrimary)',
          }}
        >
          <h2 className="text-4xl font-bold mb-3">Theme Gradient Hero</h2>
          <p className="text-lg opacity-90 mb-8">
            Each theme has a unique gradient for hero sections and highlights
          </p>
          <div className="flex justify-center gap-4">
            <button
              className="px-8 py-4 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              style={{
                background: 'var(--theme-onPrimary)',
                color: 'var(--theme-primary)',
              }}
            >
              Get Started
            </button>
            <button
              className="px-8 py-4 rounded-xl font-bold transition-all duration-200 hover:bg-white hover:bg-opacity-20"
              style={{
                background: 'transparent',
                color: 'var(--theme-onPrimary)',
                border: '2px solid var(--theme-onPrimary)',
              }}
            >
              Learn More
            </button>
          </div>
        </section>

        {/* CSS Variables Reference */}
        <section
          className="p-8 rounded-2xl shadow-lg"
          style={{
            background: 'var(--theme-surface)',
            border: `1px solid var(--theme-border)`,
          }}
        >
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--theme-text)' }}>
            CSS Variables
          </h2>
          <p className="mb-6 text-base" style={{ color: 'var(--theme-textSecondary)' }}>
            All theme colors are available as CSS custom properties
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-sm">
            {[
              '--theme-primary',
              '--theme-secondary',
              '--theme-accent',
              '--theme-background',
              '--theme-surface',
              '--theme-text',
              '--theme-textSecondary',
              '--theme-border',
              '--theme-gradient',
              '--theme-glow',
            ].map((varName) => (
              <div
                key={varName}
                className="flex justify-between items-center p-4 rounded-lg border"
                style={{
                  background: 'var(--theme-background)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                <code style={{ color: 'var(--theme-textSecondary)' }}>{varName}</code>
                <div
                  className="w-16 h-8 rounded border"
                  style={{
                    background: `var(${varName})`,
                    borderColor: 'var(--theme-border)',
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
