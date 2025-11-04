import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useResendVerification } from '../hooks/useAuth.hooks';
import { useToast } from '../../../hooks/useToast';
import { Button } from '../../../components';
import { ROUTE_PATHS } from '../../../core/routing/routes';

export default function VerifyEmailPendingPage() {
  const { t } = useTranslation(['auth', 'common', 'errors']);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Get email from location state
  const email = location.state?.email;

  // Use new centralized resend verification hook
  const resendVerificationMutation = useResendVerification();
  const loading = resendVerificationMutation.isPending;

  const [resendCount, setResendCount] = useState(0);
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);

  // Redirect to register if no email in state
  if (!email) {
    navigate(ROUTE_PATHS.REGISTER);
    return null;
  }

  const handleResendVerification = async () => {
    // Rate limiting: prevent resending within 60 seconds
    const now = Date.now();
    if (lastResendTime && now - lastResendTime < 60000) {
      const remainingSeconds = Math.ceil((60000 - (now - lastResendTime)) / 1000);
      toast.warning(t('verifyEmail.waitBeforeResend', { seconds: remainingSeconds }));
      return;
    }

    try {
      await resendVerificationMutation.mutateAsync({ email });

      setResendCount((prev) => prev + 1);
      setLastResendTime(now);
      toast.success(t('verifyEmail.resendSuccess'));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errors:RESEND_FAILED');
      toast.error(message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-600 to-cyan-600 rounded-full mb-4 shadow-lg shadow-blue-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2" data-testid="pending-heading">{t('verifyEmail.checkYourEmail')}</h1>
          <p className="text-gray-600">{t('verifyEmail.verificationSent')}</p>
        </div>

        {/* Content */}
        <div className="glass p-8 rounded-2xl shadow-xl border border-white/20 space-y-6 animate-scale-in">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">{t('verifyEmail.emailSentTo')}</p>
                <p className="font-mono bg-white/50 px-2 py-1 rounded" data-testid="email-display">{email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-700">
                {t('verifyEmail.checkInbox')}
              </p>
            </div>
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-700">
                {t('verifyEmail.clickLink')}
              </p>
            </div>
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-700">
                {t('verifyEmail.checkSpam')}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4 text-center">
              {t('verifyEmail.didntReceive')}
            </p>
            <Button
              onClick={handleResendVerification}
              disabled={loading}
              variant="outline"
              size="lg"
              className="w-full"
              data-testid="resend-button"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('verifyEmail.resending')}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t('verifyEmail.resendEmail')}
                </>
              )}
            </Button>
            {resendCount > 0 && (
              <p className="text-xs text-green-600 text-center mt-2">
                {t('verifyEmail.emailResent', { count: resendCount })}
              </p>
            )}
          </div>
        </div>

        {/* Back to login */}
        <p className="text-center mt-6 text-gray-600 animate-slide-up">
          <Link to={ROUTE_PATHS.LOGIN} className="text-brand-primary hover:opacity-80 font-semibold transition-opacity" data-testid="login-link">
            {t('verifyEmail.backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
}
