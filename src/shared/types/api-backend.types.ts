/**
 * Backend API Type Definitions
 *
 * Complete type definitions matching backend API documentation 100%
 * Reference: backend_api_details/*.md
 *
 * @version 1.0.0
 * @date 2025-10-19
 */

// ============================================================================
// AUTHENTICATION MODELS
// ============================================================================

export interface LoginRequest {
  email: string; // Valid email, max 255 chars
  password: string; // Min 8 chars
}

export interface LoginResponse {
  access_token: string; // JWT access token (30 min expiry)
  token_type: 'bearer';
  expires_in: number; // Token expiry in seconds (1800 = 30 min)
  refresh_token: string; // JWT refresh token (30 days expiry)
  user: {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    roles: string[];
    is_verified: boolean;
    is_active: boolean;
  };
  issued_at?: string;
}

// Secure login response (httpOnly cookies - no tokens in body)
export interface SecureLoginResponse {
  message: string;
  user: {
    user_id: string;
    email: string;
    roles: string[];
    last_login_at: string | null;
    first_name?: string;
    last_name?: string;
    is_verified?: boolean;
    is_active?: boolean;
  };
}

export interface RegisterRequest {
  email: string; // Valid email, unique, max 255 chars
  password: string; // Min 8 chars, 1 uppercase, 1 lowercase, 1 digit
  first_name: string; // 1-100 chars, letters only
  last_name: string; // 1-100 chars, letters only
}

export interface RegisterResponse {
  user_id: string;
  email: string;
  message: string;
  verification_required: boolean;
  approval_required: boolean;
}

export interface VerifyEmailRequest {
  token: string; // Min 10 chars
}

export interface VerifyEmailResponse {
  message: string;
  verified_at: string; // ISO 8601
  user_id: string | null;
  approval_required: boolean;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
  email: string;
  resent_at: string; // ISO 8601
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  email: string;
}

export interface ResetPasswordRequest {
  token: string; // Min 10 chars
  new_password: string; // Min 8 chars, 1 uppercase, 1 lowercase, 1 digit
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string; // Min 8 chars, 1 uppercase, 1 lowercase, 1 digit
}

export interface ChangePasswordResponse {
  message: string;
  changed_at: string; // ISO 8601
}

export interface LogoutResponse {
  message: string;
  logged_out_at: string; // ISO 8601
}

// Refresh token response is identical to login response
export type RefreshTokenResponse = LoginResponse;

// ============================================================================
// PROFILE MODELS
// ============================================================================

export type UserRoleType = 'user' | 'admin' | 'auditor';

export interface UserProfile {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRoleType;
  status: 'active' | 'inactive';
  is_verified: boolean;
  created_at: string; // ISO 8601
  last_login: string | null; // ISO 8601
}

export interface UpdateProfileRequest {
  first_name?: string; // 1-100 chars, letters only
  last_name?: string; // 1-100 chars, letters only
}

// ============================================================================
// ADMIN - USER MANAGEMENT MODELS
// ============================================================================

export interface AdminUserListResponse {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  is_active: boolean;
  is_verified: boolean;
  is_approved: boolean;
  approved_by: string | null;
  approved_at: string | null; // ISO 8601
  created_at: string; // ISO 8601
  last_login_at: string | null; // ISO 8601
}

export interface AdminUserDetailResponse extends AdminUserListResponse {
  updated_at: string | null; // ISO 8601
  login_count: number;
}

export interface AdminUsersQueryParams {
  page?: number; // min: 1, default: 1
  limit?: number; // min: 1, max: 100, default: 10
  role?: UserRoleType;
  is_active?: boolean;
}

export interface CreateUserRequest {
  email: string; // Valid email, unique
  password: string; // Min 8 chars, strong
  first_name: string; // 1-100 chars
  last_name: string; // 1-100 chars
  role?: UserRoleType; // default: user
}

export interface CreateUserResponse {
  user_id: string;
  email: string;
  message: string;
}

export interface UpdateUserRequest {
  first_name?: string; // 1-100 chars
  last_name?: string; // 1-100 chars
  role?: UserRoleType;
  is_active?: boolean;
}

export interface DeleteUserResponse {
  user_id: string;
  email: string;
  message: string;
  deleted_at: string; // ISO 8601
}

export interface ApproveUserRequest {
  user_id?: string; // For POST /admin/approve-user
}

export interface ApproveUserResponse {
  user_id: string;
  email: string;
  approved_by: string;
  approved_at: string; // ISO 8601
  message: string;
}

export interface RejectUserRequest {
  reason: string; // 10-500 chars
}

export interface RejectUserResponse {
  user_id: string;
  email: string;
  rejected_by: string;
  rejected_at: string; // ISO 8601
  reason: string;
  message: string;
}

// ============================================================================
// ADMIN - ROLE MANAGEMENT MODELS
// ============================================================================

export interface RoleResponse {
  role_name: string;
  description: string;
  permissions: string[];
  created_at: string; // ISO 8601
  updated_at?: string | null; // ISO 8601
  user_count?: number;
}

export interface CreateRoleRequest {
  role_name: string; // 3-50 chars, lowercase, unique
  description: string; // 10-200 chars
  permissions: string[]; // Non-empty array
}

export interface CreateRoleResponse extends RoleResponse {
  message: string;
}

export interface UpdateRoleRequest {
  description?: string; // 10-200 chars
  permissions?: string[]; // Non-empty array
}

export interface UpdateRoleResponse extends RoleResponse {
  message: string;
}

export interface DeleteRoleResponse {
  role_name: string;
  message: string;
  deleted_at: string; // ISO 8601
}

export interface AssignRoleRequest {
  role: string;
}

export interface AssignRoleResponse {
  user_id: string;
  role: string;
  assigned_by: string;
  assigned_at: string; // ISO 8601
  message: string;
}

export interface RevokeRoleResponse {
  user_id: string;
  previous_role: string;
  new_role: string;
  revoked_by: string;
  revoked_at: string; // ISO 8601
  message: string;
}

// ============================================================================
// AUDIT MODELS
// ============================================================================

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AuditOutcome = 'success' | 'failure';

export type AuditAction =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'PROFILE_UPDATED'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET'
  | 'EMAIL_VERIFIED'
  | 'ROLE_ASSIGNED'
  | 'ROLE_REVOKED';

export interface AuditLogEntry {
  audit_id: string;
  user_id: string;
  action: AuditAction;
  resource_type: string; // user/session/role
  resource_id: string;
  severity: AuditSeverity;
  timestamp: string; // ISO 8601
  metadata: Record<string, unknown>;
  outcome: AuditOutcome;
  ip_address: string;
  user_agent: string;
}

export interface AuditLogsQueryParams {
  action?: AuditAction;
  resource?: string;
  user_id?: string;
  start_date?: string; // ISO 8601 UTC
  end_date?: string; // ISO 8601 UTC
  severity?: AuditSeverity;
  page?: number; // min: 1, default: 1
  limit?: number; // min: 1, max: 100, default: 10
}

export interface AuditLogsResponse {
  items: AuditLogEntry[];
  total: number;
  limit: number;
  offset: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface AuditSummaryResponse {
  total_entries: number;
  date_range: {
    earliest: string; // ISO 8601
    latest: string; // ISO 8601
  };
  by_action: Record<string, number>;
  by_severity: Record<AuditSeverity, number>;
  by_outcome: Record<AuditOutcome, number>;
}

// ============================================================================
// GDPR MODELS
// ============================================================================

export type GDPRExportFormat = 'json' | 'csv';

export interface GDPRExportRequest {
  format?: GDPRExportFormat; // default: json
  include_audit_logs?: boolean; // default: true
  include_metadata?: boolean; // default: true
}

export interface GDPRExportMetadata {
  export_id: string;
  user_id: string;
  export_date: string; // ISO 8601
  format: GDPRExportFormat;
  record_count: number;
  categories: string[];
}

export interface GDPRExportResponse {
  metadata: GDPRExportMetadata;
  personal_data: {
    user_profile: {
      user_id: string;
      email: string;
      first_name: string;
      last_name: string;
      role: UserRoleType;
      created_at: string;
      is_verified: boolean;
      is_active: boolean;
    };
    account_settings: {
      last_login: string | null;
      login_count: number;
      email_verified_at: string | null;
    };
    activity_logs: Array<{
      action: string;
      timestamp: string;
      ip_address: string;
      user_agent: string;
    }>;
    audit_trail: Array<{
      audit_id: string;
      action: string;
      timestamp: string;
      changes: Record<string, unknown>;
    }>;
  };
}

export interface GDPRExportStatusResponse {
  export_id: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string; // ISO 8601
  completed_at: string | null; // ISO 8601
  download_url: string | null;
  expires_at: string | null; // ISO 8601
}

export interface GDPRDeleteRequest {
  confirmation: string; // Must be exactly "DELETE MY ACCOUNT"
  reason?: string; // Max 500 chars
}

export interface GDPRDeleteResponse {
  deletion_id: string;
  user_id: string;
  deletion_date: string; // ISO 8601
  records_deleted: number;
  categories_deleted: string[];
  anonymization_applied: boolean;
}

// ============================================================================
// HEALTH CHECK MODELS
// ============================================================================

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string; // ISO 8601
  environment: string;
  service: string;
  version: string;
}

export interface PingResponse {
  message: 'pong';
  timestamp: string; // ISO 8601
}

export interface ReadinessCheckResponse {
  status: 'ready' | 'not_ready';
  timestamp: string; // ISO 8601
  environment: string;
}

export interface DetailedHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string; // ISO 8601
  environment: string;
  service: string;
  version: string;
  uptime_seconds: number;
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      connected: boolean;
      response_time_ms: number;
    };
    system: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      cpu_usage_percent: number;
      memory_usage_percent: number;
      disk_usage_percent: number;
    };
    configuration: {
      status: 'healthy' | 'unhealthy';
      valid: boolean;
    };
  };
}

export interface DatabaseHealthResponse {
  status: 'healthy' | 'unhealthy';
  connected: boolean;
  response_time_ms: number;
  timestamp: string; // ISO 8601
}

export interface SystemHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  cpu_usage_percent: number;
  memory_usage_percent: number;
  disk_usage_percent: number;
  timestamp: string; // ISO 8601
}

// ============================================================================
// FRONTEND ERROR LOGGING MODELS
// ============================================================================

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface FrontendErrorRequest {
  message: string; // Error message
  stack?: string; // Stack trace
  level?: ErrorSeverity; // Log level (matches backend 'level' field)
  url?: string; // Page URL where error occurred
  user_agent?: string; // Browser user agent
  timestamp?: string; // ISO 8601
  metadata?: Record<string, unknown>; // Additional context
}

export interface FrontendErrorResponse {
  status: string; // "accepted"
  message: string; // "Error logged successfully"
}

// ============================================================================
// ERROR RESPONSE MODELS
// ============================================================================

// Note: ApiErrorResponse is defined in error.ts to avoid conflicts
// Using BackendApiErrorResponse as alias for backend-specific error response

export interface BackendApiErrorResponse {
  error_code: string; // Machine-readable error code
  message: string; // Human-readable error message
  status_code: number; // HTTP status code
  timestamp: string; // ISO 8601
  request_id: string; // Unique request identifier
  data?: Record<string, unknown>; // Additional error context
  errors?: BackendValidationError[]; // Field-level validation errors (422 only)
  retry_after?: number; // Seconds to wait before retry (429 only)
}

export interface BackendValidationError {
  field: string;
  message: string;
  code: string;
}

// ============================================================================
// ERROR CODES (50+ codes from API_ERROR_CODES.md)
// ============================================================================

export const ERROR_CODES = {
  // Authentication Errors (AUTH_*)
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  TOKEN_REFRESH_FAILED: 'TOKEN_REFRESH_FAILED',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  LOGIN_FAILED: 'LOGIN_FAILED',
  REGISTRATION_FAILED: 'REGISTRATION_FAILED',
  PASSWORD_RESET_FAILED: 'PASSWORD_RESET_FAILED',
  EMAIL_VERIFICATION_FAILED: 'EMAIL_VERIFICATION_FAILED',
  LOGOUT_FAILED: 'LOGOUT_FAILED',

  // User Errors (USER_*)
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USER_INACTIVE: 'USER_INACTIVE',
  PROFILE_NOT_FOUND: 'PROFILE_NOT_FOUND',
  PROFILE_RETRIEVAL_FAILED: 'PROFILE_RETRIEVAL_FAILED',
  PROFILE_UPDATE_FAILED: 'PROFILE_UPDATE_FAILED',
  SELF_DELETE_FORBIDDEN: 'SELF_DELETE_FORBIDDEN',
  NOT_VERIFIED: 'NOT_VERIFIED',

  // Admin Errors (ADMIN_*)
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  USER_LIST_FAILED: 'USER_LIST_FAILED',
  CREATION_FAILED: 'CREATION_FAILED',
  USER_DETAIL_FAILED: 'USER_DETAIL_FAILED',
  USER_UPDATE_FAILED: 'USER_UPDATE_FAILED',
  USER_DELETE_FAILED: 'USER_DELETE_FAILED',
  APPROVAL_FAILED: 'APPROVAL_FAILED',
  SYSTEM_ROLE_DELETE_FORBIDDEN: 'SYSTEM_ROLE_DELETE_FORBIDDEN',

  // Validation Errors (VALIDATION_*)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  INVALID_NAME: 'INVALID_NAME',
  FIELD_REQUIRED: 'FIELD_REQUIRED',
  FIELD_TOO_LONG: 'FIELD_TOO_LONG',
  FIELD_TOO_SHORT: 'FIELD_TOO_SHORT',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Audit Errors (AUDIT_*)
  INVALID_RANGE: 'INVALID_RANGE',
  RETRIEVAL_FAILED: 'RETRIEVAL_FAILED',

  // System Errors (SYSTEM_*)
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',

  // GDPR Errors
  EXPORT_FAILED: 'EXPORT_FAILED',
  INVALID_CONFIRMATION: 'INVALID_CONFIRMATION',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION_RULES = {
  EMAIL: {
    MAX_LENGTH: 255,
    PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRES_UPPERCASE: true,
    REQUIRES_LOWERCASE: true,
    REQUIRES_DIGIT: true,
  },
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z\s]+$/, // Letters and spaces only
  },
  ROLE_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-z]+$/, // Lowercase letters only
  },
  ROLE_DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 200,
  },
  REJECTION_REASON: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 500,
  },
  GDPR_DELETION_REASON: {
    MAX_LENGTH: 500,
  },
} as const;

// ============================================================================
// RATE LIMITS (from API_ERROR_CODES.md)
// ============================================================================

export const RATE_LIMITS = {
  LOGIN: {
    IP_LIMIT: 10, // requests per minute
    EMAIL_LIMIT: 5, // requests per minute
  },
  REGISTER: {
    IP_LIMIT: 10, // requests per hour
  },
  FORGOT_PASSWORD: {
    EMAIL_LIMIT: 3, // requests per hour
  },
  DEFAULT: {
    USER_LIMIT: 100, // requests per minute
  },
} as const;
