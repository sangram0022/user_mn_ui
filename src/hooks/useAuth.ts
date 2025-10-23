/**
 * Custom Hook: useAuth
 * Manages authentication state and operations
 *
 * React 19: No memoization needed - React Compiler handles optimization
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import type {
  ChangePasswordRequest,
  LoginRequest,
  PasswordResetRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../types/api.types';

interface StoredUser {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_verified?: boolean;
  is_approved?: boolean;
  last_login_at?: string;
}

interface ApiError {
  error?: {
    message?: string;
  };
  message?: string;
}

// Utility functions for user data management
const getUserFromStorage = (): StoredUser | null => {
  const userStr = sessionStorage.getItem('user_data');
  return userStr ? JSON.parse(userStr) : null;
};

const storeUser = (userData: StoredUser): void => {
  sessionStorage.setItem('user_data', JSON.stringify(userData));
};

const clearUserStorage = (): void => {
  sessionStorage.removeItem('user_data');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
};

export const useAuth = () => {
  const [user, setUser] = useState<StoredUser | null>(getUserFromStorage());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getUserFromStorage();
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
      const response = await authService.login({
        email: credentials.email,
        password: credentials.password,
      });

      // Store user data from auth service (already converted to camelCase)
      const userData: StoredUser = {
        user_id: response.user.id,
        email: response.user.email,
        first_name: response.user.firstName,
        last_name: response.user.lastName,
        role: response.user.role,
        is_verified: response.user.isEmailVerified,
        is_approved: response.user.isActive,
      };
      storeUser(userData);
      setUser(userData);

      // Don't navigate here - let the caller handle navigation
      return response;
    } catch (err: unknown) {
      const errorMessage =
        (err as ApiError)?.error?.message ||
        (err as ApiError)?.message ||
        'Login failed. Please try again.';
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
      const response = await authService.register({
        email: userData.email,
        password: userData.password,
        confirm_password: userData.confirm_password,
        first_name: userData.first_name,
        last_name: userData.last_name,
      });
      return response;
    } catch (err: unknown) {
      const errorMessage =
        (err as ApiError)?.error?.message ||
        (err as ApiError)?.message ||
        'Registration failed. Please try again.';
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
      clearUserStorage();
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout even if API call fails
      clearUserStorage();
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
      const response = await authService.changePassword(data as never);
      return response;
    } catch (err: unknown) {
      const errorMessage =
        (err as ApiError)?.error?.message ||
        (err as ApiError)?.message ||
        'Failed to change password.';
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
      const response = await authService.forgotPassword(data.email);
      return response;
    } catch (err: unknown) {
      const errorMessage =
        (err as ApiError)?.error?.message ||
        (err as ApiError)?.message ||
        'Failed to request password reset.';
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
      const errorMessage =
        (err as ApiError)?.error?.message ||
        (err as ApiError)?.message ||
        'Failed to reset password.';
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
      const response = await authService.verifyEmail(token);
      return response;
    } catch (err: unknown) {
      const errorMessage =
        (err as ApiError)?.error?.message ||
        (err as ApiError)?.message ||
        'Email verification failed.';
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
      const response = await authService.resendVerificationEmail(email);
      return response;
    } catch (err: unknown) {
      const errorMessage =
        (err as ApiError)?.error?.message ||
        (err as ApiError)?.message ||
        'Failed to resend verification email.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Utility functions (moved from old service)
  const hasRole = (role: string): boolean => user?.role === role;

  const hasAnyRole = (roles: string[]): boolean => (user?.role ? roles.includes(user.role) : false);

  const isAdmin = (): boolean => hasAnyRole(['admin', 'super_admin']);

  const isVerified = (): boolean => user?.is_verified === true;

  const isApproved = (): boolean => user?.is_approved === true;

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
    isAuthenticated: Boolean(user),
    hasRole,
    hasAnyRole,
    isAdmin,
    isVerified,
    isApproved,
  };
};
