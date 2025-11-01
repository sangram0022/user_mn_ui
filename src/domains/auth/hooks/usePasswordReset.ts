// ========================================
// usePasswordReset Hook
// POST /api/v1/auth/password-reset
// ========================================

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import authService from '../services/authService';
import type { PasswordResetRequest, PasswordResetResponse } from '../types/auth.types';

interface UsePasswordResetOptions {
  onSuccess?: (data: PasswordResetResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Password reset request mutation hook
 * Sends password reset link to user's email
 */
export const usePasswordReset = (
  options?: UsePasswordResetOptions
): UseMutationResult<PasswordResetResponse, Error, PasswordResetRequest> => {
  return useMutation({
    mutationFn: authService.passwordReset,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export default usePasswordReset;

