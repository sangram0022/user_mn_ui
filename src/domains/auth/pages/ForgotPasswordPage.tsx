import { ArrowLeft, CheckCircle, Loader, Mail } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useErrorHandler } from '@hooks/errors/useErrorHandler';
import { useToast } from '@hooks/useToast';
import { apiClient } from '@lib/api/client';
import { Button } from '@shared/components/ui/Button/Button';
import ErrorAlert from '@shared/ui/ErrorAlert';

const ForgotPasswordPage: React.FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      const response = await apiClient.forgotPassword(email);

      if (response.success === false) {
        const errorMsg = response.message || 'Failed to send reset email. Please try again.';
        handleError(new Error(errorMsg));
        toast.error(errorMsg);
        return;
      }

      setIsSuccess(true);
      toast.success(`Password reset link sent to ${email}`);
    } catch (err: unknown) {
      handleError(err);
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    if (error) {
      clearError();
    }
  };

  if (isSuccess) {
    return (
      <div className="page-wrapper">
        <div className="auth-layout">
          <div className="container-form text-center">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success)]"
              role="status"
              aria-live="polite"
            >
              <CheckCircle
                className="icon-xl text-[var(--color-text-primary)]"
                aria-hidden="true"
              />
            </div>

            <h1 className="mb-2 text-3xl font-bold text-[var(--color-text-primary)]">
              Check Your Email
            </h1>

            <p className="mb-6 text-sm text-[var(--color-text-tertiary)]">
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </p>

            <div className="mb-6 rounded-lg border border-[var(--color-primary)] bg-[var(--color-primary)] p-4">
              <p className="m-0 text-sm text-[var(--color-primary)]">
                The reset link will expire in 1 hour. If you don&apos;t see the email, check your
                spam folder.
              </p>
            </div>

            <div className="stack-md">
              <Button onClick={() => navigate('/login')} fullWidth size="lg">
                Back to Login
              </Button>

              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
                className="btn-base btn-secondary"
              >
                Send Another Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="auth-layout">
        <div className="container-form">
          <div className="mb-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-text-primary)] no-underline transition-colors duration-200 hover:text-[var(--color-text-secondary)]"
            >
              <ArrowLeft className="icon-sm" aria-hidden="true" />
              Back to Login
            </Link>
          </div>

          <header className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]">
              <Mail className="icon-xl text-[var(--color-text-primary)]" aria-hidden="true" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-[var(--color-text-primary)]">
              Reset Password
            </h1>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              Enter your email address and we&apos;ll send you a link to reset your password
            </p>
          </header>

          <div className="card-base card-form">
            {error && (
              <div className="mb-6" role="alert" aria-live="assertive">
                <ErrorAlert error={error} />
              </div>
            )}

            <form onSubmit={handleSubmit} aria-label="Password reset form" className="stack-md">
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={handleChange}
                    className="form-input pl-10"
                    placeholder="Enter your email address"
                  />
                  <Mail
                    className="absolute left-3 top-1/2 icon-sm -translate-y-1/2 text-[var(--color-text-tertiary)]"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className={`btn-base ${isLoading || !email.trim() ? 'opacity-50 cursor-not-allowed' : 'btn-primary'}`}
                aria-label={isLoading ? 'Sending password reset link' : 'Send password reset link'}
              >
                {isLoading ? (
                  <>
                    <span>
                      <Loader className="spinner spinner-sm spinner-white" aria-hidden="true" />
                    </span>
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[var(--color-text-tertiary)]">
              Remember your password?{' '}
              <Link
                to="/login"
                className="font-medium text-[color:var(--color-primary)] no-underline hover:text-[var(--color-primary)]"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
