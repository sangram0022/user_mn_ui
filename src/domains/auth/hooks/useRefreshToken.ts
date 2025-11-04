// ========================================
// useRefreshToken Hook
// POST /api/v1/auth/refresh
// ========================================

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import tokenService from '../services/tokenService';
import type { RefreshTokenResponse } from '../types/auth.types';

interface UseRefreshTokenOptions {
  onSuccess?: (data: RefreshTokenResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Refresh token mutation hook
 * Refreshes access token using refresh token
 */
export const useRefreshToken = (
  options?: UseRefreshTokenOptions
): UseMutationResult<RefreshTokenResponse, Error, string> => {
  return useMutation({
    mutationFn: tokenService.refreshToken,
    onSuccess: (response: RefreshTokenResponse) => {
      // Store new tokens
      if (response.data) {
        tokenService.storeTokens({
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          token_type: response.data.token_type,
          expires_in: response.data.expires_in,
        });
      }

      // Call custom success handler
      options?.onSuccess?.(response);
    },
    onError: options?.onError,
  });
};

export default useRefreshToken;

