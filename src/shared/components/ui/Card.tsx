import { cn } from '@shared/utils';
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** Enable container query responsive behavior */
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
 * Common card component with consistent styling patterns
 * Consolidates repeated background, shadow, and border patterns
 *
 * @param responsive - When true, enables container query responsive behavior
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
