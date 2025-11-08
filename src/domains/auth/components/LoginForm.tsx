// ========================================
// LoginForm Component
// Reusable login form with validation
// Uses React 19 useFormStatus for automatic pending state
// Uses React 19 useActionState for form action handling
// ========================================

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useLogin } from '../hooks/useAuth.hooks';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
import Input from '../../../components/Input';
import { Button } from '../../../components';
import type { LoginRequest } from '../types/auth.types';

interface FormState {
  error?: string;
  success?: boolean;
}

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectTo?: string;
}

/**
 * SubmitButton with useFormStatus
 * React 19 hook that automatically tracks form pending state
 * Must be rendered inside a <form> component
 */
function SubmitButton({ isPending: externalPending }: { isPending?: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || externalPending;

  return (
    <Button
      type="submit"
      disabled={isDisabled}
      className="w-full"
      variant="primary"
    >
      {isDisabled ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Logging in...
        </span>
      ) : (
        'Login'
      )}
    </Button>
  );
}

/**
 * LoginForm Component
 * Handles user authentication with email/password
 * React 19 pattern: Uses action attribute instead of onSubmit
 */
export function LoginForm({ onSuccess, onError, redirectTo = '/dashboard' }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();
  const handleError = useStandardErrorHandler();

  // React 19 useActionState for form action handling
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_prevState: FormState, formData: FormData) => {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      // Basic validation
      if (!email || !password) {
        return { error: 'Email and password are required' };
      }

      const credentials: LoginRequest = {
        email: email.trim(),
        password,
      };

      try {
        await loginMutation.mutateAsync(credentials);
        onSuccess?.();
        if (redirectTo) {
          window.location.href = redirectTo;
        }
        return { success: true };
      } catch (error) {
        const result = handleError(error, { context: { operation: 'loginForm' } });
        onError?.(error as Error);
        return { error: result.userMessage };
      }
    },
    { success: false }
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          required
          autoComplete="email"
          disabled={isPending}
          className="w-full"
        />
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            disabled={isPending}
            className="w-full pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" role="alert">
          <p className="text-sm text-red-800 dark:text-red-200">
            {state.error}
          </p>
        </div>
      )}

      {/* Success Message */}
      {state.success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg" role="status">
          <p className="text-sm text-green-800 dark:text-green-200">
            Login successful! Redirecting...
          </p>
        </div>
      )}

      {/* Submit Button - React 19 useFormStatus */}
      <SubmitButton isPending={isPending} />

      {/* Forgot Password Link */}
      <div className="text-center">
        <a
          href="/auth/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Forgot your password?
        </a>
      </div>
    </form>
  );
}

export default LoginForm;
