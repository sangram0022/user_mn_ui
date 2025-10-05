import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { parseError } from '../utils/errorHandling';
import type { RegisterRequest } from '../types';

interface LoginFormEnhancedProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

type FormStep = 'login' | 'register' | 'verify-email' | 'awaiting-approval' | 'forgot-password';

export const LoginFormEnhanced: React.FC<LoginFormEnhancedProps> = ({ onSuccess, onError }) => {
  const [currentStep, setCurrentStep] = useState<FormStep>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Check for verification token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('verification_token');
    if (token) {
      handleEmailVerification(token);
    }
  }, []);

  const handleEmailVerification = async (token: string) => {
    setIsLoading(true);
    try {
      await apiClient.verifyEmail(token);
      setSuccessMessage('✅ Email verified successfully! You can now log in.');
      setCurrentStep('login');
      // Clear URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      const parsedError = parseError(error);
      setErrors({ general: parsedError.userMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password && currentStep !== 'forgot-password') {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8 && currentStep !== 'forgot-password') {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (currentStep === 'register') {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      if (currentStep === 'login') {
        await handleLogin();
      } else if (currentStep === 'register') {
        await handleRegister();
      } else if (currentStep === 'forgot-password') {
        await handlePasswordReset();
      }
    } catch (error) {
      const parsedError = parseError(error);
      const detail = parsedError.details?.[0];
      const combinedMessage = detail ? `${parsedError.userMessage} (${detail})` : parsedError.userMessage;
      setErrors({ general: combinedMessage });
      onError?.(combinedMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    const response = await apiClient.login(formData.email, formData.password);
    console.log('Login successful:', response);
    setSuccessMessage('✅ Login successful! Redirecting...');
    setTimeout(() => onSuccess?.(), 1000);
  };

  const handleRegister = async () => {
    const registerData: RegisterRequest = {
      email: formData.email,
      password: formData.password,
      confirm_password: formData.confirmPassword,
      first_name: formData.firstName,
      last_name: formData.lastName,
      username: formData.email // Use email as username
    };
    
    const response = await apiClient.register(registerData);
    console.log('Registration successful:', response);
    
    setRegisteredEmail(formData.email);
    
    if (response.verification_token) {
      setVerificationToken(response.verification_token);
    }
    
    if (response.verification_required) {
      setCurrentStep('verify-email');
      setSuccessMessage('✅ Registration successful! Please check your email to verify your account.');
    } else if (response.approval_required) {
      setCurrentStep('awaiting-approval');
      setSuccessMessage('✅ Registration successful! Your account is awaiting admin approval.');
    } else {
      setSuccessMessage('✅ Registration successful! You can now log in.');
      setCurrentStep('login');
    }
  };

  const handlePasswordReset = async () => {
    await apiClient.requestPasswordReset(formData.email);
    setSuccessMessage('✅ Password reset link sent to your email!');
    setTimeout(() => setCurrentStep('login'), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const renderVerifyEmailStep = () => (
    <div className="text-center space-y-4">
      <div className="text-6xl mb-4">📧</div>
      <h3 className="text-2xl font-bold text-gray-900">Verify Your Email</h3>
      <p className="text-gray-600">
        We've sent a verification link to <strong>{registeredEmail}</strong>
      </p>
      <p className="text-sm text-gray-500">
        Click the link in the email to verify your account.
      </p>
      {verificationToken && (
        <button
          onClick={() => handleEmailVerification(verificationToken)}
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          Click here to verify now
        </button>
      )}
      <button
        onClick={() => setCurrentStep('login')}
        className="block w-full py-2 text-gray-600 hover:text-gray-900"
      >
        Back to Login
      </button>
    </div>
  );

  const renderAwaitingApprovalStep = () => (
    <div className="text-center space-y-4">
      <div className="text-6xl mb-4">⏳</div>
      <h3 className="text-2xl font-bold text-gray-900">Awaiting Approval</h3>
      <p className="text-gray-600">
        Your account <strong>{registeredEmail}</strong> has been created and is awaiting admin approval.
      </p>
      <p className="text-sm text-gray-500">
        You will receive an email notification once your account is approved.
      </p>
      <button
        onClick={() => setCurrentStep('login')}
        className="block w-full py-2 text-blue-600 hover:text-blue-500 font-medium"
      >
        Back to Login
      </button>
    </div>
  );

  if (currentStep === 'verify-email') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          {renderVerifyEmailStep()}
        </div>
      </div>
    );
  }

  if (currentStep === 'awaiting-approval') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          {renderAwaitingApprovalStep()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {currentStep === 'login' && 'Welcome Back'}
              {currentStep === 'register' && 'Create Account'}
              {currentStep === 'forgot-password' && 'Reset Password'}
            </h2>
            <p className="text-gray-600">
              {currentStep === 'login' && 'Sign in to your account'}
              {currentStep === 'register' && 'Sign up to get started'}
              {currentStep === 'forgot-password' && 'Enter your email to receive a reset link'}
            </p>
          </div>

          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              {successMessage}
            </div>
          )}

          {errors.general && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {currentStep === 'register' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {currentStep !== 'forgot-password' && (
                <>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete={currentStep === 'login' ? 'current-password' : 'new-password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {currentStep === 'register' && (
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <>
                  {currentStep === 'login' && 'Sign In'}
                  {currentStep === 'register' && 'Create Account'}
                  {currentStep === 'forgot-password' && 'Send Reset Link'}
                </>
              )}
            </button>

            <div className="text-center space-y-2">
              {currentStep === 'login' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep('register');
                      setErrors({});
                      setSuccessMessage('');
                    }}
                    className="text-blue-600 hover:text-blue-500 font-medium block w-full"
                  >
                    Don't have an account? Sign up
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep('forgot-password');
                      setErrors({});
                      setSuccessMessage('');
                    }}
                    className="text-sm text-gray-600 hover:text-gray-500 block w-full"
                  >
                    Forgot your password?
                  </button>
                </>
              )}

              {(currentStep === 'register' || currentStep === 'forgot-password') && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep('login');
                    setErrors({});
                    setSuccessMessage('');
                  }}
                  className="text-blue-600 hover:text-blue-500 font-medium block w-full"
                >
                  Already have an account? Sign in
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginFormEnhanced;
