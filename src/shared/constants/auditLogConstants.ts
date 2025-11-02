/**
 * Audit Log Constants
 * Centralized constants for audit log features
 */

/**
 * Status color mapping for UI rendering
 */
export const STATUS_COLORS: Record<string, string> = {
  success: '#4a9eff',
  failed: '#ff6b6b',
  warning: '#ffa500',
};

/**
 * Status label mapping
 */
export const STATUS_LABELS: Record<string, string> = {
  success: 'Success',
  failed: 'Failed',
  warning: 'Warning',
};

/**
 * Action icon mapping for display
 */
export const ACTION_ICONS: Record<string, string> = {
  USER_LOGIN: '🔓',
  USER_LOGOUT: '🔒',
  USER_CREATED: '👤',
  USER_DELETED: '❌',
  USER_UPDATED: '✏️',
  ROLE_CHANGED: '👑',
  UNAUTHORIZED_ACCESS: '⛔',
  DATA_EXPORT: '📊',
  DATA_IMPORT: '📥',
  DATA_DELETED: '🗑️',
  SYSTEM_CONFIG_CHANGED: '⚙️',
  SECURITY_ALERT: '⚠️',
  AUDIT_LOG_ARCHIVED: '📦',
};

/**
 * Action name mapping for display
 */
export const ACTION_NAMES: Record<string, string> = {
  USER_LOGIN: 'User Login',
  USER_LOGOUT: 'User Logout',
  USER_CREATED: 'User Created',
  USER_DELETED: 'User Deleted',
  USER_UPDATED: 'User Updated',
  ROLE_CHANGED: 'Role Changed',
  UNAUTHORIZED_ACCESS: 'Unauthorized Access',
  DATA_EXPORT: 'Data Export',
  DATA_IMPORT: 'Data Import',
  DATA_DELETED: 'Data Deleted',
  SYSTEM_CONFIG_CHANGED: 'System Config Changed',
  SECURITY_ALERT: 'Security Alert',
  AUDIT_LOG_ARCHIVED: 'Audit Logs Archived',
};

/**
 * Get all unique actions
 */
export function getAllActions(): string[] {
  return Object.keys(ACTION_NAMES);
}

/**
 * Get all statuses
 */
export function getAllStatuses(): Array<'success' | 'failed' | 'warning'> {
  return ['success', 'failed', 'warning'];
}
