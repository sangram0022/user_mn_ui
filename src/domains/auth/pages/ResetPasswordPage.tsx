import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useResetPassword } from '../hooks/useAuth.hooks';
import { useToast } from '../../../hooks/useToast';
import { calculatePasswordStrength } from '../../../core/validation';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
import Badge from '../../../shared/components/ui/Badge';
import { Button, Input } from '../../../components';
import { ROUTE_PATHS } from '../../../core/routing/routes';
import { PageErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';

export function ResetPasswordPage() {
  const { t } = useTranslation(['auth', 'common', 'errors']);
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const toast = useToast();
  const handleError = useStandardErrorHandler();
  
  // Use new centralized reset password hook
  const resetPasswordMutation = useResetPassword();
  const loading = resetPasswordMutation.isPending;

  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'fair' | 'good' | 'strong' | 'very_strong'>('weak');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'password' && value) {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength.strength);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error(t('errors:RESET_TOKEN_INVALID'));
      return;
    }

    // Password confirmation check
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('errors:PASSWORD_MISMATCH'));
      return;
    }

    // Check password strength
    const strength = calculatePasswordStrength(formData.password);
    if (strength.score < 40) {
      toast.error(t('errors:PASSWORD_TOO_WEAK'));
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        new_password: formData.password,
        confirm_password: formData.confirmPassword,
      });

      setIsSuccess(true);
      toast.success(t('resetPassword.successMessage'));
      setTimeout(() => {
        navigate(ROUTE_PATHS.LOGIN, {
          state: { message: t('resetPassword.successMessage') },
        });
      }, 3000);
    } catch (error) {
      handleError(error, { context: { operation: 'resetPassword' } });
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 animate-fade-in">
        <div className="max-w-md w-full text-center">
          <div className="glass p-12 rounded-2xl shadow-xl border border-white/20 animate-scale-in">
            <div className="text-6xl mb-6 animate-bounce">✅</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('resetPassword.successMessage')}
            </h1>
            <p className="text-gray-700 mb-8">
              {t('common:status.redirecting')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="max-w-md w-full">
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2" data-testid="reset-password-heading">{t('resetPassword.title')}</h1>
          <p className="text-gray-600">{t('resetPassword.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl shadow-xl border border-white/20 space-y-6 animate-scale-in" data-testid="reset-password-form">
          <div>
            <Input
              type="password"
              name="password"
              label={t('resetPassword.passwordLabel')}
              placeholder={t('resetPassword.passwordPlaceholder')}
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="new-password"
              data-testid="new-password-input"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />
            
            {formData.password && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-600">{t('resetPassword.passwordStrength')}</span>
                <Badge 
                  variant={
                    passwordStrength === 'weak' ? 'danger' : 
                    passwordStrength === 'fair' ? 'warning' : 
                    passwordStrength === 'good' ? 'info' :
                    'success'
                  }
                  className="text-xs"
                >
                  {passwordStrength.toUpperCase()}
                </Badge>
              </div>
            )}
          </div>

          <Input
            type="password"
            name="confirmPassword"
            label={t('resetPassword.confirmPasswordLabel')}
            placeholder={t('resetPassword.confirmPasswordPlaceholder')}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
            autoComplete="new-password"
            data-testid="confirm-password-input"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading || !formData.password || !formData.confirmPassword}
            className="w-full"
            data-testid="reset-submit-button"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('resetPassword.submitting')}
              </>
            ) : (
              t('resetPassword.submitButton')
            )}
          </Button>

          <div className="flex justify-between text-sm pt-4">
            <Link
              to={ROUTE_PATHS.LOGIN}
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              ← {t('resetPassword.backToLogin')}
            </Link>
            <Link
              to={ROUTE_PATHS.FORGOT_PASSWORD}
              className="text-brand-primary hover:opacity-80 font-medium transition-opacity"
            >
              {t('common:actions.requestNew')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordPageWithErrorBoundary() {
  return (
    <PageErrorBoundary>
      <ResetPasswordPage />
    </PageErrorBoundary>
  );
}

export default ResetPasswordPageWithErrorBoundary;
