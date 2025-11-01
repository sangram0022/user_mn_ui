// ⭐ SINGLE SOURCE OF TRUTH for roles and permissions

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
  GUEST: 'guest',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  // User permissions
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_APPROVE: 'user:approve',
  USER_REJECT: 'user:reject',
  
  // Role permissions
  ROLE_READ: 'role:read',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  
  // Permission management
  PERMISSION_READ: 'permission:read',
  PERMISSION_ASSIGN: 'permission:assign',
  
  // Audit permissions
  AUDIT_READ: 'audit:read',
  AUDIT_EXPORT: 'audit:export',
  
  // System permissions
  CACHE_MANAGE: 'cache:manage',
  SYSTEM_MONITOR: 'system:monitor',
  METRICS_VIEW: 'metrics:view',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Role-to-permissions mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_APPROVE,
    PERMISSIONS.USER_REJECT,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.ROLE_CREATE,
    PERMISSIONS.ROLE_UPDATE,
    PERMISSIONS.ROLE_DELETE,
    PERMISSIONS.PERMISSION_READ,
    PERMISSIONS.PERMISSION_ASSIGN,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.AUDIT_EXPORT,
    PERMISSIONS.CACHE_MANAGE,
    PERMISSIONS.SYSTEM_MONITOR,
    PERMISSIONS.METRICS_VIEW,
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_APPROVE,
    PERMISSIONS.USER_REJECT,
    PERMISSIONS.AUDIT_READ,
  ],
  [ROLES.USER]: [
    PERMISSIONS.USER_READ,
  ],
  [ROLES.GUEST]: [],
};

// Helper functions
export const hasRole = (userRoles: Role[], requiredRole: Role): boolean => {
  return userRoles.includes(requiredRole);
};

export const hasPermission = (userRoles: Role[], permission: Permission): boolean => {
  return userRoles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission));
};

export const hasAnyPermission = (userRoles: Role[], permissions: Permission[]): boolean => {
  return permissions.some((permission) => hasPermission(userRoles, permission));
};

export const hasAllPermissions = (userRoles: Role[], permissions: Permission[]): boolean => {
  return permissions.every((permission) => hasPermission(userRoles, permission));
};
