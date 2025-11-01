// ========================================
// useForgotPassword Hook
// POST /api/v1/auth/forgot-password
// ========================================

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import authService from '../services/authService';
import type { ForgotPasswordRequest, ForgotPasswordResponse } from '../types/auth.types';

interface UseForgotPasswordOptions {
  onSuccess?: (data: ForgotPasswordResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Forgot password mutation hook
 * Initiates password reset flow
 */
export function useForgotPassword(
  options?: UseForgotPasswordOptions
): UseMutationResult<ForgotPasswordResponse, Error, ForgotPasswordRequest> {
  return useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

export default useForgotPassword;
