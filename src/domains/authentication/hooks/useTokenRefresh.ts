import { useCallback, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useTokenRefresh = () => {
  const { refreshToken: refreshTokenAction, isLoading, error } = useAuthStore();

  const refreshToken = useCallback(async () => {
    try {
      await refreshTokenAction();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed',
      };
    }
  }, [refreshTokenAction]);

  // Auto refresh token when it's about to expire
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Date.now() / 1000;
          // Refresh token 5 minutes before expiry
          if (payload.exp - now < 300) {
            refreshToken();
          }
        } catch (error) {
          console.error('Failed to parse token:', error);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [refreshToken]);

  return {
    refreshToken,
    isLoading,
    error,
  };
};
