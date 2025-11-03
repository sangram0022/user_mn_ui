import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTE_PATHS } from '../../../core/routing/routes';
import { useToast } from '../../../hooks/useToast';
import { useForgotPassword } from '../hooks/useAuth.hooks';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';

export default function ForgotPasswordPage() {
  const { t } = useTranslation(['auth', 'common']);
  const toast = useToast();
  
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Use new centralized forgot password hook
  const { forgotPassword, loading } = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await forgotPassword({ email });
      
      // Security pattern: Always show success message to prevent email enumeration
      toast.success(t('forgotPassword.successMessage'));
      setIsSubmitted(true);
      
      // Log result for debugging (remove in production or make conditional)
      if (!result.success && result.error) {
        console.debug('Forgot password error:', result.error);
      }
    } catch (error) {
      // Still show success to prevent email enumeration
      toast.success(t('forgotPassword.successMessage'));
      setIsSubmitted(true);
      console.error('Forgot password error:', error);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 animate-fade-in">
        <div className="max-w-md w-full">
          <div className="glass p-12 rounded-2xl shadow-xl border border-white/20 text-center animate-scale-in">
            <div className="text-6xl mb-6 animate-bounce">✉️</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('common:success.emailSent')}
            </h2>
            <p className="text-gray-700 mb-8 leading-relaxed">
              {t('forgotPassword.successMessage')}
            </p>
            <Link to={ROUTE_PATHS.LOGIN}>
              <Button variant="primary" size="lg" className="w-full">
                {t('forgotPassword.backToLogin')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('forgotPassword.title')}</h1>
          <p className="text-gray-600">{t('forgotPassword.subtitle')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl shadow-xl border border-white/20 space-y-6 animate-scale-in">
          <Input
            type="email"
            label={t('forgotPassword.emailLabel')}
            placeholder={t('forgotPassword.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('forgotPassword.submitting')}
              </>
            ) : (
              t('forgotPassword.submitButton')
            )}
          </Button>

          <div className="text-center pt-4">
            <Link
              to={ROUTE_PATHS.LOGIN}
              className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              ← {t('forgotPassword.backToLogin')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
