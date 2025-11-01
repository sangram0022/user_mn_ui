/**
 * Design System - Input Component
 * All input variants in one place with React 19 optimizations
 */

import type { InputHTMLAttributes, ReactNode } from 'react';
import { inputVariants, type InputVariant, type InputSize } from '../design-system/variants';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  variant?: InputVariant;
  inputSize?: InputSize;
  helperText?: string;
}

export default function Input({ 
  label, 
  error, 
  icon, 
  variant = 'default',
  inputSize = 'md',
  helperText,
  className = '',
  id,
  ...props 
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);
  const activeVariant = hasError ? 'error' : variant;
  
  const classes = [
    inputVariants.base,
    inputVariants.variants[activeVariant],
    inputVariants.sizes[inputSize],
    icon ? 'pl-10' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
        
        <input
          id={inputId}
          className={classes}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${inputId}-error` : 
            helperText ? `${inputId}-helper` : 
            undefined
          }
          {...props}
        />
      </div>
      
      {error && (
        <p 
          id={`${inputId}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p 
          id={`${inputId}-helper`}
          className="mt-1 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
