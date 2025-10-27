import { Lock, Mail, User } from 'lucide-react';
import type React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useErrorHandler } from '@hooks/errors/useErrorHandler';
import {
  PasswordInput,
  SubmitButton,
  useFormState,
  useLoadingState,
  usePasswordVisibility,
} from '@shared/index';
import ErrorAlert from '@shared/ui/ErrorAlert';
import { validateBackendEmail, validateBackendPassword } from '@shared/utils/validation';
import { useAuth } from '../context/AuthContext';

interface RegisterFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const RegisterPage: React.FC = () => {
  const { formData, updateField, errors, setFieldError, clearErrors } =
    useFormState<RegisterFormData>({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    });

  const { showPassword, togglePasswordVisibility } = usePasswordVisibility();
  const { isLoading, withLoading } = useLoadingState();
  const { error, handleError, clearError } = useErrorHandler();
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();

  const validateForm = () => {
    clearErrors();
    let isValid = true;

    if (!formData.first_name.trim()) {
      setFieldError('first_name', 'First name is required');
      isValid = false;
    }

    if (!formData.last_name.trim()) {
      setFieldError('last_name', 'Last name is required');
      isValid = false;
    }

    const emailValidation = validateBackendEmail(formData.email);
    if (!emailValidation.valid) {
      setFieldError('email', emailValidation.error || 'Invalid email');
      isValid = false;
    }

    const passwordValidation = validateBackendPassword(formData.password);
    if (!passwordValidation.valid) {
      setFieldError('password', passwordValidation.error || 'Password required');
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      setFieldError('confirmPassword', 'Passwords do not match');
      isValid = false;
    }

    if (!formData.acceptTerms) {
      setFieldError('acceptTerms', 'You must accept the terms and conditions');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await withLoading(async () => {
        await authRegister({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
        navigate('/dashboard', { replace: true });
      });
    } catch (err: unknown) {
      handleError(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo & Title */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600">Start your free trial today</p>
        </div>

        {/* Form Card */}
        <div className="card">
          <div className="card-body space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="animate-slide-in">
                <ErrorAlert error={error} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* First Name */}
              <div>
                <label htmlFor="first_name" className="form-label">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => updateField('first_name', e.target.value)}
                    className={`form-input pl-10 ${errors.first_name ? 'border-red-500 focus:ring-red-200' : ''}`}
                    placeholder="John"
                    autoComplete="given-name"
                    required
                  />
                </div>
                {errors.first_name && <p className="form-error">{errors.first_name}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="last_name" className="form-label">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => updateField('last_name', e.target.value)}
                    className={`form-input pl-10 ${errors.last_name ? 'border-red-500 focus:ring-red-200' : ''}`}
                    placeholder="Doe"
                    autoComplete="family-name"
                    required
                  />
                </div>
                {errors.last_name && <p className="form-error">{errors.last_name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={`form-input pl-10 ${errors.email ? 'border-red-500 focus:ring-red-200' : ''}`}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <PasswordInput
                  label="Password"
                  value={formData.password}
                  onChange={(value) => updateField('password', value)}
                  showPassword={showPassword}
                  onToggleVisibility={togglePasswordVisibility}
                  error={errors.password}
                  required
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    className={`form-input pl-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : ''}`}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                  />
                </div>
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
              </div>

              {/* Terms & Conditions */}
              <div>
                <label className="inline-flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => updateField('acceptTerms', e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.acceptTerms && <p className="form-error">{errors.acceptTerms}</p>}
              </div>

              {/* Submit Button */}
              <SubmitButton isLoading={isLoading} className="w-full btn btn-primary">
                Create Account
              </SubmitButton>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Sign in instead →
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <p className="text-center text-xs text-gray-500">
          No credit card required • Cancel anytime
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
