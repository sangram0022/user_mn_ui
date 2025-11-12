// ========================================
// Profile Hooks
// Production-ready React hooks for profile operations
// Migrated to useApiModern pattern for consistency
// Follows SOLID principles and Clean Code practices
// ========================================

import { useApiQuery, useApiMutation } from '@/shared/hooks/useApiModern';
import { apiGet, apiPut } from '@/core/api/apiHelpers';
import { API_PREFIXES } from '@/services/api/common';
import type {
  UserProfile,
  UpdateProfileRequest,
} from '../types/profile.types';
import { APIError } from '@/core/error';
import { ValidationBuilder } from '@/core/validation';

const API_PREFIX = API_PREFIXES.PROFILE;

// ========================================
// Query Keys
// ========================================

const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
};

// ========================================
// useProfile Hook
// GET /api/v1/users/profile/me
// Fetches and manages user profile state
// ========================================

export function useProfile(options?: { enabled?: boolean }) {
  return useApiQuery(
    profileKeys.detail(),
    () => apiGet<UserProfile>(`${API_PREFIX}/me`),
    {
      enabled: options?.enabled !== false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      errorToast: true,
    }
  );
}

// ========================================
// useUpdateProfile Hook
// PUT /api/v1/users/profile/me
// Handles profile updates with validation
// ========================================

export function useUpdateProfile() {
  return useApiMutation(
    async (data: UpdateProfileRequest): Promise<UserProfile> => {
      // Client-side validation using centralized ValidationBuilder
      const builder = new ValidationBuilder();

      if (data.first_name !== undefined) {
        builder.validateField('first_name', data.first_name, (b) => 
          b.required().name()
        );
      }

      if (data.last_name !== undefined) {
        builder.validateField('last_name', data.last_name, (b) => 
          b.required().name()
        );
      }

      if (data.phone_number !== undefined) {
        builder.validateField('phone_number', data.phone_number, (b) => 
          b.required().phone()
        );
      }

      const validationResult = builder.result();

      if (!validationResult.isValid) {
        // Convert ValidationResult to error message
        const errors: string[] = [];
        if (validationResult.fields) {
          Object.entries(validationResult.fields).forEach(([field, result]) => {
            if (!result.isValid) {
              errors.push(`${field}: ${result.errors.join('. ')}`);
            }
          });
        }
        
        throw new APIError(
          errors.join('; ') || 'Validation failed',
          400,
          'PUT',
          '/profile',
          { validationErrors: validationResult.fields }
        );
      }

      // Call API
      const response = await apiPut<UserProfile>(`${API_PREFIX}/me`, data);
      return response;
    },
    {
      successMessage: 'Profile updated successfully',
      errorToast: true,
      queryKeyToUpdate: profileKeys.all,
    }
  );
}

// ========================================
// useProfileWithUpdate Hook
// Combined hook for fetching and updating profile
// Uses useApiModern pattern for consistency
// ========================================

export function useProfileWithUpdate(options?: { enabled?: boolean }) {
  const profileQuery = useProfile(options);
  const updateMutation = useUpdateProfile();

  return {
    // Query data
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading || updateMutation.isPending,
    error: updateMutation.error || profileQuery.error,
    
    // Query methods
    refetch: profileQuery.refetch,
    
    // Mutation methods
    updateProfile: updateMutation.mutate,
    updateProfileAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
  };
}
