/**
 * Admin Audit Logs - Type Definitions
 * Types for audit log and export endpoints
 * 
 * Endpoints covered:
 * - GET  /api/v1/admin/audit-logs
 * - POST /api/v1/admin/audit-logs/export
 */

import type {
  AuditSeverity,
  ActionResult,
  ExportFormat,
  PaginationParams,
  PaginationInfo,
  SortOptions,
  SearchOptions,
} from './admin.types';

// ============================================================================
// Audit Log Entity
// ============================================================================

export interface AuditLog {
  audit_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  severity: AuditSeverity;
  timestamp: string;
  metadata: Record<string, unknown>;
  outcome: string | null;
  ip_address: string;
  user_agent: string;
}

// ============================================================================
// Audit Log Actions
// ============================================================================

export const AUDIT_ACTIONS = {
  // User actions
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_APPROVE: 'user.approve',
  USER_REJECT: 'user.reject',
  USER_SUSPEND: 'user.suspend',
  USER_ACTIVATE: 'user.activate',
  
  // Role actions
  ROLE_CREATE: 'role.create',
  ROLE_UPDATE: 'role.update',
  ROLE_DELETE: 'role.delete',
  ROLE_ASSIGN: 'role.assign',
  ROLE_REVOKE: 'role.revoke',
  
  // Auth actions
  LOGIN_SUCCESS: 'login.success',
  LOGIN_FAILED: 'login.failed',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password.change',
  PASSWORD_RESET: 'password.reset',
  
  // Settings actions
  SETTINGS_UPDATE: 'settings.update',
  CONFIG_CHANGE: 'config.change',
  
  // System actions
  SYSTEM_BACKUP: 'system.backup',
  SYSTEM_RESTORE: 'system.restore',
  SYSTEM_MAINTENANCE: 'system.maintenance',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

// ============================================================================
// Audit Log Resources
// ============================================================================

export const AUDIT_RESOURCES = {
  USER: 'user',
  ROLE: 'role',
  AUTH: 'auth',
  SETTINGS: 'settings',
  SYSTEM: 'system',
  AUDIT: 'audit',
  ANALYTICS: 'analytics',
} as const;

export type AuditResource = typeof AUDIT_RESOURCES[keyof typeof AUDIT_RESOURCES];

// ============================================================================
// List Audit Logs - Request/Response
// ============================================================================

export interface AuditLogFilters extends PaginationParams, SortOptions, SearchOptions {
  start_date?: string;
  end_date?: string;
  actor_id?: string;
  target_id?: string;
  action?: string | string[];
  resource?: string | string[];
  severity?: AuditSeverity | AuditSeverity[];
}

export interface AuditLogSummary {
  total_logs_in_period: number;
  by_severity: Record<AuditSeverity, number>;
  by_action: Record<string, number>;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: PaginationInfo;
  filters_applied: Partial<AuditLogFilters>;
  summary: AuditLogSummary;
}

// ============================================================================
// Export Audit Logs - Request/Response
// ============================================================================

export interface ExportAuditLogsRequest {
  format: ExportFormat;
  filters?: AuditLogFilters;
  include_fields?: string[];
}

export interface ExportAuditLogsResponse {
  export_id: string;
  download_url: string;
  format: string;
  file_size_bytes: number;
  record_count: number;
  expires_at: string;
}

// ============================================================================
// Audit Log Detail View
// ============================================================================

export interface AuditLogDetail extends AuditLog {
  related_logs?: AuditLog[];
  context?: {
    before: Record<string, unknown>;
    after: Record<string, unknown>;
    changes: Array<{
      field: string;
      old_value: unknown;
      new_value: unknown;
    }>;
  };
}

// ============================================================================
// Audit Log Statistics
// ============================================================================

export interface AuditLogStats {
  period: string;
  total_logs: number;
  by_severity: Record<AuditSeverity, number>;
  by_action: Record<string, number>;
  by_resource: Record<string, number>;
  by_result: Record<ActionResult, number>;
  top_actors: Array<{
    user_id: string;
    email: string;
    action_count: number;
  }>;
  peak_activity_hour: number;
}

// ============================================================================
// Real-time Audit Monitoring
// ============================================================================

export interface AuditLogEvent {
  type: 'new_log' | 'critical_event' | 'suspicious_activity';
  log: AuditLog;
  alert_level?: 'info' | 'warning' | 'danger';
  message?: string;
}

export interface AuditAlertRule {
  rule_id: string;
  name: string;
  description: string;
  conditions: {
    action?: string[];
    severity?: AuditSeverity[];
    resource?: string[];
    threshold?: number;
    time_window?: string;
  };
  enabled: boolean;
  notification_channels: string[];
}

// ============================================================================
// Audit Log Search
// ============================================================================

export interface AuditLogSearchFilters {
  query: string;
  fields?: Array<'action' | 'resource_type' | 'user_id' | 'metadata'>;
  start_date?: string;
  end_date?: string;
  severity?: AuditSeverity[];
}

export interface AuditLogSearchResult {
  log: AuditLog;
  match_score: number;
  matched_fields: string[];
  highlights: Record<string, string>;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isAuditLog(obj: unknown): obj is AuditLog {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'audit_id' in obj &&
    'action' in obj &&
    'resource_type' in obj &&
    'user_id' in obj
  );
}

export function isAuditSeverity(value: string): value is AuditSeverity {
  return ['low', 'medium', 'high', 'critical'].includes(value);
}

export function isActionResult(value: string): value is ActionResult {
  return ['success', 'failed', 'partial'].includes(value);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get human-readable action name
 */
export function getActionDisplayName(action: string): string {
  const actionMap: Record<string, string> = {
    'user.create': 'User Created',
    'user.update': 'User Updated',
    'user.delete': 'User Deleted',
    'user.approve': 'User Approved',
    'user.reject': 'User Rejected',
    'user.suspend': 'User Suspended',
    'role.create': 'Role Created',
    'role.update': 'Role Updated',
    'role.delete': 'Role Deleted',
    'role.assign': 'Role Assigned',
    'login.success': 'Login Successful',
    'login.failed': 'Login Failed',
    'logout': 'Logout',
    'password.change': 'Password Changed',
    'password.reset': 'Password Reset',
  };
  
  return actionMap[action] || action.replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Get severity badge color
 */
export function getSeverityColor(severity: AuditSeverity): string {
  const colors = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    critical: 'red',
  };
  
  return colors[severity];
}
