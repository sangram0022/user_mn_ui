/**
 * Input Component
 *
 * A flexible, accessible text input component with:
 * - Multiple variants (default, filled, outlined)
 * - Size options (sm, md, lg)
 * - State management (error, disabled, readonly)
 * - Icon support (prefix/suffix)
 * - Theme support (light/dark)
 * - Full TypeScript support
 * - Accessibility built-in
 *
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   error="Invalid email address"
 *   required
 * />
 */

import { cn } from '@shared/utils';
import type React from 'react';
import { forwardRef, useId } from 'react';

export type InputVariant = 'default' | 'filled' | 'outlined';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label */
  label?: string;

  /** Helper text displayed below input */
  helperText?: string;

  /** Error message (shows error state) */
  error?: string;

  /** Visual variant */
  variant?: InputVariant;

  /** Size */
  size?: InputSize;

  /** Full width */
  fullWidth?: boolean;

  /** Prefix icon or text */
  prefixIcon?: React.ReactNode;

  /** Suffix icon or text */
  suffixIcon?: React.ReactNode;

  /** Container class name */
  containerClassName?: string;

  /** Label class name */
  labelClassName?: string;
}

const variantStyles: Record<InputVariant, string> = {
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

const sizeStyles: Record<InputSize, { input: string; icon: string }> = {
  sm: {
    input: 'px-3 py-1.5 text-sm',
    icon: 'w-4 h-4',
  },
  md: {
    input: 'px-3.5 py-2.5 text-sm',
    icon: 'w-5 h-5',
  },
  lg: {
    input: 'px-4 py-3 text-base',
    icon: 'w-6 h-6',
  },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      prefixIcon,
      suffixIcon,
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
    const inputId = id || generatedId;
    const hasError = Boolean(error);

    const baseStyles = `
      w-full
      font-medium
      text-gray-900 dark:text-gray-100
      placeholder:text-gray-400 dark:placeholder:text-gray-500
      rounded-lg
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      disabled:bg-gray-100 dark:disabled:bg-gray-900
      focus:outline-none
    `;

    const errorStyles = hasError
      ? `
        border-red-500 dark:border-red-500
        focus:border-red-500 focus:ring-red-500/20
      `
      : '';

    const inputClasses = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size].input,
      errorStyles,
      prefixIcon ? 'pl-10' : '',
      suffixIcon ? 'pr-10' : '',
      className
    );

    return (
      <div className={cn('relative', fullWidth ? 'w-full' : 'w-auto', containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
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

        {/* Input Container */}
        <div className="relative">
          {/* Prefix Icon */}
          {prefixIcon && (
            <div
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2',
                'text-gray-400 dark:text-gray-500',
                'pointer-events-none',
                sizeStyles[size].icon
              )}
            >
              {prefixIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            className={inputClasses}
            {...props}
          />

          {/* Suffix Icon */}
          {suffixIcon && (
            <div
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'text-gray-400 dark:text-gray-500',
                'pointer-events-none',
                sizeStyles[size].icon
              )}
            >
              {suffixIcon}
            </div>
          )}
        </div>

        {/* Error or Helper Text */}
        {(error || helperText) && (
          <p
            id={error ? `${inputId}-error` : `${inputId}-helper`}
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

Input.displayName = 'Input';
