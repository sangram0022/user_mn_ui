/**
 * Core API Module
 * SINGLE SOURCE OF TRUTH for API types, utilities, and constants
 * 
 * All API-related imports should come from this module:
 * 
 * @example
 * ```typescript
 * import { ApiResponse, ApiError, API_PREFIXES, unwrapResponse } from '@/core/api';
 * ```
 */

// ========================================
// Re-export Types
// ========================================

export type {
  ApiResponse,
  ValidationErrorResponse,
  ErrorResponse,
  FieldErrors,
  PaginatedResponse,
  PaginationMeta,
  PaginatedApiResponse,
  PaginationParams,
  SortParams,
  FilterParams,
  ListQueryParams,
  UnwrapApiResponse,
  DeepPartial,
} from './types';

// ========================================
// Re-export Type Guards
// ========================================

export {
  isSuccessResponse,
  isValidationError,
  isErrorResponse,
} from './types';

// ========================================
// Re-export Error Class
// ========================================

export { APIError } from '@/core/error';

// ========================================
// API Prefixes - Single Source of Truth
// ========================================

/**
 * Centralized API prefixes
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
