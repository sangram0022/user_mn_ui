/**
 * Authentication Context
 * Provides authentication state and methods throughout the application
 */

import React, { createContext, ReactNode, useCallback, useEffect, useState } from 'react';
import authService from '../services/auth.service';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from '../types/api.types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  register: (userData: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshUser: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  isVerified: () => boolean;
  isApproved: () => boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * Wraps the application to provide auth context
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    checkAuthStatus();

    // Listen for auth errors
    const handleAuthError = () => {
      setUser(null);
    };

    window.addEventListener('auth:error', handleAuthError);
    return () => window.removeEventListener('auth:error', handleAuthError);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(authService.getCurrentUser());
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest) => {
    setIsLoading(true);
    try {
      return await authService.register(userData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const hasRole = useCallback((role: string) => authService.hasRole(role), []);
  const hasAnyRole = useCallback((roles: string[]) => authService.hasAnyRole(roles), []);
  const isAdmin = useCallback(() => authService.isAdmin(), []);
  const isVerified = useCallback(() => authService.isVerified(), []);
  const isApproved = useCallback(() => authService.isApproved(), []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    hasRole,
    hasAnyRole,
    isAdmin,
    isVerified,
    isApproved,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
