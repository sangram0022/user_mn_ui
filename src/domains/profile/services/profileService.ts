// ========================================
// Profile Service
// All API calls for user profile management
// Implements SOLID principles with clean separation of concerns
// ========================================

import { apiClient } from '../../../services/api/apiClient';
import { API_PREFIXES, unwrapResponse } from '../../../services/api/common';
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
  const response = await apiClient.get<GetProfileResponse>(`${API_PREFIX}/me`);
  return response.data;
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
  const response = await apiClient.put<UpdateProfileResponse>(`${API_PREFIX}/me`, data);
  return unwrapResponse<UpdateProfileResponse>(response.data);
};

// Export all as default object
const profileService = {
  getProfile,
  updateProfile,
};

export default profileService;
