/**
 * Design System Tokens
 *
 * Centralized design tokens for consistent UI across the application.
 * These tokens are the single source of truth for colors, spacing, typography, etc.
 *
 * Usage:
 * import { colors, spacing, typography } from '@styles/tokens';
 *
 * Or use Tailwind classes that are configured to use these tokens.
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const colors = {
  // Brand Colors
  brand: {
    primary: '#3b82f6', // blue-500
    secondary: '#64748b', // slate-500
    accent: '#8b5cf6', // violet-500
  },

  // Semantic Colors
  semantic: {
    success: '#22c55e', // green-500
    warning: '#eab308', // yellow-500
    error: '#ef4444', // red-500
    info: '#3b82f6', // blue-500
  },

  // Neutral Colors (Light Mode)
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Background Colors
  background: {
    light: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
    },
    dark: {
      primary: '#111827',
      secondary: '#1f2937',
      tertiary: '#374151',
    },
  },

  // Text Colors
  text: {
    light: {
      primary: '#111827',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      inverse: '#ffffff',
    },
    dark: {
      primary: '#f9fafb',
      secondary: '#d1d5db',
      tertiary: '#9ca3af',
      inverse: '#111827',
    },
  },

  // Border Colors
  border: {
    light: {
      default: '#e5e7eb',
      strong: '#d1d5db',
      subtle: '#f3f4f6',
    },
    dark: {
      default: '#374151',
      strong: '#4b5563',
      subtle: '#1f2937',
    },
  },
} as const;

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const spacing = {
  // Base unit: 4px (0.25rem)
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
  '4xl': '6rem', // 96px
  '5xl': '8rem', // 128px
  '6xl': '12rem', // 192px

  // Component-specific
  component: {
    paddingXs: '0.5rem',
    paddingSm: '0.75rem',
    paddingMd: '1rem',
    paddingLg: '1.5rem',
    paddingXl: '2rem',

    marginXs: '0.5rem',
    marginSm: '0.75rem',
    marginMd: '1rem',
    marginLg: '1.5rem',
    marginXl: '2rem',

    gapXs: '0.5rem',
    gapSm: '0.75rem',
    gapMd: '1rem',
    gapLg: '1.5rem',
    gapXl: '2rem',
  },
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const typography = {
  // Font Families
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Georgia', 'serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
  },

  // Font Sizes
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem', // 72px
    '8xl': '6rem', // 96px
    '9xl': '8rem', // 128px
  },

  // Font Weights
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const borderRadius = {
  none: '0px',
  sm: '0.125rem', // 2px
  base: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
} as const;

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// ============================================================================
// Z-INDEX TOKENS
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
  overlay: 1090,
} as const;

// ============================================================================
// TRANSITION TOKENS
// ============================================================================

export const transitions = {
  duration: {
    instant: '75ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },

  timing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// ============================================================================
// BREAKPOINT TOKENS
// ============================================================================

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// ANIMATION TOKENS
// ============================================================================

export const animations = {
  fadeIn: 'fadeIn 0.3s ease-in-out',
  fadeOut: 'fadeOut 0.3s ease-in-out',
  slideUp: 'slideUp 0.3s ease-out',
  slideDown: 'slideDown 0.3s ease-out',
  scaleIn: 'scaleIn 0.2s ease-out',
  scaleOut: 'scaleOut 0.2s ease-out',
  shimmer: 'shimmer 2s infinite',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  spin: 'spin 1s linear infinite',
  ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
  bounce: 'bounce 1s infinite',
} as const;

// ============================================================================
// COMPONENT TOKENS
// ============================================================================

export const components = {
  button: {
    height: {
      sm: '2rem', // 32px
      md: '2.5rem', // 40px
      lg: '3rem', // 48px
    },
    padding: {
      sm: '0.5rem 1rem',
      md: '0.75rem 1.5rem',
      lg: '1rem 2rem',
    },
  },

  input: {
    height: {
      sm: '2rem',
      md: '2.5rem',
      lg: '3rem',
    },
    padding: {
      sm: '0.5rem 0.75rem',
      md: '0.625rem 1rem',
      lg: '0.75rem 1.25rem',
    },
  },

  card: {
    padding: {
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
    },
    borderRadius: {
      sm: borderRadius.md,
      md: borderRadius.lg,
      lg: borderRadius.xl,
    },
  },

  modal: {
    maxWidth: {
      sm: '400px',
      md: '600px',
      lg: '800px',
      xl: '1200px',
    },
    padding: '1.5rem',
  },
} as const;

// ============================================================================
// EXPORT ALL TOKENS
// ============================================================================

export const tokens = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  zIndex,
  transitions,
  breakpoints,
  animations,
  components,
} as const;

export default tokens;

// Type exports for TypeScript
export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type ZIndex = typeof zIndex;
export type Transitions = typeof transitions;
export type Breakpoints = typeof breakpoints;
export type Animations = typeof animations;
export type Components = typeof components;
export type Tokens = typeof tokens;
