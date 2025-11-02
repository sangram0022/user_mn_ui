/**
 * Permissions Checker Utility
 * Centralized permission checking logic
 */

/**
 * Permission levels
 */
export const PERMISSION_LEVELS = {
  ADMIN: 'admin',
  AUDITOR: 'auditor',
  USER: 'user',
  GUEST: 'guest',
} as const;

export type PermissionLevel = (typeof PERMISSION_LEVELS)[keyof typeof PERMISSION_LEVELS];

/**
 * Permission requirements
 */
export const PERMISSION_REQUIREMENTS = {
  // Admin permissions
  VIEW_AUDIT_LOGS: [PERMISSION_LEVELS.ADMIN, PERMISSION_LEVELS.AUDITOR],
  EXPORT_AUDIT_LOGS: [PERMISSION_LEVELS.ADMIN, PERMISSION_LEVELS.AUDITOR],
  ARCHIVE_AUDIT_LOGS: [PERMISSION_LEVELS.ADMIN],
  MANAGE_USERS: [PERMISSION_LEVELS.ADMIN],
  VIEW_SYSTEM_LOGS: [PERMISSION_LEVELS.ADMIN],

  // User permissions
  VIEW_PROFILE: [PERMISSION_LEVELS.ADMIN, PERMISSION_LEVELS.AUDITOR, PERMISSION_LEVELS.USER],
  EDIT_PROFILE: [PERMISSION_LEVELS.ADMIN, PERMISSION_LEVELS.AUDITOR, PERMISSION_LEVELS.USER],
  VIEW_DASHBOARD: [PERMISSION_LEVELS.ADMIN, PERMISSION_LEVELS.AUDITOR, PERMISSION_LEVELS.USER],
} as const;

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  userRole: string,
  permission: keyof typeof PERMISSION_REQUIREMENTS
): boolean {
  const requiredRoles = PERMISSION_REQUIREMENTS[permission];
  // Type assertion needed since userRole is a runtime string
  // but requiredRoles array contains typed values
  return (requiredRoles as readonly string[]).includes(userRole);
}

/**
 * Check if a user has any of the required permissions
 */
export function hasAnyPermission(
  userRole: string,
  permissions: (keyof typeof PERMISSION_REQUIREMENTS)[]
): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}

/**
 * Check if a user has all of the required permissions
 */
export function hasAllPermissions(
  userRole: string,
  permissions: (keyof typeof PERMISSION_REQUIREMENTS)[]
): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: string): boolean {
  return userRole === PERMISSION_LEVELS.ADMIN;
}

/**
 * Check if user is auditor
 */
export function isAuditor(userRole: string): boolean {
  return userRole === PERMISSION_LEVELS.AUDITOR || userRole === PERMISSION_LEVELS.ADMIN;
}

/**
 * Get user's permission level
 */
export function getPermissionLevel(userRole: string): PermissionLevel {
  return (userRole as PermissionLevel) || PERMISSION_LEVELS.GUEST;
}
