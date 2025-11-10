import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useChangePassword } from '../hooks/useAuth.hooks';
import { useToast } from '../../../hooks/useToast';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
import { Button, Input } from '../../../components';
import { ROUTE_PATHS } from '../../../core/routing/routes';
import { calculatePasswordStrength } from '../../../core/validation';
import Badge from '../../../shared/components/ui/Badge';
import { PageErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';

export function ChangePasswordPage() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const toast = useToast();
  const handleError = useStandardErrorHandler();
  
  // Use new centralized change password hook with React Query
  const changePasswordMutation = useChangePassword();
  const loading = changePasswordMutation.isPending;

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'fair' | 'good' | 'strong' | 'very_strong'>('weak');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'newPassword' && value) {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength.strength);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Password confirmation check
    if (formData.newPassword !== formData.confirmPassword) {
      // Use standard error handler for validation errors
      handleError(new Error(t('changePassword.validation.passwordsNotMatch')), {
        context: { operation: 'changePassword', validation: 'passwordMismatch' },
        customMessage: t('changePassword.validation.passwordsNotMatch'),
      });
      return;
    }

    // Check new password is different from current
    if (formData.currentPassword === formData.newPassword) {
      // Use standard error handler for validation errors
      handleError(new Error(t('changePassword.validation.passwordSameAsCurrent')), {
        context: { operation: 'changePassword', validation: 'samePassword' },
        customMessage: t('changePassword.validation.passwordSameAsCurrent'),
      });
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword,
      });

      toast.success(t('changePassword.success'));
      navigate(ROUTE_PATHS.PROFILE);
    } catch (error) {
      handleError(error, { context: { operation: 'changePassword' } });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2" data-testid="change-password-heading">{t('changePassword.title')}</h1>
          <p className="text-gray-600">{t('changePassword.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl shadow-xl border border-white/20 space-y-6 animate-scale-in" data-testid="change-password-form">
          <Input
            type="password"
            name="currentPassword"
            label={t('changePassword.currentPassword')}
            placeholder={t('changePassword.currentPasswordPlaceholder')}
            value={formData.currentPassword}
            onChange={handleChange}
            required
            disabled={loading}
            data-testid="current-password-input"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />

          <div>
            <Input
              type="password"
              name="newPassword"
              label={t('changePassword.newPassword')}
              placeholder={t('changePassword.newPasswordPlaceholder')}
              value={formData.newPassword}
              onChange={handleChange}
              required
              disabled={loading}
              data-testid="new-password-input"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              }
            />
            {formData.newPassword && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-600">{t('changePassword.passwordStrength')}</span>
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
            label={t('changePassword.confirmPassword')}
            placeholder={t('changePassword.confirmPasswordPlaceholder')}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
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
            disabled={loading}
            className="w-full"
            data-testid="change-submit-button"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('changePassword.submitting')}
              </>
            ) : (
              t('changePassword.submitButton')
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function ChangePasswordPageWithErrorBoundary() {
  return (
    <PageErrorBoundary>
      <ChangePasswordPage />
    </PageErrorBoundary>
  );
}

export default ChangePasswordPageWithErrorBoundary;
