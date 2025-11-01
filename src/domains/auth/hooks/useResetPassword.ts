// ========================================
// useResetPassword Hook
// POST /api/v1/auth/reset-password
// ========================================

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import authService from '../services/authService';
import type { ResetPasswordRequest, ResetPasswordResponse } from '../types/auth.types';

interface UseResetPasswordOptions {
  onSuccess?: (data: ResetPasswordResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Reset password mutation hook
 * Resets password using token from email
 */
export function useResetPassword(
  options?: UseResetPasswordOptions
): UseMutationResult<ResetPasswordResponse, Error, ResetPasswordRequest> {
  return useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

export default useResetPassword;
