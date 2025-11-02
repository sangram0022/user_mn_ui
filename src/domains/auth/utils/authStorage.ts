/**
 * Auth Storage - Centralized localStorage access for authentication
 * Separated from AuthContext to avoid fast refresh issues
 */

import type { User } from '../types/auth.types';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type?: 'bearer';
  expires_in?: number;
}

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

export const authStorage = {
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
