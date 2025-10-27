/**
 * Role-Based Permission Utilities
 *
 * Centralized permission checking logic for role-based access control.
 * Maps roles to their permissions and provides utility functions.
 *
 * @module shared/utils/rolePermissions
 */

import type { UserProfile } from '@shared/types';

/**
 * Permission mapping for each role
 * Defines what permissions each role has access to
 */
export const ROLE_PERMISSIONS_MAP: Record<string, string[]> = {
  // Super Admin - Full access to everything
  super_admin: [
    'admin',
    'user:read',
    'user:write',
    'user:delete',
    'rbac:read',
    'rbac:write',
    'audit:read',
    'audit:write',
    'analytics:read',
    'analytics:write',
    'health:read',
    'bulk:read',
    'bulk:write',
    'settings:read',
    'settings:write',
  ],

  // Admin - Most permissions except some super admin specific
  admin: [
    'admin',
    'user:read',
    'user:write',
    'user:delete',
    'rbac:read',
    'rbac:write',
    'audit:read',
    'analytics:read',
    'health:read',
    'bulk:read',
    'bulk:write',
  ],

  // Manager - User management and analytics
  manager: ['user:read', 'user:write', 'analytics:read', 'audit:read'],

  // User - Basic permissions
  user: [
    'user:read', // Can view users (limited)
  ],

  // Guest - Minimal permissions
  guest: [],
};

/**
 * Checks if a user has a specific permission based on their roles
 *
 * @param user - User object with roles array
 * @param permission - Permission string to check (e.g., 'user:read', 'admin')
 * @returns True if user has the permission
 *
 * @example
 * ```typescript
 * if (checkUserPermission(user, 'user:write')) {
 *   // Allow user editing
 * }
 * ```
 */
export function checkUserPermission(
  user: UserProfile | null | undefined,
  permission: string
): boolean {
  // No user = no permissions
  if (!user) return false;

  // Superuser always has all permissions
  if (user.is_superuser) return true;

  // Check if user has roles array
  if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
    return false;
  }

  // Check each role for the permission
  for (const role of user.roles) {
    const roleKey = role.toLowerCase();
    const permissions = ROLE_PERMISSIONS_MAP[roleKey];

    if (!permissions) continue;

    // Check if role has the exact permission
    if (permissions.includes(permission)) {
      return true;
    }

    // Check if role has wildcard permission (e.g., 'admin' grants all)
    if (permissions.includes('admin') && permission !== 'admin') {
      return true;
    }

    // Check if permission starts with a prefix the role has
    // e.g., 'user:read' matches if role has 'user:read'
    const hasPrefix = permissions.some((p) => {
      if (p.includes(':')) {
        const prefix = p.split(':')[0];
        return permission.startsWith(prefix + ':');
      }
      return false;
    });

    if (hasPrefix) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if user has any of the specified permissions
 *
 * @param user - User object with roles array
 * @param permissions - Array of permissions to check
 * @returns True if user has at least one permission
 */
export function checkAnyPermission(
  user: UserProfile | null | undefined,
  permissions: string[]
): boolean {
  return permissions.some((permission) => checkUserPermission(user, permission));
}

/**
 * Checks if user has all of the specified permissions
 *
 * @param user - User object with roles array
 * @param permissions - Array of permissions to check
 * @returns True if user has all permissions
 */
export function checkAllPermissions(
  user: UserProfile | null | undefined,
  permissions: string[]
): boolean {
  return permissions.every((permission) => checkUserPermission(user, permission));
}

/**
 * Checks if user has a specific role
 *
 * @param user - User object with roles array
 * @param role - Role name to check (e.g., 'admin', 'super_admin')
 * @returns True if user has the role
 */
export function hasRole(user: UserProfile | null | undefined, role: string): boolean {
  if (!user || !user.roles || !Array.isArray(user.roles)) {
    return false;
  }

  return user.roles.some((userRole) => userRole.toLowerCase() === role.toLowerCase());
}

/**
 * Checks if user has any of the specified roles
 *
 * @param user - User object with roles array
 * @param roles - Array of roles to check
 * @returns True if user has at least one role
 */
export function hasAnyRole(user: UserProfile | null | undefined, roles: string[]): boolean {
  return roles.some((role) => hasRole(user, role));
}

/**
 * Gets all permissions for a user based on their roles
 *
 * @param user - User object with roles array
 * @returns Array of all permissions user has
 */
export function getUserAllPermissions(user: UserProfile | null | undefined): string[] {
  if (!user) return [];

  if (user.is_superuser) {
    // Return all permissions for superuser
    return Object.values(ROLE_PERMISSIONS_MAP).flat();
  }

  if (!user.roles || !Array.isArray(user.roles)) {
    return [];
  }

  const allPermissions = new Set<string>();

  for (const role of user.roles) {
    const roleKey = role.toLowerCase();
    const permissions = ROLE_PERMISSIONS_MAP[roleKey] || [];
    permissions.forEach((permission) => allPermissions.add(permission));
  }

  return Array.from(allPermissions);
}

/**
 * Checks if user is admin (has admin or super_admin role)
 *
 * @param user - User object with roles array
 * @returns True if user is admin
 */
export function isAdmin(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  if (user.is_superuser) return true;
  return hasAnyRole(user, ['admin', 'super_admin']);
}

/**
 * Checks if user is super admin
 *
 * @param user - User object with roles array
 * @returns True if user is super admin
 */
export function isSuperAdmin(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return user.is_superuser || hasRole(user, 'super_admin');
}
