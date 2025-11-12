// ========================================
// Profile Types
// Complete type definitions matching backend API v1.0.0
// ========================================

/**
 * User Preferences Object
 * Stores user-specific settings
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: boolean;
  [key: string]: unknown;
}

/**
 * User Metadata Object
 * Additional flexible user data
 */
export interface UserMetadata {
  [key: string]: unknown;
}

/**
 * Complete User Profile
 * Matches GET /api/v1/users/profile/me response exactly
 */
export interface UserProfile {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  status: 'active' | 'inactive' | 'suspended';
  is_verified: boolean;
  created_at: string;
  last_login: string | null;
  updated_at: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  preferences: UserPreferences | null;
  metadata: UserMetadata | null;
  profile_data: Record<string, unknown> | null;
}

/**
 * PUT /api/v1/users/profile/me - Update profile request
 * All fields are optional (partial update)
 */
export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  avatar_url?: string;
  preferences?: UserPreferences;
  metadata?: UserMetadata;
  profile_data?: Record<string, unknown>;
}

/**
 * GET /api/v1/users/profile/me - Get profile response
 * Returns the profile directly (not wrapped in ApiResponse)
 */
export type GetProfileResponse = UserProfile;

/**
 * PUT /api/v1/users/profile/me - Update profile response
 * Returns the updated profile directly (not wrapped in ApiResponse)
 */
export type UpdateProfileResponse = UserProfile;

// ========================================
// Validation Rules (matching backend)
// ========================================

export const PROFILE_VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s'-]+$/,
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
    PATTERN: /^\+?[1-9]\d{9,14}$/,
  },
  AVATAR_URL: {
    PATTERN: /^https?:\/\/.+/,
    // XSS-safe: Must be http:// or https://, no javascript: or data:
    XSS_SAFE: /^https?:\/\/[^\s<>'"]+$/,
  },
} as const;
