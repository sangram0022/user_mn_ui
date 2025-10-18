/**
 * Radio Component
 *
 * An accessible radio button component with:
 * - Custom styling
 * - Theme support
 * - Size options
 * - Group support
 */

import { cn } from '@shared/utils';
import type React from 'react';
import { forwardRef, useId } from 'react';

export type RadioSize = 'sm' | 'md' | 'lg';

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Radio label */
  label?: string;

  /** Helper text */
  helperText?: string;

  /** Error message */
  error?: string;

  /** Size */
  size?: RadioSize;

  /** Container class name */
  containerClassName?: string;

  /** Label class name */
  labelClassName?: string;
}

const sizeStyles: Record<RadioSize, { box: string; dot: string; text: string }> = {
  sm: {
    box: 'w-4 h-4',
    dot: 'w-2 h-2',
    text: 'text-sm',
  },
  md: {
    box: 'w-4 h-4',
    dot: 'w-2 h-2',
    text: 'text-base',
  },
  lg: {
    box: 'w-5 h-5',
    dot: 'w-2.5 h-2.5',
    text: 'text-lg',
  },
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
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
    const radioId = id || generatedId;
    const hasError = Boolean(error);

    const boxStyles = `
      relative
      flex items-center justify-center
      border-2 rounded-full
      transition-all duration-200
      cursor-pointer
      ${hasError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}
      ${checked ? 'border-blue-500 dark:border-blue-600' : 'bg-white dark:bg-gray-800'}
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
          {/* Hidden Native Radio */}
          <input
            ref={ref}
            type="radio"
            id={radioId}
            disabled={disabled}
            checked={checked}
            aria-describedby={
              error ? `${radioId}-error` : helperText ? `${radioId}-helper` : undefined
            }
            className="sr-only"
            {...props}
          />

          {/* Custom Radio */}
          <label htmlFor={radioId} className={cn(boxStyles, sizeStyles[size].box, className)}>
            {/* Inner Dot */}
            {checked && (
              <span
                className={cn('rounded-full bg-blue-500 dark:bg-blue-600', sizeStyles[size].dot)}
              />
            )}
          </label>

          {/* Label and Helper Text */}
          {(label || helperText) && (
            <div className="flex-1">
              {label && (
                <label
                  htmlFor={radioId}
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
                  id={`${radioId}-helper`}
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
            id={`${radioId}-error`}
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

Radio.displayName = 'Radio';
