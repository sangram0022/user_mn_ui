/**
 * Textarea Component
 *
 * A flexible, accessible textarea component with:
 * - Auto-resize capability
 * - Character counter
 * - Multiple variants
 * - Theme support
 * - Accessibility built-in
 */

import { cn } from '@shared/utils';
import type React from 'react';
import { forwardRef, useEffect, useId, useRef, useState } from 'react';

export type TextareaVariant = 'default' | 'filled' | 'outlined';
export type TextareaSize = 'sm' | 'md' | 'lg';

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Textarea label */
  label?: string;

  /** Helper text displayed below textarea */
  helperText?: string;

  /** Error message (shows error state) */
  error?: string;

  /** Visual variant */
  variant?: TextareaVariant;

  /** Size */
  size?: TextareaSize;

  /** Full width */
  fullWidth?: boolean;

  /** Auto-resize based on content */
  autoResize?: boolean;

  /** Show character counter */
  showCounter?: boolean;

  /** Container class name */
  containerClassName?: string;

  /** Label class name */
  labelClassName?: string;
}

const variantStyles: Record<TextareaVariant, string> = {
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

const sizeStyles: Record<TextareaSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-3.5 py-2.5 text-sm',
  lg: 'px-4 py-3 text-base',
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      autoResize = false,
      showCounter = false,
      containerClassName = '',
      labelClassName = '',
      className = '',
      disabled = false,
      required = false,
      maxLength,
      value,
      onChange,
      id,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasError = Boolean(error);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [charCount, setCharCount] = useState(0);

    // Handle auto-resize
    useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value, autoResize]);

    // Handle character count - use setTimeout to avoid synchronous setState in effect
    useEffect(() => {
      setTimeout(() => {
        if (value) {
          setCharCount(String(value).length);
        } else {
          setCharCount(0);
        }
      }, 0);
    }, [value]);

    const baseStyles = `
      w-full
      font-medium
      text-[var(--color-text-primary)] dark:text-[var(--color-text-secondary)]
      placeholder:text-[color:var(--color-text-tertiary)] dark:placeholder:text-[color:var(--color-text-secondary)]
      rounded-lg
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      disabled:bg-[var(--color-surface-secondary)] dark:disabled:bg-[var(--color-surface-primary)]
      focus:outline-none
      resize-none
    `;

    const errorStyles = hasError
      ? `
        border-[var(--color-error)] dark:border-[var(--color-error)]
        focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20
      `
      : '';

    const textareaClasses = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      errorStyles,
      autoResize && 'overflow-hidden',
      className
    );

    const handleRef = (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <div className={cn('relative', fullWidth ? 'w-full' : 'w-auto', containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
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

        {/* Textarea */}
        <textarea
          ref={handleRef}
          id={inputId}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          rows={autoResize ? 1 : rows}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          className={textareaClasses}
          {...props}
        />

        {/* Character Counter */}
        {showCounter && maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)] pointer-events-none">
            {charCount}/{maxLength}
          </div>
        )}

        {/* Error or Helper Text */}
        {(error || helperText) && (
          <p
            id={error ? `${inputId}-error` : `${inputId}-helper`}
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

Textarea.displayName = 'Textarea';
