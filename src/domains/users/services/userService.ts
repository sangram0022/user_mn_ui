/**
 * User Management Service
 * API calls for user operations (non-admin)
 * 
 * Endpoints implemented:
 * - GET    /api/v1/users/me (get current user profile)
 * - PUT    /api/v1/users/me (update current user profile)
 * - DELETE /api/v1/users/me (delete current user account)
 * - GET    /api/v1/users/:id (get user by ID - if permitted)
 * - PUT    /api/v1/users/:id/profile-picture (upload profile picture)
 * - PUT    /api/v1/users/:id/password (change password)
 * 
 * Following patterns from authService.ts and adminService.ts:
 * - Uses apiClient for HTTP requests
 * - Implements unwrapResponse for consistent response handling
 * - Comprehensive error handling
 * - Type-safe with TypeScript
 */

import { apiClient } from '@/services/api/apiClient';
import { unwrapResponse } from '@/services/api/common';

// API prefix for user endpoints
const API_PREFIX = '/api/v1/users';

// ============================================================================
// Type Definitions (inline until user.types.ts is populated)
// ============================================================================

export interface UserProfile {
  user_id: string;
  email: string;
  username?: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  profile_picture_url?: string;
  bio?: string;
  roles: string[];
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  username?: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bio?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  data: UserProfile;
  message: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface DeleteAccountRequest {
  password: string;
  reason?: string;
  confirm: boolean;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
  deleted_at: string;
}

export interface UploadProfilePictureResponse {
  success: boolean;
  profile_picture_url: string;
  message: string;
}

// ============================================================================
// Current User Endpoints
// ============================================================================

/**
 * GET /api/v1/users/me
 * Get current user's profile
 */
export const getCurrentUser = async (): Promise<UserProfile> => {
  const response = await apiClient.get<{ success: boolean; data: UserProfile }>(
    `${API_PREFIX}/me`
  );
  return unwrapResponse<UserProfile>(response.data);
};

/**
 * PUT /api/v1/users/me
 * Update current user's profile
 */
export const updateCurrentUserProfile = async (
  data: UpdateProfileRequest
): Promise<UserProfile> => {
  const response = await apiClient.put<UpdateProfileResponse>(`${API_PREFIX}/me`, data);
  return unwrapResponse<UserProfile>(response.data);
};

/**
 * DELETE /api/v1/users/me
 * Delete current user's account (soft delete)
 */
export const deleteCurrentUserAccount = async (
  data: DeleteAccountRequest
): Promise<DeleteAccountResponse> => {
  const response = await apiClient.delete<DeleteAccountResponse>(`${API_PREFIX}/me`, {
    data,
  });
  return unwrapResponse<DeleteAccountResponse>(response.data);
};

// ============================================================================
// User Profile Management
// ============================================================================

/**
 * GET /api/v1/users/:id
 * Get user profile by ID (if permitted)
 */
export const getUserById = async (userId: string): Promise<UserProfile> => {
  const response = await apiClient.get<{ success: boolean; data: UserProfile }>(
    `${API_PREFIX}/${userId}`
  );
  return unwrapResponse<UserProfile>(response.data);
};

/**
 * PUT /api/v1/users/:id/password
 * Change user password
 */
export const changePassword = async (
  userId: string,
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  const response = await apiClient.put<ChangePasswordResponse>(
    `${API_PREFIX}/${userId}/password`,
    data
  );
  return unwrapResponse<ChangePasswordResponse>(response.data);
};

/**
 * PUT /api/v1/users/me/password
 * Change current user's password (convenience method)
 */
export const changeCurrentUserPassword = async (
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> => {
  const response = await apiClient.put<ChangePasswordResponse>(
    `${API_PREFIX}/me/password`,
    data
  );
  return unwrapResponse<ChangePasswordResponse>(response.data);
};

/**
 * POST /api/v1/users/:id/profile-picture
 * Upload profile picture
 */
export const uploadProfilePicture = async (
  userId: string,
  file: File
): Promise<UploadProfilePictureResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<UploadProfilePictureResponse>(
    `${API_PREFIX}/${userId}/profile-picture`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return unwrapResponse<UploadProfilePictureResponse>(response.data);
};

/**
 * POST /api/v1/users/me/profile-picture
 * Upload current user's profile picture (convenience method)
 */
export const uploadCurrentUserProfilePicture = async (
  file: File
): Promise<UploadProfilePictureResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<UploadProfilePictureResponse>(
    `${API_PREFIX}/me/profile-picture`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return unwrapResponse<UploadProfilePictureResponse>(response.data);
};

/**
 * DELETE /api/v1/users/:id/profile-picture
 * Delete profile picture
 */
export const deleteProfilePicture = async (userId: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete<{ success: boolean; message: string }>(
    `${API_PREFIX}/${userId}/profile-picture`
  );
  return unwrapResponse<{ success: boolean; message: string }>(response.data);
};

// ============================================================================
// Export all as default object
// ============================================================================

const userService = {
  getCurrentUser,
  updateCurrentUserProfile,
  deleteCurrentUserAccount,
  getUserById,
  changePassword,
  changeCurrentUserPassword,
  uploadProfilePicture,
  uploadCurrentUserProfilePicture,
  deleteProfilePicture,
};

export default userService;
