/**
 * Modern Login Page - React Hook Form Implementation
 * Demonstrates performance and developer experience improvements
 * with React Hook Form + Zod validation
 */

import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ROUTE_PATHS } from '../../../core/routing/routes';
import { getPostLoginRedirect } from '../../../core/routing/config';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
import { Button, Input, ErrorAlert } from '../../../components';
import { useLogin } from '../hooks/useAuth.hooks';
import tokenService from '../services/tokenService';
import { loginSchema, type LoginFormData } from '../../../core/validation/schemas';
import { PageErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';
import { isDevelopment } from '@/core/config';

export function ModernLoginPage() {
  const { t } = useTranslation(['auth', 'common', 'errors']);
  const navigate = useNavigate();
  const { login: setAuthState } = useAuth();
  const toast = useToast();
  const handleError = useStandardErrorHandler();
  
  // Use centralized login hook with React Query
  const loginMutation = useLogin();

  // React Hook Form setup with Zod validation
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    mode: 'onChange', // Real-time validation
  });

  // Watch form values for conditional logic
  const watchedValues = watch();

  // Load remembered email on mount
  useEffect(() => {
    const rememberMeEmail = tokenService.getRememberMeEmail();
    const isRememberMeEnabled = tokenService.isRememberMeEnabled();
    
    if (rememberMeEmail) {
      setValue('email', rememberMeEmail);
      setValue('rememberMe', isRememberMeEnabled);
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });
      
      if (result) {
        // Build user object from login response
        // Ensure roles is always an array
        const rolesArray = Array.isArray(result.roles) ? result.roles : (result.roles ? [result.roles] : []);
        const user = {
          user_id: result.user_id,
          email: result.email,
          first_name: '', // Backend doesn't return these in login
          last_name: '',
          roles: rolesArray,
          is_active: true,
          is_verified: true,
          is_approved: true,
        };

        // Set auth state with tokens
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

        // Handle remember me
        if (data.rememberMe) {
          tokenService.setRememberMeEmail(data.email);
        } else {
          tokenService.clearRememberMe();
        }

        toast.success(t('auth:LOGIN_SUCCESS'));

        // Navigate to intended destination
        const userRole = (Array.isArray(user.roles) && user.roles.length > 0) ? user.roles[0] : undefined;
        const redirectTo = getPostLoginRedirect(userRole);
        navigate(redirectTo, { replace: true });
      }
    } catch (error) {
      handleError(error, { context: { operation: 'login' } });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth:SIGN_IN_TO_ACCOUNT')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth:OR')}{' '}
            <Link
              to={ROUTE_PATHS.REGISTER}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {t('auth:CREATE_NEW_ACCOUNT')}
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder={t('auth:EMAIL_ADDRESS')}
                className={`relative block w-full rounded-t-md ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                error={errors.email?.message}
                data-testid="login-email-input"
              />
            </div>
            <div>
              <Input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                placeholder={t('auth:PASSWORD')}
                className={`relative block w-full rounded-b-md ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                error={errors.password?.message}
                data-testid="login-password-input"
              />
            </div>
          </div>

          {/* Display server-side errors */}
          {loginMutation.isError && (
            <ErrorAlert 
              message={loginMutation.error?.message || t('errors:LOGIN_FAILED')}
              data-testid="login-error-alert"
            />
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                {...register('rememberMe')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                data-testid="login-remember-checkbox"
              />
              <label className="ml-2 block text-sm text-gray-900">
                {t('auth:REMEMBER_ME')}
              </label>
            </div>

            <div className="text-sm">
              <Link
                to={ROUTE_PATHS.FORGOT_PASSWORD}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                {t('auth:FORGOT_PASSWORD')}
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isSubmitting || loginMutation.isPending || !isValid}
              loading={isSubmitting || loginMutation.isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              data-testid="login-submit-button"
            >
              {isSubmitting || loginMutation.isPending ? t('common:SIGNING_IN') : t('auth:SIGN_IN')}
            </Button>
          </div>

          {/* Form Debug Info (Development Only) */}
          {isDevelopment() && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
              <div>Form State: isDirty={isDirty.toString()}, isValid={isValid.toString()}</div>
              <div>Errors: {JSON.stringify(errors, null, 2)}</div>
              <div>Values: {JSON.stringify(watchedValues, null, 2)}</div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function ModernLoginPageWithErrorBoundary() {
  return (
    <PageErrorBoundary>
      <ModernLoginPage />
    </PageErrorBoundary>
  );
}