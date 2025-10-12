import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Info,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react';
import React, { ComponentType, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useErrorHandler } from '@hooks/errors/useErrorHandler';
import { apiClient } from '@lib/api';
import ErrorAlert from '@shared/ui/ErrorAlert';
import type { FeedbackIcon, RegistrationFeedback } from '../utils/registrationFeedback';
import { buildRegistrationFeedback } from '../utils/registrationFeedback';

const FEEDBACK_ICON_MAP: Record<FeedbackIcon, ComponentType<{ className?: string }>> = {
  mail: Mail,
  shield: ShieldCheck,
  clock: Clock,
  login: LogIn,
  info: Info,
  check: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    terms_accepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();
  const [success, setSuccess] = useState(false);
  const [registrationFeedback, setRegistrationFeedback] = useState<RegistrationFeedback | null>(
    null
  );
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [hasNavigated, setHasNavigated] = useState(false);

  const navigate = useNavigate();

  const handleProceedToLogin = useCallback(() => {
    setHasNavigated((prev) => {
      if (!prev) {
        setRedirectCountdown(null);
        navigate('/login', {
          state: { message: 'Registration successful! Please log in with your credentials.' },
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
      setRedirectCountdown((prev) => (prev === null ? null : prev - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [success, redirectCountdown, hasNavigated, handleProceedToLogin]);

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
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      handleError(new Error('Please fill in all required fields.'));
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      handleError(
        new Error('Passwords do not match. Please make sure both password fields are identical.')
      );
      return false;
    }

    if (formData.password.length < 8) {
      handleError(
        new Error('Password must be at least 8 characters long. Please choose a stronger password.')
      );
      return false;
    }

    if (!formData.terms_accepted) {
      handleError(
        new Error(
          'You must accept the Terms and Conditions to register. Please review and accept them to proceed.'
        )
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
      const response = await apiClient.register({
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
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
      <div
        style={{
          margin: '0 auto',
          width: '100%',
          maxWidth: '48rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            borderRadius: '1rem',
            border: '1px solid rgba(229, 231, 235, 0.5)',
            padding: '2.5rem',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                margin: '0 auto 1.5rem',
                width: '4rem',
                height: '4rem',
                backgroundColor: '#10b981',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)',
              }}
            >
              <CheckCircle style={{ width: '2rem', height: '2rem', color: 'white' }} />
            </div>
            <h2
              style={{
                fontSize: '1.875rem',
                fontWeight: 'bold',
                letterSpacing: '-0.025em',
                color: '#111827',
              }}
            >
              {registrationFeedback.title}
            </h2>
            <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>{registrationFeedback.subtitle}</p>
            <p style={{ marginTop: '1rem', fontSize: '1rem', color: '#374151' }}>
              {registrationFeedback.message}
            </p>
            <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
              Account email:{' '}
              <span style={{ fontWeight: '500', color: '#111827' }}>
                {registrationFeedback.email}
              </span>
            </p>
            {redirectCountdown !== null && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#3b82f6' }}>
                We'll take you to the login screen in {redirectCountdown} second
                {redirectCountdown === 1 ? '' : 's'}.
              </p>
            )}
          </div>

          <section
            style={{
              marginTop: '2rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              padding: '1.5rem',
            }}
          >
            <h3
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Account snapshot
            </h3>
            <dl
              style={{
                marginTop: '1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              {registrationFeedback.highlights.map((highlight) => (
                <div
                  key={highlight.label}
                  style={{
                    borderRadius: '0.5rem',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    padding: '1rem',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <dt
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#64748b',
                    }}
                  >
                    {highlight.label}
                  </dt>
                  <dd
                    style={{
                      marginTop: '0.25rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#0f172a',
                      wordBreak: 'break-words',
                    }}
                  >
                    {highlight.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section style={{ marginTop: '2rem' }}>
            <h3
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Next steps
            </h3>
            <div
              style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {registrationFeedback.nextSteps.map((step) => {
                const IconComponent = FEEDBACK_ICON_MAP[step.icon] ?? Info;
                return (
                  <div
                    key={step.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      borderRadius: '0.75rem',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      padding: '1rem',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <div
                      style={{
                        marginTop: '0.25rem',
                        display: 'flex',
                        height: '2.5rem',
                        width: '2.5rem',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '9999px',
                        backgroundColor: '#eff6ff',
                      }}
                    >
                      <IconComponent
                        style={{ height: '1.25rem', width: '1.25rem', color: '#3b82f6' }}
                      />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>
                        {step.title}
                      </h4>
                      <p
                        style={{
                          marginTop: '0.25rem',
                          fontSize: '0.875rem',
                          color: '#64748b',
                          lineHeight: '1.5',
                        }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div
            style={{
              marginTop: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={handleProceedToLogin}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                borderRadius: '0.5rem',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                paddingLeft: '1.25rem',
                paddingRight: '1.25rem',
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#ffffff',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease',
                border: 'none',
                cursor: 'pointer',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
              }}
            >
              <LogIn style={{ height: '1rem', width: '1rem' }} />
              {redirectCountdown !== null ? `Go to login (${redirectCountdown}s)` : 'Go to login'}
            </button>
            {redirectCountdown !== null && (
              <button
                type="button"
                onClick={() => setRedirectCountdown(null)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  paddingLeft: '1.25rem',
                  paddingRight: '1.25rem',
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Stay on this page
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (success) {
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
            textAlign: 'center',
          }}
        >
          <div
            style={{
              margin: '0 auto 1.5rem',
              width: '4rem',
              height: '4rem',
              backgroundColor: '#10b981',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)',
            }}
          >
            <CheckCircle style={{ width: '2rem', height: '2rem', color: 'white' }} />
          </div>
          <h2
            style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              letterSpacing: '-0.025em',
              color: '#111827',
            }}
          >
            Registration Successful!
          </h2>
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>
            Your account has been created successfully. You can now head to the login page.
          </p>
          <button
            type="button"
            onClick={handleProceedToLogin}
            style={{
              marginTop: '1.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              paddingLeft: '1.25rem',
              paddingRight: '1.25rem',
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#ffffff',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
            }}
          >
            <LogIn style={{ height: '1rem', width: '1rem' }} />
            Go to login
          </button>
        </div>
      </div>
    );
  }

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
            <User style={{ width: '2rem', height: '2rem', color: 'white' }} />
          </div>
          <h2
            style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              letterSpacing: '-0.025em',
              color: '#111827',
            }}
          >
            Create Your Account
          </h2>
          <p
            style={{
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: '#6b7280',
            }}
          >
            Get started with our user management platform
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
            {/* First Name Field */}
            <div>
              <label
                htmlFor="firstName"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                First Name <span style={{ color: '#ef4444' }}>*</span>
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
                  <User style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} />
                </div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
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
                  placeholder="Enter your first name"
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

            {/* Last Name Field */}
            <div>
              <label
                htmlFor="lastName"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                Last Name <span style={{ color: '#ef4444' }}>*</span>
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
                  <User style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} />
                </div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
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
                  placeholder="Enter your last name"
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

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                Confirm Password <span style={{ color: '#ef4444' }}>*</span>
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
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
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
                  placeholder="Confirm your password"
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
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? (
                    <EyeOff style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} />
                  ) : (
                    <Eye style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <input
                id="terms_accepted"
                name="terms_accepted"
                type="checkbox"
                required
                checked={formData.terms_accepted}
                onChange={handleChange}
                style={{
                  height: '1rem',
                  width: '1rem',
                  color: '#3b82f6',
                  borderColor: '#d1d5db',
                  borderRadius: '0.25rem',
                  marginTop: '0.25rem',
                  cursor: 'pointer',
                }}
              />
              <label
                htmlFor="terms_accepted"
                style={{
                  marginLeft: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#374151',
                }}
              >
                I agree to the{' '}
                <Link to="/terms" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                  Privacy Policy
                </Link>
              </label>
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
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
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
                  Already have an account?
                </span>
              </div>
            </div>
          </div>

          {/* Sign In Link */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link
              to="/login"
              style={{
                fontWeight: '500',
                color: '#3b82f6',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#3b82f6')}
            >
              Sign in to your account
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

export default RegisterPage;
