/**
 * Profile management adapter functions
 * Provides backward-compatible API wrappers for profile operations
 */

import baseApiClient from '../apiClient';
import type { UserProfile } from '../../types';
import type { ProfileResponse, ActionResponse } from './types';
import { createSuccessResponse } from './types';

/**
 * Get current user profile
 */
export async function getProfile(): Promise<ProfileResponse> {
  const profile = await baseApiClient.getUserProfile();
  
  return {
    success: true,
    profile
  };
}

/**
 * Update current user profile
 */
export async function updateProfile(
  payload: Partial<UserProfile>
): Promise<ActionResponse> {
  const updatedProfile = await baseApiClient.updateUserProfile(payload);
  
  return createSuccessResponse(updatedProfile, 'Profile updated successfully.');
}
