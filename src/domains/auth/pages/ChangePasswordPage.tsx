import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useChangePassword } from '../hooks/useChangePassword';
import { useToast } from '../../../hooks/useToast';
import { Button, Input } from '../../../components';
import { ROUTE_PATHS } from '../../../core/routing/routes';
import { ValidationBuilder, calculatePasswordStrength } from '../../../core/validation';
import { parseAuthError } from '../utils/authErrorMapping';
import Badge from '../../../shared/components/ui/Badge';

export default function ChangePasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { mutate: changePassword, isPending } = useChangePassword();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'fair' | 'good' | 'strong' | 'very_strong'>('weak');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Update password strength for new password
    if (name === 'newPassword' && value) {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength.strength);
    }
  };

  // Helper function for password strength badge color
  const getPasswordStrengthColor = (): 'success' | 'warning' | 'danger' => {
    switch (passwordStrength) {
      case 'very_strong':
      case 'strong':
        return 'success';
      case 'good':
      case 'fair':
        return 'warning';
      case 'weak':
      default:
        return 'danger';
    }
  };

  // Helper function for password strength badge label
  const getPasswordStrengthLabel = () => {
    return passwordStrength.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation using core validation system
    const validation = new ValidationBuilder()
      .validateField('current_password', formData.currentPassword, (b) => b.required())
      .validateField('new_password', formData.newPassword, (b) => b.required().password())
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
      toast.error(t('changePassword.validation.validationFailed'));
      return;
    }

    // Password confirmation check
    if (formData.newPassword !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: t('changePassword.validation.passwordsNotMatch') });
      toast.error(t('changePassword.validation.passwordsNotMatch'));
      return;
    }

    // Check new password is different from current
    if (formData.currentPassword === formData.newPassword) {
      setFieldErrors({ newPassword: t('changePassword.validation.passwordSameAsCurrent') });
      toast.error(t('changePassword.validation.passwordSameAsCurrent'));
      return;
    }

    // Check password strength
    const strength = calculatePasswordStrength(formData.newPassword);
    if (strength.score < 40) {
      setFieldErrors({ newPassword: t('changePassword.validation.passwordTooWeak') });
      toast.error(t('changePassword.validation.passwordTooWeak'));
      return;
    }

    // Clear errors
    setFieldErrors({});

    changePassword(
      {
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
      },
      {
        onSuccess: () => {
          toast.success(t('changePassword.success'));
          setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
          setTimeout(() => {
            navigate(ROUTE_PATHS.PROFILE);
          }, 2000);
        },
        onError: (error: Error) => {
          const errorMapping = parseAuthError(error);
          toast.error(errorMapping.message || t('changePassword.error'));
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-surface-secondary py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {t('changePassword.title')}
          </h1>
          <p className="text-text-tertiary">
            {t('changePassword.subtitle')}
          </p>
        </div>

        <div className="card-base p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="form-label">
                {t('changePassword.form.currentPassword.label')}
              </label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  placeholder={t('changePassword.form.currentPassword.placeholder')}
                  className="pl-10 pr-10"
                  error={fieldErrors.current_password}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="border-t border-border-base pt-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="newPassword" className="form-label">
                    {t('changePassword.form.newPassword.label')}
                  </label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      placeholder={t('changePassword.form.newPassword.placeholder')}
                      className="pl-10 pr-10"
                      error={fieldErrors.new_password}
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.newPassword && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-text-tertiary">
                        Password Strength:
                      </span>
                      <Badge variant={getPasswordStrengthColor()}>
                        {getPasswordStrengthLabel()}
                      </Badge>
                    </div>
                  )}
                  
                  <p className="form-hint">{t('changePassword.form.newPassword.hint')}</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="form-label">
                    {t('changePassword.form.confirmPassword.label')}
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      placeholder={t('changePassword.form.confirmPassword.placeholder')}
                      className="pl-10 pr-10"
                      error={fieldErrors.confirmPassword}
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-border-base">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(ROUTE_PATHS.PROFILE)}
              >
                {t('changePassword.form.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={
                  isPending ||
                  !formData.currentPassword ||
                  !formData.newPassword ||
                  !formData.confirmPassword
                }
              >
                {isPending ? t('changePassword.form.submitting') : t('changePassword.form.submit')}
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-text-tertiary">
            {t('changePassword.securityNote')}
          </p>
        </div>
      </div>
    </div>
  );
}
