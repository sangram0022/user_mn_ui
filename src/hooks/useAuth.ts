/**
 * Custom Hook: useAuth
 * Manages authentication state and operations
 *
 * React 19: No memoization needed - React Compiler handles optimization
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import {
  ChangePasswordRequest,
  LoginRequest,
  PasswordResetRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../types/api.types';

export const useAuth = () => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Listen for auth errors
    const handleAuthError = () => {
      setUser(null);
      setError('Your session has expired. Please login again.');
    };

    window.addEventListener('auth:error', handleAuthError);
    return () => window.removeEventListener('auth:error', handleAuthError);
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      setUser(authService.getCurrentUser());
      navigate('/dashboard');
      return response;
    } catch (err: unknown) {
      const errorMessage = err.error?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      return response;
    } catch (err: unknown) {
      const errorMessage = err.error?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout even if API call fails
      authService.clearAuth();
      setUser(null);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: ChangePasswordRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.changePassword(data);
      return response;
    } catch (err: unknown) {
      const errorMessage = err.error?.message || 'Failed to change password.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (data: PasswordResetRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.requestPasswordReset(data);
      return response;
    } catch (err: unknown) {
      const errorMessage = err.error?.message || 'Failed to request password reset.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.resetPassword(data);
      return response;
    } catch (err: unknown) {
      const errorMessage = err.error?.message || 'Failed to reset password.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.verifyEmail({ token });
      return response;
    } catch (err: unknown) {
      const errorMessage = err.error?.message || 'Email verification failed.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.resendVerification({ email });
      return response;
    } catch (err: unknown) {
      const errorMessage = err.error?.message || 'Failed to resend verification email.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    changePassword,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    resendVerification,
    clearError,
    isAuthenticated: !!user,
    hasRole: authService.hasRole.bind(authService),
    hasAnyRole: authService.hasAnyRole.bind(authService),
    isAdmin: authService.isAdmin.bind(authService),
    isVerified: authService.isVerified.bind(authService),
    isApproved: authService.isApproved.bind(authService),
  };
};
