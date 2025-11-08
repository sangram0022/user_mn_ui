// React 19 + Modern Auth Context with proper type alignment
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthContextType, User, LoginCredentials, RegisterData } from './types';
import type { Role } from './roles';
import authService from '../../domains/auth/services/authService';
import tokenService from '../../domains/auth/services/tokenService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth from tokenService
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = tokenService.getAccessToken();
      
      if (storedToken) {
        try {
          setToken(storedToken);
          // Keep existing localStorage pattern for user data
          const storedUser = localStorage.getItem('auth_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          tokenService.clearTokens();
          localStorage.removeItem('auth_user');
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
      
      setToken(data.access_token);
      setUser(userData);
      
      localStorage.setItem('auth_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
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
      console.log('Registration successful:', responseData);
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    // Clear all auth data
    tokenService.clearTokens();
    localStorage.removeItem('auth_user');
    setUser(null);
    setToken(null);
    
    // Call logout service (fire and forget)
    authService.logout().catch(console.error);
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
      
      setToken(data.access_token);
      
      // Update user data if needed
      if (user && data.email !== user.email) {
        const updatedUser: User = {
          ...user,
          email: data.email,
          roles: data.roles as Role[], // Backend sends string[], frontend expects Role[] (same thing)
        };
        setUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout(); // Clear everything on refresh failure
      throw error;
    }
  }

  const value: AuthContextType = {
    user,
    token,
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}