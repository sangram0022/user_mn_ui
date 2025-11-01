// ========================================
// useChangePassword Hook
// POST /api/v1/auth/change-password
// ========================================

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import authService from '../services/authService';
import type { ChangePasswordRequest, ChangePasswordResponse } from '../types/auth.types';

interface UseChangePasswordOptions {
  onSuccess?: (data: ChangePasswordResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Change password mutation hook
 * Changes password for authenticated user
 */
export function useChangePassword(
  options?: UseChangePasswordOptions
): UseMutationResult<ChangePasswordResponse, Error, ChangePasswordRequest> {
  return useMutation({
    mutationFn: authService.changePassword,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

export default useChangePassword;
