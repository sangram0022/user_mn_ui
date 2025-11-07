/**
 * Common API utilities and constants
 * Single Source of Truth for API prefixes, response unwrapping, and error handling
 */

// Re-export APIError from core for centralized import
export { APIError } from '@/core/error';

/**
 * Centralized API prefixes - Single Source of Truth
 * All service files MUST import from here instead of hardcoding strings
 */
export const API_PREFIXES = {
  AUTH: '/api/v1/auth',
  ADMIN: '/api/v1/admin',
  ADMIN_USERS: '/api/v1/admin/users',
  ADMIN_RBAC: '/api/v1/admin/rbac',
  ADMIN_AUDIT: '/api/v1/admin/audit-logs',
  ADMIN_EXPORT: '/api/v1/admin/export',
  PROFILE: '/api/v1/users/profile',
} as const;

/**
 * Type-safe API prefix keys
 */
export type ApiPrefixKey = keyof typeof API_PREFIXES;

/**
 * Standard API response wrapper from backend
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

/**
 * Unwraps the standard API response format
 * Single Source of Truth for response unwrapping logic
 * 
 * @template T - The expected data type
 * @param response - The API response to unwrap
 * @returns The unwrapped data
 * @throws {APIError} If response is invalid or contains error
 * 
 * @example
 * ```typescript
 * const response = await apiClient.get('/api/v1/users');
 * const users = unwrapResponse<User[]>(response.data);
 * ```
 */
export function unwrapResponse<T>(response: unknown): T {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response format');
  }

  const apiResponse = response as ApiResponse<T>;

  if (!apiResponse.success || apiResponse.error) {
    throw new Error(apiResponse.error || 'Request failed');
  }

  return apiResponse.data;
}
