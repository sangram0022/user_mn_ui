/**
 * TypeScript type definitions for all API requests and responses
 * Generated from backend API documentation
 */

// ==================== Authentication Types ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_verified: boolean;
  is_approved: boolean;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  last_login_at: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
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
  verification_token: string;
}

export interface RefreshTokenResponse {
  message: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
  verified_at: string;
  approval_required: boolean;
  user_id: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
  email: string;
  resent_at: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  message: string;
  email: string;
  reset_token_sent: boolean;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface LogoutResponse {
  message: string;
  user_id: string;
  logout_at: string;
}

// ==================== User & Profile Types ====================

export interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  is_approved?: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at?: string;
  last_login_at?: string;
  login_count?: number;
}

export interface UserProfile {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  is_verified: boolean;
  created_at: string;
  last_login: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
}

// ==================== Admin Types ====================

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface CreateUserResponse {
  user_id: string;
  email: string;
  message: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  role?: string;
  is_active?: boolean;
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

export interface RejectUserRequest {
  reason: string;
}

export interface RejectUserResponse {
  user_id: string;
  email: string;
  rejected_by: string;
  rejected_at: string;
  message: string;
}

export interface Role {
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  unverified_users: number;
  unapproved_users: number;
  users_by_role: Record<string, number>;
  recent_registrations: number;
  recent_logins: number;
}

// ==================== Audit Types ====================

export interface AuditLog {
  audit_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  severity: string;
  timestamp: string;
  metadata: Record<string, unknown>;
  outcome: string;
  ip_address: string;
  user_agent: string;
}

export interface AuditLogQueryParams {
  action?: string;
  resource?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  severity?: string;
  page?: number;
  limit?: number;
}

export interface AuditSummary {
  total_events: number;
  events_today: number;
  events_this_week: number;
  events_by_severity: Record<string, number>;
  events_by_action: Record<string, number>;
  recent_failures: number;
  active_users_today: number;
}

// ==================== Bulk Operations Types ====================

export interface BulkUserItem {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  metadata?: Record<string, unknown>;
}

export interface BulkCreateRequest {
  operation: string;
  items: BulkUserItem[];
  batch_size?: number;
  fail_fast?: boolean;
}

export interface BulkOperationResponse {
  operation_id: string;
  operation: string;
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: unknown[];
  duration_seconds: number;
  throughput_per_second: number;
  success_rate: number;
}

// ==================== GDPR Types ====================

export interface ExportDataRequest {
  format: 'json' | 'csv';
  include_audit_logs: boolean;
  include_metadata: boolean;
}

export interface ExportDataMetadata {
  export_id: string;
  user_id: string;
  export_date: string;
  format: string;
  record_count: number;
  categories: string[];
}

export interface DeleteAccountRequest {
  confirmation: string;
  reason: string;
}

export interface DeleteAccountResponse {
  deletion_id: string;
  user_id: string;
  deletion_date: string;
  records_deleted: number;
  categories_deleted: string[];
  anonymization_applied: boolean;
}

// ==================== Health Check Types ====================

export interface HealthStatus {
  status: string;
  timestamp: string;
  environment: string;
  service: string;
  version: string;
}

export interface DetailedHealthStatus extends HealthStatus {
  uptime_seconds: number;
  checks: {
    api: { status: string; message: string };
    database: { status: string; message: string };
    memory: { status: string; usage_percent: number; available_mb: number };
    cpu: { status: string; usage_percent: number };
    disk: { status: string; usage_percent: number };
    configuration: { status: string; checks: unknown[] };
  };
}

export interface DatabaseHealthStatus {
  status: string;
  timestamp: string;
  database_type: string;
  connected: boolean;
  response_time_ms: number;
}

export interface SystemMetrics {
  status: string;
  timestamp: string;
  cpu_usage_percent: number;
  memory_usage_percent: number;
  disk_usage_percent: number;
  available_memory_mb: number;
}

// ==================== Common Types ====================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  has_next: boolean;
  has_prev: boolean;
  current_page?: number;
  total_pages?: number;
}

export interface ApiError {
  error_code: string;
  message: string;
  details: {
    data: Array<{
      field?: string;
      message?: string;
      [key: string]: unknown;
    }>;
  };
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  status: number;
}

// ==================== Query Parameter Types ====================

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: string;
  is_active?: boolean;
}

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  event_type?: string;
  user_id?: string;
}

// ==================== Event Types ====================

export type UserEventType =
  | 'user.registered'
  | 'user.verified'
  | 'user.approved'
  | 'user.login'
  | 'user.logout'
  | 'user.password_changed'
  | 'user.profile_updated'
  | 'user.deleted';

export type AdminEventType =
  | 'admin.user_created'
  | 'admin.user_updated'
  | 'admin.user_deleted'
  | 'admin.user_approved'
  | 'admin.user_rejected';

export type SecurityEventType =
  | 'security.failed_login'
  | 'security.password_reset'
  | 'security.suspicious_activity';

export type EventType = UserEventType | AdminEventType | SecurityEventType;
