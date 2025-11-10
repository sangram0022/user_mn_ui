// ========================================
// useLogout Hook
// POST /api/v1/auth/logout
// ========================================

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import tokenService from '../services/tokenService';
import type { LogoutResponse } from '../types/auth.types';

interface UseLogoutOptions {
  onSuccess?: (data: LogoutResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Logout mutation hook
 * Logs out user and clears all cached data
 * 
 * ✅ ENHANCED: Includes default error handler with toast notifications
 */
export const useLogout = (options?: UseLogoutOptions): UseMutationResult<LogoutResponse, Error, void> => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: (data: LogoutResponse) => {
      // Clear tokens and user data
      tokenService.clearTokens();

      // Clear all React Query cache
      queryClient.clear();

      // Call custom success handler
      options?.onSuccess?.(data);

      // Use React Router navigation instead of window.location
      navigate('/auth/login', { replace: true });
    },
    onError: (error: Error) => {
      if (options?.onError) {
        options.onError(error);
      } else {
        // Even if logout fails, clear local state and redirect
        // This ensures user can't be stuck in an invalid auth state
        tokenService.clearTokens();
        queryClient.clear();
        // Use React Router navigation instead of window.location
        navigate('/auth/login', { replace: true });
      }
    },
  });
};

export default useLogout;

