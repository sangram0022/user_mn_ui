import { cn } from '@shared/utils';
import React from 'react';

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
  default: 'bg-white shadow rounded-lg',
  elevated: 'bg-white shadow-xl rounded-2xl border border-gray-100',
  bordered: 'bg-white shadow-sm rounded-lg border border-gray-200',
  glass: 'bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-200/50',
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
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  responsive = false,
}) => {
  return (
    <div
      className={cn(
        cardVariants[variant],
        cardPadding[padding],
        responsive && 'container-card card-responsive',
        className
      )}
    >
      {children}
    </div>
  );
};
