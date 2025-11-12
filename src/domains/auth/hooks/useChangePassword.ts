// ========================================
// useChangePassword Hook
// POST /api/v1/auth/change-password
// ========================================

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
import authService from '../services/authService';
import type { ChangePasswordRequest, ChangePasswordResponse } from '../types/auth.types';

interface UseChangePasswordOptions {
  onSuccess?: (data: ChangePasswordResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Change password mutation hook
 * Changes password for authenticated user
 * 
 * ✅ ENHANCED: Includes default error handler with toast notifications
 * Components can still override with custom onError handler
 */
export function useChangePassword(
  options?: UseChangePasswordOptions
): UseMutationResult<ChangePasswordResponse, Error, ChangePasswordRequest> {
  const handleError = useStandardErrorHandler();

  return useMutation({
    mutationFn: authService.changePassword,
    onSuccess: options?.onSuccess,
    onError: (error: Error) => {
      // Call custom error handler if provided, otherwise use default
      if (options?.onError) {
        options.onError(error);
      } else {
        handleError(error, {
          context: { operation: 'changePassword' },
          showToast: true,
        });
      }
    },
  });
}

export default useChangePassword;
