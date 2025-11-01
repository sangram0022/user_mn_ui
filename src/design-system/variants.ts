/**
 * Component Variants Configuration
 * Single source of truth for all component styles
 * Following clean code principles and DRY methodology
 */

// Button Component Variants
export const buttonVariants = {
  base: 'inline-flex items-center justify-center font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 rounded-lg',
  
  variants: {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40',
    secondary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40',
    accent: 'bg-gradient-to-r from-pink-600 to-red-600 text-white shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent',
    ghost: 'text-gray-700 hover:bg-gray-100 bg-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40',
    success: 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40',
  },
  
  sizes: {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-6 py-2 text-base h-10',
    lg: 'px-8 py-3 text-lg h-12',
    xl: 'px-10 py-4 text-xl h-14',
  },
} as const;

// Badge Component Variants
export const badgeVariants = {
  base: 'inline-flex items-center rounded-full font-medium',
  
  variants: {
    primary: 'bg-blue-100 text-blue-700 border border-blue-200',
    secondary: 'bg-purple-100 text-purple-700 border border-purple-200',
    success: 'bg-green-100 text-green-700 border border-green-200',
    danger: 'bg-red-100 text-red-700 border border-red-200',
    warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    info: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
    gray: 'bg-gray-100 text-gray-700 border border-gray-200',
  },
  
  sizes: {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  },
} as const;

// Export type for Badge sizes
export type BadgeSize = keyof typeof badgeVariants.sizes;

// Input Component Variants
export const inputVariants = {
  base: 'w-full border rounded-lg transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed',
  
  variants: {
    default: 'px-4 py-2 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    error: 'px-4 py-2 border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent',
    success: 'px-4 py-2 border-green-500 focus:ring-2 focus:ring-green-500 focus:border-transparent',
  },
  
  sizes: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  },
} as const;

// Card Component Variants
export const cardVariants = {
  base: 'bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-300',
  
  variants: {
    default: 'p-6',
    compact: 'p-4',
    spacious: 'p-8',
    interactive: 'p-6 hover:shadow-2xl hover:-translate-y-2 cursor-pointer',
  },
  
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  },
} as const;

// Layout Component Variants
export const layoutVariants = {
  container: {
    base: 'w-full mx-auto px-4 sm:px-6 lg:px-8',
    maxWidth: {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md', 
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      '7xl': 'max-w-7xl',
      '8xl': 'max-w-8xl',
    },
  },
  
  grid: {
    base: 'grid gap-6',
    responsive: {
      sm1: 'grid-cols-1',
      sm2: 'grid-cols-1 sm:grid-cols-2',
      sm3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      sm4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      md2: 'grid-cols-1 md:grid-cols-2',
      md3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      md4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      lg2: 'grid-cols-1 lg:grid-cols-2',
      lg3: 'grid-cols-1 lg:grid-cols-3',
      lg4: 'grid-cols-1 lg:grid-cols-4',
    },
  },
} as const;

// Animation Variants
export const animationVariants = {
  entrance: {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    slideDown: 'animate-slide-down',
    slideLeft: 'animate-slide-left',
    slideRight: 'animate-slide-right',
    scaleIn: 'animate-scale-in',
    scaleUp: 'animate-scale-up',
  },
  
  interactions: {
    pulse: 'animate-pulse-slow',
    bounce: 'animate-bounce-slow',
    spin: 'animate-spin-slow',
    shake: 'animate-shake',
  },
  
  stagger: {
    'delay-1': 'animate-stagger-1',
    'delay-2': 'animate-stagger-2', 
    'delay-3': 'animate-stagger-3',
    'delay-4': 'animate-stagger-4',
    'delay-5': 'animate-stagger-5',
    'delay-6': 'animate-stagger-6',
    'delay-7': 'animate-stagger-7',
    'delay-8': 'animate-stagger-8',
    'delay-9': 'animate-stagger-9',
    'delay-10': 'animate-stagger-10',
  },
} as const;

// Animation utilities for single source of truth
export const animationUtils = {
  /**
   * Gets stagger animation class for given index
   * Single source of truth for animation delays
   * @param index - Zero-based index for staggered animations
   * @param maxDelay - Maximum delay index (default: 10)
   */
  getStaggerClass: (index: number, maxDelay: number = 10): string => {
    const delayIndex = Math.min(index + 1, maxDelay);
    return `animate-stagger-${delayIndex}`;
  },
  
  /**
   * Combines animation with stagger delay
   * @param animation - Base animation class
   * @param index - Zero-based index for staggered animations
   */
  withStagger: (animation: string, index: number): string => {
    return `${animation} ${animationUtils.getStaggerClass(index)}`;
  },
} as const;

// Typography Variants
export const typographyVariants = {
  headings: {
    h1: 'text-5xl md:text-6xl lg:text-7xl font-bold leading-tight',
    h2: 'text-4xl md:text-5xl font-bold leading-tight',
    h3: 'text-3xl md:text-4xl font-semibold leading-tight',
    h4: 'text-2xl md:text-3xl font-semibold leading-tight',
    h5: 'text-xl md:text-2xl font-semibold leading-tight',
    h6: 'text-lg md:text-xl font-semibold leading-tight',
  },
  
  body: {
    xl: 'text-xl leading-relaxed',
    lg: 'text-lg leading-relaxed',
    base: 'text-base leading-normal',
    sm: 'text-sm leading-normal',
    xs: 'text-xs leading-normal',
  },
  
  special: {
    gradient: 'text-gradient',
    truncate: 'truncate',
    ellipsis: 'overflow-hidden text-ellipsis whitespace-nowrap',
  },
} as const;

// Utility class combinations for common patterns
export const commonPatterns = {
  // Flex patterns
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  flexStart: 'flex items-center justify-start',
  flexEnd: 'flex items-center justify-end',
  flexCol: 'flex flex-col',
  flexColCenter: 'flex flex-col items-center justify-center',
  flexColBetween: 'flex flex-col justify-between',
  
  // Responsive patterns
  responsiveText: 'text-sm md:text-base lg:text-lg',
  responsivePadding: 'px-4 md:px-6 lg:px-8',
  responsiveMargin: 'mx-4 md:mx-6 lg:mx-8',
  responsiveGap: 'gap-4 md:gap-6 lg:gap-8',
  
  // Common combinations
  centeredContainer: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  fullScreenSection: 'min-h-screen flex items-center justify-center',
  sectionPadding: 'py-12 md:py-16 lg:py-24',
  cardHover: 'transition-all duration-300 hover:shadow-2xl hover:-translate-y-2',
  
  // Interactive states
  buttonReset: 'border-none bg-transparent p-0 m-0 cursor-pointer',
  linkReset: 'text-inherit no-underline',
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  
  // Glass effects
  glass: 'glass',
  glassDark: 'glass-dark',
  
  // Performance optimizations
  gpuAccelerated: 'gpu-accelerated',
  containLayout: 'contain-layout',
  containPaint: 'contain-paint',
} as const;

// Export types for TypeScript support
export type ButtonVariant = keyof typeof buttonVariants.variants;
export type ButtonSize = keyof typeof buttonVariants.sizes;
export type BadgeVariant = keyof typeof badgeVariants.variants;
export type InputVariant = keyof typeof inputVariants.variants;
export type InputSize = keyof typeof inputVariants.sizes;
export type CardVariant = keyof typeof cardVariants.variants;
export type AnimationVariant = keyof typeof animationVariants.entrance;
export type TypographyVariant = keyof typeof typographyVariants.headings;