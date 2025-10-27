import { CheckCircle, Loader2, Mail, XCircle } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { useErrorHandler } from '@hooks/errors/useErrorHandler';
import { useToast } from '@hooks/useToast';
import { apiClient } from '@lib/api/client';

const EmailVerificationPage: React.FC = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your email...');
  const [countdown, setCountdown] = useState<number>(5);
  const { handleError } = useErrorHandler();

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        const errorMsg =
          'No verification token provided. Please check your email for the correct link.';
        setMessage(errorMsg);
        toast.error(errorMsg);
        return;
      }

      try {
        const response = await apiClient.verifyEmail(token);

        setStatus('success');
        const successMsg =
          response.message ??
          'Your email has been successfully verified! You can now sign in to your account.';
        setMessage(successMsg);
        toast.success('Email verified successfully!');
      } catch (error: unknown) {
        handleError(error);
        setStatus('error');
        const errorMsg =
          'Email verification failed. Please try again or request a new verification email.';
        setMessage(errorMsg);
        toast.error(errorMsg);
      }
    };

    void verifyEmail();
  }, [token, handleError, toast]);

  useEffect(() => {
    if (status !== 'success') {
      return;
    }

    if (countdown > 0) {
      const timer = window.setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => window.clearTimeout(timer);
    }

    navigate('/login', {
      state: {
        message: 'Email verified successfully! Please sign in with your credentials.',
      },
    });

    // Return undefined for the case where navigate is called
    return undefined;
  }, [status, countdown, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="spinner spinner-lg spinner-primary" aria-hidden="true" />;
      case 'success':
        return <CheckCircle className="icon-xl text-[var(--color-success)]" aria-hidden="true" />;
      case 'error':
        return <XCircle className="icon-xl text-[var(--color-error)]" aria-hidden="true" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-[var(--color-primary)]';
      case 'success':
        return 'text-[var(--color-success)]';
      case 'error':
        return 'text-[var(--color-error)]';
    }
  };

  return (
    <div className="page-wrapper">
      <div className="auth-layout">
        <div className="container-form">
          <div className="card-base card-form">
            <div className="text-center" role="status" aria-live="polite">
              <div className="mx-auto w-16 h-16 bg-[var(--color-surface-secondary)] rounded-full flex items-center justify-center mb-6">
                {getStatusIcon()}
              </div>

              <h2 className={`text-3xl font-bold tracking-tight mb-2 ${getStatusColor()}`}>
                {status === 'loading' && 'Verifying Email'}
                {status === 'success' && 'Email Verified!'}
                {status === 'error' && 'Verification Failed'}
              </h2>

              <p className="text-[var(--color-text-secondary)] mb-6">{message}</p>

              {status === 'success' && (
                <div
                  className="bg-[var(--color-success-light)] border border-[var(--color-success)] rounded-lg p-4 mb-6"
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-sm text-[var(--color-success)]">
                    Redirecting to login in {countdown} second{countdown === 1 ? '' : 's'}...
                  </p>
                </div>
              )}

              {status === 'error' && (
                <div
                  className="bg-[var(--color-error-light)] border border-[var(--color-error)] rounded-lg p-4 mb-6"
                  role="alert"
                  aria-live="assertive"
                >
                  <div className="space-y-3">
                    <p className="text-sm text-[var(--color-error)]">
                      <strong>What you can do:</strong>
                    </p>
                    <ul className="text-sm text-[var(--color-error)] space-y-1 ml-4">
                      <li> Check if the link is correct and not expired</li>
                      <li> Request a new verification email</li>
                      <li> Contact support if the problem persists</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="stack-md">
                {status === 'success' ? (
                  <Link to="/login" className="btn-base btn-primary">
                    Go to Login
                  </Link>
                ) : status === 'error' ? (
                  <>
                    <Link to="/email-confirmation" className="btn-base btn-secondary">
                      <Mail className="icon-sm" aria-hidden="true" />
                      Request New Verification Email
                    </Link>
                    <Link to="/login" className="btn-base btn-primary">
                      Back to Login
                    </Link>
                  </>
                ) : (
                  <div className="btn-base opacity-50 cursor-not-allowed">
                    <span>
                      <Loader2 className="spinner spinner-sm spinner-white" />
                    </span>
                    Verifying...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Need help?{' '}
              <Link
                to="/help"
                className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
