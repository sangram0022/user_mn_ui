// Global TypeScript types and interfaces for the application
// Based on the FastAPI User Management System API Documentation

// Export error types
export * from './error';

// Export utility types
export * from './utilities';

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  status?: number;
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// User Management Types (Based on API Documentation)
// ============================================================================

export interface UserRoleInfo {
  id?: number | string;
  name: string;
  description?: string;
  permissions?: string[];
}

export interface User {
  id?: string | number;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  username?: string | null;
  full_name?: string | null;
  role: string | UserRoleInfo;
  status?: string;
  is_active: boolean;
  is_verified: boolean;
  is_approved?: boolean;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  last_login_at?: string | null;
  phone_number?: string | null;
  avatar_url?: string | null;
  preferences?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  role_name?: string;
  is_superuser?: boolean;
  lifecycle_stage?: string | null;
  activity_score?: number | null;
}

export interface UserProfile extends User {
  last_login?: string | null;
  profile_data?: Record<string, unknown> | null;
}

export interface UserSummary {
  id?: string | number;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  username?: string | null;
  full_name?: string | null;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  is_approved: boolean;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at: string;
  last_login_at?: string | null;
  role_name?: string;
}

export interface UserRole {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: string;
  is_active?: boolean;
  username?: string;
  phone_number?: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  role?: string;
  is_active?: boolean;
  is_verified?: boolean;
  username?: string;
  full_name?: string;
  phone_number?: string;
}

// ============================================================================
// Authentication Types (Based on API Documentation)
// ============================================================================

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
  role: string;
  last_login_at?: string;
  issued_at: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  username?: string;
}

export interface RegisterResponse {
  message: string;
  user_id: string;
  email: string;
  verification_required: boolean;
  approval_required: boolean;
  created_at: string;
  verification_token?: string;
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

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
  confirm_password?: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  email: string;
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
  issued_at: string;
}

// ============================================================================
// GDPR Types (Based on API Documentation)
// ============================================================================

export interface GDPRExportRequest {
  user_id?: string;
}

export interface GDPRExportResponse {
  message: string;
  export_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  expires_at: string;
}

export interface GDPRExportStatus {
  export_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  download_url?: string;
  created_at: string;
  completed_at?: string;
  expires_at: string;
}

export interface GDPRDeleteRequest {
  password: string;
  confirmation: string;
  reason?: string;
}

export interface GDPRDeleteResponse {
  message: string;
  user_id: string;
  deletion_scheduled_at: string;
}

// ============================================================================
// Admin User Management Types
// ============================================================================

export interface AdminDeactivateUserRequest {
  reason: string;
}

export interface AdminActivateUserResponse {
  message: string;
  user_id: string;
  email: string;
  is_active: boolean;
}

export interface AdminDeactivateUserResponse {
  message: string;
  user_id: string;
  email: string;
  is_active: boolean;
  deactivated_at: string;
}

// ============================================================================
// CSRF Token Types
// ============================================================================

export interface CSRFTokenResponse {
  csrf_token: string;
  expires_at: string;
}

export interface CSRFValidateRequest {
  csrf_token?: string;
}

// ============================================================================
// Audit Types (Based on API Documentation)
// ============================================================================

export interface AuditLog {
  log_id: string;
  user_id: string;
  action: string;
  resource: string;
  resource_id: string;
  details: Record<string, unknown>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

export interface AuditSummary {
  total_logs: number;
  recent_actions: AuditLog[];
  security_events: number;
}

export interface AuditLogsQuery {
  action?: string;
  resource?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Admin Types (Based on API Documentation)
// ============================================================================

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  role?: string;
  is_active?: boolean;
}

export interface UserAnalytics {
  total_users: number;
  active_users: number;
  new_users_today: number;
  retention_rate: number;
  engagement_score: number;
  lifecycle_distribution: Record<string, number>;
  activity_trends: Array<{
    date: string;
    active_users: number;
  }>;
  inactive_users?: number;
  new_users_last_30_days?: number;
  engagement_distribution?: { high: number; medium: number; low: number };
  growth_rate?: number;
}

export interface LifecycleAnalytics {
  stages: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  transitions: Array<{ from_stage: string; to_stage: string; count: number }>;
}

export interface CohortAnalysis {
  cohorts: Array<{
    period: string;
    size: number;
    retention_rates: number[];
  }>;
}

// ============================================================================
// Workflow Types
// ============================================================================

export interface WorkflowRequest {
  id: string;
  type: string;
  user_id: number;
  status: 'pending' | 'approved' | 'rejected';
  data: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
  reviewed_by?: number;
  reviewed_at?: string;
}

export interface PendingWorkflow {
  id: string;
  type: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  user: {
    id: number;
    email: string;
    full_name?: string;
  };
  request_id?: string;
  workflow_type?: string;
  requester_name?: string;
}

// ============================================================================
// Form Types
// ============================================================================

export interface FormErrors {
  [key: string]: string;
}

export interface FormTouched {
  [key: string]: boolean;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// ============================================================================
// UI Component Types
// ============================================================================

export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// ============================================================================
// Filter Types
// ============================================================================

export interface UserFilters {
  search?: string;
  role?: string;
  is_active?: boolean;
  lifecycle_stage?: string;
  created_after?: string;
  created_before?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

// ============================================================================
// Event Types
// ============================================================================

export interface UserEvent {
  id: string;
  user_id: number;
  event_type: string;
  event_data: Record<string, unknown>;
  timestamp: string;
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface DashboardStats {
  total_users: number;
  active_users: number;
  pending_workflows: number;
  system_health: 'healthy' | 'warning' | 'critical';
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  permission?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Nullable<T> = T | null;

export type Maybe<T> = T | undefined;

export type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };

// ============================================================================
// HTTP Types
// ============================================================================

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestConfig {
  method: HTTPMethod;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

// ============================================================================
// Environment Types
// ============================================================================

export interface EnvironmentConfig {
  API_BASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  DEBUG: boolean;
}

// ============================================================================
// Additional Types for Constants
// ============================================================================

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface ApiEndpoints {
  // Authentication
  LOGIN: string;
  LOGOUT: string;
  REGISTER: string;
  REFRESH_TOKEN: string;
  FORGOT_PASSWORD: string;
  RESET_PASSWORD: string;
  VERIFY_EMAIL: string;
  CHANGE_PASSWORD: string;

  // Users
  USERS: string;
  USER_BY_ID: (id: string) => string;
  USER_PROFILE: string;
  USER_ANALYTICS: string;
  USER_BULK_ACTIONS: string;
  USER_EXPORT: string;
  USER_IMPORT: string;

  // Admin
  ADMIN_DASHBOARD: string;
  ADMIN_SETTINGS: string;
  ADMIN_AUDIT_LOGS: string;
  ADMIN_SYSTEM_HEALTH: string;

  // File uploads
  UPLOAD_AVATAR: string;
  UPLOAD_DOCUMENTS: string;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'dateRange' | 'text' | 'number';
  options?: Array<{
    value: string;
    label: string;
  }>;
}
