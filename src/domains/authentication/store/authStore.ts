/**
 * Authentication Domain Store (Zustand)
 *
 * High-performance state management for authentication domain
 * Benefits over Context API:
 * - Better performance (no unnecessary re-renders)
 * - TypeScript-first
 * - DevTools support
 * - Easy testing
 * - Middleware support
 *
 * @module domains/authentication/store
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  AuthToken,
  LoginCredentials,
  RegisterData,
  User,
  UserSession,
} from '../types/auth.types';

/**
 * Authentication State Interface
 */
export interface AuthState {
  // State
  user: User | null;
  token: AuthToken | null;
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
  reset: () => void;

  // Session management
  extendSession: () => Promise<void>;
  checkSession: () => boolean;

  // Internal actions
  setUser: (user: User | null) => void;
  setToken: (token: AuthToken | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Authentication Store
 *
 * Usage:
 * ```tsx
 * const { user, login, isAuthenticated } = useAuthStore();
 * ```
 */
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        user: null,
        token: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Login Action
        login: async (credentials: LoginCredentials) => {
          set({ isLoading: true, error: null });

          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(credentials),
            });

            if (!response.ok) {
              throw new Error('Login failed');
            }

            const data = await response.json();

            set({
              user: data.user,
              token: data.token,
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Login failed',
              isLoading: false,
              isAuthenticated: false,
            });
            throw error;
          }
        },

        // Register Action
        register: async (data: RegisterData) => {
          set({ isLoading: true, error: null });

          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
            });

            if (!response.ok) {
              throw new Error('Registration failed');
            }

            const result = await response.json();

            set({
              user: result.user,
              token: result.token,
              session: result.session,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Registration failed',
              isLoading: false,
            });
            throw error;
          }
        },

        // Logout Action
        logout: async () => {
          set({ isLoading: true });

          try {
            // TODO: Replace with actual API call
            await fetch('/api/auth/logout', { method: 'POST' });

            set({
              user: null,
              token: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Logout failed',
              isLoading: false,
            });
          }
        },

        // Refresh Token Action
        refreshToken: async () => {
          const { token } = get();

          if (!token?.refreshToken) {
            throw new Error('No refresh token available');
          }

          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken: token.refreshToken }),
            });

            if (!response.ok) {
              throw new Error('Token refresh failed');
            }

            const newToken = await response.json();

            set({ token: newToken });
          } catch (error) {
            // Token refresh failed, logout user
            get().logout();
            throw error;
          }
        },

        // Update User Action
        updateUser: (updates: Partial<User>) => {
          const { user } = get();

          if (user) {
            set({
              user: { ...user, ...updates },
            });
          }
        },

        // Clear Error Action
        clearError: () => {
          set({ error: null });
        },

        // Reset Action
        reset: () => {
          set({
            user: null,
            token: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        },

        // Extend Session Action
        extendSession: async () => {
          const { session } = get();

          if (!session) {
            throw new Error('No active session');
          }

          try {
            // TODO: Replace with actual API call
            const response = await fetch('/api/auth/extend-session', {
              method: 'POST',
            });

            if (!response.ok) {
              throw new Error('Session extension failed');
            }

            const newSession = await response.json();

            set({ session: newSession });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Session extension failed',
            });
            throw error;
          }
        },

        // Check Session Action
        checkSession: () => {
          const { session } = get();

          if (!session) {
            return false;
          }

          const now = Date.now();
          const expiresAt = new Date(session.expiresAt).getTime();

          return now < expiresAt;
        },

        // Internal: Set User
        setUser: (user: User | null) => {
          set({ user });
        },

        // Internal: Set Token
        setToken: (token: AuthToken | null) => {
          set({ token });
        },

        // Internal: Set Loading
        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        // Internal: Set Error
        setError: (error: string | null) => {
          set({ error });
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          session: state.session,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

/**
 * Selectors for optimized access
 */
export const authSelectors = {
  user: (state: AuthState) => state.user,
  isAuthenticated: (state: AuthState) => state.isAuthenticated,
  isLoading: (state: AuthState) => state.isLoading,
  error: (state: AuthState) => state.error,
  token: (state: AuthState) => state.token,
  hasRole: (role: string) => (state: AuthState) => state.user?.role === role,
  hasPermission: (permission: string) => (state: AuthState) =>
    state.user?.permissions?.includes(permission) ?? false,
};

/**
 * Hook for auth actions only (no state)
 * Prevents unnecessary re-renders
 */
export const useAuthActions = () =>
  useAuthStore((state) => ({
    login: state.login,
    register: state.register,
    logout: state.logout,
    refreshToken: state.refreshToken,
    updateUser: state.updateUser,
    clearError: state.clearError,
    extendSession: state.extendSession,
    checkSession: state.checkSession,
  }));
