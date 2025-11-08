// React 19 + Modern Auth Context with use() hook
import React, { createContext, use, useState, useEffect } from 'react';
import type { AuthContextType, User, LoginCredentials, RegisterData } from './types';
import type { Role } from './roles';
import authService from '../../domains/auth/services/authService';
import tokenService from '../../domains/auth/services/tokenService';
import { logger } from '@/core/logging';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Single source of truth: tokenService in localStorage
  const isAuthenticated = !!user && !!tokenService.getAccessToken();

  // Initialize auth from tokenService
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = tokenService.getAccessToken();
      
      if (storedToken) {
        try {
          // Use tokenService for centralized storage access
          const storedUser = tokenService.getUser();
          if (storedUser) {
            setUser(storedUser as User);
          }
        } catch (error) {
          logger().error('Failed to parse stored user', error instanceof Error ? error : new Error(String(error)), {
            context: 'AuthContext.initAuth',
          });
          tokenService.clearTokens();
        }
      } else {
        tokenService.clearTokens();
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // React 19: No useCallback needed - Compiler optimizes
  async function login(credentials: LoginCredentials) {
    setIsLoading(true);
    try {
      // Use proper auth service instead of direct fetch
      const data = await authService.login({
        email: credentials.email,
        password: credentials.password,
      });
      
      // Store tokens using tokenService
      tokenService.storeTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: data.token_type,
        expires_in: data.expires_in,
      });
      
      // LoginResponseData only has basic info, we'll need to fetch full profile
      // For now, create minimal user object
      const userData: User = {
        id: data.user_id,
        email: data.email,
        firstName: '', // Will be filled by profile fetch if needed
        lastName: '',
        roles: data.roles as Role[], // Backend sends string[], frontend expects Role[] (same thing)
        isActive: true,
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setUser(userData);
      
      // Use tokenService for centralized storage
      tokenService.storeUser(userData);
    } catch (error) {
      logger().error('Login error', error instanceof Error ? error : new Error(String(error)), {
        context: 'AuthContext.login',
        email: credentials.email,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(data: RegisterData) {
    setIsLoading(true);
    try {
      // Use proper auth service with correct payload structure
      const responseData = await authService.register({
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        // RegisterRequest expects first_name/last_name, not full_name
      });
      
      // RegisterResponseData doesn't include tokens - user needs to verify email first
      // Just return success, user will need to verify and then login
      logger().info('Registration successful', {
        context: 'AuthContext.register',
        userId: responseData.user_id,
        email: responseData.email,
      });
      
    } catch (error) {
      logger().error('Registration error', error instanceof Error ? error : new Error(String(error)), {
        context: 'AuthContext.register',
        email: data.email,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    // Clear all auth data using tokenService
    tokenService.clearTokens();
    setUser(null);
    
    // Call logout service (fire and forget)
    authService.logout().catch((error) => {
      logger().error('Logout service call failed', error instanceof Error ? error : new Error(String(error)), {
        context: 'AuthContext.logout',
      });
    });
  }

  async function refreshAuth() {
    try {
      const refreshToken = tokenService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const data = await authService.refreshToken(refreshToken);
      
      // Store new tokens
      tokenService.storeTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: data.token_type,
        expires_in: data.expires_in,
      });
      
      // Update user data if needed
      if (user && data.email !== user.email) {
        const updatedUser: User = {
          ...user,
          email: data.email,
          roles: data.roles as Role[], // Backend sends string[], frontend expects Role[] (same thing)
        };
        setUser(updatedUser);
        // Use tokenService for centralized storage
        tokenService.storeUser(updatedUser);
      }
    } catch (error) {
      logger().error('Token refresh failed', error instanceof Error ? error : new Error(String(error)), {
        context: 'AuthContext.refreshAuth',
      });
      logout(); // Clear everything on refresh failure
      throw error;
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * React 19 use() hook for consuming AuthContext
 * Automatically throws error if used outside provider (built-in behavior)
 */
export function useAuth() {
  const context = use(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}