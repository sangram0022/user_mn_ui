// ========================================
// Auth Context - Global Authentication State
// Uses React 19's use() hook for context consumption
// ========================================

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import authService from '../services/authService';
import tokenService from '../services/tokenService';
import { logger } from '@/core/logging';
import { authStorage } from '../utils/authStorage';
import { getEffectivePermissionsForRoles } from '@/domains/rbac/utils/rolePermissionMap';
import type { User } from '../types/auth.types';
import type { Permission, UserRole } from '@/domains/rbac/types/rbac.types';

// ========================================
// Types
// ========================================

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type?: 'bearer';
  expires_in?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: Permission[];
}

interface AuthActions {
  login: (tokens: AuthTokens, user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateUser: (user: User) => void;
}

export interface AuthContextValue extends AuthState, AuthActions {}

// ========================================
// Context Creation with default value
// ========================================

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  permissions: [],
  login: () => {},
  logout: async () => {},
  checkAuth: async () => {},
  refreshSession: async () => {},
  updateUser: () => {},
});

// ========================================
// Auth Provider Component
// ========================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // State (Single source of truth)
  const [state, setState] = useState<AuthState>(() => {
    const user = authStorage.getUser();
    return {
      user,
      isAuthenticated: !!authStorage.getAccessToken(),
      isLoading: true,
      // Compute permissions from user roles if user exists
      permissions: user?.roles
        ? getEffectivePermissionsForRoles(user.roles as UserRole[])
        : [],
    };
  });

  // ========================================
  // Actions
  // ========================================

  /**
   * Login - Set tokens and user in state & storage
   */
  const login = useCallback((tokens: AuthTokens, user: User) => {
    authStorage.setTokens(tokens);
    authStorage.setUser(user);
    
    // Compute permissions from user roles
    const permissions = getEffectivePermissionsForRoles(user.roles as UserRole[]);
    
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
      permissions,
    });
  }, []);

  /**
   * Logout - Clear state, storage, and redirect
   */
  const logout = useCallback(async () => {
    try {
      // Call logout API (optional - even if it fails, we clear locally)
      await authService.logout();
    } catch (error) {
      logger().error('Logout API error', error as Error, {
        context: 'AuthContext.logout',
      });
    } finally {
      // Always clear local state
      authStorage.clear();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: [],
      });
      
      // Redirect to login - use window.location to avoid router dependency
      window.location.href = '/login';
    }
  }, []);

  /**
   * Check Auth - Validate current session
   */
  const checkAuth = useCallback(async () => {
    const accessToken = authStorage.getAccessToken();
    
    if (!accessToken) {
      setState(prev => ({ ...prev, isAuthenticated: false, isLoading: false, permissions: [] }));
      return;
    }

    try {
      // Verify token by fetching current user profile
      // Note: You'll need to add this endpoint or use an existing one
      // For now, we'll just trust the token exists
      const storedUser = authStorage.getUser();
      if (storedUser) {
        // Compute permissions from user roles
        const permissions = getEffectivePermissionsForRoles(storedUser.roles as UserRole[]);
        
        setState({
          user: storedUser,
          isAuthenticated: true,
          isLoading: false,
          permissions,
        });
      } else {
        // Token exists but no user data - invalid state
        logger().warn('Token exists but no user data found', {
          context: 'AuthContext.checkAuth',
        });
        authStorage.clear();
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          permissions: [],
        });
      }
    } catch (error) {
      logger().error('Auth check failed', error as Error, {
        context: 'AuthContext.checkAuth',
      });
      // Token is invalid, clear everything
      authStorage.clear();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: [],
      });
    }
  }, []);

  /**
   * Refresh Session - Get new access token using refresh token
   */
  const refreshSession = useCallback(async () => {
    const refreshToken = authStorage.getRefreshToken();
    
    if (!refreshToken) {
      await logout();
      return;
    }

    try {
      const response = await tokenService.refreshToken(refreshToken);
      
      // Update tokens in storage
      authStorage.setTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
      });
      
      logger().debug('Session refreshed successfully', {
        context: 'AuthContext.refreshSession',
      });
      // Note: RefreshTokenResponse doesn't include user data
      // User data remains unchanged
    } catch (error) {
      logger().error('Token refresh failed', error as Error, {
        context: 'AuthContext.refreshSession',
      });
      await logout();
    }
  }, [logout]);

  /**
   * Update User - Update user data in state & storage
   */
  const updateUser = useCallback((user: User) => {
    authStorage.setUser(user);
    setState(prev => ({
      ...prev,
      user,
    }));
  }, []);

  // ========================================
  // Auto-validate token on mount
  // ========================================

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ========================================
  // Context Value (State + Actions)
  // ========================================

  const value: AuthContextValue = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    permissions: state.permissions,
    
    // Actions
    login,
    logout,
    checkAuth,
    refreshSession,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
