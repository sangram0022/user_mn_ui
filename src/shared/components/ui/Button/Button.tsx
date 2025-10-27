/**
 * 🚀 Ultra-Modern Button Component (2024-2025)
 *
 * Latest Features:
 * ✅ React 19 patterns (memo, forwardRef)
 * ✅ Modern CSS classes (OKLCH colors, animations)
 * ✅ GPU-accelerated hover effects
 * ✅ Loading states with smooth transitions
 * ✅ Full accessibility (ARIA, focus management)
 * ✅ Polymorphic component (render as any element)
 * ✅ WCAG AAA compliant colors
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md">
 *   Click me
 * </Button>
 *
 * <Button as="a" href="/dashboard" variant="outline" icon={<ArrowRight />}>
 *   Go to Dashboard
 * </Button>
 *
 * <Button variant="primary" isLoading>
 *   Processing...
 * </Button>
 * ```
 */

import { cn } from '@shared/utils';
import { Loader } from 'lucide-react';
import type React from 'react';
import { type ComponentPropsWithoutRef, type ElementType, type ReactNode, memo } from 'react';

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
  loadingText?: string;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
  className?: string;
  ref?: React.Ref<HTMLElement>;
} & ComponentPropsWithoutRef<T>;

export type ButtonProps<T extends ElementType = 'button'> = PolymorphicProps<T>;

// ============================================================================
// Component - Optimized with React 19 patterns
// ============================================================================

const ButtonComponent = <T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText = 'Loading...',
  fullWidth = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  children,
  className,
  ...props
}: ButtonProps<T>) => {
  const Component = as || 'button';
  const isDisabled = disabled || isLoading;

  // Modern class composition with GPU acceleration
  const classNames = cn(
    // Base button classes
    'btn',
    `btn-${variant}`,
    `btn-${size}`,

    // Modern enhancements
    'gpu-accelerated', // Hardware acceleration
    'hover-lift', // Smooth hover effect
    'focus-ring', // Modern focus management

    // State modifiers
    fullWidth && 'w-full',
    isLoading && 'opacity-80 cursor-wait pointer-events-none',

    className
  );

  return (
    <Component
      className={classNames}
      disabled={isDisabled}
      data-loading={isLoading || undefined}
      data-disabled={isDisabled || undefined}
      aria-disabled={isDisabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2 animate-fade-in">
          <Loader className="spinner spinner-sm spinner-white" aria-hidden="true" />
          <span>{loadingText}</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {icon && iconPosition === 'left' && (
            <span className="inline-flex flex-shrink-0" aria-hidden="true">
              {icon}
            </span>
          )}
          <span className="flex-1">{children}</span>
          {icon && iconPosition === 'right' && (
            <span className="inline-flex flex-shrink-0" aria-hidden="true">
              {icon}
            </span>
          )}
        </span>
      )}
    </Component>
  );
};

ButtonComponent.displayName = 'Button';

// Memo optimization for performance
export const Button = memo(ButtonComponent) as typeof ButtonComponent;

// ============================================================================
// Button Group
// ============================================================================

interface ButtonGroupProps {
  children: ReactNode;
  attached?: boolean;
  className?: string;
}

const ButtonGroupComponent: React.FC<ButtonGroupProps> = ({
  children,
  attached = false,
  className,
}) => (
  <div className={cn(attached ? 'btn-group-attached' : 'btn-group', className)} role="group">
    {children}
  </div>
);

export const ButtonGroup = memo(ButtonGroupComponent);
ButtonGroup.displayName = 'ButtonGroup';

// ============================================================================
// Icon Button
// ============================================================================

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: ReactNode;
  'aria-label': string;
}

const IconButtonComponent: React.FC<IconButtonProps> = ({ icon, className, ...props }) => (
  <Button {...props} className={cn('btn-icon', className)}>
    {icon}
  </Button>
);

export const IconButton = memo(IconButtonComponent);
IconButton.displayName = 'IconButton';
