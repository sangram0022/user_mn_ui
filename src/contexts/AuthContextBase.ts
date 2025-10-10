import { createContext } from 'react';
import type { UserProfile, LoginRequest } from '@shared/types';

export interface AuthContextType { user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  clearError: () => void; }

export const AuthContext = createContext<AuthContextType | undefined>(undefined);