import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTE_PATHS } from '../../../core/routing/routes';
import { useToast } from '../../../hooks/useToast';
import { ValidationBuilder } from '../../../core/validation';
import { parseAuthError } from '../utils/authErrorMapping';
import { useForgotPassword } from '../hooks/useForgotPassword';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';

export default function ForgotPasswordPage() {
  const { t } = useTranslation(['auth', 'common', 'errors', 'validation']);
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation using core validation system
    const validation = new ValidationBuilder()
      .validateField('email', email, (b) => b.required().email())
      .result();

    if (!validation.isValid) {
      const errors: Record<string, string> = {};
      
      if (validation.fields) {
        Object.entries(validation.fields).forEach(([fieldName, fieldResult]) => {
          if (!fieldResult.isValid && fieldResult.errors.length > 0) {
            errors[fieldName] = fieldResult.errors[0];
          }
        });
      }
      
      setFieldErrors(errors);
  toast.error(t('validation.validationFailed'));
      return;
    }

    // Clear errors
    setFieldErrors({});

    // Security pattern: Always show success message
    forgotPassword(
      { email },
      {
        onSuccess: () => {
          toast.success(t('forgotPassword.successMessage'));
          setIsSubmitted(true);
        },
        onError: (error: Error) => {
          const errorMapping = parseAuthError(error);
          // Security: Still show success to prevent email enumeration
          toast.success(t('forgotPassword.successMessage'));
          setIsSubmitted(true);
          // Log error for debugging (remove in production)
          console.error('Forgot password error:', errorMapping);
        },
      }
    );
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
                {t('forgotPassword.backToLogin')} {t('forgotPassword.loginLink')}
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
            error={fieldErrors.email}
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
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
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
              ← {t('forgotPassword.backToLogin')} {t('forgotPassword.loginLink')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
