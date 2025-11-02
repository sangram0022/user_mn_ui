// ========================================
// Role-Permission Mapping - SINGLE SOURCE OF TRUTH
// ========================================
// Centralized role hierarchy and permission definitions
// Backend compatible with user_mn permissions.yaml
// Follows DRY principle - permissions defined once
// ========================================

import type { UserRole, Permission } from '../types/rbac.types';
import { RoleLevel } from '../types/rbac.types';
import type { RoleLevelType } from '../types/rbac.types';

// Re-export RoleLevel for use in other modules
export { RoleLevel };

/**
 * Role hierarchy levels for inheritance
 * Higher level = more permissions inherited from lower levels
 */
export const ROLE_HIERARCHY: Record<UserRole, RoleLevelType> = {
  public: RoleLevel.PUBLIC,
  user: RoleLevel.USER,
  employee: RoleLevel.EMPLOYEE,
  manager: RoleLevel.MANAGER,
  admin: RoleLevel.ADMIN,
  super_admin: RoleLevel.SUPER_ADMIN,
  auditor: RoleLevel.ADMIN, // Auditors have admin-level access (specific permissions)
};

/**
 * Permission constants - Domain:Action format
 * Organized by domain for maintainability
 */
const PERMISSIONS = {
  // Auth permissions (public + authenticated users)
  AUTH: {
    LOGIN: 'auth:login',
    LOGOUT: 'auth:logout',
    REGISTER: 'auth:register',
    REFRESH_TOKEN: 'auth:refresh_token',
    ALL: 'auth:*',
  },

  // User profile permissions
  PROFILE: {
    VIEW_OWN: 'profile:view_own',
    EDIT_OWN: 'profile:edit_own',
    VIEW_ANY: 'profile:view_any',
    EDIT_ANY: 'profile:edit_any',
    ALL: 'profile:*',
  },

  // User management permissions
  USERS: {
    VIEW_LIST: 'users:view_list',
    VIEW_DETAIL: 'users:view_detail',
    CREATE: 'users:create',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
    MANAGE_TEAM: 'users:manage_team',
    ALL: 'users:*',
  },

  // RBAC management permissions
  RBAC: {
    VIEW_ROLES: 'rbac:view_roles',
    VIEW_PERMISSIONS: 'rbac:view_permissions',
    ASSIGN_ROLES: 'rbac:assign_roles',
    MANAGE_ROLES: 'rbac:manage_roles',
    ALL: 'rbac:*',
  },

  // Audit logging permissions
  AUDIT: {
    VIEW_OWN_LOGS: 'audit:view_own_logs',
    VIEW_ALL_LOGS: 'audit:view_all_logs',
    EXPORT_LOGS: 'audit:export_logs',
    ALL: 'audit:*',
  },

  // Admin permissions
  ADMIN: {
    DASHBOARD: 'admin:dashboard',
    SYSTEM_CONFIG: 'admin:system_config',
    MONITORING: 'admin:monitoring',
    ALL: 'admin:*',
  },

  // Email verification permissions
  EMAIL: {
    SEND_VERIFICATION: 'email:send_verification',
    VERIFY: 'email:verify',
    ALL: 'email:*',
  },

  // MFA permissions
  MFA: {
    ENABLE: 'mfa:enable',
    DISABLE: 'mfa:disable',
    VERIFY: 'mfa:verify',
    ALL: 'mfa:*',
  },

  // Session management permissions
  SESSIONS: {
    VIEW_OWN: 'sessions:view_own',
    VIEW_ALL: 'sessions:view_all',
    REVOKE: 'sessions:revoke',
    ALL: 'sessions:*',
  },

  // Feature permissions
  FEATURES: {
    VIEW: 'features:view',
    MANAGE: 'features:manage',
    ALL: 'features:*',
  },

  // GDPR permissions
  GDPR: {
    EXPORT_DATA: 'gdpr:export_data',
    DELETE_DATA: 'gdpr:delete_data',
    ALL: 'gdpr:*',
  },
} as const;

/**
 * ✅ SINGLE SOURCE OF TRUTH for permissions by role
 * Defines what each role can do
 *
 * Key principle: Higher roles inherit ALL permissions of lower roles
 * - super_admin inherits everything
 * - admin inherits employee, user, public permissions
 * - manager inherits employee, user, public permissions
 * - etc.
 */

// Base permissions for each role (without inheritance)
const BASE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // PUBLIC: No authentication required
  public: [PERMISSIONS.AUTH.LOGIN, PERMISSIONS.AUTH.REGISTER],

  // USER: Basic authenticated user
  user: [
    PERMISSIONS.AUTH.LOGOUT,
    PERMISSIONS.AUTH.REFRESH_TOKEN,
    PERMISSIONS.PROFILE.VIEW_OWN,
    PERMISSIONS.PROFILE.EDIT_OWN,
    PERMISSIONS.SESSIONS.VIEW_OWN,
    PERMISSIONS.EMAIL.VERIFY,
    PERMISSIONS.MFA.ENABLE,
    PERMISSIONS.MFA.DISABLE,
    PERMISSIONS.GDPR.EXPORT_DATA,
  ],

  // EMPLOYEE: Regular employee with basic permissions
  employee: [
    PERMISSIONS.USERS.VIEW_LIST,
    PERMISSIONS.USERS.VIEW_DETAIL,
    PERMISSIONS.AUDIT.VIEW_OWN_LOGS,
  ],

  // MANAGER: Team lead/manager
  manager: [
    PERMISSIONS.USERS.MANAGE_TEAM,
    PERMISSIONS.AUDIT.VIEW_ALL_LOGS,
  ],

  // ADMIN: System administrator
  admin: [
    PERMISSIONS.USERS.ALL,
    PERMISSIONS.RBAC.ALL,
    PERMISSIONS.AUDIT.ALL,
    PERMISSIONS.ADMIN.ALL,
    PERMISSIONS.EMAIL.ALL,
    PERMISSIONS.MFA.ALL,
    PERMISSIONS.SESSIONS.ALL,
    PERMISSIONS.FEATURES.MANAGE,
  ],

  // SUPER_ADMIN: Highest privilege
  super_admin: [
    PERMISSIONS.GDPR.DELETE_DATA,
  ],

  // AUDITOR: Specialized role for auditing
  auditor: [
    PERMISSIONS.AUDIT.VIEW_ALL_LOGS,
    PERMISSIONS.AUDIT.EXPORT_LOGS,
  ],
};

/**
 * ROLE_PERMISSIONS with inheritance hierarchy
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  public: BASE_PERMISSIONS.public,
  user: [
    ...BASE_PERMISSIONS.public,
    ...BASE_PERMISSIONS.user,
  ],
  employee: [
    ...BASE_PERMISSIONS.public,
    ...BASE_PERMISSIONS.user,
    ...BASE_PERMISSIONS.employee,
  ],
  manager: [
    ...BASE_PERMISSIONS.public,
    ...BASE_PERMISSIONS.user,
    ...BASE_PERMISSIONS.employee,
    ...BASE_PERMISSIONS.manager,
  ],
  admin: [
    ...BASE_PERMISSIONS.public,
    ...BASE_PERMISSIONS.user,
    ...BASE_PERMISSIONS.employee,
    ...BASE_PERMISSIONS.manager,
    ...BASE_PERMISSIONS.admin,
  ],
  super_admin: [
    ...BASE_PERMISSIONS.public,
    ...BASE_PERMISSIONS.user,
    ...BASE_PERMISSIONS.employee,
    ...BASE_PERMISSIONS.manager,
    ...BASE_PERMISSIONS.admin,
    ...BASE_PERMISSIONS.super_admin,
  ],
  auditor: [
    ...BASE_PERMISSIONS.public,
    ...BASE_PERMISSIONS.user,
    ...BASE_PERMISSIONS.auditor,
  ],
};

/**
 * Get all effective permissions for a user's role
 * Handles permission inheritance and wildcard expansion
 * ✅ Uses memoization to avoid recomputation
 */
const permissionCache = new Map<UserRole, Set<Permission>>();

export function getEffectivePermissions(role: UserRole): Permission[] {
  // Check cache first
  if (permissionCache.has(role)) {
    return Array.from(permissionCache.get(role)!);
  }

  const permissions = new Set<Permission>(ROLE_PERMISSIONS[role] || []);

  // Store in cache
  permissionCache.set(role, permissions);

  return Array.from(permissions);
}

/**
 * Get all permissions for multiple roles
 * Merges permissions from all roles (union)
 */
export function getEffectivePermissionsForRoles(roles: UserRole[]): Permission[] {
  const allPermissions = new Set<Permission>();

  for (const role of roles) {
    const rolePermissions = getEffectivePermissions(role);
    rolePermissions.forEach(perm => allPermissions.add(perm));
  }

  return Array.from(allPermissions);
}

/**
 * Check if a permission matches a pattern (wildcard support)
 * Examples:
 * - checkPermissionMatch('users:delete', 'users:*') → true
 * - checkPermissionMatch('users:delete', 'users:delete') → true
 * - checkPermissionMatch('users:delete', 'profile:*') → false
 */
export function checkPermissionMatch(
  permission: Permission,
  pattern: Permission
): boolean {
  if (pattern === '*') return true;
  if (permission === pattern) return true;

  // Wildcard matching: "users:*" matches "users:delete"
  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1); // Remove the *
    return permission.startsWith(prefix);
  }

  return false;
}

/**
 * Check if user has a specific permission
 * Handles wildcard matching
 */
export function hasPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  return userPermissions.some(userPerm =>
    checkPermissionMatch(requiredPermission, userPerm)
  );
}

/**
 * Check if user has ALL of multiple permissions
 */
export function hasAllPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every(perm =>
    hasPermission(userPermissions, perm)
  );
}

/**
 * Check if user has ANY of multiple permissions
 */
export function hasAnyPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some(perm =>
    hasPermission(userPermissions, perm)
  );
}

/**
 * Check if user has minimum required role level
 * With role hierarchy (higher roles inherit lower roles)
 */
export function hasMinimumRoleLevel(
  userRoles: UserRole[],
  minimumLevel: RoleLevelType
): boolean {
  return userRoles.some(role => {
    const roleLevel = ROLE_HIERARCHY[role] ?? RoleLevel.PUBLIC;
    return roleLevel >= minimumLevel;
  });
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(
  userRoles: UserRole[],
  requiredRoles: UserRole[]
): boolean {
  return userRoles.some(role => requiredRoles.includes(role));
}

/**
 * Get role display name for UI
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    public: 'Public',
    user: 'User',
    employee: 'Employee',
    manager: 'Manager',
    admin: 'Administrator',
    super_admin: 'Super Administrator',
    auditor: 'Auditor',
  };
  return displayNames[role] || role;
}

/**
 * Get role level display name
 */
export function getRoleLevelName(level: RoleLevelType): string {
  const levelNames: Record<RoleLevelType, string> = {
    [RoleLevel.PUBLIC]: 'Public',
    [RoleLevel.USER]: 'User',
    [RoleLevel.EMPLOYEE]: 'Employee',
    [RoleLevel.MANAGER]: 'Manager',
    [RoleLevel.ADMIN]: 'Administrator',
    [RoleLevel.SUPER_ADMIN]: 'Super Administrator',
  };
  return levelNames[level] || 'Unknown';
}

/**
 * Export all permission constants for use in components
 * ✅ DRY principle - use these instead of hardcoding permission strings
 */
export const PERMISSION_CONSTANTS = PERMISSIONS;

/**
 * Get all available roles
 */
export function getAllRoles(): UserRole[] {
  return Object.keys(ROLE_HIERARCHY) as UserRole[];
}

/**
 * Get all available permissions
 */
export function getAllPermissions(): Permission[] {
  const permissions = new Set<Permission>();

  Object.values(PERMISSIONS).forEach(domain => {
    Object.values(domain).forEach(permission => {
      if (typeof permission === 'string') {
        permissions.add(permission);
      }
    });
  });

  return Array.from(permissions);
}
