/**
 * Complete API Type Definitions
 * Based on API_COMPLETE_REFERENCE.md and related documentation
 * Covers all 52 endpoints with full request/response types
 */

// ============================================================================
// AUTHENTICATION TYPES (Endpoints 1-16)
// ============================================================================

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password?: string;
  first_name: string;
  last_name: string;
}

export interface RegisterResponse {
  message: string;
  user_id: string;
  email: string;
  verification_required: boolean;
  approval_required: boolean;
  created_at: string;
  verification_token: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
  user_id: string;
  email: string;
  roles: string[];
  last_login_at: string | null;
  issued_at: string;
}

export interface SecureLoginResponse {
  message: string;
  user: {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    roles: string[];
    is_verified: boolean;
    is_active: boolean;
    last_login_at: string | null;
  };
  csrf_token: string;
  issued_at: string;
}

export interface LogoutResponse {
  message: string;
  logged_out_at: string;
  success: boolean;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
  user: {
    user_id: string;
    email: string;
    roles: string[];
  };
  issued_at: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
  email: string;
  verified_at: string;
  success: boolean;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
  email: string;
  sent_at: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  email: string;
  sent_at: string;
  expires_in: number;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
  confirm_password?: string;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
  reset_at: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password?: string;
}

export interface ChangePasswordResponse {
  message: string;
  success: boolean;
  changed_at: string;
}

export interface CSRFTokenResponse {
  csrf_token: string;
  expires_in: number;
  issued_at: string;
}

export interface ValidateCSRFRequest {
  token: string;
}

export interface ValidateCSRFResponse {
  valid: boolean;
  message: string;
}

// ============================================================================
// PROFILE TYPES (Endpoints 9-16)
// ============================================================================

export interface UserProfile {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  is_active: boolean;
  is_verified: boolean;
  is_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string | null;
  last_login_at: string | null;
  login_count: number;
  preferences?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  preferences?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export type UpdateProfileResponse = UserProfile;

// ============================================================================
// ADMIN USER MANAGEMENT TYPES (Endpoints 17-22)
// ============================================================================

export interface AdminUsersQueryParams {
  page?: number;
  limit?: number;
  role?: string;
  is_active?: boolean;
  is_verified?: boolean;
  is_approved?: boolean;
  sort_by?: 'created_at' | 'updated_at' | 'email' | 'last_login_at';
  order?: 'asc' | 'desc';
}

export interface AdminUserSummary {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  is_active: boolean;
  is_verified: boolean;
  is_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  last_login_at: string | null;
}

export interface AdminUsersResponse {
  items: AdminUserSummary[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  roles?: string[];
  is_active?: boolean;
}

export interface CreateUserResponse {
  user_id: string;
  email: string;
  message: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  roles?: string[];
  is_active?: boolean;
  is_verified?: boolean;
}

export interface DeleteUserResponse {
  user_id: string;
  email: string;
  message: string;
  deleted_at: string;
}

export interface ApproveUserRequest {
  user_id: string;
}

export interface ApproveUserResponse {
  user_id: string;
  email: string;
  approved_by: string;
  approved_at: string;
  message: string;
}

// ============================================================================
// RBAC TYPES (Endpoints 23-31)
// ============================================================================

export interface RoleResponse {
  role_id: string;
  role_name: string;
  description: string;
  permissions: string[];
  priority?: number;
  inherits_from?: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string | null;
}

export interface CreateRoleRequest {
  role_name: string;
  description: string;
  permissions: string[];
  priority?: number;
  inherits_from?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateRoleRequest {
  role_name?: string;
  description?: string;
  permissions?: string[];
  priority?: number;
  inherits_from?: string[];
  metadata?: Record<string, unknown>;
}

export interface DeleteRoleResponse {
  role_id: string;
  role_name: string;
  message: string;
  deleted_at: string;
}

export interface PermissionsResponse {
  permissions: Record<string, string[]>;
  total: number;
  categories: string[];
}

export interface UserPermissionsResponse {
  user_id: string;
  permissions: string[];
  roles: Array<{
    role_id: string;
    role_name: string;
    permissions: string[];
  }>;
}

export interface AssignRoleRequest {
  role_id: string;
}

export interface AssignRoleResponse {
  user_id: string;
  role_id: string;
  message: string;
  assigned_at: string;
}

export interface RevokeRoleResponse {
  user_id: string;
  role_id: string;
  message: string;
  revoked_at: string;
}

export interface RBACCacheStatsResponse {
  total_cached_users: number;
  total_cached_roles: number;
  cache_hit_rate: number;
  cache_size_bytes: number;
  last_sync_at: string;
}

// ============================================================================
// GDPR TYPES (Endpoints 32-38)
// ============================================================================

export interface GDPRExportRequest {
  format?: 'json' | 'csv';
  include_audit_logs?: boolean;
  include_metadata?: boolean;
}

export interface GDPRExportResponse {
  export_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  message: string;
}

export interface GDPRExportStatusResponse {
  export_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  created_at: string;
  completed_at: string | null;
  download_url: string | null;
  expires_at: string | null;
  error_message: string | null;
}

export interface GDPRDeleteRequest {
  password: string;
  confirmation: string;
  reason?: string;
}

export interface GDPRDeleteResponse {
  user_id: string;
  message: string;
  deletion_scheduled_at: string;
  grace_period_ends_at: string;
  final_deletion_at: string;
}

export interface GDPRConsentResponse {
  user_id: string;
  consents: Array<{
    consent_type: string;
    granted: boolean;
    granted_at: string;
    version: string;
  }>;
}

export interface GDPRDataPortabilityResponse {
  user_id: string;
  data: Record<string, unknown>;
  exported_at: string;
  format: string;
}

// ============================================================================
// AUDIT LOG TYPES (Endpoints 39-40)
// ============================================================================

export interface AuditLogQueryParams {
  action?: string;
  resource?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  page?: number;
  limit?: number;
}

export interface AuditLogEntry {
  audit_id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  timestamp: string;
  metadata: Record<string, unknown>;
  outcome: 'success' | 'failure' | null;
  ip_address: string | null;
  user_agent: string | null;
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
  entries_by_severity: Record<string, number>;
  entries_by_action: Record<string, number>;
  recent_critical_events: AuditLogEntry[];
  time_range: {
    earliest: string;
    latest: string;
  };
  generated_at: string;
}

// ============================================================================
// HEALTH & MONITORING TYPES (Endpoints 41-51)
// ============================================================================

export interface BasicHealthResponse {
  status: 'healthy';
  timestamp: string;
  environment: string;
  service: string;
  version: string;
}

export interface PingResponse {
  message: 'pong';
  timestamp: string;
}

export interface ReadyResponse {
  status: 'ready' | 'degraded' | 'critical';
  timestamp: string;
  environment: string;
  service: string;
  version: string;
}

export interface DetailedHealthResponse {
  status: 'healthy' | 'warning' | 'degraded' | 'critical';
  timestamp: string;
  uptime_seconds: number;
  environment: string;
  version: string;
  checks: {
    database: {
      status: 'healthy' | 'warning' | 'degraded' | 'critical';
      connected: boolean;
      response_time_ms: number;
      last_check: string;
    };
    cache: {
      status: 'healthy' | 'warning' | 'degraded' | 'critical';
      connected: boolean;
      hit_rate: number;
      size_mb: number;
    };
    email: {
      status: 'healthy' | 'warning' | 'degraded' | 'critical';
      quota_remaining: number;
      quota_limit: number;
      quota_percentage: number;
    };
    storage: {
      status: 'healthy' | 'warning' | 'degraded' | 'critical';
      used_gb: number;
      total_gb: number;
      usage_percentage: number;
    };
    dependencies: {
      status: 'healthy' | 'warning' | 'degraded' | 'critical';
      services: Record<string, 'up' | 'down'>;
    };
  };
}

export interface DatabaseHealthResponse {
  status: 'healthy' | 'critical';
  timestamp: string;
  database_type: string;
  connected: boolean;
  response_time_ms: number;
}

export interface SystemHealthResponse {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  cpu_usage_percent: number;
  memory_usage_percent: number;
  disk_usage_percent: number;
  available_memory_mb: number;
}

export interface PatternsHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  circuits: {
    total: number;
    open: number;
    half_open: number;
    closed: number;
  };
  cache: {
    backend: string;
    hit_rate: number;
    size_mb: number;
  };
  events: {
    total_subscribers: number;
    event_types: number;
  };
}

export interface CircuitsHealthResponse {
  circuits: Array<{
    name: string;
    state: 'closed' | 'open' | 'half_open';
    failure_count: number;
    success_count: number;
    last_failure: string | null;
  }>;
  healthy_circuits: number;
  unhealthy_circuits: number;
}

export interface CacheHealthResponse {
  backend: string;
  connected: boolean;
  hit_rate: number;
  size_mb: number;
  redis_status: string;
}

export interface EventsHealthResponse {
  total_event_types: number;
  total_subscribers: number;
  recent_events: Array<{
    event_type: string;
    timestamp: string;
    subscriber_count: number;
  }>;
}

export interface EventsHistoryResponse {
  total: number;
  events: Array<{
    event_type: string;
    timestamp: string;
    data: Record<string, unknown>;
  }>;
}

// ============================================================================
// FRONTEND LOGGING TYPES (Endpoint 52)
// ============================================================================

export interface FrontendErrorRequest {
  message: string;
  stack?: string;
  url?: string;
  user_agent?: string;
  timestamp?: string;
  level?: 'error' | 'warning' | 'info';
  metadata?: Record<string, unknown>;
}

export interface FrontendErrorResponse {
  message: string;
  logged_at: string;
  error_id: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path?: string;
  request_id?: string;
}

export interface ValidationError {
  detail: Array<{
    loc: string[];
    msg: string;
    type: string;
    ctx?: Record<string, unknown>;
  }>;
}

export interface RateLimitError {
  code: 'RATE_LIMIT_EXCEEDED';
  message: string;
  retry_after: number;
  limit: number;
  window: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type APIResponse<T> = {
  data: T;
  status: number;
  headers: Headers;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
};
