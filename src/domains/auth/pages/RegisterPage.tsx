import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTE_PATHS } from '../../../core/routing/routes';
import { useToast } from '../../../hooks/useToast';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import Badge from '../../../shared/components/ui/Badge';
import { useRegister } from '../hooks/useAuth.hooks';
import { useRegisterForm } from '../../../core/validation';
import { calculatePasswordStrength } from '../../../core/validation';
import { ModernErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';

export default function RegisterPage() {
  const { t } = useTranslation(['auth', 'common', 'errors']);
  const navigate = useNavigate();
  const toast = useToast();
  const handleError = useStandardErrorHandler();

  // Use new centralized register hook with React Query
  const registerMutation = useRegister();

  // Password strength state (for UI feedback)
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'fair' | 'good' | 'strong' | 'very_strong'>('weak');

  // React Hook Form integration
  const form = useRegisterForm({
    onSuccess: async (data) => {
      try {
        const result = await registerMutation.mutateAsync({
          email: data.email,
          username: data.username,
          first_name: data.firstName,
          last_name: data.lastName,
          password: data.password,
        });

        if (result) {
          toast.success(t('auth:REGISTER_SUCCESS'));
          
          // Navigate to login with success message
          navigate(ROUTE_PATHS.LOGIN, {
            replace: true,
            state: { 
              message: t('auth:REGISTRATION_COMPLETE_LOGIN'),
              email: data.email 
            }
          });
        }
      } catch (error) {
        handleError(error, { context: { operation: 'register' } });
      }
    },
    onError: (error) => {
      handleError(error, { context: { operation: 'register' } });
    }
  });

  // Watch password field for strength calculation
  const passwordValue = form.watch('password');
  
  // Calculate password strength when password changes
  React.useEffect(() => {
    if (passwordValue) {
      const strength = calculatePasswordStrength(passwordValue);
      setPasswordStrength(strength.strength);
    } else {
      setPasswordStrength('weak');
    }
  }, [passwordValue]);

  // Get password strength badge variant
  const getStrengthVariant = () => {
    switch (passwordStrength) {
      case 'very_strong': return 'success';
      case 'strong': return 'success';
      case 'good': return 'warning';
      case 'fair': return 'warning';
      case 'weak': return 'danger';
      default: return 'danger';
    }
  };

  return (
    <ModernErrorBoundary 
      level="page"
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Registration Page</h1>
            <p className="text-gray-600 mb-6">We're experiencing technical difficulties. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
    >
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-linear-to-br from-purple-50 to-pink-50 animate-fade-in">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 animate-slide-down">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-purple-600 to-pink-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">{t('auth:CREATE_ACCOUNT', 'Create Account')}</h1>
            <p className="text-gray-600">{t('auth:REGISTER_DESCRIPTION', 'Join thousands of users managing teams efficiently')}</p>
          </div>

          {/* Register Form Card */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 animate-scale-in">
            <ModernErrorBoundary 
              level="component"
              fallback={
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <p className="text-red-800 font-medium">Registration form error</p>
                  <p className="text-red-600 text-sm mt-1">Please refresh the page to try again.</p>
                </div>
              }
            >

          {/* Registration form with React Hook Form */}
          <form onSubmit={form.handleSubmit} className="space-y-6">
            {/* Show API errors */}
            {registerMutation.isError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">
                  {registerMutation.error?.message || t('errors:REGISTER_FAILED')}
                </span>
              </div>
            )}

            {/* Name fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth:FIRST_NAME')}
                </label>
                <Input
                  id="firstName"
                  type="text"
                  {...form.register('firstName')}
                  error={form.formState.errors.firstName?.message}
                  placeholder={t('auth:FIRST_NAME_PLACEHOLDER')}
                  disabled={form.formState.isSubmitting || registerMutation.isPending}
                  autoComplete="given-name"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth:LAST_NAME')}
                </label>
                <Input
                  id="lastName"
                  type="text"
                  {...form.register('lastName')}
                  error={form.formState.errors.lastName?.message}
                  placeholder={t('auth:LAST_NAME_PLACEHOLDER')}
                  disabled={form.formState.isSubmitting || registerMutation.isPending}
                  autoComplete="family-name"
                />
              </div>
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth:EMAIL')}
              </label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                error={form.formState.errors.email?.message}
                placeholder={t('auth:EMAIL_PLACEHOLDER')}
                disabled={form.formState.isSubmitting || registerMutation.isPending}
                autoComplete="email"
              />
            </div>

            {/* Username field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth:USERNAME')}
              </label>
              <Input
                id="username"
                type="text"
                {...form.register('username')}
                error={form.formState.errors.username?.message}
                placeholder={t('auth:USERNAME_PLACEHOLDER')}
                disabled={form.formState.isSubmitting || registerMutation.isPending}
                autoComplete="username"
              />
            </div>

            {/* Password field with strength indicator */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth:PASSWORD')}
              </label>
              <Input
                id="password"
                type="password"
                {...form.register('password')}
                error={form.formState.errors.password?.message}
                placeholder={t('auth:PASSWORD_PLACEHOLDER')}
                disabled={form.formState.isSubmitting || registerMutation.isPending}
                autoComplete="new-password"
              />
              
              {/* Password strength indicator */}
              {passwordValue && (
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{t('auth:PASSWORD_STRENGTH')}:</span>
                  <Badge variant={getStrengthVariant()} size="sm">
                    {t(`auth:PASSWORD_STRENGTH_${passwordStrength.toUpperCase()}`)}
                  </Badge>
                </div>
              )}
            </div>

            {/* Confirm password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth:CONFIRM_PASSWORD')}
              </label>
              <Input
                id="confirmPassword"
                type="password"
                {...form.register('confirmPassword')}
                error={form.formState.errors.confirmPassword?.message}
                placeholder={t('auth:CONFIRM_PASSWORD_PLACEHOLDER')}
                disabled={form.formState.isSubmitting || registerMutation.isPending}
                autoComplete="new-password"
              />
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  {...form.register('terms')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={form.formState.isSubmitting || registerMutation.isPending}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  {t('auth:AGREE_TO')}{' '}
                  <Link
                    to="/terms"
                    className="font-medium text-blue-600 hover:text-blue-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('auth:TERMS_OF_SERVICE')}
                  </Link>
                  {' '}{t('common:AND')}{' '}
                  <Link
                    to="/privacy"
                    className="font-medium text-blue-600 hover:text-blue-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('auth:PRIVACY_POLICY')}
                  </Link>
                </label>
                {form.formState.errors.terms && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.terms.message}</p>
                )}
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={form.isDisabled || registerMutation.isPending}
              loading={form.formState.isSubmitting || registerMutation.isPending}
              aria-label={t('auth:CREATE_ACCOUNT_BUTTON_ARIA')}
            >
              {form.formState.isSubmitting || registerMutation.isPending ? t('common:CREATING_ACCOUNT') : t('auth:CREATE_ACCOUNT')}
            </Button>


            </form>

            {/* Debug info in development */}
            {import.meta.env.DEV && (
              <div className="mt-6 p-4 bg-gray-100 rounded text-xs">
                <div className="font-semibold mb-2">Form State Debug</div>
                <div>Valid: {form.formState.isValid.toString()}</div>
                <div>Dirty: {form.formState.isDirty.toString()}</div>
                <div>Submitting: {form.formState.isSubmitting.toString()}</div>
                <div>Errors: {Object.keys(form.formState.errors).length}</div>
                <div>Password Strength: {passwordStrength}</div>
              </div>
            )}
            </ModernErrorBoundary>
          </div>

          {/* Sign In Link */}
          <p className="text-center mt-6 text-gray-600 animate-slide-up">
            {t('auth:ALREADY_HAVE_ACCOUNT', 'Already have an account?')}{' '}
            <Link to={ROUTE_PATHS.LOGIN} className="text-purple-600 hover:text-purple-500 font-semibold transition-colors">
              {t('auth:SIGN_IN', 'Sign in')}
            </Link>
          </p>
        </div>
      </div>
    </ModernErrorBoundary>
  );
}