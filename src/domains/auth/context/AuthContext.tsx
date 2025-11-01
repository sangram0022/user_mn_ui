// ========================================
// Auth Context - Global Authentication State
// Uses React 19's use() hook for context consumption
// ========================================

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import authService from '../services/authService';
import tokenService from '../services/tokenService';
import type { User } from '../types/auth.types';

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
  login: () => {},
  logout: async () => {},
  checkAuth: async () => {},
  refreshSession: async () => {},
  updateUser: () => {},
});

// ========================================
// Storage Keys
// ========================================

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  REMEMBER_ME: 'remember_me',
  REMEMBER_ME_EMAIL: 'remember_me_email',
} as const;

// ========================================
// Storage Helpers (Centralized localStorage access)
// ========================================

const storage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },
  
  getRefreshToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
  
  getUser: (): User | null => {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  isRememberMeEnabled: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
  },

  getRememberMeEmail: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER_ME_EMAIL);
  },
  
  setTokens: (tokens: AuthTokens, rememberMe: boolean = false): void => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, rememberMe ? 'true' : 'false');
  },
  
  setUser: (user: User): void => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  setRememberMeEmail: (email: string): void => {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME_EMAIL, email);
  },
  
  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    // Note: We keep remember_me_email so user can see it on login page next time
  },

  clearRememberMe: (): void => {
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME_EMAIL);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
  },
};

// ========================================
// Auth Provider Component
// ========================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // State (Single source of truth)
  const [state, setState] = useState<AuthState>(() => ({
    user: storage.getUser(),
    isAuthenticated: !!storage.getAccessToken(),
    isLoading: true,
  }));

  // ========================================
  // Actions
  // ========================================

  /**
   * Login - Set tokens and user in state & storage
   */
  const login = useCallback((tokens: AuthTokens, user: User) => {
    storage.setTokens(tokens);
    storage.setUser(user);
    
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
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
      console.error('Logout API error:', error);
    } finally {
      // Always clear local state
      storage.clear();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      // Redirect to login - use window.location to avoid router dependency
      window.location.href = '/login';
    }
  }, []);

  /**
   * Check Auth - Validate current session
   */
  const checkAuth = useCallback(async () => {
    const accessToken = storage.getAccessToken();
    
    if (!accessToken) {
      setState(prev => ({ ...prev, isAuthenticated: false, isLoading: false }));
      return;
    }

    try {
      // Verify token by fetching current user profile
      // Note: You'll need to add this endpoint or use an existing one
      // For now, we'll just trust the token exists
      const storedUser = storage.getUser();
      if (storedUser) {
        setState({
          user: storedUser,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // Token exists but no user data - invalid state
        storage.clear();
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Token is invalid, clear everything
      storage.clear();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  /**
   * Refresh Session - Get new access token using refresh token
   */
  const refreshSession = useCallback(async () => {
    const refreshToken = storage.getRefreshToken();
    
    if (!refreshToken) {
      await logout();
      return;
    }

    try {
      const response = await tokenService.refreshToken(refreshToken);
      
      // Update tokens in storage
      storage.setTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
      });
      
      // Note: RefreshTokenResponse doesn't include user data
      // User data remains unchanged
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  }, [logout]);

  /**
   * Update User - Update user data in state & storage
   */
  const updateUser = useCallback((user: User) => {
    storage.setUser(user);
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
    
    // Actions
    login,
    logout,
    checkAuth,
    refreshSession,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ========================================
// Export for easy access
// ========================================

export { storage as authStorage };
