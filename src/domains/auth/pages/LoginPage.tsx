import { Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useErrorHandler } from '@hooks/errors/useErrorHandler';
import {
  PasswordInput,
  SubmitButton,
  TextInput,
  useFormState,
  useLoadingState,
  usePasswordVisibility,
} from '@shared/index';
import ErrorAlert from '@shared/ui/ErrorAlert';
import { validateEmail, validatePassword } from '@shared/utils/formValidation';
import { useAuth } from '../context/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC = () => {
  const { formData, updateField, errors, setFieldError, clearErrors } = useFormState<LoginFormData>(
    {
      email: '',
      password: '',
      rememberMe: false,
    }
  );

  const { showPassword, togglePasswordVisibility } = usePasswordVisibility();
  const { isLoading, withLoading } = useLoadingState();
  const { error, handleError, clearError } = useErrorHandler();

  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const validateForm = () => {
    clearErrors();
    let isValid = true;

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      setFieldError('email', emailValidation.error || 'Invalid email');
      isValid = false;
    }

    const passwordValidation = validatePassword(formData.password, 8);
    if (!passwordValidation.isValid) {
      setFieldError(
        'password',
        passwordValidation.error || 'Password must be at least 8 characters'
      );
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await withLoading(async () => {
        await authLogin({
          email: formData.email,
          password: formData.password,
        });

        // Small delay to ensure state is fully updated
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Navigate to dashboard after successful login
        navigate('/dashboard', { replace: true });
      });
    } catch (err: unknown) {
      handleError(err);
    }
  };

  return (
    <>
      <div className="mx-auto w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account to continue</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md mt-8">
        <div className="bg-white/95 backdrop-blur-sm p-8 shadow-xl rounded-2xl border border-gray-200/50">
          {/* Error Alert */}
          {error && (
            <div className="mb-6">
              <ErrorAlert error={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Email Field */}
            <TextInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(value) => updateField('email', value)}
              error={errors.email}
              required
              placeholder="Enter your email"
              autoComplete="email"
            />

            {/* Password Field */}
            <PasswordInput
              label="Password"
              value={formData.password}
              onChange={(value) => updateField('password', value)}
              showPassword={showPassword}
              onToggleVisibility={togglePasswordVisibility}
              error={errors.password}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <label
                htmlFor="remember-me-checkbox"
                className="inline-flex items-center gap-2 text-sm text-gray-900 cursor-pointer"
              >
                <input
                  id="remember-me-checkbox"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => updateField('rememberMe', e.target.checked)}
                  className="w-4 h-4 border border-gray-300 rounded accent-blue-500"
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <SubmitButton isLoading={isLoading}>Sign In</SubmitButton>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/95 text-gray-600">Don't have an account?</span>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <Link
              to="/register"
              className="font-medium text-blue-500 hover:text-blue-600 transition-colors"
            >
              Create a new account
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
