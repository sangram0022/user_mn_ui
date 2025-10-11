import { ArrowLeft, CheckCircle, Loader, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useErrorHandler } from '@hooks/errors/useErrorHandler';
import { apiClient } from '@lib/api';
import ErrorAlert from '@shared/ui/ErrorAlert';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      const response = await apiClient.forgotPassword(email);

      if (response.success === false) {
        handleError(new Error(response.message || 'Failed to send reset email. Please try again.'));
        return;
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    if (error) {
      clearError();
    }
  };

  if (isSuccess) {
    return (
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
            width: '4rem',
            height: '4rem',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <CheckCircle style={{ width: '2rem', height: '2rem', color: 'white' }} />
        </div>

        <h1
          style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem',
          }}
        >
          Check Your Email
        </h1>

        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
          We've sent a password reset link to <strong>{email}</strong>
        </p>

        <div
          style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <p style={{ fontSize: '0.875rem', color: '#0369a1', margin: 0 }}>
            The reset link will expire in 1 hour. If you don't see the email, check your spam
            folder.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Back to Login
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSuccess(false);
              setEmail('');
            }}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#6b7280',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Send Another Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ margin: '0 auto', width: '100%', maxWidth: '28rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#6b7280',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
          }}
        >
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
          Back to Login
        </Link>
      </div>

      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            width: '4rem',
            height: '4rem',
            backgroundColor: '#3b82f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}
        >
          <Mail style={{ width: '2rem', height: '2rem', color: 'white' }} />
        </div>
        <h1
          style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem',
          }}
        >
          Reset Password
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Enter your email address and we'll send you a link to reset your password
        </p>
      </header>

      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          borderRadius: '1rem',
          border: '1px solid #f3f4f6',
        }}
      >
        {error && (
          <div style={{ marginBottom: '1.5rem' }}>
            <ErrorAlert error={error} />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
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
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  paddingLeft: '2.5rem',
                  fontSize: '0.875rem',
                  color: '#111827',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                }}
                placeholder="Enter your email address"
              />
              <Mail
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '1rem',
                  height: '1rem',
                  color: '#9ca3af',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
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
              background:
                isLoading || !email.trim()
                  ? '#9ca3af'
                  : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: isLoading || !email.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {isLoading ? (
              <>
                <Loader
                  style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }}
                />
                Sending Reset Link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#6b7280',
          }}
        >
          Remember your password?{' '}
          <Link to="/login" style={{ fontWeight: '500', color: '#3b82f6', textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
