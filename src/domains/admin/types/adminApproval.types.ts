/**
 * Admin User Approval - Type Definitions
 * Types for user approval and rejection endpoints
 * 
 * Endpoints covered:
 * - POST /api/v1/admin/users/:id/approve
 * - POST /api/v1/admin/users/:id/reject
 */

// ============================================================================
// Approve User - Request/Response
// ============================================================================

export interface ApproveUserRequest {
  welcome_message?: string;
  initial_role?: string;
  send_welcome_email?: boolean;
  grant_trial_benefits?: boolean;
  trial_days?: number;
  notes?: string;
}

export interface TrialBenefits {
  granted: boolean;
  trial_ends_at: string;
  benefits: string[];
}

export interface ApproveUserResponse {
  user_id: string;
  email: string;
  username: string;
  status: 'active';
  role: string;
  approved_at: string;
  approved_by: string;
  welcome_email_sent: boolean;
  trial_benefits?: TrialBenefits;
  initial_permissions: string[];
  message: string;
}

// ============================================================================
// Reject User - Request/Response
// ============================================================================

export interface RejectUserRequest {
  reason: string;
  send_notification?: boolean;
  block_email?: boolean;
  custom_message?: string;
  allow_reapplication?: boolean;
  reapplication_wait_days?: number;
}

export interface RejectUserResponse {
  user_id: string;
  email: string;
  username?: string;
  status: 'rejected';
  rejected_at: string;
  rejected_by: string;
  rejection_reason: string;
  notification_sent: boolean;
  email_blocked: boolean;
  can_reapply: boolean;
  reapplication_available_at?: string;
  message: string;
}

// ============================================================================
// Bulk Approval - Request/Response
// ============================================================================

export interface BulkApprovalRequest {
  user_ids: string[];
  options?: ApproveUserRequest;
}

export interface BulkApprovalResult {
  total: number;
  approved: number;
  failed: number;
  success_ids: string[];
  errors: Array<{
    user_id: string;
    error: string;
    error_code: string;
  }>;
}

export interface BulkRejectionRequest {
  user_ids: string[];
  reason: string;
  options?: Omit<RejectUserRequest, 'reason'>;
}

export interface BulkRejectionResult {
  total: number;
  rejected: number;
  failed: number;
  success_ids: string[];
  errors: Array<{
    user_id: string;
    error: string;
    error_code: string;
  }>;
}

// ============================================================================
// Approval Validation
// ============================================================================

export const REJECTION_REASON_MIN_LENGTH = 10;
export const REJECTION_REASON_MAX_LENGTH = 500;
export const TRIAL_DAYS_MIN = 1;
export const TRIAL_DAYS_MAX = 365;
export const REAPPLICATION_WAIT_MAX_DAYS = 365;

// ============================================================================
// Type Guards
// ============================================================================

export function isApprovalRequest(obj: unknown): obj is ApproveUserRequest {
  return (
    typeof obj === 'object' &&
    obj !== null
  );
}

export function isRejectionRequest(obj: unknown): obj is RejectUserRequest {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'reason' in obj &&
    typeof (obj as RejectUserRequest).reason === 'string'
  );
}

export function isValidRejectionReason(reason: string): boolean {
  return (
    reason.length >= REJECTION_REASON_MIN_LENGTH &&
    reason.length <= REJECTION_REASON_MAX_LENGTH
  );
}

export function isValidTrialDays(days: number): boolean {
  return days >= TRIAL_DAYS_MIN && days <= TRIAL_DAYS_MAX;
}
