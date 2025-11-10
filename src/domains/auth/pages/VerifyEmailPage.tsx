import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useVerifyEmail } from '../hooks/useAuth.hooks';
import { useToast } from '../../../hooks/useToast';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
import { Button } from '../../../components';
import { ROUTE_PATHS } from '../../../core/routing/routes';
import { PageErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';
import { UI_TIMING } from '@/core/constants';

type VerificationStatus = 'loading' | 'success' | 'error';

function VerifyEmailPage() {
  const { t } = useTranslation(['auth', 'common', 'errors']);
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const toast = useToast();
  const handleError = useStandardErrorHandler();
  
  // Use new centralized verify email hook
  const verifyEmailMutation = useVerifyEmail();

  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true; // Track if component is still mounted
    let redirectTimeout: number | null = null;

    const verify = async () => {
      if (!token) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage(t('errors:VERIFICATION_TOKEN_INVALID'));
        }
        return;
      }

      try {
        await verifyEmailMutation.mutateAsync({ token });

        if (!isMounted) return; // Don't update state if unmounted

        setStatus('success');
        toast.success(t('verifyEmail.success'));
        redirectTimeout = setTimeout(() => {
          if (isMounted) {
            navigate(ROUTE_PATHS.LOGIN, {
              state: { message: t('verifyEmail.successMessage') },
            });
          }
        }, UI_TIMING.SUCCESS_REDIRECT_DELAY);
      } catch (error) {
        if (!isMounted) return; // Don't update state if unmounted

        const result = handleError(error, { context: { operation: 'verifyEmail', token } });
        setStatus('error');
        setErrorMessage(result.userMessage);
      }
    };

    verify();

    return () => {
      isMounted = false; // Mark as unmounted
      if (redirectTimeout) {
        clearTimeout(redirectTimeout); // Clear pending redirect
      }
    };
  }, [token, verifyEmailMutation, toast, navigate, t, handleError]);

  if (status === 'loading') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 animate-fade-in">
        <div className="max-w-md w-full text-center">
          <div className="glass p-12 rounded-2xl shadow-xl border border-white/20 animate-scale-in">
            <svg className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('verifyEmail.verifying')}
            </h1>
            <p className="text-gray-600">{t('common:status.pleaseWait')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 animate-fade-in">
        <div className="max-w-md w-full text-center">
          <div className="glass p-12 rounded-2xl shadow-xl border border-white/20 animate-scale-in">
            <div className="text-6xl mb-6 animate-bounce">✅</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="verify-email-heading">
              {t('verifyEmail.success')}
            </h1>
            <p className="text-gray-700 mb-8" data-testid="success-message">
              {t('verifyEmail.successMessage')}
            </p>
            <p className="text-gray-600">{t('common:status.redirecting')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="max-w-md w-full text-center">
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-red-600 to-pink-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2" data-testid="verify-email-heading">{t('verifyEmail.failed')}</h1>
          <p className="text-gray-600 mb-6" data-testid="error-message">
            {errorMessage || t('verifyEmail.failedMessage')}
          </p>
        </div>

        <div className="glass p-8 rounded-2xl shadow-xl border border-white/20 animate-scale-in">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-700 mb-6">
            {t('verifyEmail.needNewLink')}
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate(ROUTE_PATHS.REGISTER)}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {t('verifyEmail.backToRegister')}
            </Button>
            <Link
              to={ROUTE_PATHS.LOGIN}
              className="block text-center text-brand-primary hover:opacity-80 font-medium transition-opacity"
              data-testid="login-link"
            >
              {t('verifyEmail.goToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function VerifyEmailPageWithErrorBoundary() {
  return (
    <PageErrorBoundary>
      <VerifyEmailPage />
    </PageErrorBoundary>
  );
}

export default VerifyEmailPageWithErrorBoundary;
