/**
 * Design System - Card Component
 * Reusable card with consistent styling and React 19 optimizations
 */

import type { ReactNode, CSSProperties, HTMLAttributes, ElementType } from 'react';
import { cardVariants, type CardVariant } from '@/design-system/variants';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  hover?: boolean;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
}

export default function Card({ 
  children, 
  variant = 'default',
  hover = false, 
  className = '', 
  style,
  as: Component = 'div',
  ...props 
}: CardProps) {
  const hoverStyles = hover ? 'hover:shadow-2xl hover:-translate-y-2 cursor-pointer' : '';
  
  const classes = [
    cardVariants.base,
    cardVariants.variants[variant],
    hoverStyles,
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <Component 
      className={classes}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
}
