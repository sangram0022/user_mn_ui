/**
 * FormInput Component - Modern React 19 Implementation
 *
 * Features:
 * - React 19 memo optimization for re-render prevention
 * - Modern CSS classes with GPU acceleration
 * - OKLCH color space for accessibility
 * - Smooth focus transitions
 * - Enhanced hover states with lift effect
 *
 * @since 2024-2025 Modernization Phase 2
 */

import type { LucideIcon } from 'lucide-react';
import type React from 'react';
import { memo } from 'react';

/**
 * Form input component props
 */
interface FormInputProps {
  /**
   * Unique identifier for the input element
   * Used for label association and form submission
   */
  id: string;

  /**
   * Name attribute for form submission
   */
  name: string;

  /**
   * Input type (text, email, password, etc.)
   * @example type="email"
   * @example type="password"
   */
  type: string;

  /**
   * Label text displayed above the input
   */
  label: string;

  /**
   * Current input value
   */
  value: string;

  /**
   * Change event handler
   */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * Whether the field is required
   * Shows red asterisk (*) next to label
   * @default false
   */
  required?: boolean;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Autocomplete attribute for browser assistance
   * @example autoComplete="email"
   * @example autoComplete="current-password"
   */
  autoComplete?: string;

  /**
   * Lucide icon component to display at the start of input
   * @example Icon={Mail}
   * @example Icon={Lock}
   */
  Icon?: LucideIcon;

  /**
   * Helper text displayed below the input
   * Useful for hints or format examples
   */
  helperTextContent?: string;

  /**
   * Toggle icon element (e.g., eye icon for password visibility)
   * Displayed at the end of input
   */
  ToggleIcon?: React.ReactNode;

  /**
   * Callback when toggle icon is clicked
   * Typically used for password visibility toggle
   */
  onToggle?: () => void;
}

/**
 * FormInput Component
 *
 * A styled form input component with:
 * - Icon support (prefix and suffix)
 * - Required field indicator
 * - Helper text support
 * - Toggle functionality (e.g., password visibility)
 * - Accessible labels
 * - Focus states with blue outline
 * - Dark mode compatible
 *
 * @example
 * // Basic text input
 * <FormInput
 *   id="username"
 *   name="username"
 *   type="text"
 *   label="Username"
 *   value={username}
 *   onChange={(e) => setUsername(e.target.value)}
 *   required
 * />
 *
 * @example
 * // Email input with icon
 * <FormInput
 *   id="email"
 *   name="email"
 *   type="email"
 *   label="Email Address"
 *   value={email}
 *   onChange={handleEmailChange}
 *   Icon={Mail}
 *   autoComplete="email"
 *   placeholder="you@example.com"
 * />
 *
 * @example
 * // Password input with visibility toggle
 * <FormInput
 *   id="password"
 *   name="password"
 *   type={showPassword ? 'text' : 'password'}
 *   label="Password"
 *   value={password}
 *   onChange={handlePasswordChange}
 *   Icon={Lock}
 *   ToggleIcon={showPassword ? <EyeOff /> : <Eye />}
 *   onToggle={() => setShowPassword(!showPassword)}
 *   helperTextContent="Must be at least 8 characters"
 * />
 */
const FormInputComponent: React.FC<FormInputProps> = ({
  id,
  name,
  type,
  label,
  value,
  onChange,
  required = false,
  placeholder,
  autoComplete,
  Icon,
  helperTextContent,
  ToggleIcon,
  onToggle,
}) => (
  <div className="w-full">
    <label
      htmlFor={id}
      className="block text-sm font-semibold mb-2 text-text-primary transition-colors"
    >
      {label} {required && <span className="text-error">*</span>}
    </label>
    <div className="relative group">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400">
          <Icon className="icon-md text-text-secondary" />
        </div>
      )}
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={onChange}
        className={`
            form-input-modern
            block w-full rounded-lg border-2
            ${Icon ? 'pl-10' : 'pl-4'} 
            ${ToggleIcon ? 'pr-12' : 'pr-4'} 
            py-3 text-base font-normal
            bg-background-elevated border-border-primary text-text-primary
            shadow-sm transition-all duration-200
            focus:outline-none focus-ring
            hover:border-primary-400 hover:shadow-md
            gpu-accelerated
            placeholder:text-text-tertiary
          `}
        placeholder={placeholder}
      />
      {ToggleIcon && onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent border-none cursor-pointer text-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 gpu-accelerated"
          aria-label="Toggle visibility"
        >
          {ToggleIcon}
        </button>
      )}
    </div>
    {helperTextContent && (
      <p className="mt-2 text-sm text-text-secondary transition-colors animate-fade-in">
        {helperTextContent}
      </p>
    )}
  </div>
);

FormInputComponent.displayName = 'FormInput';

/**
 * Memoized FormInput component to prevent unnecessary re-renders
 * Uses React 19 memo for optimal performance
 */
export const FormInput = memo(FormInputComponent);
