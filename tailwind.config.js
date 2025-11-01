/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "!./src/_reference_backup_ui/**/*" // Exclude reference pages
  ],
  theme: {
    extend: {
      // Modern CSS Features Configuration for Tailwind 4.1.16
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      
      // CSS Grid 2.0 Features
      gridTemplateColumns: {
        'subgrid': 'subgrid',
        'auto-fit-250': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fill-200': 'repeat(auto-fill, minmax(200px, 1fr))',
        'auto-fit-300': 'repeat(auto-fit, minmax(300px, 1fr))',
      },
      
      gridTemplateRows: {
        'subgrid': 'subgrid',
        'auto': 'auto',
        'min-content': 'min-content',
        'max-content': 'max-content',
      },
      
      // Container Query Sizes
      containers: {
        'xs': '20rem',
        'sm': '24rem', 
        'md': '28rem',
        'lg': '32rem',
        'xl': '36rem',
        '2xl': '42rem',
        '3xl': '48rem',
        '4xl': '56rem',
        '5xl': '64rem',
        '6xl': '72rem',
        '7xl': '80rem',
      },
      
      // Modern Color System - OKLCH & P3
      colors: {
        // CSS Color Level 4 - Wide Gamut Colors
        'brand': {
          'primary': 'oklch(0.7 0.15 260)',
          'secondary': 'oklch(0.8 0.12 320)', 
          'accent': 'oklch(0.75 0.2 60)',
          'muted': 'oklch(0.85 0.05 260)',
        },
        'surface': {
          'primary': 'oklch(1 0 0)',
          'secondary': 'oklch(0.98 0 0)',
          'tertiary': 'oklch(0.95 0 0)',
          'elevated': 'color-mix(in oklch, oklch(1 0 0) 95%, oklch(0.7 0.15 260) 5%)',
          'glass': 'color-mix(in oklch, transparent 20%, oklch(1 0 0) 80%)',
        },
        'text': {
          'primary': 'oklch(0.2 0 0)',
          'secondary': 'oklch(0.5 0 0)',
          'tertiary': 'oklch(0.7 0 0)',
          'inverse': 'oklch(0.95 0 0)',
        },
        'semantic': {
          'success': 'oklch(0.7 0.15 142)',
          'warning': 'oklch(0.8 0.15 85)',
          'error': 'oklch(0.65 0.2 25)',
          'info': 'oklch(0.75 0.12 220)',
        },
        // P3 Display Colors for Supporting Browsers
        'p3': {
          'red': 'color(display-p3 1 0 0)',
          'green': 'color(display-p3 0 1 0)',
          'blue': 'color(display-p3 0 0 1)',
          'vivid-pink': 'color(display-p3 1 0.2 0.6)',
          'electric-blue': 'color(display-p3 0 0.8 1)',
        }
      },
      
      // Modern Typography with CSS Fonts Level 4
      fontFamily: {
        'sans': [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ],
        'serif': [
          'ui-serif',
          'Georgia', 
          'Cambria',
          '"Times New Roman"',
          'Times',
          'serif'
        ],
        'mono': [
          'ui-monospace',
          'SFMono-Regular',
          '"SF Mono"',
          'Consolas',
          '"Liberation Mono"',
          'Menlo',
          'monospace'
        ],
      },
      
      // CSS View Transitions
      transitionProperty: {
        'view': 'view-transition-name',
        'all-smooth': 'all, view-transition-name',
      },
      
      // Modern Spacing with Logical Properties
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)', 
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      
      // Advanced Box Shadows
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 16px 64px 0 rgba(31, 38, 135, 0.5)',
        'elevation-1': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'elevation-2': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'elevation-3': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'elevation-4': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'elevation-5': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      },
      
      // Modern Border Radius
      borderRadius: {
        'circle': '50%',
        'pill': '9999px',
        'organic': '30% 70% 70% 30% / 30% 30% 70% 70%',
      },
      
      // CSS Scroll Snap
      scrollSnapType: {
        'x-mandatory': 'x mandatory',
        'y-mandatory': 'y mandatory',
        'both-mandatory': 'both mandatory',
        'x-proximity': 'x proximity',
        'y-proximity': 'y proximity',
      },
      
      // Advanced Animations & Easing
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-out': 'fadeOut 0.5s ease-in',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-left': 'slideLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right': 'slideRight 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-out': 'scaleOut 0.4s cubic-bezier(0.7, 0, 0.84, 0)',
        'bounce-gentle': 'bounceGentle 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.9)' }
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-1deg)' },
          '75%': { transform: 'rotate(1deg)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor' }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      
      // Modern Easing Functions
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ease-in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'ease-in-out-back': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      
      // CSS Custom Properties for Dynamic Theming
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
    },
  },
  
  plugins: [
    // Container Queries Plugin for Tailwind v4
    function({ addUtilities, theme, addVariant }) {
      // Container Query Variants
      addVariant('cq-xs', '@container (min-width: 20rem)');
      addVariant('cq-sm', '@container (min-width: 24rem)');
      addVariant('cq-md', '@container (min-width: 28rem)');
      addVariant('cq-lg', '@container (min-width: 32rem)');
      addVariant('cq-xl', '@container (min-width: 36rem)');
      addVariant('cq-2xl', '@container (min-width: 42rem)');
      
      // CSS Anchor Positioning Utilities
      addUtilities({
        '.anchor-top': {
          'anchor-name': '--anchor-top',
          'position': 'absolute',
          'top': 'anchor(top)',
        },
        '.anchor-bottom': {
          'anchor-name': '--anchor-bottom', 
          'position': 'absolute',
          'bottom': 'anchor(bottom)',
        },
        '.anchor-left': {
          'anchor-name': '--anchor-left',
          'position': 'absolute', 
          'left': 'anchor(left)',
        },
        '.anchor-right': {
          'anchor-name': '--anchor-right',
          'position': 'absolute',
          'right': 'anchor(right)',
        },
      });
      
      // View Transition Utilities
      addUtilities({
        '.view-transition-slide': {
          'view-transition-name': 'slide',
        },
        '.view-transition-fade': {
          'view-transition-name': 'fade',
        },
        '.view-transition-scale': {
          'view-transition-name': 'scale',
        },
      });
      
      // CSS Subgrid Utilities
      addUtilities({
        '.grid-subgrid': {
          'display': 'subgrid',
        },
        '.grid-cols-subgrid': {
          'grid-template-columns': 'subgrid',
        },
        '.grid-rows-subgrid': {
          'grid-template-rows': 'subgrid',
        },
      });
      
      // Modern Layout Utilities
      addUtilities({
        '.container-query': {
          'container-type': 'inline-size',
        },
        '.container-query-size': {
          'container-type': 'size',
        },
        '.container-query-normal': {
          'container-type': 'normal',
        },
      });
      
      // CSS Nesting Utilities
      addUtilities({
        '.nested': {
          '&:hover': {
            '& > *': {
              'transform': 'scale(1.02)',
            }
          }
        }
      });
    },
  ],
  
  // CSS Layers for better specificity management
  layers: {
    'reset': 1,
    'base': 2,
    'tokens': 3,
    'utilities': 4,
    'components': 5,
    'overrides': 6,
  },
  
  // CSS-in-JS support for dynamic values
  safelist: [
    'text-brand-primary',
    'bg-brand-primary',
    'border-brand-primary',
    'text-semantic-success',
    'text-semantic-error',
    'text-semantic-warning',
    'text-semantic-info',
    {
      pattern: /^(text|bg|border)-(brand|surface|text|semantic)-(primary|secondary|tertiary|accent|muted|success|warning|error|info)$/,
    },
    {
      pattern: /^(animate|transition)-(fade|slide|scale|bounce|wiggle|float|glow|shimmer)(-\w+)?$/,
    },
    {
      pattern: /^(cq|container)-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)$/,
    }
  ],
  
  // Dark Mode Configuration
  darkMode: ['class', '[data-theme="dark"]'],
  
  // Experimental Features for Tailwind 4.1.16
  experimental: {
    optimizeUniversalDefaults: true,
  },
  
  // CSS Variables Configuration
  cssVariablePrefix: 'tw-',
}