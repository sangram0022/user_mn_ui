/**
 * User Data Transformers
 * Transforms API responses (snake_case) to frontend models (camelCase)
 * and adds computed properties for UI convenience
 * 
 * Purpose: Decouple API response shape from UI requirements
 * 
 * @example
 * const apiUser = { user_id: '123', first_name: 'John', last_name: 'Doe' };
 * const uiUser = transformUser(apiUser);
 * // { userId: '123', firstName: 'John', lastName: 'Doe', fullName: 'John Doe' }
 */

import type { User as ApiUser } from '@/domains/auth/types/auth.types';
import type { UserProfile as ApiUserProfile } from '@/domains/users/services/userService';

// ============================================================================
// Frontend UI Models (camelCase with computed properties)
// ============================================================================

export interface UserUI {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isActive: boolean;
  isVerified: boolean;
  createdAt?: string;
  lastLogin?: string | null;
  updatedAt?: string | null;
  status?: 'active' | 'inactive' | 'suspended';
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  username?: string;
  
  // Computed properties for UI convenience
  fullName: string;
  initials: string;
  displayName: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasRole: (role: string) => boolean;
  statusColor: 'success' | 'error' | 'warning' | 'default';
}

export interface UserProfileUI extends UserUI {
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  profilePictureUrl?: string;
  bio?: string;
  lastLoginAt?: string;
  
  // Computed properties
  age?: number;
  memberSince: string;
  accountAge: string;
}

// ============================================================================
// Transform Functions
// ============================================================================

/**
 * Transform API User to UI User model
 * Converts snake_case to camelCase and adds computed properties
 * 
 * @param apiUser - User object from API (snake_case)
 * @returns UI-friendly user object with computed properties
 */
export function transformUser(apiUser: ApiUser): UserUI {
  const fullName = `${apiUser.first_name} ${apiUser.last_name}`.trim();
  const initials = `${apiUser.first_name.charAt(0)}${apiUser.last_name.charAt(0)}`.toUpperCase();
  const displayName = apiUser.username || fullName || apiUser.email.split('@')[0];
  
  const roles = apiUser.roles || [];
  const isAdmin = roles.includes('admin');
  const isSuperAdmin = roles.includes('super_admin');
  
  const hasRole = (role: string): boolean => roles.includes(role);
  
  const statusColor: 'success' | 'error' | 'warning' | 'default' = 
    apiUser.status === 'active' 
      ? 'success' 
      : apiUser.status === 'suspended' 
        ? 'error' 
        : apiUser.status === 'inactive' 
          ? 'warning' 
          : 'default';
  
  return {
    userId: apiUser.user_id,
    email: apiUser.email,
    firstName: apiUser.first_name,
    lastName: apiUser.last_name,
    roles: apiUser.roles,
    isActive: apiUser.is_active,
    isVerified: apiUser.is_verified,
    createdAt: apiUser.created_at,
    lastLogin: apiUser.last_login,
    updatedAt: apiUser.updated_at,
    status: apiUser.status,
    phoneNumber: apiUser.phone_number,
    avatarUrl: apiUser.avatar_url,
    username: apiUser.username,
    
    // Computed properties
    fullName,
    initials,
    displayName,
    isAdmin,
    isSuperAdmin,
    hasRole,
    statusColor,
  };
}

/**
 * Transform API UserProfile to UI UserProfile model
 * Extends transformUser with profile-specific properties
 * 
 * @param apiProfile - UserProfile object from API (snake_case)
 * @returns UI-friendly profile object with computed properties
 */
export function transformUserProfile(apiProfile: ApiUserProfile): UserProfileUI {
  const baseUser = transformUser({
    user_id: apiProfile.user_id,
    email: apiProfile.email,
    first_name: apiProfile.first_name,
    last_name: apiProfile.last_name,
    roles: apiProfile.roles,
    is_active: apiProfile.is_active,
    is_verified: apiProfile.is_verified,
    created_at: apiProfile.created_at,
    last_login: apiProfile.last_login_at,
    updated_at: apiProfile.updated_at,
    phone_number: apiProfile.phone_number,
    avatar_url: apiProfile.profile_picture_url,
    username: apiProfile.username,
  });
  
  // Compute age from date_of_birth
  let age: number | undefined;
  if (apiProfile.date_of_birth) {
    const birthDate = new Date(apiProfile.date_of_birth);
    const today = new Date();
    age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  }
  
  // Compute member since (formatted date)
  const memberSince = apiProfile.created_at 
    ? new Date(apiProfile.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Unknown';
  
  // Compute account age (human-readable duration)
  const accountAge = apiProfile.created_at 
    ? getAccountAge(apiProfile.created_at)
    : 'Unknown';
  
  return {
    ...baseUser,
    dateOfBirth: apiProfile.date_of_birth,
    gender: apiProfile.gender,
    profilePictureUrl: apiProfile.profile_picture_url,
    bio: apiProfile.bio,
    lastLoginAt: apiProfile.last_login_at,
    
    // Computed properties
    age,
    memberSince,
    accountAge,
  };
}

/**
 * Transform array of API users to UI users
 * 
 * @param apiUsers - Array of user objects from API
 * @returns Array of UI-friendly user objects
 */
export function transformUsers(apiUsers: ApiUser[]): UserUI[] {
  return apiUsers.map(transformUser);
}

/**
 * Transform array of API user profiles to UI profiles
 * 
 * @param apiProfiles - Array of user profile objects from API
 * @returns Array of UI-friendly profile objects
 */
export function transformUserProfiles(apiProfiles: ApiUserProfile[]): UserProfileUI[] {
  return apiProfiles.map(transformUserProfile);
}

// ============================================================================
// Reverse Transformers (UI to API for updates)
// ============================================================================

/**
 * Transform UI user update data to API format
 * Converts camelCase to snake_case for API requests
 * 
 * @param uiData - Update data from UI (camelCase)
 * @returns API-compatible update data (snake_case)
 */
export function transformUserUpdateToApi(uiData: Partial<{
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bio: string;
}>): Record<string, unknown> {
  const apiData: Record<string, unknown> = {};
  
  if (uiData.firstName !== undefined) apiData.first_name = uiData.firstName;
  if (uiData.lastName !== undefined) apiData.last_name = uiData.lastName;
  if (uiData.username !== undefined) apiData.username = uiData.username;
  if (uiData.phoneNumber !== undefined) apiData.phone_number = uiData.phoneNumber;
  if (uiData.dateOfBirth !== undefined) apiData.date_of_birth = uiData.dateOfBirth;
  if (uiData.gender !== undefined) apiData.gender = uiData.gender;
  if (uiData.bio !== undefined) apiData.bio = uiData.bio;
  
  return apiData;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate human-readable account age from creation date
 * 
 * @param createdAt - ISO 8601 date string
 * @returns Human-readable duration (e.g., "2 years", "3 months", "5 days")
 */
function getAccountAge(createdAt: string): string {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 1) return 'Less than a day';
  if (diffDays === 1) return '1 day';
  if (diffDays < 30) return `${diffDays} days`;
  
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1 month';
  if (diffMonths < 12) return `${diffMonths} months`;
  
  const diffYears = Math.floor(diffMonths / 12);
  const remainingMonths = diffMonths % 12;
  
  if (diffYears === 1 && remainingMonths === 0) return '1 year';
  if (diffYears === 1) return `1 year, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  if (remainingMonths === 0) return `${diffYears} years`;
  
  return `${diffYears} years, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
}

