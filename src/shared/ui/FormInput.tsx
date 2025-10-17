import type { LucideIcon } from 'lucide-react';
import React from 'react';

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
export const FormInput: React.FC<FormInputProps> = ({
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
}) => {
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="block text-sm font-semibold mb-2"
        style={{ color: 'var(--theme-text)' }}
      >
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5" style={{ color: 'var(--theme-textSecondary)' }} />
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
            block w-full rounded-lg border-2
            ${Icon ? 'pl-10' : 'pl-4'} 
            ${ToggleIcon ? 'pr-12' : 'pr-4'} 
            py-3 text-base font-normal
            shadow-sm transition-all duration-200
            focus:outline-none
          `}
          style={{
            background: 'var(--theme-input-bg)',
            borderColor: 'var(--theme-input-border)',
            color: 'var(--theme-input-text)',
          }}
          placeholder={placeholder}
        />
        {ToggleIcon && onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity"
            style={{ color: 'var(--theme-textSecondary)' }}
          >
            {ToggleIcon}
          </button>
        )}
      </div>
      {helperTextContent && (
        <p className="mt-2 text-sm" style={{ color: 'var(--theme-textSecondary)' }}>
          {helperTextContent}
        </p>
      )}
    </div>
  );
};
