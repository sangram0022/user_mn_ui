// ========================================
// useSecureAuth Hook
// Secure authentication with httpOnly cookies
// ========================================

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import secureAuthService from '../services/secureAuthService';
import tokenService from '../services/tokenService';
import type { LoginRequest, SecureLoginResponse, SecureLogoutResponse } from '../types/auth.types';

interface UseSecureLoginOptions {
  onSuccess?: (data: SecureLoginResponse) => void;
  onError?: (error: Error) => void;
}

interface UseSecureLogoutOptions {
  onSuccess?: (data: SecureLogoutResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Secure login mutation hook (httpOnly cookies)
 */
export function useSecureLogin(
  options?: UseSecureLoginOptions
): UseMutationResult<SecureLoginResponse, Error, LoginRequest> {
  return useMutation({
    mutationFn: secureAuthService.loginSecure,
    onSuccess: (data: SecureLoginResponse) => {
      // Store user data and CSRF token using centralized service
      tokenService.storeUser(data.user);
      tokenService.storeCsrfToken(data.csrf_token);

      // Call custom success handler
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Secure logout mutation hook (httpOnly cookies)
 */
export function useSecureLogout(
  options?: UseSecureLogoutOptions
): UseMutationResult<SecureLogoutResponse, Error, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: secureAuthService.logoutSecure,
    onSuccess: (data: SecureLogoutResponse) => {
      // Clear user data and CSRF token using centralized service
      tokenService.removeUser();
      tokenService.removeCsrfToken();

      // Clear all React Query cache
      queryClient.clear();

      // Call custom success handler
      options?.onSuccess?.(data);

      // Redirect to login page
      window.location.href = '/auth/login';
    },
    onError: options?.onError,
  });
}

export default { useSecureLogin, useSecureLogout };


