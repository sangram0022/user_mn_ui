// ========================================
// useLogin Hook
// POST /api/v1/auth/login
// ========================================

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import authService from '../services/authService';
import tokenService from '../services/tokenService';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

interface UseLoginOptions {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Login mutation hook
 * Authenticates user and stores tokens
 */
export const useLogin = (options?: UseLoginOptions): UseMutationResult<LoginResponse, Error, LoginRequest> => {
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data: LoginResponse) => {
      // Store tokens in localStorage
      tokenService.storeTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: data.token_type,
        expires_in: data.expires_in,
      });

      // Store user data using centralized service
      tokenService.storeUser(data.user);

      // Call custom success handler
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

export default useLogin;


