/**
 * User Profile API Service
 * Reference: API_DOCUMENTATION_COMPLETE.md - User Profile APIs
 */

import { apiClient } from '@lib/api/client';
import type { UserProfile } from '@shared/types';
import { logger } from '@shared/utils/logger';

/**
 * User Profile Service
 * Handles user profile-related API calls
 */
export class UserProfileService {
  /**
   * Get Current User Profile
   * GET /profile/me
   *
   * Retrieve authenticated user's profile.
   *
   * @returns User profile data
   *
   * @example
   * const profile = await userProfileService.getCurrentProfile();
   */
  async getCurrentProfile(): Promise<UserProfile> {
    try {
      logger.debug('[UserProfileService] Fetching current user profile');

      const profile = await apiClient.getUserProfile();

      logger.info('[UserProfileService] Profile fetched successfully', {
        userId: profile.id || profile.user_id,
      });

      return profile;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[UserProfileService] Failed to fetch profile', error);
      } else {
        logger.error('[UserProfileService] Failed to fetch profile');
      }
      throw error;
    }
  }

  /**
   * Update User Profile
   * PUT /profile/me
   *
   * Update authenticated user's profile.
   *
   * @param updates - Profile fields to update
   * @returns Updated profile data
   *
   * @example
   * const updated = await userProfileService.updateProfile({
   *   first_name: 'John',
   *   last_name: 'Doe',
   *   bio: 'Updated bio'
   * });
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      logger.debug('[UserProfileService] Updating user profile');

      const updated = await apiClient.updateUserProfile(updates);

      logger.info('[UserProfileService] Profile updated successfully');

      return updated;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[UserProfileService] Failed to update profile', error);
      } else {
        logger.error('[UserProfileService] Failed to update profile');
      }
      throw error;
    }
  }

  /**
   * Update Profile Preferences
   *
   * @param preferences - User preferences to update
   * @returns Updated profile
   */
  async updatePreferences(preferences: Record<string, unknown>): Promise<UserProfile> {
    try {
      logger.debug('[UserProfileService] Updating preferences');

      const updated = await apiClient.updateUserProfile({ preferences });

      logger.info('[UserProfileService] Preferences updated successfully');

      return updated;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[UserProfileService] Failed to update preferences', error);
      } else {
        logger.error('[UserProfileService] Failed to update preferences');
      }
      throw error;
    }
  }

  /**
   * Update Theme Preference
   *
   * @param theme - Theme preference (e.g., 'light', 'dark', 'system')
   * @returns Updated profile
   */
  async updateTheme(theme: string): Promise<UserProfile> {
    return this.updatePreferences({ theme });
  }

  /**
   * Update Language Preference
   *
   * @param language - Language code (e.g., 'en', 'es', 'fr')
   * @returns Updated profile
   */
  async updateLanguage(language: string): Promise<UserProfile> {
    return this.updatePreferences({ language });
  }

  /**
   * Update Notification Settings
   *
   * @param notifications - Notification preferences
   * @returns Updated profile
   */
  async updateNotifications(notifications: {
    enabledNotifications?: boolean;
    emailNotifications?: boolean;
  }): Promise<UserProfile> {
    return this.updatePreferences(notifications);
  }
}

export const userProfileService = new UserProfileService();

export default userProfileService;
