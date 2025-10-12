import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useErrorHandler } from '@hooks/errors/useErrorHandler';
import ErrorAlert from '@shared/ui/ErrorAlert';
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
    if (!formData.email || !formData.password) {
      handleError(new Error('Please provide both your email address and password to continue.'));
      return false;
    }

    if (formData.password.length < 8) {
      handleError(
        new Error('Password must be at least 8 characters long. Please choose a stronger password.')
      );
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

      // Log successful authentication
      console.log('Login successful - user state updated, navigating to dashboard');

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
      <div
        style={{
          margin: '0 auto',
          width: '100%',
          maxWidth: '28rem',
        }}
      >
        {/* Logo and Title */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              margin: '0 auto 1.5rem',
              width: '4rem',
              height: '4rem',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)',
            }}
          >
            <Lock style={{ width: '2rem', height: '2rem', color: 'white' }} />
          </div>
          <h2
            style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              letterSpacing: '-0.025em',
              color: '#111827',
            }}
          >
            Welcome Back
          </h2>
          <p
            style={{
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: '#6b7280',
            }}
          >
            Sign in to your account to continue
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: '2rem',
          margin: '2rem auto 0',
          width: '100%',
          maxWidth: '28rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            paddingTop: '2rem',
            paddingBottom: '2rem',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            borderRadius: '1rem',
            border: '1px solid rgba(229, 231, 235, 0.5)',
          }}
        >
          {/* Error Alert */}
          {error && (
            <div style={{ marginBottom: '1.5rem' }}>
              <ErrorAlert error={error} />
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
          >
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    paddingLeft: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Mail style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    display: 'block',
                    width: '100%',
                    paddingLeft: '2.5rem',
                    paddingRight: '0.75rem',
                    paddingTop: '0.75rem',
                    paddingBottom: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    color: '#111827',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Enter your email"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    paddingLeft: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Lock style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    display: 'block',
                    width: '100%',
                    paddingLeft: '2.5rem',
                    paddingRight: '3rem',
                    paddingTop: '0.75rem',
                    paddingBottom: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    color: '#111827',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Create a password"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    right: 0,
                    paddingRight: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? (
                    <EyeOff style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} />
                  ) : (
                    <Eye style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} />
                  )}
                </button>
              </div>
              <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#6b7280' }}>
                Must be at least 8 characters long
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
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
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#3b82f6',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#3b82f6')}
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#ffffff',
                  background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isLoading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                }}
              >
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        border: '2px solid white',
                        borderTopColor: 'transparent',
                        borderRadius: '9999px',
                        animation: 'spin 1s linear infinite',
                        marginRight: '0.5rem',
                      }}
                    ></div>
                    Signing you in…
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
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
                    paddingLeft: '0.5rem',
                    paddingRight: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: '#6b7280',
                  }}
                >
                  Don't have an account?
                </span>
              </div>
            </div>
          </div>

          {/* Sign In Link */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link
              to="/register"
              style={{
                fontWeight: '500',
                color: '#3b82f6',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#3b82f6')}
            >
              Create a new account
            </Link>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default LoginPage;
