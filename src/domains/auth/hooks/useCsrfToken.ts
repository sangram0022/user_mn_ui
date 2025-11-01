// ========================================
// useCsrfToken Hook
// GET /api/v1/auth/csrf-token
// ========================================

import { useQuery, useMutation, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import { queryKeys } from '../../../services/api/queryClient';
import tokenService from '../services/tokenService';
import type { CsrfTokenResponse, ValidateCsrfRequest, ValidateCsrfResponse } from '../types/token.types';

/**
 * Get CSRF token query hook
 */
export function useCsrfToken(): UseQueryResult<CsrfTokenResponse, Error> {
  return useQuery({
    queryKey: queryKeys.auth.csrfToken(),
    queryFn: tokenService.getCsrfToken,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

interface UseValidateCsrfOptions {
  onSuccess?: (data: ValidateCsrfResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Validate CSRF token mutation hook
 */
export function useValidateCsrfToken(
  options?: UseValidateCsrfOptions
): UseMutationResult<ValidateCsrfResponse, Error, ValidateCsrfRequest> {
  return useMutation({
    mutationFn: tokenService.validateCsrfToken,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}

export default { useCsrfToken, useValidateCsrfToken };
