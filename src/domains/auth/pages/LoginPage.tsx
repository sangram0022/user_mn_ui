import { AlertCircle, ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import React, { startTransition, useCallback, useState, useTransition } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useErrorHandler } from '@hooks/errors/useErrorHandler';
import { useAuth } from '../context/AuthContext';

interface LoginFormState {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startLoginTransition] = useTransition();

  const navigate = useNavigate();
  const { login } = useAuth();
  const { error, errorMessage, handleError, clearError } = useErrorHandler();

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setFormState((previous) => ({
        ...previous,
        [name]: value,
      }));

      if (error) {
        clearError();
      }
    },
    [clearError, error]
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      clearError();

      startLoginTransition(async () => {
        try {
          await login({
            email: formState.email,
            password: formState.password,
          });
          navigate('/dashboard');
        } catch (submissionError: unknown) {
          handleError(submissionError, 'LoginPage');
        }
      });
    },
    [clearError, formState.email, formState.password, handleError, login, navigate]
  );

  const togglePasswordVisibility = useCallback(() => {
    startTransition(() => {
      setShowPassword((previous) => !previous);
    });
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #f3e8ff 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem 1rem',
      }}
    >
      <div
        style={{
          margin: '0 auto',
          width: '100%',
          maxWidth: '28rem',
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.875rem',
              color: '#6b7280',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#374151')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
          >
            <ArrowLeft
              style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }}
              aria-hidden
            />
            Back to Home
          </Link>
        </div>

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
            <Lock style={{ width: '2rem', height: '2rem', color: 'white' }} aria-hidden />
          </div>
          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              letterSpacing: '-0.025em',
              color: '#111827',
            }}
          >
            Welcome Back
          </h1>
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

        <div style={{ marginTop: '2rem' }}>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              padding: '2rem 1.5rem',
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              borderRadius: '1rem',
              border: '1px solid rgba(229, 231, 235, 0.5)',
            }}
          >
            {errorMessage && (
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                }}
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    color: '#dc2626',
                    marginTop: '0.125rem',
                  }}
                  aria-hidden
                />
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#991b1b' }}>
                    Authentication error
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#b91c1c', marginTop: '0.25rem' }}>
                    {errorMessage}
                  </p>
                  {error?.code && (
                    <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.5rem' }}>
                      Code: {error.code}
                    </p>
                  )}
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
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
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      left: 0,
                      paddingLeft: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <Mail
                      style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }}
                      aria-hidden
                    />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formState.email}
                    onChange={handleInputChange}
                    style={{
                      appearance: 'none',
                      position: 'relative',
                      display: 'block',
                      width: '100%',
                      paddingLeft: '2.5rem',
                      paddingRight: '0.75rem',
                      paddingTop: '0.75rem',
                      paddingBottom: '0.75rem',
                      border: '1px solid #d1d5db',
                      color: '#111827',
                      borderRadius: '0.5rem',
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
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

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
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      left: 0,
                      paddingLeft: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <Lock
                      style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }}
                      aria-hidden
                    />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formState.password}
                    onChange={handleInputChange}
                    style={{
                      appearance: 'none',
                      position: 'relative',
                      display: 'block',
                      width: '100%',
                      paddingLeft: '2.5rem',
                      paddingRight: '2.5rem',
                      paddingTop: '0.75rem',
                      paddingBottom: '0.75rem',
                      border: '1px solid #d1d5db',
                      color: '#111827',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    placeholder="Enter your password"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      right: 0,
                      left: 'auto',
                      paddingRight: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {showPassword ? (
                      <EyeOff
                        style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }}
                        aria-hidden
                      />
                    ) : (
                      <Eye
                        style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }}
                        aria-hidden
                      />
                    )}
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    style={{
                      height: '1rem',
                      width: '1rem',
                      color: '#3b82f6',
                      borderColor: '#d1d5db',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                    }}
                  />
                  <label
                    htmlFor="remember-me"
                    style={{
                      marginLeft: '0.5rem',
                      display: 'block',
                      fontSize: '0.875rem',
                      color: '#111827',
                    }}
                  >
                    Remember me
                  </label>
                </div>

                <div style={{ fontSize: '0.875rem' }}>
                  <Link
                    to="/forgot-password"
                    style={{
                      fontWeight: '500',
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
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    position: 'relative',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingTop: '0.75rem',
                    paddingBottom: '0.75rem',
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    borderRadius: '0.5rem',
                    color: '#ffffff',
                    background: isPending ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    cursor: isPending ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)',
                    opacity: isPending ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isPending) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  {isPending ? (
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <span
                        style={{
                          width: '1.25rem',
                          height: '1.25rem',
                          border: '2px solid white',
                          borderTopColor: 'transparent',
                          borderRadius: '9999px',
                          animation: 'spin 1s linear infinite',
                          marginRight: '0.5rem',
                        }}
                        aria-hidden
                      />
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>

            <div style={{ marginTop: '1.5rem' }}>
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
      </div>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoginPage;
