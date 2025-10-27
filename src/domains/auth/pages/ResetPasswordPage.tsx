import { CheckCircle, Eye, EyeOff, Loader, Lock } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { logger } from './../../../shared/utils/logger';

import { useErrorHandler } from '@hooks/errors/useErrorHandler';
import { useToast } from '@hooks/useToast';
import { apiClient } from '@lib/api/client';
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
        className="flex min-h-screen items-center justify-center bg-[var(--color-surface-secondary)]"
        role="status"
        aria-live="polite"
      >
        <Loader className="spinner spinner-lg spinner-primary" aria-hidden="true" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="page-wrapper">
        <div className="auth-layout">
          <div className="container-form text-center" role="status" aria-live="polite">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success)]">
              <CheckCircle
                className="icon-xl text-[var(--color-text-primary)]"
                aria-hidden="true"
              />
            </div>

            <h1 className="mb-2 text-3xl font-bold text-[var(--color-text-primary)]">
              Password Reset Successful!
            </h1>

            <p className="mb-6 text-sm text-[var(--color-text-tertiary)]">
              Your password has been successfully reset. Redirecting to login...
            </p>

            <div className="spinner spinner-lg spinner-primary mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="auth-layout">
        <div className="container-form">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]">
              <Lock className="icon-xl text-[var(--color-text-primary)]" aria-hidden="true" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-[var(--color-text-primary)]">
              Reset Your Password
            </h1>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              Enter your new password below
            </p>
          </div>

          <div className="card-base card-form">
            {error && (
              <div className="mb-6" role="alert" aria-live="assertive">
                <ErrorAlert error={error} />
              </div>
            )}

            <form onSubmit={handleSubmit} aria-label="Password reset form" className="stack-md">
              <div>
                <label htmlFor="password" className="form-label">
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
                    className="form-input pl-10 pr-10"
                    placeholder="Enter your new password"
                  />
                  <Lock
                    className="absolute left-3 top-1/2 icon-sm -translate-y-1/2 text-[var(--color-text-tertiary)]"
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent p-0 text-[color:var(--color-text-primary)] hover:text-[var(--color-text-secondary)]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="icon-sm" aria-hidden="true" />
                    ) : (
                      <Eye className="icon-sm" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <p className="form-hint">Must be at least 8 characters long</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="form-label">
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
                    className="form-input pl-10 pr-10"
                    placeholder="Confirm your new password"
                  />
                  <Lock
                    className="absolute left-3 top-1/2 icon-sm -translate-y-1/2 text-[var(--color-text-tertiary)]"
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent p-0 text-[color:var(--color-text-primary)] hover:text-[var(--color-text-secondary)]"
                    aria-label={
                      showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="icon-sm" aria-hidden="true" />
                    ) : (
                      <Eye className="icon-sm" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !formData.password || !formData.confirmPassword}
                className={`btn-base ${isLoading || !formData.password || !formData.confirmPassword ? 'opacity-50 cursor-not-allowed' : 'btn-primary'}`}
                aria-label={isLoading ? 'Resetting password' : 'Reset password'}
              >
                {isLoading ? (
                  <>
                    <span>
                      <Loader className="spinner spinner-sm spinner-white" aria-hidden="true" />
                    </span>
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            <div className="mt-6 flex justify-between text-sm">
              <Link
                to="/login"
                className="font-medium text-[color:var(--color-primary)] no-underline hover:text-[var(--color-primary)]"
              >
                Back to login
              </Link>
              <Link
                to="/forgot-password"
                className="font-medium text-[color:var(--color-primary)] no-underline hover:text-[var(--color-primary)]"
              >
                Request new link
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
