/**
 * Admin User Management - Type Definitions
 * Types for all user management API endpoints
 * 
 * Endpoints covered:
 * - GET    /api/v1/admin/users (list with pagination)
 * - POST   /api/v1/admin/users (create)
 * - GET    /api/v1/admin/users/:id (get details)
 * - PUT    /api/v1/admin/users/:id (update)
 * - DELETE /api/v1/admin/users/:id (delete)
 */

import type {
  UserStatus,
  AccountType,
  Gender,
  PaginationParams,
  PaginationInfo,
  SortOptions,
  SearchOptions,
} from './admin.types';

// ============================================================================
// User Entity
// ============================================================================

export interface AdminUser {
  user_id: string;
  email: string;
  username?: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: Gender;
  profile_picture_url?: string;
  bio?: string;
  
  roles: string[];
  is_active: boolean;
  is_verified: boolean;
  is_approved: boolean;
  
  last_login_at?: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

// ============================================================================
// User Statistics
// ============================================================================

export interface UserLoginStats {
  login_count: number;
  last_login_at?: string;
  last_login_ip?: string;
  last_login_user_agent?: string;
  failed_login_attempts: number;
  last_failed_login_at?: string;
  account_locked: boolean;
  lock_expires_at?: string;
}

export interface UserDetailedStats extends AdminUser {
  login_stats: UserLoginStats;
  session_count: number;
  total_session_duration: string;
  average_session_duration: string;
  permissions: string[];
  metadata?: Record<string, unknown>;
}

// ============================================================================
// List Users - Request/Response
// ============================================================================

export interface ListUsersFilters extends PaginationParams, SortOptions, SearchOptions {
  status?: UserStatus | UserStatus[];
  role?: string | string[];
  account_type?: AccountType | AccountType[];
  email_verified?: boolean;
  phone_verified?: boolean;
  is_approved?: boolean;
  created_after?: string;
  created_before?: string;
  last_login_after?: string;
  last_login_before?: string;
}

export interface ListUsersResponse {
  users: AdminUser[];
  pagination: PaginationInfo;
  filters_applied: Partial<ListUsersFilters>;
  summary?: {
    total_users: number;
    active_users: number;
    inactive_users: number;
    pending_approval: number;
  };
}

// ============================================================================
// Create User - Request/Response
// ============================================================================

export interface CreateUserRequest {
  email: string;
  username?: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: Gender;
  bio?: string;
  
  roles?: string[];
  account_type?: AccountType;
  email_verified?: boolean;
  is_approved?: boolean;
  send_welcome_email?: boolean;
}

export interface CreateUserResponse {
  user: AdminUser;
  message: string;
  welcome_email_sent: boolean;
  temporary_password?: string;
}

// ============================================================================
// Update User - Request/Response
// ============================================================================

export interface UpdateUserRequest {
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: Gender;
  bio?: string;
  profile_picture_url?: string;
  
  roles?: string[];
  is_active?: boolean;
  is_verified?: boolean;
  is_approved?: boolean;
  
  // Password reset
  reset_password?: boolean;
  new_password?: string;
}

export interface UpdateUserResponse {
  user: AdminUser;
  message: string;
  changes: {
    field: string;
    old_value: unknown;
    new_value: unknown;
  }[];
  password_reset?: boolean;
}

// ============================================================================
// Delete User - Request/Response
// ============================================================================

export interface DeleteUserOptions {
  soft_delete?: boolean;
  force?: boolean;
  transfer_ownership_to?: string;
  delete_related_data?: boolean;
  reason?: string;
}

export interface DeleteUserResponse {
  message: string;
  user_id: string;
  deleted_at: string;
  soft_deleted: boolean;
  related_data_deleted: string[];
  ownership_transferred: boolean;
  can_restore: boolean;
  restore_deadline?: string;
}

// ============================================================================
// Bulk Operations
// ============================================================================

export interface BulkUserAction {
  operation: 'delete' | 'approve' | 'reject' | 'activate' | 'deactivate' | 'assign_role';
  user_ids: string[];
  options?: Record<string, unknown>;
}

export interface BulkOperationResult {
  total: number;
  succeeded: number;
  failed: number;
  success_ids: string[];
  errors: Array<{
    user_id: string;
    error: string;
    error_code: string;
  }>;
}

// ============================================================================
// User Export
// ============================================================================

export interface ExportUsersRequest {
  format: 'csv' | 'json' | 'xlsx';
  filters?: ListUsersFilters;
  fields?: Array<keyof AdminUser>;
}

export interface ExportUsersResponse {
  export_id: string;
  download_url: string;
  format: string;
  file_size_bytes: number;
  record_count: number;
  expires_at: string;
}

// ============================================================================
// User Activity
// ============================================================================

export interface UserActivity {
  activity_id: string;
  user_id: string;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

export interface UserActivityFilters extends PaginationParams {
  start_date?: string;
  end_date?: string;
  action?: string;
  resource?: string;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isAdminUser(obj: unknown): obj is AdminUser {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'user_id' in obj &&
    'email' in obj &&
    'username' in obj
  );
}

export function isUserStatus(value: string): value is UserStatus {
  return ['active', 'inactive', 'pending', 'suspended', 'deleted'].includes(value);
}

export function isAccountType(value: string): value is AccountType {
  return ['regular', 'premium', 'trial'].includes(value);
}
