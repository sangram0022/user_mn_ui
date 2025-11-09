import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTE_PATHS } from '../../../core/routing/routes';
import { getPostLoginRedirect } from '../../../core/routing/config';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { Button, Input, ErrorAlert } from '../../../components';
import { useLogin } from '../hooks/useAuth.hooks';
import { useLoginForm } from '../../../core/validation';
import { ModernErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';
import tokenService from '../services/tokenService';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
import { logger } from '@/core/logging';

export default function LoginPage() {
  const { t } = useTranslation(['auth', 'common', 'errors']);
  const navigate = useNavigate();
  const { login: setAuthState } = useAuth();
  const toast = useToast();
  const handleError = useStandardErrorHandler();
  
  // Use new centralized login hook with React Query
  const loginMutation = useLogin();

  // React Hook Form integration
  const form = useLoginForm({
    onSuccess: async (data) => {
      try {
        const result = await loginMutation.mutateAsync({
          email: data.email,
          password: data.password,
        });
        
        // Debug: Log the actual response structure
        if (import.meta.env.DEV) {
          logger().info('🔍 Login response received', {
            hasResult: !!result,
            resultKeys: result ? Object.keys(result) : [],
            hasAccessToken: !!result?.access_token,
            hasData: 'data' in (result || {}),
            accessToken: result?.access_token,
            refreshToken: result?.refresh_token,
          });
        }
        
        if (result) {
          // Build user object from login response
          const user = {
            user_id: result.user_id,
            email: result.email,
            first_name: '', // Backend doesn't return these in login
            last_name: '',
            roles: result.roles,
            is_active: true,
            is_verified: true,
            last_login: result.last_login_at,
          };

          // Update auth context with tokens and user
          setAuthState(
            {
              access_token: result.access_token,
              refresh_token: result.refresh_token,
              token_type: result.token_type,
              expires_in: result.expires_in,
            },
            user,
            data.rememberMe  // Pass rememberMe to auth context
          );
          
          // Handle remember me email storage
          if (data.rememberMe) {
            tokenService.setRememberMeEmail(data.email);
          } else {
            tokenService.clearRememberMe();
          }
          
          // Success message
          toast.success(t('login.success'));
          
          // Navigate based on role
          const userRole = result.roles[0];
          const redirectPath = getPostLoginRedirect(userRole);
          navigate(redirectPath, { replace: true });
        }
      } catch (error) {
        handleError(error, { context: { operation: 'login' } });
      }
    },
    onError: (error) => {
      handleError(error, { context: { operation: 'login-form' } });
    }
  });

  // Load remembered email on mount
  useEffect(() => {
    const rememberMeEmail = tokenService.getRememberMeEmail();
    const isRememberMeEnabled = tokenService.isRememberMeEnabled();
    
    if (rememberMeEmail) {
      form.reset({
        email: rememberMeEmail,
        password: '',
        rememberMe: isRememberMeEnabled,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  return (
    <ModernErrorBoundary 
      level="page"
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Login Page</h1>
            <p className="text-gray-600 mb-6">We're experiencing technical difficulties. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
    >
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-linear-to-br from-blue-50 to-purple-50 animate-fade-in">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 animate-slide-down">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">{t('auth:WELCOME_BACK', 'Welcome Back')}</h1>
            <p className="text-gray-600">{t('auth:SIGN_IN_TO_CONTINUE', 'Sign in to your account to continue')}</p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-6 animate-scale-in">
            <ModernErrorBoundary 
              level="component"
              fallback={
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <p className="text-red-800 font-medium">Login form error</p>
                  <p className="text-red-600 text-sm mt-1">Please refresh the page to try again.</p>
                </div>
              }
            >
              {/* Login form with React Hook Form */}
              <form onSubmit={form.handleSubmit} className="space-y-6">
                {/* Show API errors */}
                {loginMutation.isError && (
                  <ErrorAlert
                    message={loginMutation.error?.message || t('errors:LOGIN_FAILED')}
                    className="mb-4"
                    onDismiss={() => loginMutation.reset()}
                  />
                )}

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
                    disabled={form.formState.isSubmitting || loginMutation.isPending}
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                {/* Password field */}
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
                    disabled={form.formState.isSubmitting || loginMutation.isPending}
                    autoComplete="current-password"
                  />
                </div>

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      {...form.register('rememberMe')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={form.formState.isSubmitting || loginMutation.isPending}
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-600">
                      {t('auth:REMEMBER_ME')}
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link
                      to={ROUTE_PATHS.FORGOT_PASSWORD}
                      className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      {t('auth:FORGOT_PASSWORD')}
                    </Link>
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={form.isDisabled || loginMutation.isPending}
                  loading={form.formState.isSubmitting || loginMutation.isPending}
                  aria-label={t('auth:SIGN_IN_BUTTON_ARIA')}
                >
                  {form.formState.isSubmitting || loginMutation.isPending ? t('common:SIGNING_IN') : t('auth:SIGN_IN')}
                </Button>

                {/* Register link */}
                <div className="text-center">
                  <span className="text-sm text-text-secondary">
                    {t('auth:NO_ACCOUNT')}{' '}
                    <Link
                      to={ROUTE_PATHS.REGISTER}
                      className="font-medium text-brand-primary hover:text-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 rounded transition-colors"
                    >
                      {t('auth:CREATE_ACCOUNT')}
                    </Link>
                  </span>
                </div>
              </form>

              {/* Debug info in development */}
              {import.meta.env.DEV && (
                <div className="mt-6 p-4 bg-gray-100 rounded text-xs">
                  <div className="font-semibold mb-2">Form State Debug</div>
                  <div>Valid: {form.formState.isValid.toString()}</div>
                  <div>Dirty: {form.formState.isDirty.toString()}</div>
                  <div>Submitting: {form.formState.isSubmitting.toString()}</div>
                  <div>Errors: {Object.keys(form.formState.errors).length}</div>
                  <div>Touched: {Object.keys(form.formState.touchedFields).length}</div>
                </div>
              )}
            </ModernErrorBoundary>
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
    </ModernErrorBoundary>
  );
}