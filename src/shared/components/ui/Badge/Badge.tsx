/**
 * Badge Component
 *
 * A badge component for labels, tags, and status indicators with:
 * - Multiple variants
 * - Size options
 * - Dot indicator option
 * - Removable option
 * - Theme support
 */

import { cn } from '@shared/utils';
import { X } from 'lucide-react';
import type React from 'react';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'critical';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  /** Badge content */
  children: React.ReactNode;

  /** Variant */
  variant?: BadgeVariant;

  /** Size */
  size?: BadgeSize;

  /** Optional icon to display before text */
  icon?: React.ReactNode;

  /** Show dot indicator */
  dot?: boolean;

  /** Removable */
  removable?: boolean;

  /** On remove callback */
  onRemove?: () => void;

  /** Custom class name */
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-[var(--color-surface-secondary)] dark:bg-[var(--color-surface-primary)] text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] border border-[var(--color-border)] dark:border-[var(--color-border)]',
  primary:
    'bg-[var(--color-primary-light)] dark:bg-[var(--color-primary)]/30 text-[var(--color-primary)] dark:text-[var(--color-primary)] border border-[var(--color-primary)] dark:border-[var(--color-primary)]',
  success:
    'bg-[var(--color-success-light)] dark:bg-[var(--color-success)]/30 text-[var(--color-success)] dark:text-[var(--color-success)] border border-[var(--color-success)] dark:border-[var(--color-success)]',
  warning:
    'bg-[var(--color-warning-light)] dark:bg-[var(--color-warning)]/30 text-[var(--color-warning)] dark:text-[var(--color-warning)] border border-[var(--color-warning)] dark:border-[var(--color-warning)]',
  error:
    'bg-[var(--color-error-light)] dark:bg-[var(--color-error)]/30 text-[var(--color-error)] dark:text-[var(--color-error)] border border-[var(--color-error)] dark:border-[var(--color-error)]',
  info: 'bg-[var(--color-primary-light)] dark:bg-[var(--color-primary)]/20 text-[var(--color-primary)] dark:text-[var(--color-primary)] border border-[var(--color-primary)] dark:border-[var(--color-primary)]',
  critical:
    'bg-[var(--color-error)] dark:bg-[var(--color-error)] text-[var(--color-text-primary)] border border-[var(--color-error)] dark:border-[var(--color-error)]',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-surface-secondary)]',
  primary: 'bg-[var(--color-primary)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  error: 'bg-[var(--color-error)]',
  info: 'bg-[var(--color-primary)]',
  critical: 'bg-[var(--color-surface-primary)]',
};

const sizeStyles: Record<BadgeSize, { container: string; dot: string; icon: string }> = {
  sm: {
    container: 'px-2 py-0.5 text-xs',
    dot: 'w-1.5 h-1.5',
    icon: 'icon-xs',
  },
  md: {
    container: 'px-2.5 py-1 text-sm',
    dot: 'w-2 h-2',
    icon: 'icon-xs',
  },
  lg: {
    container: 'px-3 py-1.5 text-base',
    dot: 'w-2.5 h-2.5',
    icon: 'icon-sm',
  },
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  dot = false,
  removable = false,
  onRemove,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        'font-medium rounded-full',
        'transition-colors',
        variantStyles[variant],
        sizeStyles[size].container,
        className
      )}
    >
      {/* Dot Indicator */}
      {dot && <span className={cn('rounded-full', dotColors[variant], sizeStyles[size].dot)} />}

      {/* Icon */}
      {icon && <span className={cn('inline-flex', sizeStyles[size].icon)}>{icon}</span>}

      {/* Content */}
      <span>{children}</span>

      {/* Remove Button */}
      {removable && (
        <button
          onClick={onRemove}
          className={cn(
            'rounded-full',
            'hover:bg-black/10 dark:hover:bg-[var(--color-surface-primary)]/10',
            'transition-colors',
            'focus:outline-none focus:ring-1 focus:ring-current',
            '-mr-1'
          )}
          aria-label="Remove"
        >
          <X className={sizeStyles[size].icon} />
        </button>
      )}
    </span>
  );
}
