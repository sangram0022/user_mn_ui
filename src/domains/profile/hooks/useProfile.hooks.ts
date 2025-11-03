// ========================================
// Profile Hooks
// Production-ready React hooks for profile operations
// Follows SOLID principles and Clean Code practices
// ========================================

import { useState, useEffect } from 'react';
import profileService from '../services/profileService';
import type {
  UserProfile,
  UpdateProfileRequest,
} from '../types/profile.types';
import { extractErrorDetails, type ErrorDetails } from '../../auth/utils/error.utils';
import {
  validateName,
  validatePhoneNumber,
  validateAvatarUrl,
  validateForm,
} from '../../auth/utils/validation.utils';

// ========================================
// useProfile Hook
// Fetches and manages user profile state
// ========================================

export function useProfile(autoLoad: boolean = true) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorDetails | null>(null);

  const getProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await profileService.getProfile();
      setProfile(response);
      return { success: true, data: response };
    } catch (err) {
      const errorDetails = extractErrorDetails(err);
      setError(errorDetails);
      return { success: false, error: errorDetails };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      getProfile();
    }
  }, [autoLoad]);

  return {
    profile,
    loading,
    error,
    getProfile,
    refetch: getProfile,
  };
}

// ========================================
// useUpdateProfile Hook
// Handles profile updates with validation
// ========================================

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);

  const updateProfile = async (data: UpdateProfileRequest) => {
    setLoading(true);
    setError(null);
    setFieldErrors(null);

    try {
      // Client-side validation
      const validations: Record<string, ReturnType<typeof validateName>> = {};

      if (data.first_name !== undefined) {
        validations.first_name = validateName(data.first_name, 'First name');
      }

      if (data.last_name !== undefined) {
        validations.last_name = validateName(data.last_name, 'Last name');
      }

      if (data.phone_number !== undefined) {
        validations.phone_number = validatePhoneNumber(data.phone_number);
      }

      if (data.avatar_url !== undefined) {
        validations.avatar_url = validateAvatarUrl(data.avatar_url);
      }

      const validationResult = validateForm(validations);

      if (!validationResult.isValid) {
        const errors: Record<string, string> = {};
        Object.entries(validationResult.fieldErrors).forEach(([field, errorMessages]) => {
          errors[field] = errorMessages.join('\n');
        });
        
        setFieldErrors(errors);
        setError({ message: 'Please check your input' });
        return { success: false, fieldErrors: errors };
      }

      // Call API
      const response = await profileService.updateProfile(data);
      
      setLoading(false);
      return { success: true, data: response };
    } catch (err) {
      const errorDetails = extractErrorDetails(err);
      setError(errorDetails);
      setFieldErrors(errorDetails.fieldErrors || null);
      setLoading(false);
      return { success: false, error: errorDetails };
    }
  };

  return {
    loading,
    error,
    fieldErrors,
    updateProfile,
  };
}

// ========================================
// useProfileWithUpdate Hook
// Combined hook for fetching and updating profile
// ========================================

export function useProfileWithUpdate(autoLoad: boolean = true) {
  const {
    profile,
    loading: fetchLoading,
    error: fetchError,
    getProfile,
  } = useProfile(autoLoad);

  const {
    loading: updateLoading,
    error: updateError,
    fieldErrors,
    updateProfile: updateProfileFn,
  } = useUpdateProfile();

  const updateProfile = async (data: UpdateProfileRequest) => {
    const result = await updateProfileFn(data);
    
    if (result.success) {
      // Refresh profile after successful update
      await getProfile();
    }
    
    return result;
  };

  return {
    profile,
    loading: fetchLoading || updateLoading,
    error: updateError || fetchError,
    fieldErrors,
    getProfile,
    updateProfile,
    refetch: getProfile,
  };
}
