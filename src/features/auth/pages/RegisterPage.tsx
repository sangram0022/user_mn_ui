import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Eye, EyeOff, Info, LogIn, Lock, Mail, ShieldCheck, User } from 'lucide-react';

import { apiClient } from '@services/apiClient';
import ErrorAlert from '@shared/ui/ErrorAlert';
import { useErrorHandler } from '@hooks/errors/useErrorHandler';
import { buildRegistrationFeedback } from '@utils/registrationFeedback';
import type { FeedbackIcon, RegistrationFeedback } from '@utils/registrationFeedback';

const FEEDBACK_ICON_MAP: Record<FeedbackIcon, React.ComponentType<{ className?: string }>> = {
  mail: Mail,
  shield: ShieldCheck,
  clock: Clock,
  login: LogIn,
  info: Info
};

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    terms_accepted: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();
  const [success, setSuccess] = useState(false);
  const [registrationFeedback, setRegistrationFeedback] = useState<RegistrationFeedback | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [hasNavigated, setHasNavigated] = useState(false);

  const navigate = useNavigate();

  const handleProceedToLogin = useCallback(() => {
    setHasNavigated(prev => {
      if (!prev) {
        setRedirectCountdown(null);
        navigate('/login', {
          state: { message: 'Registration successful! Please log in with your credentials.' }
        });
      }
      return true;
    });
  }, [navigate]);

  useEffect(() => {
    if (!success || !registrationFeedback) {
      return;
    }

    if (registrationFeedback.redirectSeconds === null) {
      setRedirectCountdown(null);
      return;
    }

    setRedirectCountdown(registrationFeedback.redirectSeconds);
  }, [success, registrationFeedback]);

  useEffect(() => {
    if (!success || hasNavigated) {
      return;
    }

    if (redirectCountdown === null) {
      return;
    }

    if (redirectCountdown <= 0) {
      handleProceedToLogin();
      return;
    }

    const timer = window.setTimeout(() => {
      setRedirectCountdown(prev => (prev === null ? null : prev - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [success, redirectCountdown, hasNavigated, handleProceedToLogin]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      handleError(new Error('Please fill in all required fields.'));
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      handleError(new Error('Passwords do not match. Please make sure both password fields are identical.'));
      return false;
    }

    if (formData.password.length < 6) {
      handleError(new Error('Password must be at least 6 characters long. Please choose a stronger password.'));
      return false;
    }

    if (!formData.terms_accepted) {
      handleError(new Error('Please accept the terms and conditions to continue.'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    clearError();
    setSuccess(false);
    setRegistrationFeedback(null);
    setRedirectCountdown(null);
    setHasNavigated(false);

    try {
      const response = await apiClient.register({
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword || formData.password,
        username: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName
      });

      const feedback = buildRegistrationFeedback(response);
      setRegistrationFeedback(feedback);
      setSuccess(true);
      return;
    } catch (err: unknown) {
      handleError(err);
      setSuccess(false);
      setRegistrationFeedback(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (success && registrationFeedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
          <div className="bg-white shadow-xl sm:rounded-2xl border border-gray-100 p-8 sm:p-10">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                {registrationFeedback.title}
              </h2>
              <p className="mt-2 text-gray-600">{registrationFeedback.subtitle}</p>
              <p className="mt-4 text-base text-gray-700">
                {registrationFeedback.message}
              </p>
              <p className="mt-3 text-sm text-gray-500">
                Account email:{' '}
                <span className="font-medium text-gray-900">{registrationFeedback.email}</span>
              </p>
              {redirectCountdown !== null && (
                <p className="mt-2 text-sm text-blue-600">
                  We'll take you to the login screen in {redirectCountdown} second{redirectCountdown === 1 ? '' : 's'}.
                </p>
              )}
            </div>

            <section className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-6">
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Account snapshot</h3>
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {registrationFeedback.highlights.map(highlight => (
                  <div key={highlight.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{highlight.label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900 break-words">{highlight.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="mt-8">
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Next steps</h3>
              <div className="mt-4 space-y-4">
                {registrationFeedback.nextSteps.map(step => {
                  const IconComponent = FEEDBACK_ICON_MAP[step.icon] ?? Info;
                  return (
                    <div key={step.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">{step.title}</h4>
                        <p className="mt-1 text-sm text-slate-600 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleProceedToLogin}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <LogIn className="h-4 w-4" />
                {redirectCountdown !== null ? `Go to login (${redirectCountdown}s)` : 'Go to login'}
              </button>
              {redirectCountdown !== null && (
                <button
                  type="button"
                  onClick={() => setRedirectCountdown(null)}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Stay on this page
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Registration Successful!
          </h2>
          <p className="mt-4 text-gray-600">
            Your account has been created successfully. You can now head to the login page.
          </p>
          <button
            type="button"
            onClick={handleProceedToLogin}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <LogIn className="h-4 w-4" />
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back to Home Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Get started with our user management platform
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          {/* Error Alert */}
          {error && (
            <div className="mb-6">
              <ErrorAlert error={error} />
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* First Name Field */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your first name"
                />
              </div>
            </div>

            {/* Last Name Field */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters long</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                id="terms_accepted"
                name="terms_accepted"
                type="checkbox"
                required
                checked={formData.terms_accepted}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="terms_accepted" className="ml-3 text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
