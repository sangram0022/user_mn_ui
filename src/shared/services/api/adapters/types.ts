/**
 * Type definitions for API adapters and response transformations
 */

import type {
  UserRole,
  UserSummary,
  RegisterResponse,
  UserProfile
} from '@shared/types';

/**
 * Standard success response wrapper
 */
export interface StandardResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Pagination information for list responses
 */
export interface PageInfo {
  skip: number;
  limit: number;
  has_more: boolean;
}

/**
 * Legacy user format with numeric ID
 */
export interface LegacyUser {
  id: number;
  email: string;
  username?: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  role: {
    id: number;
    name: string;
    description: string;
  };
  lifecycle_stage?: string;
  activity_score?: number;
  last_login_at?: string;
  created_at: string;
}

/**
 * Legacy users list response
 */
export interface LegacyUsersResponse {
  success: boolean;
  users: LegacyUser[];
  total: number;
  page_info: PageInfo;
}

/**
 * Legacy roles response
 */
export interface LegacyRolesResponse {
  success: boolean;
  roles: Array<Pick<UserRole, 'id' | 'name' | 'description' | 'permissions'>>;
}

/**
 * Generic action response (create, update, delete operations)
 */
export interface ActionResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

/**
 * Profile response wrapper
 */
export interface ProfileResponse {
  success: boolean;
  profile?: UserProfile;
  message?: string;
}

/**
 * Analytics response wrapper
 */
export interface AnalyticsResponse {
  success: boolean;
  data?: unknown;
  message?: string;
}

/**
 * Registration response wrapper
 */
export interface RegisterResponseWrapper {
  success: boolean;
  data?: RegisterResponse;
  message?: string;
  error?: string;
}

/**
 * Helper to build full name from parts
 */
export function buildFullName(summary: UserSummary): string | undefined {
  const parts = [summary.first_name, summary.last_name].filter(Boolean);
  if (parts.length === 0) {
    return summary.full_name ?? undefined;
  }
  return parts.join(' ');
}

/**
 * Convert UserSummary to LegacyUser format
 */
export function toLegacyUser(summary: UserSummary, index: number): LegacyUser {
  const numericId = Number(summary.user_id);
  const fallbackId = index + 1;
  
  return {
    id: Number.isFinite(numericId) ? numericId : fallbackId,
    email: summary.email,
    username: summary.username ?? summary.email?.split('@')[0],
    full_name: buildFullName(summary),
    is_active: summary.is_active,
    is_verified: summary.is_verified,
    role: {
      id: fallbackId,
      name: summary.role,
      description: summary.role
    },
    lifecycle_stage: undefined,
    activity_score: undefined,
    last_login_at: summary.last_login_at ?? undefined,
    created_at: summary.created_at
  };
}

/**
 * Resolve pagination info from query parameters
 */
export function resolvePageInfo(params?: Record<string, unknown>): PageInfo {
  const skip = typeof params?.skip === 'number'
    ? params.skip
    : Number(params?.skip ?? 0);
  const limit = typeof params?.limit === 'number'
    ? params.limit
    : Number(params?.limit ?? 25);
  
  return {
    skip,
    limit,
    has_more: false
  };
}

/**
 * Create a standard success response
 */
export function createSuccessResponse<T>(data?: T, message?: string): StandardResponse<T> {
  return {
    success: true,
    data,
    message
  };
}

/**
 * Create a standard error response
 */
export function createErrorResponse(message: string): StandardResponse {
  return {
    success: false,
    error: message,
    message
  };
}

/**
 * @deprecated Legacy adapter types removed.
 */
export {};
