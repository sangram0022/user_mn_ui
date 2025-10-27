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
    box: 'size-4',
    icon: 'icon-xs',
    text: 'text-sm',
  },
  md: {
    box: 'size-4',
    icon: 'icon-xs',
    text: 'text-base',
  },
  lg: {
    box: 'size-5',
    icon: 'icon-sm',
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
      ${hasError ? 'border-[var(--color-error)] dark:border-[var(--color-error)]' : 'border-[var(--color-border)] dark:border-[var(--color-border)]'}
      ${
        checked || indeterminate
          ? 'bg-[var(--color-primary)] border-[var(--color-primary)] dark:bg-[var(--color-primary)] dark:border-[var(--color-primary)]'
          : 'bg-[var(--color-surface-primary)] dark:bg-[var(--color-surface-primary)]'
      }
      ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-[var(--color-primary)] dark:hover:border-[var(--color-primary)]'
      }
      focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20
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
              <span className="text-[var(--color-text-primary)]">
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
                      ? 'text-[color:var(--color-error)] dark:text-[color:var(--color-error)]'
                      : 'text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]',
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
                  className="mt-0.5 text-sm text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]"
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
            className="mt-1.5 text-sm text-[color:var(--color-error)] dark:text-[var(--color-error)]"
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
