import React, { useCallback, useState, useTransition, startTransition } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useErrorHandler } from '@hooks/errors/useErrorHandler';

interface LoginFormState { email: string;
  password: string; }

const LoginPage: React.FC = () => { const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startLoginTransition] = useTransition();

  const navigate = useNavigate();
  const { login } = useAuth();
  const { error, errorMessage, handleError, clearError } = useErrorHandler();

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => { const { name, value } = event.target;
    setFormState((previous) => ({ ...previous,
      [name]: value
    }));

    if (error) { clearError();
    }
  }, [clearError, error]);

  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => { event.preventDefault();
    clearError();

    startLoginTransition(async () => {
      try {
        await login({
          email: formState.email,
          password: formState.password
        });
        navigate('/dashboard');
      } catch (submissionError: unknown) { handleError(submissionError, 'LoginPage');
      }
    });
  }, [clearError, formState.email, formState.password, handleError, login, navigate]);

  const togglePasswordVisibility = useCallback(() => { startTransition(() => {
      setShowPassword((previous) => !previous);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden />
            Back to Home
          </Link>
        </div>

        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-white" aria-hidden />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome Back
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        <div className="mt-8">
          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
            {errorMessage && (
              <div
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" aria-hidden />
                <div>
                  <p className="text-sm font-medium text-red-800">Authentication error</p>
                  <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                  {error?.code && (
                    <p className="text-xs text-red-600 mt-2">Code: {error.code}</p>
                  )}
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" aria-hidden />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formState.email}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" aria-hidden />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formState.password}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" aria-hidden />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" aria-hidden />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isPending ? (
                    <span className="flex items-center">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" aria-hidden />
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
              >
                Create a new account
              </Link>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-sm font-medium text-blue-800 mb-2">Demo Credentials</h2>
            <dl className="text-xs text-blue-700 space-y-1">
              <div className="flex justify-between">
                <dt className="font-semibold">Admin</dt>
                <dd>admin@example.com / admin123</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold">User</dt>
                <dd>user@example.com / user123</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
