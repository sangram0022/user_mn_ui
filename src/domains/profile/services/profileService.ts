// ========================================
// Profile Service
// All API calls for user profile management
// Implements SOLID principles with clean separation of concerns
// ========================================

import { apiGet, apiPut } from '@/core/api/apiHelpers';
import { API_PREFIXES } from '@/services/api/common';
import type {
  GetProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '../types/profile.types';

const API_PREFIX = API_PREFIXES.PROFILE;

/**
 * GET /api/v1/users/profile/me
 * Get current authenticated user's profile
 * Alternative endpoints: /api/v1/users/profile, /api/v1/users/profile/
 */
export const getProfile = async (): Promise<GetProfileResponse> => {
  return apiGet<GetProfileResponse>(`${API_PREFIX}/me`);
};

/**
 * PUT /api/v1/users/profile/me
 * Update current authenticated user's profile
 * Alternative endpoints: /api/v1/users/profile, /api/v1/users/profile/
 * 
 * @param data - Partial profile update (all fields optional)
 * @returns Updated profile
 */
export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  return apiPut<UpdateProfileResponse>(`${API_PREFIX}/me`, data);
};

// Export all as default object
const profileService = {
  getProfile,
  updateProfile,
};

export default profileService;
