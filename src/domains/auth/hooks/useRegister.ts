// ========================================
// useRegister Hook
// POST /api/v1/auth/register
// ========================================

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import authService from '../services/authService';
import type { RegisterRequest, RegisterResponse } from '../types/auth.types';

interface UseRegisterOptions {
  onSuccess?: (data: RegisterResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Register mutation hook
 * Creates new user account and sends verification email
 */
export const useRegister = (
  options?: UseRegisterOptions
): UseMutationResult<RegisterResponse, Error, RegisterRequest> => {
  return useMutation({
    mutationFn: authService.register,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export default useRegister;

