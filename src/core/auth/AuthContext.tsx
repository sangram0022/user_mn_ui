// React 19: Modern Context with use() hook pattern
// Removed useCallback - React 19 Compiler handles optimization automatically
import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthContextType, User, LoginCredentials, RegisterData } from './types';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token');
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // React 19: No useCallback needed - Compiler optimizes
  async function login(credentials: LoginCredentials) {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      
      setToken(data.token);
      setUser(data.user);
      
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
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
      // TODO: Replace with actual API call
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Registration failed');

      const responseData = await response.json();
      
      setToken(responseData.token);
      setUser(responseData.user);
      
      localStorage.setItem('auth_token', responseData.token);
      localStorage.setItem('auth_user', JSON.stringify(responseData.user));
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  async function refreshAuth() {
    // TODO: Implement token refresh
    console.log('Refreshing auth...');
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    refreshAuth,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export default AuthContext;
