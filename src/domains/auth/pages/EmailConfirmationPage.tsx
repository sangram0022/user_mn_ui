import { ArrowLeft, CheckCircle, Clock, Mail, RefreshCw } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logger } from './../../../shared/utils/logger';

import { useToast } from '@hooks/useToast';
import { apiClient } from '@lib/api/client';

const EmailConfirmationPage: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(30);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { email?: string } | null;
    const urlParams = new URLSearchParams(location.search);
    const emailFromUrl = urlParams.get('email');

    const userEmail = state?.email || emailFromUrl || '';
    setEmail(userEmail);

    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/login', {
            state: {
              message: 'Please check your email and verify your account before logging in.',
            },
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [location, navigate]);

  const handleResendEmail = async () => {
    if (!email || isResending) {
      return;
    }

    setIsResending(true);
    setResendMessage(null);

    try {
      const response = await apiClient.resendVerification({ email });
      const successMsg = response.message ?? 'Verification email has been resent successfully!';
      setResendMessage(successMsg);
      toast.success(successMsg);
    } catch (error) {
      logger.error('Resend verification error:', undefined, { error });
      const errorMsg = 'Failed to resend verification email. Please try again.';
      setResendMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="auth-layout">
        <div className="container-form">
          <div className="card-base card-form">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center mb-6">
                <Mail className="icon-xl text-[var(--color-text-primary)]" aria-hidden="true" />
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mb-2">
                Check your email
              </h2>

              <p className="text-[var(--color-text-secondary)] mb-6">
                We&apos;ve sent a verification link to{' '}
                <span className="font-medium text-[var(--color-text-primary)]">
                  {email || 'your email address'}
                </span>
              </p>

              <div
                className="bg-[var(--color-primary-light)] border border-[var(--color-primary)] rounded-lg p-4 mb-6"
                role="region"
                aria-label="Next steps information"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle
                    className="icon-md text-[var(--color-primary)] mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-[var(--color-primary)] mb-1">
                      What happens next?
                    </h3>
                    <ul className="text-sm text-[var(--color-primary)] space-y-1">
                      <li> Click the verification link in your email</li>
                      <li> Your account will be activated automatically</li>
                      <li> You can then sign in with your credentials</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div
                className="bg-[var(--color-warning)] border border-[var(--color-warning)] rounded-lg p-4 mb-6"
                role="region"
                aria-label="Troubleshooting tips"
              >
                <div className="flex items-start gap-3">
                  <Clock
                    className="icon-md text-[var(--color-warning)] mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-[var(--color-warning)] mb-1">
                      Didn&apos;t receive the email?
                    </h3>
                    <ul className="text-sm text-[var(--color-warning)] space-y-1">
                      <li> Check your spam or junk folder</li>
                      <li> The link expires in 24 hours</li>
                      <li> Make sure to check all email aliases</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="stack-md">
                {resendMessage && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`p-3 rounded-lg text-sm ${
                      resendMessage.includes('successfully')
                        ? 'bg-[var(--color-success-light)] border border-[var(--color-success)] text-[var(--color-success)]'
                        : 'bg-[var(--color-error-light)] border border-[var(--color-error)] text-[var(--color-error)]'
                    }`}
                  >
                    {resendMessage}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isResending || !email}
                  className="btn-base btn-secondary"
                  aria-label={
                    isResending ? 'Resending verification email' : 'Resend verification email'
                  }
                >
                  <RefreshCw
                    className={`icon-sm ${isResending ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                  {isResending ? 'Resending...' : 'Resend verification email'}
                </button>

                <Link to="/login" className="btn-base btn-primary">
                  <ArrowLeft className="icon-sm" aria-hidden="true" />
                  Back to login
                </Link>
              </div>

              <p className="mt-4 text-xs text-[var(--color-text-tertiary)]">
                Auto-redirecting to login in {countdown} seconds...
              </p>
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

export default EmailConfirmationPage;
