/**
 * Generic Input Component with form integration
 */
import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';
import type { ComponentSize } from '@shared/types';

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onBlur' | 'onFocus' | 'size'> {
  // Form field props
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  
  // Component props
  size?: ComponentSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  
  // Value and handlers
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      error,
      required = false,
      disabled = false,
      placeholder,
      helperText,
      size = 'medium',
      leftIcon,
      rightIcon,
      value,
      onChange,
      onBlur,
      onFocus,
      className = '',
      ...props
    },
    ref
  ) => {
    const inputId = React.useId();
    const errorId = React.useId();
    const helperTextId = React.useId();

    const baseClasses = [
      'block w-full border rounded-md shadow-sm',
      'transition-colors duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    ];

    const sizeClasses = {
      small: ['px-3 py-1.5 text-sm'],
      medium: ['px-3 py-2 text-sm'],
      large: ['px-4 py-3 text-base'],
    };

    const stateClasses = error
      ? [
          'border-red-300 text-red-900 placeholder-red-300',
          'focus:ring-red-500 focus:border-red-500',
        ]
      : [
          'border-gray-300 text-gray-900 placeholder-gray-400',
          'focus:ring-indigo-500 focus:border-indigo-500',
        ];

    const paddingClasses = [];
    if (leftIcon) paddingClasses.push('pl-10');
    if (rightIcon || error) paddingClasses.push('pr-10');

    const inputClasses = [
      ...baseClasses,
      ...sizeClasses[size],
      ...stateClasses,
      ...paddingClasses,
      className,
    ].join(' ');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 sm:text-sm">{leftIcon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperTextId : undefined
            }
            {...props}
          />
          
          {(rightIcon || error) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {error ? (
                <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
              ) : (
                rightIcon && <span className="text-gray-400 sm:text-sm">{rightIcon}</span>
              )}
            </div>
          )}
        </div>
        
        {error && (
          <p id={errorId} className="text-sm text-red-600">
            {error}
          </p>
        )}
        
        {!error && helperText && (
          <p id={helperTextId} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;