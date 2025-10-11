import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

export const useLogout = () => {
  const { logout: logoutAction, isLoading } = useAuthStore();

  const logout = useCallback(async () => {
    try {
      await logoutAction();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      };
    }
  }, [logoutAction]);

  return {
    logout,
    isLoading,
  };
};
