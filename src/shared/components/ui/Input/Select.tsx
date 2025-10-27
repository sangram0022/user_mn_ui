/**
 * Select Component
 *
 * A styled select dropdown component with:
 * - Multiple variants
 * - Size options
 * - State management
 * - Theme support
 * - Accessibility built-in
 */

import { cn } from '@shared/utils';
import { ChevronDown } from 'lucide-react';
import type React from 'react';
import { forwardRef, useId } from 'react';

export type SelectVariant = 'default' | 'filled' | 'outlined';
export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Select label */
  label?: string;

  /** Helper text displayed below select */
  helperText?: string;

  /** Error message (shows error state) */
  error?: string;

  /** Options array */
  options: SelectOption[];

  /** Placeholder text */
  placeholder?: string;

  /** Visual variant */
  variant?: SelectVariant;

  /** Size */
  size?: SelectSize;

  /** Full width */
  fullWidth?: boolean;

  /** Container class name */
  containerClassName?: string;

  /** Label class name */
  labelClassName?: string;
}

const variantStyles: Record<SelectVariant, string> = {
  default: `
    border border-[var(--color-border)] dark:border-[var(--color-border)]
    bg-[var(--color-surface-primary)] dark:bg-[var(--color-surface-primary)]
    focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20
  `,
  filled: `
    border-0 border-b-2 border-[var(--color-border)] dark:border-[var(--color-border)]
    bg-[var(--color-surface-secondary)] dark:bg-[var(--color-surface-primary)]/50
    rounded-t-lg rounded-b-none
    focus:border-[var(--color-primary)] focus:bg-[var(--color-surface-primary)] dark:focus:bg-[var(--color-surface-primary)]
  `,
  outlined: `
    border-2 border-[var(--color-border)] dark:border-[var(--color-border)]
    bg-transparent
    focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20
  `,
};

const sizeStyles: Record<SelectSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3.5 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      placeholder,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      containerClassName = '',
      labelClassName = '',
      className = '',
      disabled = false,
      required = false,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const hasError = Boolean(error);

    const baseStyles = `
      w-full
      font-medium
      text-[var(--color-text-primary)] dark:text-[var(--color-text-secondary)]
      rounded-lg
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      disabled:bg-[var(--color-surface-secondary)] dark:disabled:bg-[var(--color-surface-primary)]
      focus:outline-none
      appearance-none
      pr-10
      cursor-pointer
    `;

    const errorStyles = hasError
      ? `
        border-[var(--color-error)] dark:border-[var(--color-error)]
        focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20
      `
      : '';

    const selectClasses = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      errorStyles,
      className
    );

    return (
      <div className={cn('relative', fullWidth ? 'w-full' : 'w-auto', containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              'block mb-2 text-sm font-medium',
              'text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]',
              hasError && 'text-[color:var(--color-error)] dark:text-[color:var(--color-error)]',
              disabled && 'opacity-50',
              labelClassName
            )}
          >
            {label}
            {required && <span className="text-[color:var(--color-error)] ml-1">*</span>}
          </label>
        )}

        {/* Select Container */}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
            }
            className={selectClasses}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[color:var(--color-text-tertiary)] dark:text-[var(--color-text-tertiary)]">
            <ChevronDown className="icon-md" />
          </div>
        </div>

        {/* Error or Helper Text */}
        {(error || helperText) && (
          <p
            id={error ? `${selectId}-error` : `${selectId}-helper`}
            className={cn(
              'mt-1.5 text-sm',
              error
                ? 'text-[color:var(--color-error)] dark:text-[color:var(--color-error)]'
                : 'text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)]'
            )}
            role={error ? 'alert' : undefined}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
