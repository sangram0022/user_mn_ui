import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useResetPassword } from '../hooks/useResetPassword';
import { useToast } from '../../../hooks/useToast';
import { ValidationBuilder, calculatePasswordStrength } from '../../../core/validation';
import { parseAuthError } from '../utils/authErrorMapping';
import Badge from '../../../shared/components/ui/Badge';
import { Button, Input } from '../../../components';
import { ROUTE_PATHS } from '../../../core/routing/routes';

export default function ResetPasswordPage() {
  const { t } = useTranslation(['auth', 'common', 'errors', 'validation']);
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const toast = useToast();
  const { mutate: resetPassword, isPending } = useResetPassword();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'fair' | 'good' | 'strong' | 'very_strong'>('weak');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Update password strength for new password
    if (name === 'password' && value) {
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

    if (!token) {
      toast.error(t('errors:RESET_TOKEN_INVALID'));
      return;
    }

    // Client-side validation using core validation system
    const validation = new ValidationBuilder()
      .validateField('password', formData.password, (b) => b.required().password())
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
      toast.error(t('validation:validationFailed'));
      return;
    }

    // Password confirmation check
    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: t('errors:PASSWORD_MISMATCH') });
      toast.error(t('errors:PASSWORD_MISMATCH'));
      return;
    }

    // Check password strength
    const strength = calculatePasswordStrength(formData.password);
    if (strength.score < 40) {
      setFieldErrors({ password: t('validation:password.tooWeak') });
      toast.error(t('validation:password.tooWeak'));
      return;
    }

    // Clear errors
    setFieldErrors({});

    resetPassword(
      {
        token,
        new_password: formData.password,
      },
      {
        onSuccess: () => {
              setIsSuccess(true);
              toast.success(t('resetPassword.successMessage'));
          setTimeout(() => {
            navigate(ROUTE_PATHS.LOGIN, {
                  state: { message: t('resetPassword.successMessage') },
            });
          }, 3000);
        },
        onError: (error: Error) => {
          const errorMapping = parseAuthError(error);
          toast.error(errorMapping.message || t('resetPassword.error'));
        },
      }
    );
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {t('resetPassword.successMessage')}
          </h1>
          <p className="text-text-tertiary mb-6">
            {t('common:status.redirecting')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            {t('resetPassword.title')}
          </h1>
          <p className="text-text-tertiary">
            {t('resetPassword.subtitle')}
          </p>
        </div>

        <div className="card-base p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="form-label">
                {t('resetPassword.passwordLabel')}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  placeholder={t('resetPassword.passwordPlaceholder')}
                  className="pl-10 pr-10"
                  error={fieldErrors.password}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-text-tertiary">
                    Password Strength:
                  </span>
                  <Badge variant={getPasswordStrengthColor()}>
                    {getPasswordStrengthLabel()}
                  </Badge>
                </div>
              )}
              
              <p className="form-hint">{t('validation:password.minLength')}</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                {t('resetPassword.confirmPasswordLabel')}
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
                  placeholder={t('resetPassword.confirmPasswordPlaceholder')}
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

            <Button
              type="submit"
              disabled={isPending || !formData.password || !formData.confirmPassword}
              className="w-full"
            >
              {isPending ? t('resetPassword.submitting') : t('resetPassword.submitButton')}
            </Button>
          </form>

          <div className="mt-6 flex justify-between text-sm">
            <Link
              to={ROUTE_PATHS.LOGIN}
              className="text-primary hover:text-primary-dark font-medium"
            >
              {t('resetPassword.backToLogin')}
            </Link>
            <Link
              to={ROUTE_PATHS.FORGOT_PASSWORD}
              className="text-primary hover:text-primary-dark font-medium"
            >
              {t('common:actions.requestNew')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
