/**
 * Advanced Form Components
 * Modern form components with validation, accessibility, and excellent UX
 */

import React, { forwardRef, useState } from 'react';
import type { ReactNode } from 'react';
import { designUtils } from './tokens';
import { Input } from './components';
import type { InputProps } from './components';

// Form Field Wrapper
export interface FormFieldProps { label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: ReactNode;
  className?: string; }

export const FormField: React.FC<FormFieldProps> = ({ label,
  error,
  helperText,
  required = false,
  children,
  className }) => {
  return (
    <div className={designUtils.buildClass('space-y-1', className)}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-error-600' : 'text-secondary-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

// Enhanced Input with better validation
export interface FormInputProps extends Omit<InputProps, 'error' | 'helperText' | 'errorText'> { label?: string;
  error?: string;
  helperText?: string;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | undefined;
  };
  showCharCount?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, 
    error, 
    helperText, 
    validation,
    showCharCount = false,
    required,
    className,
    maxLength,
    value = '',
    onChange,
    onBlur,
    ...props 
  }, ref) => { const [internalError, setInternalError] = useState<string>('');
    const [touched, setTouched] = useState(false);
    
    const currentValue = typeof value === 'string' ? value : '';
    const hasError = error || (touched && internalError);
    
    const validateValue = (val: string): string => {
      if (!validation) return '';
      
      if (validation.required && !val.trim()) {
        return 'This field is required';
      }
      
      if (validation.minLength && val.length < validation.minLength) {
        return `Minimum ${validation.minLength} characters required`;
      }
      
      if (validation.maxLength && val.length > validation.maxLength) {
        return `Maximum ${validation.maxLength} characters allowed`;
      }
      
      if (validation.pattern && !validation.pattern.test(val)) { return 'Invalid format';
      }
      
      if (validation.custom) { return validation.custom(val) || '';
      }
      
      return '';
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => { setTouched(true);
      const validationError = validateValue(e.target.value);
      setInternalError(validationError);
      onBlur?.(e);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (touched) {
        const validationError = validateValue(e.target.value);
        setInternalError(validationError);
      }
      onChange?.(e);
    };
    
    return (
      <FormField
        label={label}
        error={hasError ? (error || internalError) : undefined}
        helperText={helperText}
        required={required || validation?.required}
        className={className}
      >
        <Input
          ref={ref}
          error={!!hasError}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          maxLength={maxLength || validation?.maxLength}
          {...props}
        />
        {showCharCount && maxLength && (
          <div className="flex justify-end">
            <span className={`text-xs ${currentValue.length > maxLength * 0.9 ? 'text-warning-600' : 'text-secondary-500'}`}>
              {currentValue.length}/{maxLength}
            </span>
          </div>
        )}
      </FormField>
    );
  }
);

FormInput.displayName = 'FormInput';

// Select Component
export interface SelectOption { value: string;
  label: string;
  disabled?: boolean; }

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> { label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  inputSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; }

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, 
    error, 
    helperText, 
    options, 
    placeholder,
    inputSize = 'md',
    className,
    ...props 
  }, ref) => { const sizeClasses = {
      xs: 'px-2.5 py-1.5 text-xs',
      sm: 'px-3 py-2 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2 text-base',
      xl: 'px-4 py-3 text-base'
    };
    
    const baseClass = 'block w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 bg-white';
    const variantClass = error 
      ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
      : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500';
    const sizeClass = sizeClasses[inputSize];
    
    const finalClassName = designUtils.buildClass(
      baseClass,
      variantClass,
      sizeClass,
      className
    );
    
    return (
      <FormField label={label} error={error} helperText={helperText} className={className}>
        <select ref={ref} className={finalClassName} {...props}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value} 
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      </FormField>
    );
  }
);

Select.displayName = 'Select';

// Textarea Component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string;
  error?: string;
  helperText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  showCharCount?: boolean; }

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, 
    error, 
    helperText, 
    resize = 'vertical',
    showCharCount = false,
    className,
    maxLength,
    value = '',
    ...props 
  }, ref) => { const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize'
    };
    
    const baseClass = 'block w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 px-3 py-2 text-sm';
    const variantClass = error 
      ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
      : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500';
    const resizeClass = resizeClasses[resize];
    
    const finalClassName = designUtils.buildClass(
      baseClass,
      variantClass,
      resizeClass,
      className
    );
    
    const currentValue = typeof value === 'string' ? value : '';
    
    return (
      <FormField label={label} error={error} helperText={helperText}>
        <textarea
          ref={ref}
          className={finalClassName}
          value={value}
          maxLength={maxLength}
          {...props}
        />
        {showCharCount && maxLength && (
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${currentValue.length > maxLength * 0.9 ? 'text-warning-600' : 'text-secondary-500'}`}>
              {currentValue.length}/{maxLength}
            </span>
          </div>
        )}
      </FormField>
    );
  }
);

Textarea.displayName = 'Textarea';

// Checkbox Component
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> { label?: string;
  description?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean; }

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, 
    description, 
    error,
    size = 'md',
    indeterminate: _indeterminate = false,
    className,
    ...props 
  }, ref) => { const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };
    
    const baseClass = 'border rounded focus:ring-2 focus:ring-offset-0 transition-colors duration-200';
    const variantClass = error
      ? 'border-error-500 text-error-600 focus:ring-error-500'
      : 'border-secondary-300 text-primary-600 focus:ring-primary-500';
    const sizeClass = sizeClasses[size];
    
    const finalClassName = designUtils.buildClass(
      baseClass,
      variantClass,
      sizeClass,
      className
    );
    
    return (
      <div className="space-y-1">
        <div className="flex items-start">
          <div className="flex items-center h-6">
            <input
              ref={ref}
              type="checkbox"
              className={finalClassName}
              {...props}
            />
          </div>
          {(label || description) && (
            <div className="ml-3">
              {label && (
                <label className="text-sm font-medium text-secondary-700">
                  {label}
                </label>
              )}
              {description && (
                <p className="text-sm text-secondary-500">{description}</p>
              )}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-error-600">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Radio Group Component
export interface RadioOption { value: string;
  label: string;
  description?: string;
  disabled?: boolean; }

export interface RadioGroupProps { name: string;
  value?: string;
  onChange?: (value: string) => void;
  options: RadioOption[];
  label?: string;
  error?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  className?: string; }

export const RadioGroup: React.FC<RadioGroupProps> = ({ name,
  value,
  onChange,
  options,
  label,
  error,
  orientation = 'vertical',
  size = 'md',
  className }) => { const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };
  
  const containerClass = orientation === 'horizontal' 
    ? 'flex flex-wrap gap-6' 
    : 'space-y-4';
  
  const radioBaseClass = 'border focus:ring-2 focus:ring-offset-0 transition-colors duration-200';
  const radioVariantClass = error
    ? 'border-error-500 text-error-600 focus:ring-error-500'
    : 'border-secondary-300 text-primary-600 focus:ring-primary-500';
  const radioSizeClass = sizeClasses[size];
  
  const radioClassName = designUtils.buildClass(
    radioBaseClass,
    radioVariantClass,
    radioSizeClass
  );
  
  return (
    <FormField label={label} error={error} className={className}>
      <div className={containerClass}>
        {options.map((option) => (
          <div key={option.value} className="flex items-start">
            <div className="flex items-center h-6">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={option.disabled}
                className={radioClassName}
              />
            </div>
            <div className="ml-3">
              <label className="text-sm font-medium text-secondary-700">
                {option.label}
              </label>
              {option.description && (
                <p className="text-sm text-secondary-500">{option.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </FormField>
  );
};

// Toggle/Switch Component
export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> { label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error'; }

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, 
    description, 
    size = 'md', 
    color = 'primary',
    checked = false,
    className,
    ...props 
  }, ref) => { const sizeClasses = {
      sm: {
        switch: 'h-5 w-9',
        thumb: 'h-4 w-4',
        translate: 'translate-x-4'
      },
      md: { switch: 'h-6 w-11',
        thumb: 'h-5 w-5',
        translate: 'translate-x-5'
      },
      lg: { switch: 'h-7 w-12',
        thumb: 'h-6 w-6',
        translate: 'translate-x-5'
      }
    };
    
    const colorClasses = { primary: 'bg-primary-600',
      success: 'bg-success-600',
      warning: 'bg-warning-600',
      error: 'bg-error-600'
    };
    
    const { switch: switchClass, thumb: thumbClass, translate: translateClass } = sizeClasses[size];
    const activeColorClass = colorClasses[color];
    
    return (
      <div className={designUtils.buildClass('flex items-center', className)}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only"
            checked={checked}
            {...props}
          />
          <div 
            className={designUtils.buildClass(
              'relative inline-flex flex-shrink-0 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500',
              switchClass,
              checked ? activeColorClass : 'bg-secondary-200'
            )}
          >
            <span
              className={designUtils.buildClass(
                'pointer-events-none inline-block rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
                thumbClass,
                checked ? translateClass : 'translate-x-0'
              )}
            />
          </div>
        </div>
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <span className="text-sm font-medium text-secondary-900">{label}</span>
            )}
            {description && (
              <p className="text-sm text-secondary-500">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';