import type { CSSProperties } from 'react';

/**
 * Design System - Modular Reusable Styles
 * Centralized styling system for consistent UI across all pages
 */

// Color Palette
export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  // Secondary Colors
  secondary: {
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
  },
  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  // Backgrounds
  background: {
    light: '#ffffff',
    gray: '#f9fafb',
    dark: '#111827',
  },
};

// Typography
export const typography = {
  fontFamily: {
    base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },
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
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
};

// Spacing
export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '0.75rem', // 12px
  lg: '1rem', // 16px
  xl: '1.5rem', // 24px
  '2xl': '2rem', // 32px
  '3xl': '3rem', // 48px
  '4xl': '4rem', // 64px
  '5xl': '6rem', // 96px
};

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

// Container Styles
export const containers = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: spacing['2xl'],
    boxSizing: 'border-box',
  } as CSSProperties,

  card: {
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.xl,
    boxShadow: shadows.xl,
    padding: spacing['2xl'],
    boxSizing: 'border-box',
  } as CSSProperties,

  section: {
    padding: `${spacing['4xl']} ${spacing.xl}`,
    boxSizing: 'border-box',
  } as CSSProperties,

  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${spacing.xl}`,
    boxSizing: 'border-box',
  } as CSSProperties,
};

// Form Input Styles
export const formInputStyles = {
  base: {
    display: 'block',
    width: '100%',
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    border: `1px solid ${colors.secondary[300]}`,
    borderRadius: borderRadius.md,
    boxShadow: shadows.sm,
    color: colors.secondary[900],
    fontSize: typography.fontSize.sm,
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: colors.background.light,
  } as CSSProperties,

  withIcon: {
    paddingLeft: '2.5rem',
  } as CSSProperties,

  focused: {
    borderColor: colors.primary[500],
    boxShadow: `0 0 0 3px rgba(59, 130, 246, 0.1)`,
  } as CSSProperties,

  error: {
    borderColor: colors.error,
    boxShadow: `0 0 0 3px rgba(239, 68, 68, 0.1)`,
  } as CSSProperties,

  label: {
    display: 'block',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.secondary[700],
    marginBottom: spacing.sm,
  } as CSSProperties,
};

// Button Styles
export const buttonStyles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${spacing.md} ${spacing.xl}`,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    borderRadius: borderRadius.md,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box',
  } as CSSProperties,

  primary: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: colors.background.light,
    boxShadow: shadows.md,
  } as CSSProperties,

  primaryHover: {
    transform: 'translateY(-1px)',
    boxShadow: shadows.lg,
  } as CSSProperties,

  secondary: {
    backgroundColor: colors.secondary[100],
    color: colors.secondary[700],
    border: `1px solid ${colors.secondary[300]}`,
  } as CSSProperties,

  secondaryHover: {
    backgroundColor: colors.secondary[200],
  } as CSSProperties,

  outline: {
    backgroundColor: 'transparent',
    color: colors.primary[600],
    border: `1px solid ${colors.primary[600]}`,
  } as CSSProperties,

  outlineHover: {
    backgroundColor: colors.primary[50],
  } as CSSProperties,

  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as CSSProperties,
};

// Navigation Styles
export const navigationStyles = {
  navbar: {
    position: 'sticky' as const,
    top: 0,
    left: 0,
    right: 0,
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
    zIndex: 50,
  } as CSSProperties,

  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `${spacing.lg} ${spacing.xl}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxSizing: 'border-box',
  } as CSSProperties,

  navLink: {
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.secondary[700],
    textDecoration: 'none',
    borderRadius: borderRadius.md,
    transition: 'all 0.2s ease',
  } as CSSProperties,

  navLinkHover: {
    backgroundColor: colors.secondary[100],
    color: colors.primary[600],
  } as CSSProperties,

  navLinkActive: {
    backgroundColor: colors.primary[50],
    color: colors.primary[700],
  } as CSSProperties,
};

// Alert/Message Styles
export const alertStyles = {
  base: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.lg,
    boxSizing: 'border-box',
  } as CSSProperties,

  success: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    border: '1px solid #6ee7b7',
  } as CSSProperties,

  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
  } as CSSProperties,

  warning: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    border: '1px solid #fcd34d',
  } as CSSProperties,

  info: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    border: '1px solid #93c5fd',
  } as CSSProperties,
};

// Card Styles
export const cardStyles = {
  base: {
    backgroundColor: colors.background.light,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.base,
    padding: spacing.xl,
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  } as CSSProperties,

  hover: {
    boxShadow: shadows.lg,
    transform: 'translateY(-2px)',
  } as CSSProperties,

  header: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.secondary[900],
    marginBottom: spacing.lg,
  } as CSSProperties,

  body: {
    fontSize: typography.fontSize.base,
    color: colors.secondary[600],
    lineHeight: typography.lineHeight.relaxed,
  } as CSSProperties,
};

// Gradient Backgrounds
export const gradients = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  warm: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  cool: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  sunset: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
};

// Utility Functions
export const mergeStyles = (...styles: (CSSProperties | undefined)[]): CSSProperties => {
  return styles.reduce((acc, style) => ({ ...acc, ...style }), {});
};

export const createHoverStyle = (baseStyle: CSSProperties, hoverStyle: CSSProperties) => {
  return {
    base: baseStyle,
    hover: { ...baseStyle, ...hoverStyle },
  };
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  containers,
  formInputStyles,
  buttonStyles,
  navigationStyles,
  alertStyles,
  cardStyles,
  gradients,
  mergeStyles,
  createHoverStyle,
};
