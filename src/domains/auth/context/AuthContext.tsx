// ========================================
// Auth Context - Global Authentication State
// Uses React 19's use() hook for context consumption
// 
// Note: useCallback KEPT for all action functions
// Reason: Context value memoization - prevents unnecessary re-renders of consumers
// ========================================

/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import authService from '../services/authService';
import tokenService from '../services/tokenService';
import { logger } from '@/core/logging';
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
  login: (tokens: AuthTokens, user: User, rememberMe?: boolean) => void;
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
    const user = tokenService.getUser() as User | null;
    return {
      user,
      isAuthenticated: !!tokenService.getAccessToken(),
      isLoading: true,
      // Compute permissions from user roles if user exists
      permissions: user?.roles
        ? getEffectivePermissionsForRoles(user.roles as UserRole[])
        : [],
    };
  });

  // ========================================
  // Actions
  // Kept: useCallback for context value stability (prevents consumer re-renders)
  // ========================================

  /**
   * Login - Set tokens and user in state & storage
   */
  const login = useCallback((tokens: AuthTokens, user: User, rememberMe: boolean = false) => {
    logger().info('🔐 Login: Storing tokens and user data', {
      userId: user.user_id,
      email: user.email,
      roles: user.roles,
      rememberMe,
      tokenPreview: tokens.access_token.substring(0, 20) + '...',
      expiresIn: tokens.expires_in || 3600,
      context: 'AuthContext.login',
    });
    
    // Store tokens with expiry time calculation
    tokenService.storeTokens({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type || 'bearer',
      expires_in: tokens.expires_in || 3600, // Default 1 hour if not provided
    }, rememberMe);
    
    tokenService.storeUser(user);
    
    // Verify tokens were stored
    const storedToken = tokenService.getAccessToken();
    logger().info('✓ Tokens stored in localStorage', {
      hasStoredToken: !!storedToken,
      storedTokenPreview: storedToken ? storedToken.substring(0, 20) + '...' : 'none',
      context: 'AuthContext.login',
    });
    
    // Compute permissions from user roles
    const permissions = getEffectivePermissionsForRoles(user.roles as UserRole[]);
    
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
      permissions,
    });
    
    logger().info('✓ Auth state updated', {
      isAuthenticated: true,
      permissionCount: permissions.length,
      context: 'AuthContext.login',
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
      tokenService.clearTokens();
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
    const accessToken = tokenService.getAccessToken();
    
    if (!accessToken) {
      setState(prev => ({ ...prev, isAuthenticated: false, isLoading: false, permissions: [] }));
      return;
    }

    try {
      // Verify token by fetching current user profile
      // Note: You'll need to add this endpoint or use an existing one
      // For now, we'll just trust the token exists
      const storedUser = tokenService.getUser() as User | null;
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
        tokenService.clearTokens();
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
      tokenService.clearTokens();
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
    const refreshToken = tokenService.getRefreshToken();
    
    if (!refreshToken) {
      await logout();
      return;
    }

    try {
      const response = await tokenService.refreshToken(refreshToken);
      
      // Update tokens in storage with expiry time
      if (response.data) {
        tokenService.storeTokens({
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          token_type: response.data.token_type || 'bearer',
          expires_in: response.data.expires_in || 3600,
        });
      }
      
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
    tokenService.storeUser(user);
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
  }, [checkAuth]); // checkAuth is stable (useCallback)

  // ========================================
  // Context Value (State + Actions)
  // Kept: useMemo for context value identity (prevents unnecessary re-renders)
  // ========================================

  const value: AuthContextValue = useMemo(() => ({
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
  }), [state.user, state.isAuthenticated, state.isLoading, state.permissions, login, logout, checkAuth, refreshSession, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
