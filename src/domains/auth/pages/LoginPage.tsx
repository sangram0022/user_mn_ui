import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTE_PATHS } from '../../../core/routing/routes';
import { getPostLoginRedirect } from '../../../core/routing/config';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { Button, Input, ErrorAlert } from '../../../components';
import { useLogin } from '../hooks/useAuth.hooks';
import tokenService from '../services/tokenService';

export function LoginPage() {
  const { t } = useTranslation(['auth', 'common', 'errors']);
  const navigate = useNavigate();
  const { login: setAuthState } = useAuth();
  const toast = useToast();
  
  // Use new centralized login hook with React Query
  const loginMutation = useLogin();
  const loading = loginMutation.isPending;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');

  // Load remembered email on mount
  useEffect(() => {
    const rememberMeEmail = tokenService.getRememberMeEmail();
    const isRememberMeEnabled = tokenService.isRememberMeEnabled();
    
    if (rememberMeEmail) {
      setFormData({
        email: rememberMeEmail,
        password: '',
        rememberMe: isRememberMeEnabled,
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');

    try {
      const result = await loginMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
      });
      
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

        // Update auth context with rememberMe flag
        setAuthState(
          {
            access_token: result.access_token,
            refresh_token: result.refresh_token,
            token_type: result.token_type,
            expires_in: result.expires_in,
          },
          user,
          formData.rememberMe  // Pass rememberMe to auth context
        );
        
        // Handle remember me email storage
        if (formData.rememberMe) {
          tokenService.setRememberMeEmail(formData.email);
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
    } catch (error: unknown) {
      // Extract error message and field errors
      let errorMessage = t('errors:AUTH_FAILED');
      const fieldErrs: Record<string, string> = {};
      
      if (error && typeof error === 'object') {
        // Check for APIError with field_errors
        if ('field_errors' in error && error.field_errors) {
          const fieldErrors = error.field_errors as Record<string, string[]>;
          
          // Extract field-specific errors
          Object.entries(fieldErrors).forEach(([field, messages]) => {
            if (field === 'general') {
              // General errors display at the top
              errorMessage = messages[0] || errorMessage;
            } else {
              // Field-specific errors
              fieldErrs[field] = messages[0];
            }
          });
        }
        
        // Fallback to error message
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
        
        // Check for specific error codes to provide better messages
        if ('responseData' in error && error.responseData) {
          const data = error.responseData as { message_code?: string; message?: string };
          if (data.message_code === 'SYSTEM_ERROR') {
            errorMessage = t('errors:SYSTEM_TEMPORARILY_UNAVAILABLE', {
              defaultValue: 'System temporarily unavailable. Please try again in a few moments.',
            });
          } else if (data.message_code === 'INVALID_CREDENTIALS') {
            errorMessage = t('errors:INVALID_CREDENTIALS', {
              defaultValue: 'Invalid email or password. Please check your credentials and try again.',
            });
          } else if (data.message_code === 'ACCOUNT_LOCKED') {
            errorMessage = t('errors:ACCOUNT_LOCKED', {
              defaultValue: 'Your account has been locked. Please contact support for assistance.',
            });
          } else if (data.message) {
            errorMessage = data.message;
          }
        }
      }
      
      // Set errors in state
      setGeneralError(errorMessage);
      setFieldErrors(fieldErrs);
      
      // Show toast notification
      toast.error(errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2" data-testid="login-heading">{t('login.title')}</h1>
          <p className="text-gray-600">{t('login.subtitle')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl shadow-xl border border-white/20 space-y-6 animate-scale-in" data-testid="login-form">
          {/* General Error Display */}
          {generalError && (
            <ErrorAlert
              message={generalError}
              title="Login Failed"
              variant="danger"
              onDismiss={() => setGeneralError('')}
              testId="login-error"
            />
          )}

          {/* Email Input */}
          <Input
            type="email"
            name="email"
            label={t('login.email')}
            placeholder={t('login.emailPlaceholder')}
            value={formData.email}
            onChange={handleChange}
            error={fieldErrors.email}
            required
            autoComplete="email"
            disabled={loading}
            data-testid="email-input"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
          />

          {/* Password Input */}
          <Input
            type="password"
            name="password"
            label={t('login.password')}
            placeholder={t('login.passwordPlaceholder')}
            value={formData.password}
            onChange={handleChange}
            error={fieldErrors.password}
            required
            autoComplete="current-password"
            disabled={loading}
            data-testid="password-input"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                data-testid="remember-me-checkbox"
              />
              <span className="text-sm text-gray-700">{t('login.rememberMe')}</span>
            </label>
            <Link to={ROUTE_PATHS.FORGOT_PASSWORD} className="text-sm text-brand-primary hover:opacity-80 font-medium transition-opacity" data-testid="forgot-password-link">
              {t('login.forgotPasswordLink')}
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading}
            data-testid="login-submit-button"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('login.signingIn')}
              </span>
            ) : (
              t('login.signIn')
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">{t('login.orContinueWith')}</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" size="md" data-testid="google-login-button">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('login.google')}
            </Button>
            <Button type="button" variant="outline" size="md" data-testid="github-login-button">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.840 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              {t('login.github')}
            </Button>
          </div>
        </form>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-gray-600 animate-slide-up">
          {t('login.noAccount')}{' '}
          <Link to={ROUTE_PATHS.REGISTER} className="text-brand-primary hover:opacity-80 font-semibold transition-opacity" data-testid="register-link">
            {t('login.signUpLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
