/**
 * Card Component - Modern React 19 Implementation
 *
 * Features:
 * - React 19 memo optimization for re-render prevention
 * - Modern CSS with GPU acceleration and :has() selector
 * - OKLCH color space with smooth gradients
 * - Container queries for true responsive design
 * - Glassmorphism with backdrop-filter
 * - Hover lift effects with smooth transitions
 *
 * @since 2024-2025 Modernization Phase 2
 */

import { cn } from '@shared/utils';
import type React from 'react';
import { memo } from 'react';

/**
 * Card component props
 */
interface CardProps {
  /**
   * Card content
   */
  children: React.ReactNode;

  /**
   * Visual variant of the card
   * @default 'default'
   * @example
   * variant="elevated" // For emphasis
   * variant="glass" // For modern glassmorphism effect
   */
  variant?: 'default' | 'elevated' | 'bordered' | 'glass';

  /**
   * Internal padding size
   * @default 'md'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Enable container query responsive behavior
   * When true, card adapts to its container size rather than viewport
   * @default false
   */
  responsive?: boolean;
}

const cardVariants = {
  default:
    'bg-surface-primary shadow-modern rounded-2xl transition-all duration-200 hover:shadow-lg gpu-accelerated',
  elevated:
    'bg-surface-primary shadow-elevated-modern rounded-2xl border border-border-primary transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 gpu-accelerated',
  bordered:
    'bg-surface-primary shadow-sm rounded-xl border-2 border-border-primary transition-all duration-200 hover:border-primary-500 hover:shadow-md gpu-accelerated',
  glass:
    'glass-card-modern rounded-2xl border border-border-primary/50 transition-all duration-300 hover:border-primary-400/70 hover:shadow-xl gpu-accelerated backdrop-blur-xl',
};

const cardPadding = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-8 sm:p-10',
};

/**
 * Card Component
 *
 * A flexible card container with consistent styling patterns.
 * Consolidates repeated background, shadow, and border patterns across the app.
 *
 * Features:
 * - Multiple visual variants (default, elevated, bordered, glass)
 * - Flexible padding options
 * - Container query support for responsive layouts
 * - Dark mode compatible
 * - Consistent design system integration
 *
 * @example
 * // Basic card
 * <Card>
 *   <h2>Card Title</h2>
 *   <p>Card content</p>
 * </Card>
 *
 * @example
 * // Elevated card with custom padding
 * <Card variant="elevated" padding="lg">
 *   <YourContent />
 * </Card>
 *
 * @example
 * // Glass effect card with container queries
 * <Card variant="glass" responsive>
 *   <DynamicContent />
 * </Card>
 */
const CardComponent: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  responsive = false,
}) => (
  <div
    className={cn(
      'card-modern',
      cardVariants[variant],
      cardPadding[padding],
      responsive && '@container card-responsive',
      'will-change-transform',
      className
    )}
  >
    {children}
  </div>
);

CardComponent.displayName = 'Card';

/**
 * Memoized Card component to prevent unnecessary re-renders
 * Uses React 19 memo for optimal performance
 */
export const Card = memo(CardComponent);
