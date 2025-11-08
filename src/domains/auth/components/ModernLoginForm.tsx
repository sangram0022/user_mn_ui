// ========================================
// ModernLoginForm - Updated with Modern Patterns
// Uses React 19 features and modern components
// ========================================

import { z } from 'zod';
import { ModernForm, InputField, SubmitButton, FormActions } from '@/shared/components/forms/ModernFormComponents';
import { useApiMutation } from '@/shared/hooks/useApiModern';
import { ComponentErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';
import authService from '../services/authService';
import type { LoginRequest } from '../types/auth.types';

// ========================================
// Validation Schema with Zod
// ========================================

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email address is too long'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ========================================
// Props Interface
// ========================================

interface ModernLoginFormProps {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
  redirectTo?: string;
  className?: string;
}

// ========================================
// Modern Login Form Component
// ========================================

export function ModernLoginForm({ 
  onSuccess, 
  onError, 
  redirectTo = '/dashboard',
  className = '',
}: ModernLoginFormProps) {
  
  // Modern API mutation with optimistic updates
  const loginMutation = useApiMutation(
    async (credentials: LoginRequest) => {
      return await authService.login(credentials);
    },
    {
      successMessage: 'Login successful! Redirecting...',
      onSuccess: (data) => {
        onSuccess?.(data);
        
        // Redirect after successful login
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 1000);
      },
      onError: (error) => {
        console.error('Login failed:', error.message);
        onError?.(error);
      },
    }
  );

  // Form submission handler with modern patterns
  const handleSubmit = async (formData: LoginFormData): Promise<unknown> => {
    const credentials: LoginRequest = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    return loginMutation.mutateAsync(credentials);
  };

  return (
    <ComponentErrorBoundary>
      <div className={`modern-login-form ${className}`}>
        <ModernForm<LoginFormData>
          onSubmit={handleSubmit}
          schema={loginSchema}
          defaultValues={{
            email: '',
            password: '',
          }}
          resetOnSuccess={false}
          className="space-y-6"
        >
          {(form) => (
            <>
              {/* Email Field */}
              <InputField
                name="email"
                control={form.control}
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                required
                disabled={loginMutation.isPending}
                className="w-full"
              />

              {/* Password Field */}
              <InputField
                name="password"
                control={form.control}
                label="Password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={loginMutation.isPending}
                className="w-full"
              />

              {/* Form Actions */}
              <FormActions alignment="between" className="flex-col space-y-4">
                {/* Submit Button */}
                <SubmitButton
                  isLoading={loginMutation.isPending}
                  disabled={loginMutation.isPending || !form.formState.isValid}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  {loginMutation.isPending ? 'Logging in...' : 'Login'}
                </SubmitButton>

                {/* Additional Links */}
                <div className="flex justify-between items-center w-full text-sm">
                  <a
                    href="/auth/forgot-password"
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </a>
                  
                  <a
                    href="/auth/register"
                    className="text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                  >
                    Create account
                  </a>
                </div>
              </FormActions>

              {/* Loading State Indicator */}
              {loginMutation.isPending && (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Authenticating...
                  </span>
                </div>
              )}

              {/* Success Message */}
              {loginMutation.isSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <p className="text-sm text-green-700 dark:text-green-300 text-center">
                    ✅ Login successful! Redirecting to dashboard...
                  </p>
                </div>
              )}

              {/* Development Info */}
              {import.meta.env.MODE === 'development' && (
                <details className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    Form State (Development)
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    {JSON.stringify(
                      {
                        values: form.getValues(),
                        errors: form.formState.errors,
                        isValid: form.formState.isValid,
                        isDirty: form.formState.isDirty,
                        isSubmitting: form.formState.isSubmitting,
                      },
                      null,
                      2
                    )}
                  </pre>
                </details>
              )}
            </>
          )}
        </ModernForm>
      </div>
    </ComponentErrorBoundary>
  );
}

// ========================================
// Enhanced Login Form with Remember Me
// ========================================

const extendedLoginSchema = loginSchema.extend({
  rememberMe: z.boolean().default(false),
});

type ExtendedLoginFormData = z.infer<typeof extendedLoginSchema>;

interface ExtendedLoginFormProps extends ModernLoginFormProps {
  showRememberMe?: boolean;
}

export function ExtendedLoginForm({ 
  showRememberMe = true,
  ...props 
}: ExtendedLoginFormProps) {
  const loginMutation = useApiMutation(
    async (credentials: LoginRequest & { rememberMe?: boolean }) => {
      return await authService.login(credentials);
    },
    {
      successMessage: 'Login successful!',
      onSuccess: props.onSuccess,
      onError: props.onError,
    }
  );

  const handleSubmit = async (formData: ExtendedLoginFormData): Promise<unknown> => {
    const credentials = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      rememberMe: formData.rememberMe,
    };

    return loginMutation.mutateAsync(credentials);
  };

  return (
    <ComponentErrorBoundary>
      <div className={`extended-login-form ${props.className || ''}`}>
        <ModernForm<ExtendedLoginFormData>
          onSubmit={handleSubmit}
          schema={extendedLoginSchema}
          defaultValues={{
            email: '',
            password: '',
            rememberMe: false,
          }}
          className="space-y-6"
        >
          {(form) => (
            <>
              <InputField
                name="email"
                control={form.control}
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                required
                disabled={loginMutation.isPending}
              />

              <InputField
                name="password"
                control={form.control}
                label="Password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={loginMutation.isPending}
              />

              {/* Remember Me Checkbox */}
              {showRememberMe && (
                <div className="flex items-center">
                  <input
                    {...form.register('rememberMe')}
                    type="checkbox"
                    id="rememberMe"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loginMutation.isPending}
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Keep me logged in for 30 days
                  </label>
                </div>
              )}

              <FormActions>
                <SubmitButton
                  isLoading={loginMutation.isPending}
                  disabled={loginMutation.isPending || !form.formState.isValid}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Login
                </SubmitButton>
              </FormActions>
            </>
          )}
        </ModernForm>
      </div>
    </ComponentErrorBoundary>
  );
}

export default ModernLoginForm;