// ========================================
// useResendVerification Hook
// POST /api/v1/auth/resend-verification
// ========================================

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import authService from '../services/authService';
import type { ResendVerificationRequest, ResendVerificationResponse } from '../types/auth.types';

interface UseResendVerificationOptions {
  onSuccess?: (data: ResendVerificationResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Resend verification email mutation hook
 * Resends email verification link
 */
export function useResendVerification(
  options?: UseResendVerificationOptions
): UseMutationResult<ResendVerificationResponse, Error, ResendVerificationRequest> {
  return useMutation({
    mutationFn: authService.resendVerification,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

export default useResendVerification;
