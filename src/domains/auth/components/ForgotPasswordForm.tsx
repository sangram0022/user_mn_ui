// ========================================
// ForgotPasswordForm Component
// Request password reset email
// ========================================

import { useState } from 'react';
import { useForgotPassword } from '../hooks/useForgotPassword';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * ForgotPasswordForm Component
 * Allows users to request password reset
 */
export function ForgotPasswordForm({ onSuccess, onError }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const forgotPasswordMutation = useForgotPassword({
    onSuccess: () => {
      setSubmitted(true);
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      return;
    }

    forgotPasswordMutation.mutate({
      email: email.trim().toLowerCase(),
    });
  };

  const isDisabled = forgotPasswordMutation.isPending || !email;

  if (submitted) {
    return (
      <div className="space-y-4">
        {/* Success Message */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-green-500 mt-0.5 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Check your email
              </h3>
              <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
              <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                Didn't receive the email? Check your spam folder or try again in a few minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Login */}
        <div className="text-center">
          <a
            href="/auth/login"
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Instructions */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Enter your email address and we'll send you instructions to reset your password.
      </p>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Address
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          autoComplete="email"
          disabled={forgotPasswordMutation.isPending}
          className="w-full"
          autoFocus
        />
      </div>

      {/* Error Message */}
      {forgotPasswordMutation.isError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">
            {forgotPasswordMutation.error.message || 'Failed to send reset email. Please try again.'}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isDisabled}
        className="w-full"
        variant="primary"
      >
        {forgotPasswordMutation.isPending ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </span>
        ) : (
          'Send Reset Instructions'
        )}
      </Button>

      {/* Back to Login Link */}
      <div className="text-center">
        <a
          href="/auth/login"
          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Back to login
        </a>
      </div>
    </form>
  );
}

export default ForgotPasswordForm;
