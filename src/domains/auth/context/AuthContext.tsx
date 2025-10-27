import { createContext, use } from 'react';

import type { LoginRequest, UserProfile } from '@shared/types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  refreshProfile: () => Promise<void>;
}

export type { AuthContextType };

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * React 19: Hook to access auth context using use() hook
 * Can be called conditionally unlike useContext
 */
export const useAuth = (): AuthContextType => {
  const context = use(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
