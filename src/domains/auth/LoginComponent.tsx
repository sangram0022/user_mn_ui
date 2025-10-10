/**
 * Authentication Feature - Login Component
 * Expert-level React patterns with React 19 features
 */

import { logger } from './../../shared/utils/logger';
import { useTransition, useOptimistic, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEnhancedForm, useEnhancedAuth } from '../../shared/hooks/useAdvancedHooks';
import { LoadingSpinner } from '../../shared/loading/LoadingComponents';
import { Button, Input, Alert } from '../../shared/design';

interface LoginFormData extends Record<string, unknown> { email: string;
  password: string;
  rememberMe: boolean; }

interface LoginComponentProps { redirectTo?: string;
  onSuccess?: () => void; }

export const LoginComponent: React.FC<LoginComponentProps> = ({ redirectTo = '/dashboard',
  onSuccess }) => { const navigate = useNavigate();
  const [isPending, startLoginTransition] = useTransition();
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Optimistic UI state
  const [optimisticState, addOptimisticUpdate] = useOptimistic(
    { isLoggingIn: false, message: '' },
    (state, newMessage: string) => ({ ...state,
      isLoggingIn: true,
      message: newMessage
    })
  );

  const { login } = useEnhancedAuth();

  const { values,
    errors,
    touched,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    isValid
  } = useEnhancedForm<LoginFormData>({ initialValues: {
      email: '',
      password: '',
      rememberMe: false
    },
    validationSchema: (values) => { const errors: Record<keyof LoginFormData, string | undefined> = {
        email: undefined,
        password: undefined,
        rememberMe: undefined
      };
      
      if (!values.email) { errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) { errors.email = 'Please enter a valid email address';
      }
      
      if (!values.password) { errors.password = 'Password is required';
      } else if (values.password.length < 6) { errors.password = 'Password must be at least 6 characters';
      }
      
      return errors;
    },
    onSubmit: async (formValues) => { setError(null);
      
      // Optimistic update
      addOptimisticUpdate('Signing you in...');
      
      startLoginTransition(async () => {
        try {
          await login({
            email: formValues.email,
            password: formValues.password
          });
          
          if (formValues.rememberMe) { localStorage.setItem('rememberLogin', 'true');
          }
          
          onSuccess?.();
          navigate(redirectTo);
        } catch (error) { setLoginAttempts(prev => prev + 1);
          setError(
            error instanceof Error 
              ? error.message 
              : 'Login failed. Please check your credentials and try again.'
          );
        }
      });
    }
  });

  const shouldShowCaptcha = loginAttempts >= 3;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <Alert
              variant="error"
              title="Login Failed"
              onDismiss={() => setError(null)}
              dismissible
            >
              {error}
            </Alert>
          )}
          
          {optimisticState.isLoggingIn && !error && (
            <Alert
              variant="info"
              title="Signing In"
            >
              {optimisticState.message}
            </Alert>
          )}

          <div className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              label="Email address"
              value={values.email}
              onChange={(e) => setFieldValue('email', e.target.value)}
              onBlur={() => setFieldTouched('email')}
              error={touched.email && !!errors.email}
              errorText={touched.email ? errors.email : undefined}
              disabled={isPending}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />

            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              label="Password"
              value={values.password}
              onChange={(e) => setFieldValue('password', e.target.value)}
              onBlur={() => setFieldTouched('password')}
              error={touched.password && !!errors.password}
              errorText={touched.password ? errors.password : undefined}
              disabled={isPending}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={values.rememberMe}
                onChange={(e) => setFieldValue('rememberMe', e.target.checked)}
                disabled={isPending}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          {shouldShowCaptcha && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Multiple failed login attempts detected. Please verify you're human.
              </p>
              {/* In a real app, implement CAPTCHA here */}
              <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-center text-sm">
                [CAPTCHA Component Would Go Here]
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isPending || !isValid}
            aria-describedby="submit-button-description"
          >
            {isPending ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner size="sm" color="white" showText={false} />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign in'
            )}
          </Button>
          
          <div id="submit-button-description" className="sr-only">
            Click to sign in to your account. This will redirect you to the dashboard upon successful authentication.
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="md"
              className="w-full"
              disabled={isPending}
              onClick={() => { // Implement OAuth login
                logger.info('Google OAuth login');
              }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>

            <Button
              variant="outline"
              size="md"
              className="w-full"
              disabled={isPending}
              onClick={() => { // Implement GitHub OAuth login
                logger.info('GitHub OAuth login');
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;