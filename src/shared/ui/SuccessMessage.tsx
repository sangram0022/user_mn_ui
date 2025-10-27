import { CheckCircle, LogIn } from 'lucide-react';
import type { FC } from 'react';
import { AuthButton } from './AuthButton';

/**
 * Success message component props
 */
interface SuccessMessageProps {
  /**
   * Main heading text
   * @example "Registration Successful!"
   * @example "Password Reset Complete"
   */
  title: string;

  /**
   * Descriptive message text
   * @example "Your account has been created successfully."
   */
  message: string;

  /**
   * Button label text
   * @default 'Continue'
   */
  buttonText?: string;

  /**
   * Click handler for the action button
   * If not provided, button will not be rendered
   */
  onButtonClick?: () => void;

  /**
   * Countdown timer in seconds
   * Shows "Redirecting in X seconds..." when set
   * Set to null to hide countdown
   * @default null
   */
  countdown?: number | null;
}

/**
 * SuccessMessage Component
 *
 * A centered success state component with:
 * - Check icon in gradient circle
 * - Title and message text
 * - Optional action button
 * - Optional countdown timer
 * - Responsive design
 *
 * Commonly used for:
 * - Registration confirmation
 * - Password reset success
 * - Form submission success
 * - Account verification
 *
 * @example
 * // Basic success message
 * <SuccessMessage
 *   title="Registration Successful!"
 *   message="Your account has been created."
 * />
 *
 * @example
 * // With action button
 * <SuccessMessage
 *   title="Password Reset Complete"
 *   message="Your password has been updated successfully."
 *   buttonText="Go to Login"
 *   onButtonClick={() => navigate('/login')}
 * />
 *
 * @example
 * // With countdown timer
 * <SuccessMessage
 *   title="Email Verified"
 *   message="Your email has been verified successfully."
 *   countdown={5}
 *   buttonText="Continue to Dashboard"
 *   onButtonClick={handleContinue}
 * />
 */
export const SuccessMessage: FC<SuccessMessageProps> = ({
  title,
  message,
  buttonText = 'Continue',
  onButtonClick,
  countdown,
}) => (
  <div className="mx-auto w-full max-w-md text-center">
    <div className="mx-auto mb-6 size-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg">
      <CheckCircle className="icon-xl text-white" />
    </div>
    <h2 className="text-3xl font-bold tracking-tight text-[color:var(--color-text-primary)]">
      {title}
    </h2>
    <p className="mt-4 text-[color:var(--color-text-secondary)]">{message}</p>
    {countdown !== null && countdown !== undefined && (
      <p className="mt-2 text-sm text-[color:var(--color-primary)]">
        Redirecting in {countdown} second{countdown === 1 ? '' : 's'}...
      </p>
    )}
    {onButtonClick && (
      <div className="mt-6">
        <AuthButton type="button" variant="primary" onClick={onButtonClick} fullWidth={false}>
          <LogIn className="icon-sm" />
          {buttonText}
        </AuthButton>
      </div>
    )}
  </div>
);
