import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { LoginCredentials } from '../types/auth.types';

export const useLogin = () => {
  const { login: loginAction, isLoading, error } = useAuthStore();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        await loginAction(credentials);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Login failed',
        };
      }
    },
    [loginAction]
  );

  return {
    login,
    isLoading,
    error,
  };
};
