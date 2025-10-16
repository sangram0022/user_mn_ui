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
import React, { forwardRef, useId } from 'react';

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
    border border-gray-300 dark:border-gray-600
    bg-white dark:bg-gray-800
    focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
  `,
  filled: `
    border-0 border-b-2 border-gray-300 dark:border-gray-600
    bg-gray-50 dark:bg-gray-800/50
    rounded-t-lg rounded-b-none
    focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800
  `,
  outlined: `
    border-2 border-gray-300 dark:border-gray-600
    bg-transparent
    focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
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
      text-gray-900 dark:text-gray-100
      rounded-lg
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      disabled:bg-gray-100 dark:disabled:bg-gray-900
      focus:outline-none
      appearance-none
      pr-10
      cursor-pointer
    `;

    const errorStyles = hasError
      ? `
        border-red-500 dark:border-red-500
        focus:border-red-500 focus:ring-red-500/20
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
              'text-gray-700 dark:text-gray-300',
              hasError && 'text-red-600 dark:text-red-400',
              disabled && 'opacity-50',
              labelClassName
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
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
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        {/* Error or Helper Text */}
        {(error || helperText) && (
          <p
            id={error ? `${selectId}-error` : `${selectId}-helper`}
            className={cn(
              'mt-1.5 text-sm',
              error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
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
