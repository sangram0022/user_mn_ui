// ========================================
// useRefreshToken Hook
// POST /api/v1/auth/refresh
// ========================================

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import tokenService from '../services/tokenService';
import type { RefreshTokenResponse } from '../types/token.types';

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
    onSuccess: (data: RefreshTokenResponse) => {
      // Store new tokens
      tokenService.storeTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: data.token_type,
        expires_in: data.expires_in,
      });

      // Call custom success handler
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

export default useRefreshToken;

