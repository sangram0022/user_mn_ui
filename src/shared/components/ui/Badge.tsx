/**
 * Design System - Badge Component
 * Reusable badge component with variants
 */

import type { ReactNode } from 'react';
import { badgeVariants, type BadgeVariant, type BadgeSize } from '../../../design-system/variants';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}

export default function Badge({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
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
