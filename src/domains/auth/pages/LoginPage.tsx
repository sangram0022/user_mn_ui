import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useErrorHandler } from '@hooks/errors/useErrorHandler';
import { AuthButton } from '@shared/ui/AuthButton';
import ErrorAlert from '@shared/ui/ErrorAlert';
import { FormInput } from '@shared/ui/FormInput';
import { validateEmail, validatePassword } from '@shared/utils/formValidation';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();

  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      handleError(new Error(emailValidation.error));
      return false;
    }

    const passwordValidation = validatePassword(formData.password, 8);
    if (!passwordValidation.isValid) {
      handleError(new Error(passwordValidation.error));
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Use AuthProvider's login method which updates user state
      await authLogin({
        email: formData.email,
        password: formData.password,
      });

      // Only navigate after successful login and user state update
      // Small delay to ensure state is fully updated
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Navigate to dashboard after successful login
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      // Handle error on the login page, not showing full-screen error
      handleError(err);
      setIsLoading(false); // Reset loading state on error
    }
    // Note: Don't reset loading in finally - let navigation happen while showing spinner
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
            <FormInput
              id="email"
              name="email"
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              autoComplete="email"
              Icon={Mail}
            />

            {/* Password Field */}
            <FormInput
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
              Icon={Lock}
              helperTextContent="Must be at least 8 characters long"
              ToggleIcon={
                showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )
              }
              onToggle={() => setShowPassword(!showPassword)}
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
                  onChange={handleChange}
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
            <AuthButton type="submit" variant="primary" isLoading={isLoading}>
              Sign In
            </AuthButton>
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
