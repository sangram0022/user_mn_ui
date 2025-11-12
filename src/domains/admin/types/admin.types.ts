/**
 * Admin Domain - Core Type Definitions
 * SINGLE SOURCE OF TRUTH for admin-related types
 * 
 * All types extracted from ADMIN_API_DOCUMENTATION.md
 * Aligned with backend validation patterns
 */

// Re-export shared types from SSOT
export type {
  ApiResponse,
  PaginationParams,
  PaginationMeta,
  PaginatedResponse,
  PaginatedApiResponse,
  SortOrder,
  SortOptions,
  SearchOptions,
  ExportFormat,
  UserStatus,
  RoleLevel,
} from '@/shared/types';

// ============================================================================
// Admin-specific Enums
// ============================================================================

export type AccountType = 'regular' | 'premium' | 'trial';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ActionResult = 'success' | 'failed' | 'partial';
export type TimePeriod = '24h' | '7d' | '30d' | '90d' | '1y' | 'all';

// ============================================================================
// Pagination Types (Admin-specific extensions)
// ============================================================================

/**
 * @deprecated Use PaginationMeta from @/shared/types instead
 * Kept for backward compatibility, will be removed in future
 */
export interface PaginationInfo {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// ============================================================================
// Error Types (Admin-specific)
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export interface ValidationError extends ApiError {
  validation_errors: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

// ============================================================================
// Common Request Options
// ============================================================================

export interface RequestOptions {
  signal?: AbortSignal;
  timeout?: number;
  headers?: Record<string, string>;
}

// ============================================================================
// Error Code Constants
// ============================================================================

export const ERROR_CODES = {
  // Authentication
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Authorization
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ROLE_REQUIRED: 'ROLE_REQUIRED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // User
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  USERNAME_ALREADY_EXISTS: 'USERNAME_ALREADY_EXISTS',
  CANNOT_DELETE_SELF: 'CANNOT_DELETE_SELF',
  CANNOT_DELETE_ADMIN: 'CANNOT_DELETE_ADMIN',
  USER_ALREADY_APPROVED: 'USER_ALREADY_APPROVED',
  USER_ALREADY_PROCESSED: 'USER_ALREADY_PROCESSED',
  
  // Role
  ROLE_NOT_FOUND: 'ROLE_NOT_FOUND',
  ROLE_ALREADY_EXISTS: 'ROLE_ALREADY_EXISTS',
  INVALID_ROLE: 'INVALID_ROLE',
  CANNOT_MODIFY_SYSTEM_ROLE: 'CANNOT_MODIFY_SYSTEM_ROLE',
  CANNOT_DELETE_SYSTEM_ROLE: 'CANNOT_DELETE_SYSTEM_ROLE',
  ROLE_IN_USE: 'ROLE_IN_USE',
  INVALID_ROLE_LEVEL: 'INVALID_ROLE_LEVEL',
  INVALID_PERMISSIONS: 'INVALID_PERMISSIONS',
  INVALID_RESOURCE: 'INVALID_RESOURCE',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  INVALID_PHONE_NUMBER: 'INVALID_PHONE_NUMBER',
  INVALID_DATE: 'INVALID_DATE',
  MISSING_REJECTION_REASON: 'MISSING_REJECTION_REASON',
  
  // Operations
  CREATION_FAILED: 'CREATION_FAILED',
  UPDATE_FAILED: 'UPDATE_FAILED',
  DELETION_FAILED: 'DELETION_FAILED',
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
  
  // Other
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  INVALID_PERIOD: 'INVALID_PERIOD',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// ============================================================================
// HTTP Status Constants
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

// ============================================================================
// API Endpoint Constants
// ============================================================================

export const API_ENDPOINTS = {
  // User Management
  LIST_USERS: '/api/v1/admin/users',
  CREATE_USER: '/api/v1/admin/users',
  GET_USER: '/api/v1/admin/users/:user_id',
  UPDATE_USER: '/api/v1/admin/users/:user_id',
  DELETE_USER: '/api/v1/admin/users/:user_id',
  
  // User Approval
  APPROVE_USER: '/api/v1/admin/users/:user_id/approve',
  REJECT_USER: '/api/v1/admin/users/:user_id/reject',
  
  // Role Management
  LIST_ROLES: '/api/v1/admin/rbac/roles',
  GET_ROLE: '/api/v1/admin/rbac/roles/:role_name',
  CREATE_ROLE: '/api/v1/admin/rbac/roles',
  UPDATE_ROLE: '/api/v1/admin/rbac/roles/:role_name',
  DELETE_ROLE: '/api/v1/admin/rbac/roles/:role_name',
  ASSIGN_ROLES: '/api/v1/admin/users/:user_id/roles',
  
  // Analytics
  ADMIN_STATS: '/api/v1/admin/stats',
  GROWTH_ANALYTICS: '/api/v1/admin/analytics/growth',
  
  // Audit Logs
  AUDIT_LOGS: '/api/v1/admin/audit-logs',
  EXPORT_AUDIT_LOGS: '/api/v1/admin/audit-logs/export',
} as const;

// ============================================================================
// Role Hierarchy Constants
// ============================================================================

export const ROLE_HIERARCHY = {
  admin: 100,
  manager: 50,
  auditor: 25,
  user: 10,
} as const;

export const SYSTEM_ROLES = ['admin', 'user'] as const;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Helper type to replace path parameters in endpoint strings
 * Example: ReplacePathParams<'/users/:id', { id: string }> = '/users/123'
 */
export type ReplacePathParams<
  Path extends string,
  Params extends Record<string, string | number>
> = Path extends `${infer Before}:${infer Param}/${infer After}`
  ? `${Before}${Params[Param]}/${ReplacePathParams<After, Params>}`
  : Path extends `${infer Before}:${infer Param}`
  ? `${Before}${Params[Param]}`
  : Path;

/**
 * Make specified properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specified properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

