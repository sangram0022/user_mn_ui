// ========================================
// useVerifyEmail Hook
// POST /api/v1/auth/verify-email
// ========================================

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import authService from '../services/authService';
import type { VerifyEmailRequest, VerifyEmailResponse } from '../types/auth.types';

interface UseVerifyEmailOptions {
  onSuccess?: (data: VerifyEmailResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Email verification mutation hook
 * Verifies email using token from email
 */
export const useVerifyEmail = (
  options?: UseVerifyEmailOptions
): UseMutationResult<VerifyEmailResponse, Error, VerifyEmailRequest> => {
  return useMutation({
    mutationFn: authService.verifyEmail,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export default useVerifyEmail;

