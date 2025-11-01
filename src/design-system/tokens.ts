/**
 * Design System Tokens - Single Source of Truth
 * Using latest CSS features including oklch colors and modern approaches
 * Following clean code principles and DRY methodology
 */

// Modern Color Tokens using OKLCH (2024+)
export const designTokens = {
  // Brand Colors using OKLCH for better perceptual uniformity
  colors: {
    brand: {
      primary: 'oklch(0.7 0.15 260)', // Blue with consistent lightness
      secondary: 'oklch(0.8 0.12 320)', // Purple with consistent lightness
      accent: 'oklch(0.75 0.2 60)', // Orange with consistent lightness
    },
    
    semantic: {
      success: 'oklch(0.7 0.15 142)', // Green
      warning: 'oklch(0.8 0.15 85)', // Yellow
      error: 'oklch(0.65 0.2 25)', // Red
      info: 'oklch(0.75 0.12 220)', // Light Blue
    },
    
    // Neutral colors with perceptual lightness steps
    neutral: {
      900: 'oklch(0.15 0 0)', // Near black
      800: 'oklch(0.25 0 0)',
      700: 'oklch(0.35 0 0)',
      600: 'oklch(0.45 0 0)',
      500: 'oklch(0.55 0 0)',
      400: 'oklch(0.65 0 0)',
      300: 'oklch(0.75 0 0)',
      200: 'oklch(0.85 0 0)',
      100: 'oklch(0.95 0 0)',
      50: 'oklch(0.98 0 0)', // Near white
    },
    
    surface: {
      primary: 'oklch(1 0 0)', // Pure white
      secondary: 'oklch(0.98 0 0)', // Off white
      tertiary: 'oklch(0.95 0 0)', // Light gray
      elevated: 'color-mix(in oklch, oklch(1 0 0) 95%, oklch(0.7 0.15 260) 5%)', // Slight blue tint
    },
    
    text: {
      primary: 'oklch(0.2 0 0)', // Dark gray
      secondary: 'oklch(0.5 0 0)', // Medium gray
      tertiary: 'oklch(0.7 0 0)', // Light gray
      inverse: 'oklch(0.95 0 0)', // Light text for dark backgrounds
    },
    
    // Dynamic color mixing functions
    interactive: {
      hover: 'color-mix(in oklch, var(--color-current) 85%, oklch(0 0 0) 15%)', // Darken on hover
      active: 'color-mix(in oklch, var(--color-current) 75%, oklch(0 0 0) 25%)', // Darken more on active
      disabled: 'color-mix(in oklch, var(--color-current) 50%, transparent 50%)', // Semi-transparent
    },
  },

  // Typography Scale with fluid typography
  typography: {
    fontFamily: {
      sans: ['Inter Variable', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
      display: ['Cal Sans', 'Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
    },
    
    // Fluid typography using clamp()
    fontSizes: {
      xs: 'clamp(0.75rem, 0.95vw, 0.875rem)', // 12-14px
      sm: 'clamp(0.875rem, 1.1vw, 1rem)', // 14-16px
      base: 'clamp(1rem, 1.25vw, 1.125rem)', // 16-18px
      lg: 'clamp(1.125rem, 1.4vw, 1.25rem)', // 18-20px
      xl: 'clamp(1.25rem, 1.6vw, 1.5rem)', // 20-24px
      '2xl': 'clamp(1.5rem, 2vw, 1.875rem)', // 24-30px
      '3xl': 'clamp(1.875rem, 2.5vw, 2.25rem)', // 30-36px
      '4xl': 'clamp(2.25rem, 3vw, 3rem)', // 36-48px
      '5xl': 'clamp(3rem, 4vw, 3.75rem)', // 48-60px
      '6xl': 'clamp(3.75rem, 5vw, 4.5rem)', // 60-72px
      '7xl': 'clamp(4.5rem, 6vw, 6rem)', // 72-96px
    },
    
    fontWeights: {
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
    
    lineHeights: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },

  // Spacing Scale with logical properties support
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem', // 2px
    1: '0.25rem', // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem', // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem', // 12px
    3.5: '0.875rem', // 14px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    7: '1.75rem', // 28px
    8: '2rem', // 32px
    9: '2.25rem', // 36px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
    32: '8rem', // 128px
    40: '10rem', // 160px
    48: '12rem', // 192px
    56: '14rem', // 224px
    64: '16rem', // 256px
    72: '18rem', // 288px
    80: '20rem', // 320px
    96: '24rem', // 384px
  },

  // Border Radius with modern approach
  borderRadius: {
    none: '0',
    sm: '0.125rem', // 2px
    base: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    '3xl': '1.5rem', // 24px
    '4xl': '2rem', // 32px
    full: '50%', // Changed from 9999px for better performance
  },

  // Modern shadows using color-mix
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 color-mix(in srgb, oklch(0 0 0) 5%, transparent)',
    sm: '0 1px 3px 0 color-mix(in srgb, oklch(0 0 0) 10%, transparent), 0 1px 2px -1px color-mix(in srgb, oklch(0 0 0) 10%, transparent)',
    md: '0 4px 6px -1px color-mix(in srgb, oklch(0 0 0) 10%, transparent), 0 2px 4px -2px color-mix(in srgb, oklch(0 0 0) 10%, transparent)',
    lg: '0 10px 15px -3px color-mix(in srgb, oklch(0 0 0) 10%, transparent), 0 4px 6px -4px color-mix(in srgb, oklch(0 0 0) 10%, transparent)',
    xl: '0 20px 25px -5px color-mix(in srgb, oklch(0 0 0) 10%, transparent), 0 8px 10px -6px color-mix(in srgb, oklch(0 0 0) 10%, transparent)',
    '2xl': '0 25px 50px -12px color-mix(in srgb, oklch(0 0 0) 25%, transparent)',
    inner: 'inset 0 2px 4px 0 color-mix(in srgb, oklch(0 0 0) 5%, transparent)',
    
    // Colored shadows for interactive elements
    colored: {
      primary: '0 4px 14px 0 color-mix(in oklch, var(--color-brand-primary) 25%, transparent)',
      success: '0 4px 14px 0 color-mix(in oklch, var(--color-semantic-success) 25%, transparent)',
      warning: '0 4px 14px 0 color-mix(in oklch, var(--color-semantic-warning) 25%, transparent)',
      error: '0 4px 14px 0 color-mix(in oklch, var(--color-semantic-error) 25%, transparent)',
    },
  },

  // Animation tokens with modern features
  animation: {
    durations: {
      instant: '0ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '750ms',
      slowest: '1000ms',
    },
    
    easings: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    
    // View transition names for smooth page transitions
    viewTransitions: {
      slideIn: 'slide-in',
      slideOut: 'slide-out',
      fadeIn: 'fade-in',
      fadeOut: 'fade-out',
      scaleIn: 'scale-in',
      scaleOut: 'scale-out',
    },
    
    // Scroll-driven animation timelines
    scrollTimelines: {
      root: 'scroll(root)',
      nearest: 'scroll(nearest)',
      self: 'scroll(self)',
    },
  },

  // Container query breakpoints
  containers: {
    xs: '20rem', // 320px
    sm: '24rem', // 384px
    md: '28rem', // 448px
    lg: '32rem', // 512px
    xl: '36rem', // 576px
    '2xl': '42rem', // 672px
    '3xl': '48rem', // 768px
    '4xl': '56rem', // 896px
    '5xl': '64rem', // 1024px
    '6xl': '72rem', // 1152px
    '7xl': '80rem', // 1280px
  },

  // Viewport breakpoints
  breakpoints: {
    xs: '20rem', // 320px
    sm: '40rem', // 640px
    md: '48rem', // 768px
    lg: '64rem', // 1024px
    xl: '80rem', // 1280px
    '2xl': '96rem', // 1536px
    '3xl': '112rem', // 1792px
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
  
  // Modern CSS features
  modern: {
    // CSS Anchor positioning
    anchor: {
      top: 'anchor(top)',
      bottom: 'anchor(bottom)',
      left: 'anchor(left)',
      right: 'anchor(right)',
      center: 'anchor(center)',
    },
    
    // CSS containment
    contain: {
      none: 'none',
      strict: 'strict',
      content: 'content',
      size: 'size',
      layout: 'layout',
      style: 'style',
      paint: 'paint',
    },
    
    // Container query sizes
    containerType: {
      normal: 'normal',
      size: 'size',
      inlineSize: 'inline-size',
    },
  },
} as const;

// Type helpers for better TypeScript support
export type BrandColor = keyof typeof designTokens.colors.brand;
export type SemanticColor = keyof typeof designTokens.colors.semantic;
export type NeutralColor = keyof typeof designTokens.colors.neutral;
export type SurfaceColor = keyof typeof designTokens.colors.surface;
export type TextColor = keyof typeof designTokens.colors.text;
export type SpacingSize = keyof typeof designTokens.spacing;
export type BorderRadiusSize = keyof typeof designTokens.borderRadius;
export type ShadowSize = keyof typeof designTokens.shadows;
export type AnimationDuration = keyof typeof designTokens.animation.durations;
export type AnimationEasing = keyof typeof designTokens.animation.easings;
export type Breakpoint = keyof typeof designTokens.breakpoints;
export type Container = keyof typeof designTokens.containers;
export type ZIndex = keyof typeof designTokens.zIndex;

// Utility functions with type safety
export const getColor = (category: 'brand' | 'semantic' | 'neutral' | 'surface' | 'text', variant: string) => {
  return designTokens.colors[category]?.[variant as keyof typeof designTokens.colors[typeof category]];
};

export const getSpacing = (size: SpacingSize) => designTokens.spacing[size];
export const getBorderRadius = (size: BorderRadiusSize) => designTokens.borderRadius[size];
export const getShadow = (size: ShadowSize) => designTokens.shadows[size];
export const getBreakpoint = (size: Breakpoint) => designTokens.breakpoints[size];
export const getContainer = (size: Container) => designTokens.containers[size];

// CSS Custom Properties for dynamic theming
export const cssVariables = {
  // Brand colors
  '--color-brand-primary': designTokens.colors.brand.primary,
  '--color-brand-secondary': designTokens.colors.brand.secondary,
  '--color-brand-accent': designTokens.colors.brand.accent,
  
  // Semantic colors
  '--color-semantic-success': designTokens.colors.semantic.success,
  '--color-semantic-warning': designTokens.colors.semantic.warning,
  '--color-semantic-error': designTokens.colors.semantic.error,
  '--color-semantic-info': designTokens.colors.semantic.info,
  
  // Surface colors
  '--color-surface-primary': designTokens.colors.surface.primary,
  '--color-surface-secondary': designTokens.colors.surface.secondary,
  '--color-surface-tertiary': designTokens.colors.surface.tertiary,
  '--color-surface-elevated': designTokens.colors.surface.elevated,
  
  // Text colors
  '--color-text-primary': designTokens.colors.text.primary,
  '--color-text-secondary': designTokens.colors.text.secondary,
  '--color-text-tertiary': designTokens.colors.text.tertiary,
  '--color-text-inverse': designTokens.colors.text.inverse,
  
  // Interactive states
  '--color-interactive-hover': designTokens.colors.interactive.hover,
  '--color-interactive-active': designTokens.colors.interactive.active,
  '--color-interactive-disabled': designTokens.colors.interactive.disabled,
  
  // Animation
  '--animation-duration-fast': designTokens.animation.durations.fast,
  '--animation-duration-normal': designTokens.animation.durations.normal,
  '--animation-duration-slow': designTokens.animation.durations.slow,
  
  '--animation-easing-ease-in-out': designTokens.animation.easings.easeInOut,
  '--animation-easing-spring': designTokens.animation.easings.spring,
  '--animation-easing-bounce': designTokens.animation.easings.bounce,
} as const;