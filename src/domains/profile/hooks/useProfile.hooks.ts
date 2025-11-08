// ========================================
// Profile Hooks
// Production-ready React hooks for profile operations
// Migrated to TanStack Query for consistency
// Follows SOLID principles and Clean Code practices
// ========================================

import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import profileService from '../services/profileService';
import type {
  UserProfile,
  UpdateProfileRequest,
} from '../types/profile.types';
import { APIError } from '@/core/error';
import { ValidationBuilder } from '@/core/validation';

// ========================================
// Query Keys
// ========================================

const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
};

// ========================================
// useProfile Hook
// Fetches and manages user profile state with TanStack Query
// ========================================

export function useProfile(options?: { enabled?: boolean }): UseQueryResult<UserProfile, APIError> {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: async () => {
      const response = await profileService.getProfile();
      return response;
    },
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ========================================
// useUpdateProfile Hook
// Handles profile updates with validation and TanStack Query
// ========================================

export function useUpdateProfile(): UseMutationResult<UserProfile, APIError, UpdateProfileRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
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
      const response = await profileService.updateProfile(data);
      return response;
    },
    onSuccess: (updatedProfile) => {
      // Update cache with new profile data
      queryClient.setQueryData(profileKeys.detail(), updatedProfile);
      
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

// ========================================
// useProfileWithUpdate Hook
// Combined hook for fetching and updating profile
// Now uses TanStack Query for both operations
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
