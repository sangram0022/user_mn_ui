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
      <div className="mx-auto w-full max-w-md text-center">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500"
          role="status"
          aria-live="polite"
        >
          <CheckCircle className="h-8 w-8 text-white" aria-hidden="true" />
        </div>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">Check Your Email</h1>

        <p className="mb-6 text-sm text-gray-500">
          We&apos;ve sent a password reset link to <strong>{email}</strong>
        </p>

        <div className="mb-6 rounded-lg border border-sky-200 bg-sky-50 p-4">
          <p className="m-0 text-sm text-sky-700">
            The reset link will expire in 1 hour. If you don&apos;t see the email, check your spam
            folder.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate('/login')} fullWidth size="lg">
            Back to Login
          </Button>

          <button
            type="button"
            onClick={() => {
              setIsSuccess(false);
              setEmail('');
            }}
            className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-500 transition-all duration-200 hover:bg-gray-50"
          >
            Send Another Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 no-underline transition-colors duration-200 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Login
        </Link>
      </div>

      <header className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500">
          <Mail className="h-8 w-8 text-white" aria-hidden="true" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Reset Password</h1>
        <p className="text-sm text-gray-500">
          Enter your email address and we&apos;ll send you a link to reset your password
        </p>
      </header>

      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-2xl">
        {error && (
          <div className="mb-6" role="alert" aria-live="assertive">
            <ErrorAlert error={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} aria-label="Password reset form">
          <div className="mb-6">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
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
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-10 text-sm text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Enter your email address"
              />
              <Mail
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className={`flex w-full items-center justify-center gap-2 rounded-lg border-none px-4 py-3 text-sm font-semibold text-white transition-all duration-200 ${
              isLoading || !email.trim()
                ? 'cursor-not-allowed bg-gray-400'
                : 'cursor-pointer bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            }`}
            aria-label={isLoading ? 'Sending password reset link' : 'Send password reset link'}
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" aria-hidden="true" />
                Sending Reset Link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-blue-500 no-underline hover:text-blue-600">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
