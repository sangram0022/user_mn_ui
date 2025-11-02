import { useActionState, useOptimistic, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTE_PATHS } from '../../../core/routing/routes';
import { getPostLoginRedirect } from '../../../core/routing/config';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { useErrorMessage } from '../../../core/localization/hooks/useErrorMessage';
import { Button, Input } from '../../../components';
import { useLogin } from '../hooks/useLogin';
import { ValidationBuilder } from '../../../core/validation';
import { parseAuthError, getErrorActions, type ErrorAction } from '../utils/authErrorMapping';
import { debounce } from '../../../shared/utils/debounce';

// React 19: Server Action type
type LoginState = {
  error?: string;
  success?: boolean;
};

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login: setAuthState } = useAuth();
  const toast = useToast();
  const { parseError } = useErrorMessage();
  
  // Use proper login mutation hook
  const loginMutation = useLogin({
    onSuccess: (data) => {
      // Update auth context with user data
      setAuthState(
        {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          token_type: data.token_type,
          expires_in: data.expires_in,
        },
        data.user
      );
      
      // Success message
      toast.success(t('auth.login.success'));
      
      // Navigate to appropriate page based on user role
      const userRole = data.user.roles[0]; // Get first role (super_admin, admin, user, etc.)
      const redirectPath = getPostLoginRedirect(userRole);
      navigate(redirectPath, { replace: true });
    },
    onError: (error) => {
      // Parse error using error mapping for better messages
      const errorMapping = parseAuthError(error);
      const actions = getErrorActions(error);
      
      setErrorActions(actions);
      toast.error(errorMapping.message);
    },
  });

  // React 19: useOptimistic for instant UI feedback
  const [optimisticLoading, setOptimisticLoading] = useOptimistic(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // Field-level errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // Error actions for contextual help
  const [errorActions, setErrorActions] = useState<ErrorAction[]>([]);

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
            return b.password();
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

  // Load remembered email on mount
  useEffect(() => {
    const rememberMeEmail = localStorage.getItem('remember_me_email');
    const isRememberMeEnabled = localStorage.getItem('remember_me') === 'true';
    
    if (rememberMeEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberMeEmail,
        rememberMe: isRememberMeEnabled,
      }));
    }
  }, []);

  // React 19: useActionState for form handling
  async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const rememberMe = formData.get('rememberMe') === 'on';

    // Client-side validation using core validation system
    const validation = new ValidationBuilder()
      .validateField('email', email, (b) => b.required().email())
      .validateField('password', password, (b) => b.required().password())
      .result();

    if (!validation.isValid) {
      // Set field-level errors
      const errors: Record<string, string> = {};
      
      if (validation.fields) {
        Object.entries(validation.fields).forEach(([fieldName, fieldResult]) => {
          if (!fieldResult.isValid && fieldResult.errors.length > 0) {
            errors[fieldName] = fieldResult.errors[0];
          }
        });
      }
      
      setFieldErrors(errors);
      return { error: validation.errors[0] || t('errors.validationFailed') };
    }

    // Clear field errors on successful validation
    setFieldErrors({});

    try {
      setOptimisticLoading(true);
      await loginMutation.mutateAsync({ email, password });
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('remember_me_email', email);
        localStorage.setItem('remember_me', 'true');
      } else {
        localStorage.removeItem('remember_me_email');
        localStorage.setItem('remember_me', 'false');
      }
      
      return { success: true };
    } catch (error) {
      // Error is already handled by onError callback
      const errorMessage = parseError(error);
      return { error: errorMessage };
    } finally {
      setOptimisticLoading(false);
    }
  }

  const [state, formAction, isPending] = useActionState(loginAction, {});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Trigger debounced field validation for real-time feedback (performance optimized - reduces calls 10x)
    if (type !== 'checkbox' && (name === 'email' || name === 'password')) {
      validateFieldDebounced(name, value);
    }
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
          <h1 className="text-3xl font-bold mb-2">{t('auth.login.title')}</h1>
          <p className="text-gray-600">{t('auth.login.subtitle')}</p>
        </div>

        {/* Form - React 19: action prop instead of onSubmit */}
        <form action={formAction} className="glass p-8 rounded-2xl shadow-xl border border-white/20 space-y-6 animate-scale-in">
          {state.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
              <p className="text-red-700 text-sm font-medium">{state.error}</p>
              
              {/* Contextual Error Actions */}
              {errorActions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-red-200">
                  {errorActions.map((action, index) => (
                    action.type === 'link' ? (
                      <Link
                        key={index}
                        to={action.action}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          action.variant === 'primary'
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-white text-red-700 border border-red-300 hover:bg-red-50'
                        }`}
                      >
                        {action.label}
                      </Link>
                    ) : action.type === 'external' ? (
                      <a
                        key={index}
                        href={action.action}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white text-red-700 border border-red-300 hover:bg-red-50 transition-colors"
                      >
                        {action.label}
                      </a>
                    ) : null
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Email Input */}
          <Input
            type="email"
            name="email"
            label={t('auth.login.email')}
            placeholder={t('auth.login.emailPlaceholder')}
            value={formData.email}
            onChange={handleChange}
            error={fieldErrors.email}
            required
            autoComplete="email"
            disabled={isPending || optimisticLoading}
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
            label={t('auth.login.password')}
            placeholder={t('auth.login.passwordPlaceholder')}
            value={formData.password}
            onChange={handleChange}
            error={fieldErrors.password}
            required
            autoComplete="current-password"
            disabled={isPending || optimisticLoading}
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
              />
              <span className="text-sm text-gray-700">{t('auth.login.rememberMe')}</span>
            </label>
            <Link to={ROUTE_PATHS.FORGOT_PASSWORD} className="text-sm text-brand-primary hover:opacity-80 font-medium transition-opacity">
              {t('auth.login.forgotPasswordLink')}
            </Link>
          </div>

          {/* Submit Button - React 19: Shows pending state automatically */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isPending || optimisticLoading || loginMutation.isPending}
          >
            {isPending || optimisticLoading || loginMutation.isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('auth.login.signingIn')}
              </span>
            ) : (
              t('auth.login.signIn')
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">{t('auth.login.orContinueWith')}</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" size="md">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('auth.login.google')}
            </Button>
            <Button type="button" variant="outline" size="md">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.840 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              {t('auth.login.github')}
            </Button>
          </div>
        </form>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-gray-600 animate-slide-up">
          {t('auth.login.noAccount')}{' '}
          <Link to={ROUTE_PATHS.REGISTER} className="text-brand-primary hover:opacity-80 font-semibold transition-opacity">
            {t('auth.login.signUpLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
