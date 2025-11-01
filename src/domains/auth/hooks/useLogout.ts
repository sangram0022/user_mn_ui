// ========================================
// useLogout Hook
// POST /api/v1/auth/logout
// ========================================

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
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
 */
export const useLogout = (options?: UseLogoutOptions): UseMutationResult<LogoutResponse, Error, void> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: (data: LogoutResponse) => {
      // Clear tokens and user data
      tokenService.clearTokens();

      // Clear all React Query cache
      queryClient.clear();

      // Call custom success handler
      options?.onSuccess?.(data);

      // Redirect to login page
      window.location.href = '/auth/login';
    },
    onError: options?.onError,
  });
};

export default useLogout;

