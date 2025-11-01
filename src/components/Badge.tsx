/**
 * Design System - Badge Component
 * All badge variants in one place with React 19 optimizations
 * Single source of truth - all styles from variants.ts
 */

import type { ReactNode } from 'react';
import { badgeVariants, type BadgeVariant, type BadgeSize } from '../design-system/variants';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  size?: BadgeSize;
}

export default function Badge({ 
  variant = 'primary', 
  children, 
  className = '',
  size = 'md'
}: BadgeProps) {
  const classes = [
    badgeVariants.base,
    badgeVariants.variants[variant],
    badgeVariants.sizes[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {children}
    </span>
  );
}
