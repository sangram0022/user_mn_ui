import { Loader } from 'lucide-react';
import type React from 'react';

/**
 * Button variant types
 */
type ButtonVariant = 'primary' | 'secondary';

/**
 * AuthButton component props
 */
interface AuthButtonProps {
  /**
   * Button type attribute
   * @default 'button'
   */
  type?: 'submit' | 'button';

  /**
   * Visual variant
   * - primary: Gradient background, white text
   * - secondary: White background, gray text with border
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Loading state - shows spinner and disables interaction
   * @default false
   */
  isLoading?: boolean;

  /**
   * Disabled state - prevents interaction
   * @default false
   */
  disabled?: boolean;

  /**
   * Click event handler
   */
  onClick?: () => void;

  /**
   * Button content (text, icons, etc.)
   */
  children: React.ReactNode;

  /**
   * Whether button should take full width of container
   * @default true
   */
  fullWidth?: boolean;
}

/**
 * AuthButton Component
 *
 * A styled button component specifically designed for authentication flows.
 *
 * Features:
 * - Two visual variants (primary gradient, secondary outline)
 * - Loading state with spinner
 * - Hover effects (shadow + translate)
 * - Focus ring for accessibility
 * - Disabled state handling
 * - Full width or auto width options
 * - Smooth transitions
 *
 * Commonly used for:
 * - Login/Register forms
 * - Password reset flows
 * - Email verification
 * - OAuth provider buttons
 *
 * @example
 * // Primary submit button with loading
 * <AuthButton
 *   type="submit"
 *   variant="primary"
 *   isLoading={isSubmitting}
 * >
 *   Sign In
 * </AuthButton>
 *
 * @example
 * // Secondary button with icon
 * <AuthButton
 *   type="button"
 *   variant="secondary"
 *   onClick={handleGoogleLogin}
 *   fullWidth={false}
 * >
 *   <GoogleIcon />
 *   Sign in with Google
 * </AuthButton>
 *
 * @example
 * // Disabled button
 * <AuthButton
 *   type="submit"
 *   disabled={!isFormValid}
 * >
 *   Continue
 * </AuthButton>
 */
export const AuthButton: React.FC<AuthButtonProps> = ({
  type = 'button',
  variant = 'primary',
  isLoading = false,
  disabled = false,
  onClick,
  children,
  fullWidth = true,
}) => {
  const baseClasses = `
    ${fullWidth ? 'w-full' : 'w-auto'} 
    flex justify-center items-center gap-2 
    px-4 py-3 
    border-none rounded-lg 
    text-sm font-medium 
    transition-all duration-200 
    cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;

  const variantClasses = {
    primary: `
      text-white bg-gradient-primary
      shadow-sm
      hover:shadow-md hover:-translate-y-0.5
      focus:ring-blue-500
      ${isLoading || disabled ? 'opacity-50 cursor-not-allowed bg-gray-400 bg-none' : ''}
    `,
    secondary: `
      text-gray-700 bg-white border border-gray-300
      shadow-sm
      hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5
      focus:ring-gray-500
      ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `,
  };

  return (
    <button
      type={type}
      disabled={isLoading || disabled}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {isLoading ? (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          <span>Please wait...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
