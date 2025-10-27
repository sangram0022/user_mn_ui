import { Lock, Mail } from 'lucide-react';
import type React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useErrorHandler } from '@hooks/errors/useErrorHandler';
import {
  PasswordInput,
  SubmitButton,
  useFormState,
  useLoadingState,
  usePasswordVisibility,
} from '@shared/index';
import ErrorAlert from '@shared/ui/ErrorAlert';
import { validateBackendEmail, validateBackendPassword } from '@shared/utils/validation';
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

    const emailValidation = validateBackendEmail(formData.email);
    if (!emailValidation.valid) {
      setFieldError('email', emailValidation.error || 'Invalid email');
      isValid = false;
    }

    const passwordValidation = validateBackendPassword(formData.password);
    if (!passwordValidation.valid) {
      setFieldError('password', passwordValidation.error || 'Password required');
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
        await new Promise((resolve) => setTimeout(resolve, 100));
        navigate('/dashboard', { replace: true });
      });
    } catch (err: unknown) {
      handleError(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo & Title */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Form Card */}
        <div className="card">
          <div className="card-body space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="animate-slide-in">
                <ErrorAlert error={error} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={`form-input pl-10 ${errors.email ? 'border-red-500 focus:ring-red-200' : ''}`}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              {/* Password Field */}
              <div>
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
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => updateField('rememberMe', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <SubmitButton isLoading={isLoading} className="w-full btn btn-primary">
                Sign In
              </SubmitButton>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <Link
                to="/register"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Create a new account →
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <p className="text-center text-xs text-gray-500">
          Protected by enterprise-grade encryption
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
