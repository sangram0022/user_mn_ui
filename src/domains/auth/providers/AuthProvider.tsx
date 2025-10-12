import type { FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { apiClient } from '@lib/api';
import { tokenService } from '@shared/services/auth/tokenService';
import type { LoginRequest, UserProfile, UserRoleInfo } from '@shared/types';
import { logger } from '@shared/utils/logger';

import { AuthContext, type AuthContextType } from '../context/AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setError(null);

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

      // Verify token is still valid by fetching user profile
      const userProfile = await apiClient.getUserProfile();
      setUser(userProfile);
      logger.debug('Auth check succeeded for user', { email: userProfile?.email });
    } catch (err) {
      logger.error('Auth check failed', err instanceof Error ? err : new Error(String(err)));
      // Clear invalid tokens
      tokenService.clearTokens();
      setUser(null);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setError(null);

      // Call login API - tokens are automatically stored by apiClient
      const response = await apiClient.login(credentials.email, credentials.password);

      logger.info('Login successful', {
        email: response.email,
        userId: response.user_id,
        role: response.role,
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

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Check if user is superuser (admin)
    if (user.is_superuser) return true;

    // Check role-based permissions
    if (typeof user.role === 'object' && user.role && 'permissions' in user.role) {
      const permissions = (user.role as UserRoleInfo).permissions;
      if (Array.isArray(permissions)) {
        return permissions.includes(permission);
      }
    }

    // Check role name for admin
    if (user.role_name === 'admin' || user.role === 'admin') return true;

    // Default deny
    return false;
  };

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
