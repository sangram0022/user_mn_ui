import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTE_PATHS } from '../../../core/routing/routes';
import { useToast } from '../../../hooks/useToast';
import { useForgotPassword } from '../hooks/useAuth.hooks';
import { useForgotPasswordForm } from '../../../core/validation/useValidatedForm';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';

export default function ForgotPasswordPage() {
  const { t } = useTranslation(['auth', 'common']);
  const toast = useToast();
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Use new centralized forgot password hook with React Query
  const forgotPasswordMutation = useForgotPassword();

  // React Hook Form integration
  const form = useForgotPasswordForm({
    onSuccess: async (data) => {
      try {
        await forgotPasswordMutation.mutateAsync({ email: data.email });
        
        // Security pattern: Always show success message to prevent email enumeration
        toast.success(t('forgotPassword.successMessage'));
        setIsSubmitted(true);
      } catch (error) {
        // Still show success to prevent email enumeration
        toast.success(t('forgotPassword.successMessage'));
        setIsSubmitted(true);
        console.error('Forgot password error:', error);
      }
    },
    onError: (error) => {
      console.error('Forgot password form error:', error);
    }
  });



  if (isSubmitted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-linear-to-br from-green-50 to-blue-50 animate-fade-in">
        <div className="w-full max-w-md">
          <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-200 text-center animate-scale-in" data-testid="success-message">
            <div className="text-6xl mb-6 animate-bounce">✉️</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('common:success.emailSent')}
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-linear-to-br from-blue-50 to-purple-50 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900" data-testid="forgot-password-heading">{t('forgotPassword.title')}</h1>
          <p className="text-gray-600">{t('forgotPassword.subtitle')}</p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-6 animate-scale-in">
        <form onSubmit={form.handleSubmit} className="space-y-6" data-testid="forgot-password-form">
          <Input
            type="email"
            label={t('forgotPassword.emailLabel')}
            placeholder={t('forgotPassword.emailPlaceholder')}
            {...form.register('email')}
            error={form.formState.errors.email?.message}
            required
            disabled={form.formState.isSubmitting || forgotPasswordMutation.isPending}
            data-testid="email-input"

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
            disabled={form.isDisabled || forgotPasswordMutation.isPending}
            loading={form.formState.isSubmitting || forgotPasswordMutation.isPending}
            className="w-full"
            data-testid="submit-button"
          >
            {form.formState.isSubmitting || forgotPasswordMutation.isPending ? t('forgotPassword.submitting') : t('forgotPassword.submitButton')}
          </Button>

        </form>

        {/* Back to login link */}
        <div className="text-center pt-4">
          <Link
            to={ROUTE_PATHS.LOGIN}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            data-testid="login-link"
          >
            ← {t('forgotPassword.backToLogin')}
          </Link>
        </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-gray-600 animate-slide-up">
          {t('auth:NO_ACCOUNT', "Don't have an account?")}{' '}
          <Link to={ROUTE_PATHS.REGISTER} className="text-blue-600 hover:text-blue-500 font-semibold transition-colors">
            {t('auth:CREATE_ACCOUNT', 'Sign up for free')}
          </Link>
        </p>
      </div>
    </div>
  );
}
