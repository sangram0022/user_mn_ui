/**
 * Design System Configuration and Tokens
 * Modern design system for consistent UI/UX across the application
 */

// Color palette with semantic meanings
export const colors = {
  // Primary brand colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main brand color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },
  
  // Secondary colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },
  
  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },
  
  info: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e'
  }
} as const;

// Typography scale
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Georgia', 'serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace']
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
    '7xl': ['4.5rem', { lineHeight: '1' }],
    '8xl': ['6rem', { lineHeight: '1' }],
    '9xl': ['8rem', { lineHeight: '1' }]
  },
  
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  }
} as const;

// Spacing scale
export const spacing = {
  px: '1px',
  0: '0px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem'
} as const;

// Border radius scale
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px'
} as const;

// Shadows
export const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000'
} as const;

// Animation and transitions
export const animation = {
  none: 'none',
  spin: 'spin 1s linear infinite',
  ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  bounce: 'bounce 1s infinite',
  'fade-in': 'fadeIn 0.3s ease-in-out',
  'fade-out': 'fadeOut 0.3s ease-in-out',
  'slide-up': 'slideUp 0.3s ease-out',
  'slide-down': 'slideDown 0.3s ease-out',
  'scale-in': 'scaleIn 0.2s ease-out',
  'scale-out': 'scaleOut 0.2s ease-out'
} as const;

// Component variants
export const variants = {
  button: {
    primary: {
      base: 'bg-primary-500 text-white border-primary-500 hover:bg-primary-600 focus:ring-primary-500',
      disabled: 'bg-primary-300 text-primary-100 cursor-not-allowed'
    },
    secondary: {
      base: 'bg-white text-secondary-700 border-secondary-300 hover:bg-secondary-50 focus:ring-secondary-500',
      disabled: 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
    },
    success: {
      base: 'bg-success-500 text-white border-success-500 hover:bg-success-600 focus:ring-success-500',
      disabled: 'bg-success-300 text-success-100 cursor-not-allowed'
    },
    warning: {
      base: 'bg-warning-500 text-white border-warning-500 hover:bg-warning-600 focus:ring-warning-500',
      disabled: 'bg-warning-300 text-warning-100 cursor-not-allowed'
    },
    error: {
      base: 'bg-error-500 text-white border-error-500 hover:bg-error-600 focus:ring-error-500',
      disabled: 'bg-error-300 text-error-100 cursor-not-allowed'
    },
    ghost: {
      base: 'bg-transparent text-secondary-700 border-transparent hover:bg-secondary-100 focus:ring-secondary-500',
      disabled: 'bg-transparent text-secondary-400 cursor-not-allowed'
    },
    outline: {
      base: 'bg-transparent text-primary-500 border-primary-500 hover:bg-primary-50 focus:ring-primary-500',
      disabled: 'bg-transparent text-primary-300 border-primary-300 cursor-not-allowed'
    }
  },
  
  input: {
    default: {
      base: 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500',
      error: 'border-error-500 focus:border-error-500 focus:ring-error-500',
      success: 'border-success-500 focus:border-success-500 focus:ring-success-500',
      disabled: 'bg-secondary-50 border-secondary-200 text-secondary-500 cursor-not-allowed'
    }
  },
  
  alert: {
    success: {
      base: 'bg-success-50 border-success-200 text-success-800',
      icon: 'text-success-400'
    },
    warning: {
      base: 'bg-warning-50 border-warning-200 text-warning-800',
      icon: 'text-warning-400'
    },
    error: {
      base: 'bg-error-50 border-error-200 text-error-800',
      icon: 'text-error-400'
    },
    info: {
      base: 'bg-info-50 border-info-200 text-info-800',
      icon: 'text-info-400'
    }
  }
} as const;

// Component sizes
export const sizes = {
  button: {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-6 py-3 text-base'
  },
  
  input: {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-4 py-3 text-base'
  },
  
  icon: {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// Z-index scale
export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1060',
  toast: '1070'
} as const;

// Component base classes
export const baseClasses = {
  button: 'inline-flex items-center justify-center border font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  input: 'block w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 disabled:bg-gray-50 disabled:text-gray-500',
  card: 'bg-white rounded-lg border border-secondary-200 shadow-sm',
  modal: 'fixed inset-0 z-modal overflow-y-auto',
  overlay: 'fixed inset-0 bg-black bg-opacity-50 transition-opacity',
  dropdown: 'absolute z-dropdown mt-1 bg-white border border-secondary-200 rounded-md shadow-lg'
} as const;

// Layout constants
export const layout = {
  containerMaxWidth: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  gridCols: {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6',
    12: 'grid-cols-12'
  },
  
  aspectRatio: {
    square: 'aspect-square',
    video: 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '3/2': 'aspect-[3/2]',
    '16/9': 'aspect-[16/9]'
  }
} as const;

// Design tokens export
export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  animation,
  variants,
  sizes,
  breakpoints,
  zIndex,
  baseClasses,
  layout
} as const;

// Utility functions for design system
export const designUtils = {
  // Get color value by path
  getColor: (path: string): string => {
    const keys = path.split('.');
    let value: unknown = colors;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return path;
      }
    }
    
    return typeof value === 'string' ? value : path;
  },
  
  // Build Tailwind class string
  buildClass: (...classes: (string | undefined | null | false)[]): string => {
    return classes.filter(Boolean).join(' ');
  },
  
  // Get responsive class string
  responsive: (base: string, responsiveClasses?: Partial<Record<'sm' | 'md' | 'lg' | 'xl' | '2xl', string>>): string => {
    let classes = base;
    
    if (responsiveClasses) {
      Object.entries(responsiveClasses).forEach(([bp, cls]) => {
        if (cls) {
          classes += ` ${bp}:${cls}`;
        }
      });
    }
    
    return classes;
  },
  
  // Merge component variants
  mergeVariants: (base: string, variant?: string, size?: string, className?: string): string => {
    return designUtils.buildClass(base, variant, size, className);
  }
};

export default designTokens;