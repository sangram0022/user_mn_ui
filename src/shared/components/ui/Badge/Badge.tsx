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
    'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600',
  primary:
    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
  success:
    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800',
  warning:
    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
  error:
    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
  info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800',
  critical: 'bg-red-600 dark:bg-red-700 text-white border border-red-700 dark:border-red-600',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-gray-500',
  primary: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  info: 'bg-blue-400',
  critical: 'bg-white',
};

const sizeStyles: Record<BadgeSize, { container: string; dot: string; icon: string }> = {
  sm: {
    container: 'px-2 py-0.5 text-xs',
    dot: 'w-1.5 h-1.5',
    icon: 'w-3 h-3',
  },
  md: {
    container: 'px-2.5 py-1 text-sm',
    dot: 'w-2 h-2',
    icon: 'w-3.5 h-3.5',
  },
  lg: {
    container: 'px-3 py-1.5 text-base',
    dot: 'w-2.5 h-2.5',
    icon: 'w-4 h-4',
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
            'hover:bg-black/10 dark:hover:bg-white/10',
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
