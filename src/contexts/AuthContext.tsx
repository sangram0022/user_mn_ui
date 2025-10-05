import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../services/apiClient';
import type { UserProfile, LoginRequest } from '../types';
import { AuthContext, type AuthContextType } from '../hooks/useAuth';
import { logger } from '../utils/logger';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if we have a token
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Try to get user profile to verify token is still valid
      const userProfile = await apiClient.getUserProfile();
      setUser(userProfile);
      logger.debug('Auth check succeeded for user', userProfile?.email);
    } catch (err) {
      logger.error('Auth check failed', err);
      // Clear invalid token
      localStorage.removeItem('token');
      setUser(null);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.login(credentials.email, credentials.password);
      
      // Store the token
      localStorage.setItem('token', response.access_token);
      
      // Get user profile
      const userProfile = await apiClient.getUserProfile();
      setUser(userProfile);
      logger.info('User logged in', { email: userProfile.email });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      logger.error('Login failed', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await apiClient.logout();
      logger.debug('Logout API call succeeded');
    } catch (err) {
      logger.warn('Logout API call failed', err);
      // Continue with logout even if API call fails
    } finally {
      // Clear local state and token
      localStorage.removeItem('token');
      setUser(null);
      setIsLoading(false);
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
    if (typeof user.role === 'object' && user.role?.permissions) {
      return user.role.permissions.includes(permission);
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
    isLoading,
    error,
    login,
    logout,
    updateProfile,
    clearError,
    hasPermission,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

// Re-export useAuth hook for backward compatibility
// eslint-disable-next-line react-refresh/only-export-components
export { useAuth } from '../hooks/useAuth';