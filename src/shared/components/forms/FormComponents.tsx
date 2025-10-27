/**
 * Shared form input components
 * Standardizes form inputs across the application
 */

import { Eye, EyeOff } from 'lucide-react';
import type React from 'react';

export interface BaseInputProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  containerClassName?: string;
}

export interface TextInputProps extends BaseInputProps {
  type?: 'text' | 'email' | 'tel';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
}

export interface PasswordInputProps extends BaseInputProps {
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggleVisibility: () => void;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
}

export interface SelectInputProps extends BaseInputProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Shared input styles - Using unified-form.css classes
 *
 * ✅ CORRECT APPROACH: Use CSS classes from unified-form.css
 * ❌ WRONG: Hardcoded Tailwind utilities that override our design system
 *
 * Classes from unified-form.css:
 * - .form-input: Base input styling (replaces hardcoded Tailwind classes)
 * - .form-label: Label styling
 * - .form-error-message: Error message styling
 * - .form-group: Container styling with proper spacing
 */
const inputBaseStyles = 'form-input';
const errorInputStyles = ''; // Error styling handled via aria-invalid in CSS
const labelStyles = 'form-label';
const errorStyles = 'form-error-message';
const containerStyles = 'form-group';

// Text Input Component
export const TextInput: React.FC<TextInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  disabled = false,
  autoComplete,
  className = '',
  containerClassName = '',
}) => (
  <div className={`${containerStyles} ${containerClassName}`}>
    <label className={labelStyles}>
      {label}
      {required && <span className="text-[var(--color-error)] ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputBaseStyles} ${error ? errorInputStyles : ''} ${className}`}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete={autoComplete}
      required={required}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={error ? `${label.replace(/\s+/g, '-')}-error` : undefined}
    />
    {error && (
      <p id={`${label.replace(/\s+/g, '-')}-error`} className={errorStyles} role="alert">
        {error}
      </p>
    )}
  </div>
);

// Password Input Component
export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChange,
  showPassword,
  onToggleVisibility,
  error,
  required = false,
  placeholder,
  disabled = false,
  autoComplete,
  className = '',
  containerClassName = '',
}) => (
  <div className={`${containerStyles} ${containerClassName}`}>
    <label className={labelStyles}>
      {label}
      {required && <span className="text-[var(--color-error)] ml-1">*</span>}
    </label>
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBaseStyles} form-input-with-icon ${className}`}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${label.replace(/\s+/g, '-')}-error` : undefined}
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors duration-200"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
    {error && (
      <p id={`${label.replace(/\s+/g, '-')}-error`} className={errorStyles} role="alert">
        {error}
      </p>
    )}
  </div>
);

// Select Input Component
export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  placeholder,
  disabled = false,
  className = '',
  containerClassName = '',
}) => (
  <div className={`${containerStyles} ${containerClassName}`}>
    <label className={labelStyles}>
      {label}
      {required && <span className="text-[var(--color-error)] ml-1">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputBaseStyles} form-select ${className}`}
      disabled={disabled}
      required={required}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={error ? `${label.replace(/\s+/g, '-')}-error` : undefined}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <p id={`${label.replace(/\s+/g, '-')}-error`} className={errorStyles} role="alert">
        {error}
      </p>
    )}
  </div>
);

// Submit Button Component
export interface SubmitButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  children,
  isLoading = false,
  disabled = false,
  className = '',
  variant = 'primary',
}) => {
  const baseStyles =
    'w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary:
      'text-[var(--color-text-primary)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus:ring-[var(--color-primary)]',
    secondary:
      'text-[var(--color-text-secondary)] bg-[var(--color-border)] hover:bg-[var(--color-border)] focus:ring-[var(--color-border)]',
    danger:
      'text-[var(--color-text-primary)] bg-[var(--color-error)] hover:bg-[var(--color-error)] focus:ring-[var(--color-error)]',
  };

  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <svg
            className="spinner spinner-sm -ml-1 mr-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

// Form Container Component
export interface FormContainerProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const FormContainer: React.FC<FormContainerProps> = ({
  children,
  onSubmit,
  className = '',
  title,
  subtitle,
}) => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-secondary)] py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-md w-full space-y-8">
      {title && (
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--color-text-primary)]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <form className={`mt-8 space-y-6 ${className}`} onSubmit={onSubmit}>
        {children}
      </form>
    </div>
  </div>
);
