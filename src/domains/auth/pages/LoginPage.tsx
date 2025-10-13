import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useErrorHandler } from '@hooks/errors/useErrorHandler';
import {
  authCard,
  authContainer,
  centeredText,
  formContainer,
  heading,
  iconContainerGradient,
  iconStyle,
  inputIconStyle,
  linkPrimary,
  spaceBetween,
  subheading,
} from '@shared/styles/authStyles';
import { AuthButton } from '@shared/ui/AuthButton';
import ErrorAlert from '@shared/ui/ErrorAlert';
import { FormInput } from '@shared/ui/FormInput';
import { validateEmail, validatePassword } from '@shared/utils/formValidation';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();

  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      handleError(new Error(emailValidation.error));
      return false;
    }

    const passwordValidation = validatePassword(formData.password, 8);
    if (!passwordValidation.isValid) {
      handleError(new Error(passwordValidation.error));
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Use AuthProvider's login method which updates user state
      await authLogin({
        email: formData.email,
        password: formData.password,
      });

      // Only navigate after successful login and user state update
      // Small delay to ensure state is fully updated
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Navigate to dashboard after successful login
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      // Handle error on the login page, not showing full-screen error
      handleError(err);
      setIsLoading(false); // Reset loading state on error
    }
    // Note: Don't reset loading in finally - let navigation happen while showing spinner
  };

  return (
    <>
      <div style={authContainer}>
        {/* Logo and Title */}
        <div style={centeredText}>
          <div style={iconContainerGradient}>
            <Lock style={iconStyle} />
          </div>
          <h2 style={heading}>Welcome Back</h2>
          <p style={subheading}>Sign in to your account to continue</p>
        </div>
      </div>

      <div style={{ ...authContainer, marginTop: '2rem' }}>
        <div style={authCard}>
          {/* Error Alert */}
          {error && (
            <div style={{ marginBottom: '1.5rem' }}>
              <ErrorAlert error={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} style={formContainer}>
            {/* Email Field */}
            <FormInput
              id="email"
              name="email"
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              autoComplete="email"
              Icon={Mail}
            />

            {/* Password Field */}
            <FormInput
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
              Icon={Lock}
              helperTextContent="Must be at least 8 characters long"
              ToggleIcon={
                showPassword ? <EyeOff style={inputIconStyle} /> : <Eye style={inputIconStyle} />
              }
              onToggle={() => setShowPassword(!showPassword)}
            />

            <div style={spaceBetween}>
              <label
                htmlFor="remember-me-checkbox"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#111827',
                  cursor: 'pointer',
                }}
              >
                <input
                  id="remember-me-checkbox"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  style={{
                    height: '1rem',
                    width: '1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    accentColor: '#3b82f6',
                  }}
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                style={linkPrimary}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#3b82f6')}
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <AuthButton type="submit" variant="primary" isLoading={isLoading}>
              Sign In
            </AuthButton>
          </form>

          {/* Divider */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div style={{ width: '100%', borderTop: '1px solid #d1d5db' }} />
              </div>
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                }}
              >
                <span
                  style={{
                    padding: '0 0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: '#6b7280',
                  }}
                >
                  Don't have an account?
                </span>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link
              to="/register"
              style={linkPrimary}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#3b82f6')}
            >
              Create a new account
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
