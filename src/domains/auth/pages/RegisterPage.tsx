import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTE_PATHS } from '../../../core/routing/routes';
import { useToast } from '../../../hooks/useToast';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import Badge from '../../../shared/components/ui/Badge';
import { useRegister } from '../hooks/useRegister';
import { ValidationBuilder, calculatePasswordStrength } from '../../../core/validation';
import { parseAuthError } from '../utils/authErrorMapping';
import { debounce } from '../../../shared/utils/debounce';

export default function RegisterPage() {
  const { t } = useTranslation(['auth', 'common', 'errors', 'validation']);
  const navigate = useNavigate();
  const toast = useToast();

  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'fair' | 'good' | 'strong' | 'very_strong'>('weak');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Real-time field validation with debouncing (reduces calls by 10x for better performance)
  const validateFieldDebounced = useCallback(
    debounce((fieldName: string, value: string) => {
      if (!value) {
        setFieldErrors((prev) => ({ ...prev, [fieldName]: '' }));
        return;
      }

      try {
        const validation = new ValidationBuilder()
          .validateField(fieldName, value, (b) => {
            if (fieldName === 'email') return b.email();
            if (fieldName === 'password') return b.password();
            return b.name();
          })
          .result();

        setFieldErrors((prev) => ({
          ...prev,
          [fieldName]: !validation.isValid && validation.errors.length > 0 ? validation.errors[0] : '',
        }));
      } catch {
        // Validation error - silently skip
      }
    }, 300),
    []
  );

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  // Use proper register mutation hook
  const registerMutation = useRegister({
    onSuccess: (data) => {
      toast.success(data.message || t('common.success.saved'));
      navigate(ROUTE_PATHS.LOGIN);
    },
    onError: (error) => {
      // Parse error using error mapping for better messages
      const errorMapping = parseAuthError(error);
      toast.error(errorMapping.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation using core validation system
    const validation = new ValidationBuilder()
      .validateField('first_name', formData.firstName, (b) => b.required().name())
      .validateField('last_name', formData.lastName, (b) => b.required().name())
      .validateField('email', formData.email, (b) => b.required().email())
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
      toast.error(t('errors:validationFailed'));
      return;
    }

    // Clear field errors on successful validation
    setFieldErrors({});

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('errors:PASSWORD_MISMATCH'));
      return;
    }

    if (!formData.terms) {
      toast.error(t('errors:TERMS_NOT_ACCEPTED'));
      return;
    }

    try {
      await registerMutation.mutateAsync({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
    } catch (error) {
      // Error is already handled by onError callback
      console.error('Registration error:', error);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Trigger debounced field validation for real-time feedback (performance optimized - reduces calls 10x)
    if (typeof value === 'string' && ['firstName', 'lastName', 'email', 'password'].includes(field)) {
      validateFieldDebounced(field, value);
    }

    // Password strength check using core validation system
    if (field === 'password' && typeof value === 'string') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength.strength);
      // Note: feedback available in strength.feedback for future UI enhancement
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-purple-600 to-pink-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('register.title')}</h1>
          <p className="text-gray-600">{t('register.subtitle')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl shadow-xl border border-white/20 space-y-5 animate-scale-in">
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              label={t('register.firstNameLabel')}
              placeholder={t('register.firstNamePlaceholder')}
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              error={fieldErrors.first_name}
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
            <Input
              type="text"
              label={t('register.lastNameLabel')}
              placeholder={t('register.lastNamePlaceholder')}
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              error={fieldErrors.last_name}
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
          </div>

          <Input
            type="email"
            label={t('register.emailLabel')}
            placeholder={t('register.emailPlaceholder')}
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={fieldErrors.email}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
          />

          <div>
            <Input
              type="password"
              label={t('register.passwordLabel')}
              placeholder={t('register.passwordPlaceholder')}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={fieldErrors.password}
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />
            {formData.password && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-600">{t('register.passwordStrengthLabel')}</span>
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
            label={t('register.confirmPasswordLabel')}
            placeholder={t('register.confirmPasswordPlaceholder')}
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.terms}
              onChange={(e) => handleChange('terms', e.target.checked)}
              className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">
              {t('register.termsPrefix')}{' '}
              <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                {t('register.termsLink')}
              </a>
              {' '}{t('register.termsAnd')}{' '}
              <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                {t('register.privacyLink')}
              </a>
            </span>
          </label>

          <Button type="submit" variant="secondary" size="lg" disabled={registerMutation.isPending} className="w-full">
            {registerMutation.isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('register.submitting')}
              </>
            ) : (
              t('register.submitButton')
            )}
          </Button>

          {/* Social Registration */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('register.socialDivider')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button type="button" variant="outline" size="md" className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('register.socialGoogle')}
            </Button>
            <Button type="button" variant="outline" size="md" className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              {t('register.socialGitHub')}
            </Button>
          </div>
        </form>

        {/* Sign In Link */}
        <p className="text-center mt-6 text-white/90 animate-slide-up">
          {t('register.haveAccount')}{' '}
          <Link to={ROUTE_PATHS.LOGIN} className="text-yellow-300 hover:text-yellow-200 font-semibold">
            {t('register.signInLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
