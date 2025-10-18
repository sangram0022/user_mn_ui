/**
 * Button Component - Zero Inline Styles
 *
 * Modern, accessible button with:
 * - All styles via CSS classes (no inline styles)
 * - Design token based
 * - Full dark mode support
 * - WCAG 2.1 AA compliant
 * - Polymorphic (can render as button, a, Link, etc.)
 *
 * @example
 * <Button variant="primary" size="md">
 *   Click me
 * </Button>
 *
 * <Button as="a" href="/dashboard" variant="outline">
 *   Go to Dashboard
 * </Button>
 */

import { cn } from '@shared/utils';
import { Loader } from 'lucide-react';
import type React from 'react';
import { type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'danger'
  | 'success'
  | 'ghost'
  | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

type PolymorphicProps<T extends ElementType> = {
  as?: T;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
  className?: string;
} & ComponentPropsWithoutRef<T>;

export type ButtonProps<T extends ElementType = 'button'> = PolymorphicProps<T>;

// ============================================================================
// Component
// ============================================================================

export const Button = <T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  children,
  className,
  ...props
}: ButtonProps<T>) => {
  const Component = as || 'button';

  // Build class names using CSS classes only
  const classNames = cn(
    // Base button class
    'btn',
    // Variant
    `btn-${variant}`,
    // Size
    `btn-${size}`,
    // Modifiers
    fullWidth && 'btn-block',
    className
  );

  const isDisabled = disabled || isLoading;

  return (
    <Component
      className={classNames}
      disabled={isDisabled}
      data-loading={isLoading || undefined}
      data-disabled={isDisabled || undefined}
      aria-disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader className="w-4 h-4 animate-spin" aria-hidden="true" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span aria-hidden="true">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span aria-hidden="true">{icon}</span>}
        </>
      )}
    </Component>
  );
};

// ============================================================================
// Button Group
// ============================================================================

interface ButtonGroupProps {
  children: ReactNode;
  attached?: boolean;
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  attached = false,
  className,
}) => (
  <div className={cn(attached ? 'btn-group-attached' : 'btn-group', className)} role="group">
    {children}
  </div>
);

// ============================================================================
// Icon Button
// ============================================================================

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: ReactNode;
  'aria-label': string;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, className, ...props }) => (
  <Button {...props} className={cn('btn-icon', className)}>
    {icon}
  </Button>
);

// Set display name for debugging
Button.displayName = 'Button';
ButtonGroup.displayName = 'ButtonGroup';
IconButton.displayName = 'IconButton';
