import { logger } from './../shared/utils/logger';
import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '@lib/api';
import type { UserProfile, LoginRequest } from '@shared/types';

interface AuthContextType { user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearError: () => void; }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps { children: ReactNode; }

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => { const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => { try {
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
    } catch (err) { logger.error('Auth check failed:', undefined, { err  });
      // Clear invalid token
      localStorage.removeItem('token');
      setUser(null);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally { setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => { try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.login(credentials.email, credentials.password);
      
      // Store the token
      localStorage.setItem('token', response.access_token);
      
      // Get user profile
      const userProfile = await apiClient.getUserProfile();
      setUser(userProfile);
    } catch (err) { setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally { setIsLoading(false);
    }
  };

  const logout = async () => { try {
      setIsLoading(true);
      setError(null);

      await apiClient.logout();
    } catch (err) { logger.error('Logout error:', undefined, { err  });
      // Continue with logout even if API call fails
    } finally { // Clear local state and token
      localStorage.removeItem('token');
      setUser(null);
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => { try {
      setError(null);
      
      const updatedProfile = await apiClient.updateUserProfile(updates);
      setUser(updatedProfile);
    } catch (err) { setError(err instanceof Error ? err.message : 'Profile update failed');
      throw err;
    }
  };

  const clearError = () => { setError(null);
  };

  const value: AuthContextType = { user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;