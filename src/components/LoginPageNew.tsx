import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';
import { useErrorHandler } from '../hooks/useErrorHandler';
import ErrorAlert from './ErrorAlert';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();

    try {
      await login({ email: formData.email, password: formData.password });
      navigate('/dashboard');
    } catch (err: unknown) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* Back to Home Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.875rem',
              color: '#6b7280',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
          >
            <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Back to Home
          </Link>
        </div>

        {/* Logo and Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            margin: '0 auto 1.5rem', 
            width: '4rem', 
            height: '4rem', 
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
            borderRadius: '1rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
          }}>
            <Lock style={{ width: '2rem', height: '2rem', color: 'white' }} />
          </div>
          <h2 style={{ 
            fontSize: '1.875rem', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Welcome Back
          </h2>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#6b7280'
          }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
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
              <ErrorAlert error={error} onDismiss={clearError} />
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="email" style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '0.5rem'
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
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
                    outline: 'none'
                  }}
                  placeholder="Enter your email"
                />
                <Mail style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  width: '1rem', 
                  height: '1rem', 
                  color: '#9ca3af'
                }} />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="password" style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '0.5rem'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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
                  placeholder="Enter your password"
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
            </div>

            {/* Remember Me and Forgot Password */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  style={{
                    width: '1rem',
                    height: '1rem',
                    color: '#3b82f6',
                    borderRadius: '0.25rem',
                    border: '1px solid #d1d5db'
                  }}
                />
                <label 
                  htmlFor="remember-me" 
                  style={{ 
                    marginLeft: '0.5rem', 
                    fontSize: '0.875rem', 
                    color: '#374151' 
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
                    textDecoration: 'none'
                  }}
                >
                  Forgot password?
                </Link>
              </div>
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
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'white',
                  background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isLoading ? 0.5 : 1
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  fontWeight: '500',
                  color: '#3b82f6',
                  textDecoration: 'none'
                }}
              >
                Create a new account
              </Link>
            </span>
          </div>
        </div>

        {/* Demo Credentials */}
        <div style={{ 
          marginTop: '1.5rem', 
          backgroundColor: '#eff6ff', 
          border: '1px solid #bfdbfe', 
          borderRadius: '0.5rem', 
          padding: '1rem'
        }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e40af', marginBottom: '0.5rem', margin: '0 0 0.5rem' }}>Demo Credentials</h4>
          <div style={{ fontSize: '0.75rem', color: '#1d4ed8' }}>
            <div style={{ marginBottom: '0.25rem' }}><strong>Admin:</strong> admin@example.com / admin123</div>
            <div><strong>User:</strong> user@example.com / user123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
