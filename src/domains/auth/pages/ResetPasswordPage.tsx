import { CheckCircle, Eye, EyeOff, Loader, Lock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { logger } from './../../../shared/utils/logger';

import { useErrorHandler } from '@hooks/errors/useErrorHandler';
import { useToast } from '@hooks/useToast';
import { apiClient } from '@lib/api';
import ErrorAlert from '@shared/ui/ErrorAlert';

const ResetPasswordPage: React.FC = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      handleError(new Error('Invalid or missing reset token'));
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, handleError]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      handleError(new Error('Invalid reset token'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Passwords do not match';
      handleError(new Error(errorMsg));
      toast.error(errorMsg);
      return;
    }

    if (formData.password.length < 8) {
      const errorMsg = 'Password must be at least 8 characters long';
      handleError(new Error(errorMsg));
      toast.error(errorMsg);
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const response = await apiClient.resetPassword({
        token,
        new_password: formData.password,
        confirm_password: formData.confirmPassword,
      });

      if (!response.message) {
        logger.warn('Password reset response missing message payload');
      }

      setIsSuccess(true);
      toast.success('Password reset successful! Redirecting to login...');
      window.setTimeout(() => {
        navigate('/login', {
          state: {
            message:
              response.message ??
              'Password reset successful! Please log in with your new password.',
          },
        });
      }, 3000);
    } catch (err: unknown) {
      handleError(err);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) {
      clearError();
    }
  };

  if (!token && !error) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gray-50"
        role="status"
        aria-live="polite"
      >
        <Loader className="h-8 w-8 animate-spin" aria-hidden="true" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6 py-12">
        <div className="mx-auto w-full max-w-md text-center" role="status" aria-live="polite">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
            <CheckCircle className="h-8 w-8 text-white" aria-hidden="true" />
          </div>

          <h1 className="mb-2 text-3xl font-bold text-gray-900">Password Reset Successful!</h1>

          <p className="mb-6 text-sm text-gray-500">
            Your password has been successfully reset. Redirecting to login...
          </p>

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500">
          <Lock className="h-8 w-8 text-white" aria-hidden="true" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Reset Your Password</h1>
        <p className="text-sm text-gray-500">Enter your new password below</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-2xl">
        {error && (
          <div className="mb-6" role="alert" aria-live="assertive">
            <ErrorAlert error={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} aria-label="Password reset form">
          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-10 pr-10 text-sm text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Enter your new password"
              />
              <Lock
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent p-0 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long</p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-10 pr-10 text-sm text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Confirm your new password"
              />
              <Lock
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent p-0 text-gray-400 hover:text-gray-600"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !formData.password || !formData.confirmPassword}
            className={`flex w-full items-center justify-center gap-2 rounded-lg border-none px-4 py-3 text-sm font-semibold text-white transition-all ${
              isLoading || !formData.password || !formData.confirmPassword
                ? 'cursor-not-allowed bg-gray-400'
                : 'cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            }`}
            aria-label={isLoading ? 'Resetting password' : 'Reset password'}
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" aria-hidden="true" />
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="mt-6 flex justify-between text-sm">
          <Link to="/login" className="font-medium text-blue-500 no-underline hover:text-blue-600">
            Back to login
          </Link>
          <Link
            to="/forgot-password"
            className="font-medium text-blue-500 no-underline hover:text-blue-600"
          >
            Request new link
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
