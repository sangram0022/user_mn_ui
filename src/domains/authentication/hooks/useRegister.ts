import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { RegisterData } from '../types/auth.types';

export const useRegister = () => {
  const { register: registerAction, isLoading, error } = useAuthStore();

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        await registerAction(data);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Registration failed',
        };
      }
    },
    [registerAction]
  );

  return {
    register,
    isLoading,
    error,
  };
};
