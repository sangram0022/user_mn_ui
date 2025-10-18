/**
 * Checkbox Component
 *
 * An accessible checkbox component with:
 * - Custom styling
 * - Indeterminate state support
 * - Theme support
 * - Size options
 */

import { cn } from '@shared/utils';
import { Check, Minus } from 'lucide-react';
import type React from 'react';
import { forwardRef, useId } from 'react';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Checkbox label */
  label?: string;

  /** Helper text */
  helperText?: string;

  /** Error message */
  error?: string;

  /** Size */
  size?: CheckboxSize;

  /** Indeterminate state */
  indeterminate?: boolean;

  /** Container class name */
  containerClassName?: string;

  /** Label class name */
  labelClassName?: string;
}

const sizeStyles: Record<CheckboxSize, { box: string; icon: string; text: string }> = {
  sm: {
    box: 'w-4 h-4',
    icon: 'w-3 h-3',
    text: 'text-sm',
  },
  md: {
    box: 'w-4 h-4',
    icon: 'w-3 h-3',
    text: 'text-base',
  },
  lg: {
    box: 'w-5 h-5',
    icon: 'w-4 h-4',
    text: 'text-lg',
  },
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      indeterminate = false,
      containerClassName = '',
      labelClassName = '',
      className = '',
      disabled = false,
      checked,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;
    const hasError = Boolean(error);

    const boxStyles = `
      relative
      flex items-center justify-center
      border-2 rounded
      transition-all duration-200
      cursor-pointer
      ${hasError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}
      ${
        checked || indeterminate
          ? 'bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600'
          : 'bg-white dark:bg-gray-800'
      }
      ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-blue-400 dark:hover:border-blue-500'
      }
      focus-within:ring-2 focus-within:ring-blue-500/20
    `;

    return (
      <div className={cn('relative', containerClassName)}>
        <div className="flex items-start gap-2">
          {/* Hidden Native Checkbox */}
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            disabled={disabled}
            checked={checked}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${checkboxId}-error` : helperText ? `${checkboxId}-helper` : undefined
            }
            className="sr-only"
            {...props}
          />

          {/* Custom Checkbox */}
          <label htmlFor={checkboxId} className={cn(boxStyles, sizeStyles[size].box, className)}>
            {/* Check or Indeterminate Icon */}
            {(checked || indeterminate) && (
              <span className="text-white">
                {indeterminate ? (
                  <Minus className={sizeStyles[size].icon} strokeWidth={3} />
                ) : (
                  <Check className={sizeStyles[size].icon} strokeWidth={3} />
                )}
              </span>
            )}
          </label>

          {/* Label and Helper Text */}
          {(label || helperText) && (
            <div className="flex-1">
              {label && (
                <label
                  htmlFor={checkboxId}
                  className={cn(
                    'font-medium cursor-pointer',
                    sizeStyles[size].text,
                    hasError
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-700 dark:text-gray-300',
                    disabled && 'opacity-50 cursor-not-allowed',
                    labelClassName
                  )}
                >
                  {label}
                </label>
              )}
              {helperText && !error && (
                <p
                  id={`${checkboxId}-helper`}
                  className="mt-0.5 text-sm text-gray-500 dark:text-gray-400"
                >
                  {helperText}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p
            id={`${checkboxId}-error`}
            className="mt-1.5 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
