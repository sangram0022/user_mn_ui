import type { FC, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import { apiClient } from '@lib/api/client';
import { tokenService } from '@shared/services/auth/tokenService';
import type { LoginRequest, UserProfile } from '@shared/types';
import { logger } from '@shared/utils/logger';
import { checkUserPermission } from '@shared/utils/rolePermissions';

import { AuthContext, type AuthContextType } from '../context/AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const hasMountedRef = useRef(false);

  const isAuthenticated = Boolean(user);

  // Check if user is authenticated on app load
  // Use ref to prevent duplicate checks in React StrictMode
  useEffect(() => {
    const abortController = new AbortController();

    // In development, React StrictMode causes components to mount twice
    // Use ref to ensure auth check only runs once per actual mount
    if (hasMountedRef.current) {
      logger.debug('Auth check skipped - already mounted in StrictMode');
      return;
    }

    hasMountedRef.current = true;

    // Prevent duplicate auth checks
    if (!isCheckingAuth) {
      checkAuthStatus(abortController.signal);
    }

    return () => {
      abortController.abort();
    };
  }, []);

  //  CRITICAL FIX: Global 401 handler to prevent infinite retry loops
  // Listen for authentication failures from API client
  useEffect(() => {
    const handleAuthFailure = (event: Event) => {
      const customEvent = event as CustomEvent<{ status: number; endpoint: string }>;
      logger.warn('[Auth] API authentication failure detected', customEvent.detail);

      // Clear auth state immediately
      tokenService.clearTokens();
      apiClient.clearSession();
      setUser(null);
      setError('Session expired. Please log in again.');

      // Note: Redirect to login is handled by route guards in App.tsx
      // This just ensures the auth state is cleared to trigger the redirect
    };

    // Add event listener for API authentication failures
    window.addEventListener('api:auth-failed', handleAuthFailure);

    return () => {
      window.removeEventListener('api:auth-failed', handleAuthFailure);
    };
  }, []);

  const checkAuthStatus = async (signal?: AbortSignal) => {
    // Prevent concurrent auth checks
    if (isCheckingAuth) {
      logger.debug('Auth check already in progress, skipping');
      return;
    }

    try {
      setIsCheckingAuth(true);
      setError(null);

      // Check if request was aborted
      if (signal?.aborted) {
        logger.debug('Auth check aborted');
        return;
      }

      // Use enterprise token service to check authentication
      if (!tokenService.isAuthenticated()) {
        logger.debug('No valid authentication session found');
        return;
      }

      const accessToken = tokenService.getAccessToken();
      if (!accessToken) {
        logger.debug('No access token found');
        return;
      }

      // Check again before making API call
      if (signal?.aborted) {
        logger.debug('Auth check aborted before API call');
        return;
      }

      // Verify token is still valid by fetching user profile
      const userProfile = await apiClient.getUserProfile();

      // Final abort check before updating state
      if (signal?.aborted) {
        logger.debug('Auth check aborted after API call');
        return;
      }

      setUser(userProfile);
      logger.debug('Auth check succeeded for user', { email: userProfile?.email });
    } catch (err) {
      // Don't log errors for aborted requests
      if (signal?.aborted) {
        logger.debug('Auth check cancelled');
        return;
      }

      logger.error('Auth check failed', err instanceof Error ? err : new Error(String(err)));
      // Clear invalid tokens
      tokenService.clearTokens();
      setUser(null);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setError(null);

      // Use secure login endpoint with httpOnly cookies and CSRF protection
      // The apiClient will automatically handle token storage and CSRF token fetching
      const response = await apiClient.loginSecure(credentials.email, credentials.password);

      logger.info('Secure login successful', {
        email: response.user.email,
        userId: response.user.user_id,
        roles: response.user.roles,
      });

      // Get user profile after login
      const userProfile = await apiClient.getUserProfile();
      setUser(userProfile);
      logger.info('User profile loaded', { email: userProfile.email });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      logger.error('Login failed', err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);

      await apiClient.logout();
      logger.debug('Logout API call succeeded');
    } catch (err) {
      logger.warn('Logout API call failed', { error: String(err) });
      // Continue with logout even if API call fails
    } finally {
      // Clear tokens using enterprise token service
      tokenService.clearTokens();
      apiClient.clearSession();
      setUser(null);
      logger.info('User logged out successfully');
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setError(null);

      const updatedProfile = await apiClient.updateUserProfile(updates);
      setUser(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile update failed');
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Use centralized permission checking utility
  const hasPermission = (permission: string): boolean => checkUserPermission(user, permission);

  const refreshProfile = async () => {
    try {
      setError(null);
      const userProfile = await apiClient.getUserProfile();
      setUser(userProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile refresh failed');
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    error,
    login,
    logout,
    updateProfile,
    clearError,
    hasPermission,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

// Re-export useAuth hook for backward compatibility
// eslint-disable-next-line react-refresh/only-export-components
export { useAuth } from '../context/AuthContext';
