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
import { useSessionMonitor } from '@/shared/hooks/useSessionMonitor';
import { SessionTimeoutDialog } from '@/shared/components/dialogs/SessionTimeoutDialog';
import type { User } from '../types/auth.types';
import type { Permission, UserRole } from '@/domains/rbac/types/rbac.types';

// Normalize roles coming from various sources (array, CSV string, JSON string, object)
function normalizeRoles(raw: unknown): UserRole[] {
  if (!raw) return [];
  // Already an array of strings
  if (Array.isArray(raw)) {
    return raw.filter(r => typeof r === 'string') as UserRole[];
  }

  // JSON stringified array or CSV string
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(r => typeof r === 'string') as UserRole[];
    } catch {
      // not JSON, continue to CSV handling
    }

    // CSV (comma separated) fallback
    return raw.split(',').map(s => s.trim()).filter(Boolean) as UserRole[];
  }

  // Object (could be numeric keyed or a map)
  if (typeof raw === 'object') {
    const vals = Object.values(raw as Record<string, unknown>);
    return vals.filter(v => typeof v === 'string') as UserRole[];
  }

  return [];
}

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
    // Defensive: normalize roles before computing permissions
    const rolesArray = normalizeRoles(user?.roles);
    return {
      user,
      isAuthenticated: !!tokenService.getAccessToken(),
      isLoading: true,
      // Compute permissions from user roles if user exists
      permissions: rolesArray.length > 0
        ? getEffectivePermissionsForRoles(rolesArray as UserRole[])
        : [],
    };
  });

  // ========================================
  // Actions
  // Kept: useCallback for context value stability (prevents consumer re-renders)
  // ========================================

  /**
   * Login - Set tokens and user in state & storage
   * Kept: useCallback required for useMemo context value dependency (prevents Provider re-renders)
   */
  const login = useCallback((tokens: AuthTokens, user: User, rememberMe: boolean = false) => {
    logger().info('🔐 Login: Storing tokens and user data', {
      userId: user.user_id,
      email: user.email,
      roles: user.roles,
      rememberMe,
      tokenPreview: tokens.access_token ? tokens.access_token.substring(0, 20) + '...' : 'none',
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
    
  // Compute permissions from user roles (normalized)
  const rolesArray = normalizeRoles(user.roles);
  const permissions = getEffectivePermissionsForRoles(rolesArray as UserRole[]);
    
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
   * Kept: useCallback required for useMemo context value dependency
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
   * Kept: useCallback required for useMemo context value dependency
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
        // Compute permissions from user roles (normalized)
        const rolesArray = normalizeRoles(storedUser.roles);
        const permissions = getEffectivePermissionsForRoles(rolesArray as UserRole[]);
        
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
  // Session Monitoring (5-minute warning)
  // ========================================

  const { showWarning, secondsRemaining } = useSessionMonitor({
    warningMinutes: 5,
    onTimeout: logout,
    enabled: state.isAuthenticated,
  });

  const handleExtendSession = async () => {
    await refreshSession();
  };

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

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionTimeoutDialog
        isOpen={showWarning}
        secondsRemaining={secondsRemaining}
        onExtend={handleExtendSession}
        onLogout={logout}
      />
    </AuthContext.Provider>
  );
}
