import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, Loader } from 'lucide-react';
import { apiClient } from '@services/apiClient';
import ErrorAlert from '@shared/ui/ErrorAlert';
import { useErrorHandler } from '@hooks/errors/useErrorHandler';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      handleError(new Error('Invalid or missing reset token'));
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, handleError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      handleError(new Error('Invalid reset token'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      handleError(new Error('Passwords do not match'));
      return;
    }

    if (formData.password.length < 6) {
      handleError(new Error('Password must be at least 6 characters long'));
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      // Call reset password API endpoint
      const response = await apiClient.resetPassword({
        token,
        new_password: formData.password,
        confirm_password: formData.confirmPassword
      });

      if (!response.message) {
        console.warn('Password reset response missing message payload');
      }

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login', {
          state: { message: response.message ?? 'Password reset successful! Please log in with your new password.' }
        });
      }, 3000);
    } catch (err: unknown) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) clearError();
  };

  if (!token && !error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <Loader style={{ width: '2rem', height: '2rem', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem 1.5rem'
      }}>
        <div style={{
          margin: '0 auto',
          width: '100%',
          maxWidth: '28rem',
          textAlign: 'center'
        }}>
          {/* Success Icon */}
          <div style={{
            width: '4rem',
            height: '4rem',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <CheckCircle style={{ width: '2rem', height: '2rem', color: 'white' }} />
          </div>

          <h2 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem',
          }}>
            Password Reset Successful!
          </h2>
          
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            marginBottom: '1.5rem',
          }}>
            Your password has been successfully reset. Redirecting to login...
          </p>

          <div style={{
            width: '2rem',
            height: '2rem',
            border: '4px solid #3b82f6',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '3rem 1.5rem'
    }}>
      <div style={{
        margin: '0 auto',
        width: '100%',
        maxWidth: '28rem'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            backgroundColor: '#3b82f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <Lock style={{ width: '2rem', height: '2rem', color: 'white' }} />
          </div>
          <h2 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem',
          }}>
            Reset Your Password
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
          }}>
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          borderRadius: '1rem',
          border: '1px solid #f3f4f6'
        }}>
          {/* Error Alert */}
          {error && (
            <div style={{ marginBottom: '1.5rem' }}>
              <ErrorAlert error={error} />
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Password Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    paddingLeft: '2.5rem',
                    paddingRight: '2.5rem',
                    fontSize: '0.875rem',
                    color: '#111827',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  placeholder="Enter your new password"
                />
                <Lock style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '1rem',
                  height: '1rem',
                  color: '#9ca3af'
                }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#9ca3af'
                  }}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: '1rem', height: '1rem' }} />
                  ) : (
                    <Eye style={{ width: '1rem', height: '1rem' }} />
                  )}
                </button>
              </div>
              <p style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                marginTop: '0.25rem'
              }}>
                Must be at least 6 characters long
              </p>
            </div>

            {/* Confirm Password Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="confirmPassword" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    paddingLeft: '2.5rem',
                    paddingRight: '2.5rem',
                    fontSize: '0.875rem',
                    color: '#111827',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  placeholder="Confirm your new password"
                />
                <Lock style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '1rem',
                  height: '1rem',
                  color: '#9ca3af'
                }} />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#9ca3af'
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOff style={{ width: '1rem', height: '1rem' }} />
                  ) : (
                    <Eye style={{ width: '1rem', height: '1rem' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.password || !formData.confirmPassword}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'white',
                background: isLoading || !formData.password || !formData.confirmPassword
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: isLoading || !formData.password || !formData.confirmPassword ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {isLoading ? (
                <>
                  <Loader style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#6b7280',
          }}>
            Remember your password?{' '}
            <Link
              to="/login"
              style={{
                fontWeight: '500',
                color: '#3b82f6',
                textDecoration: 'none'
              }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
