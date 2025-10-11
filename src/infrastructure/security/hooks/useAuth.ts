/**
 * Authentication Hook
 * Provides React hooks for authentication state and operations
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../../../domains/authentication/store/authStore';
import type { User, LoginData, RegisterData } from '../../../types/index';

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for authentication operations
 */
export function useAuth(): UseAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    user,
    isAuthenticated,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    refreshToken: storeRefreshToken,
  } = useAuthStore();

  const login = useCallback(
    async (data: LoginData) => {
      try {
        setIsLoading(true);
        setError(null);
        await storeLogin(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [storeLogin]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        setIsLoading(true);
        setError(null);
        await storeRegister(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [storeRegister]
  );

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await storeLogout();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storeLogout]);

  const refreshToken = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await storeRefreshToken();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Token refresh failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storeRefreshToken]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-refresh token on mount if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check token expiry and refresh if needed
      const checkTokenExpiry = async () => {
        try {
          // This would typically check the token expiry
          // and refresh if within a certain threshold
          await refreshToken();
        } catch (err) {
          // Token refresh failed, user might need to login again
          console.error('Auto token refresh failed:', err);
        }
      };

      checkTokenExpiry();
    }
  }, [isAuthenticated, user, refreshToken]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    error,
    clearError,
  };
}

/**
 * Hook for checking if user has specific role
 */
export function useRole() {
  const { user } = useAuth();

  const hasRole = useCallback(
    (role: string) => {
      return user?.role === role;
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roles: string[]) => {
      return user?.role ? roles.includes(user.role) : false;
    },
    [user]
  );

  const isAdmin = useCallback(() => {
    return hasRole('admin');
  }, [hasRole]);

  const isModerator = useCallback(() => {
    return hasRole('moderator') || isAdmin();
  }, [hasRole, isAdmin]);

  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isModerator,
    currentRole: user?.role || null,
  };
}

/**
 * Hook for authentication status checks
 */
export function useAuthStatus() {
  const { isAuthenticated, user, isLoading } = useAuth();

  const isLoggedIn = isAuthenticated && !!user;
  const isGuest = !isAuthenticated || !user;

  return {
    isLoggedIn,
    isGuest,
    isAuthenticated,
    isLoading,
    user,
  };
}
