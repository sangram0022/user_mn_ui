/**
 * Design System Export Index
 * Central export point for all design system components and utilities
 */

// Design tokens and utilities
export { designTokens, designUtils } from './tokens';

// Re-export commonly used design system utilities
import { designTokens, designUtils } from './tokens';

export const {
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
} = designTokens;

// Design utilities for components
export const getColor = designUtils.getColor;
export const buildClass = designUtils.buildClass;
export const responsive = designUtils.responsive;

// Default theme configuration
export const theme = {
  colors: designTokens.colors,
  typography: designTokens.typography,
  spacing: designTokens.spacing,
  borderRadius: designTokens.borderRadius,
  boxShadow: designTokens.boxShadow,
};
