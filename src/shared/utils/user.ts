/**
 * User Utility Functions
 *
 * Provides utility functions for user-related operations such as
 * role name formatting and permission extraction.
 *
 * @author Senior React Developer
 * @created [Current Date]
 */

import type { User } from '../../types/api.types';

/**
 * Role display name mapping
 */
const ROLE_DISPLAY_NAMES: Record<string, string> = {
  admin: 'Administrator',
  moderator: 'Moderator',
  user: 'User',
  guest: 'Guest',
  super_admin: 'Super Administrator',
  content_moderator: 'Content Moderator',
  support: 'Support',
};

/**
 * Gets a human-readable role name for display
 *
 * @param user - The user object
 * @returns Formatted role name for display
 *
 * @example
 * ```typescript
 * const roleName = getUserRoleName(user);
 * // Returns: "Administrator" for role "admin"
 * ```
 */
export function getUserRoleName(user: User | null | undefined): string {
  if (!user?.role) {
    return 'Guest';
  }

  // Return mapped name or capitalize the role
  return (
    ROLE_DISPLAY_NAMES[user.role.toLowerCase()] ||
    user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
  );
}

/**
 * Role-based permission mapping
 */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    'users.read',
    'users.write',
    'users.delete',
    'content.read',
    'content.write',
    'content.delete',
    'settings.read',
    'settings.write',
    'reports.read',
    'analytics.read',
  ],
  moderator: ['users.read', 'content.read', 'content.write', 'content.delete', 'reports.read'],
  user: ['content.read', 'profile.read', 'profile.write'],
  guest: ['content.read'],
};

/**
 * Gets the list of permissions for a user based on their role
 *
 * @param user - The user object
 * @returns Array of permission strings
 *
 * @example
 * ```typescript
 * const permissions = getUserPermissions(user);
 * // Returns: ["users.read", "users.write", ...] for admin
 * ```
 */
export function getUserPermissions(user: User | null | undefined): string[] {
  if (!user?.role) {
    return ROLE_PERMISSIONS.guest || [];
  }

  const role = user.role.toLowerCase();
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.guest || [];
}

/**
 * Checks if a user has a specific permission
 *
 * @param user - The user object
 * @param permission - The permission to check
 * @returns True if user has the permission
 *
 * @example
 * ```typescript
 * if (hasPermission(user, 'users.write')) {
 *   // Show edit button
 * }
 * ```
 */
export function hasPermission(user: User | null | undefined, permission: string): boolean {
  const permissions = getUserPermissions(user);
  return permissions.includes(permission);
}

/**
 * Checks if a user has any of the specified permissions
 *
 * @param user - The user object
 * @param permissions - Array of permissions to check
 * @returns True if user has at least one permission
 *
 * @example
 * ```typescript
 * if (hasAnyPermission(user, ['users.write', 'content.write'])) {
 *   // Show content management section
 * }
 * ```
 */
export function hasAnyPermission(user: User | null | undefined, permissions: string[]): boolean {
  const userPermissions = getUserPermissions(user);
  return permissions.some((permission) => userPermissions.includes(permission));
}

/**
 * Checks if a user has all of the specified permissions
 *
 * @param user - The user object
 * @param permissions - Array of permissions to check
 * @returns True if user has all permissions
 *
 * @example
 * ```typescript
 * if (hasAllPermissions(user, ['users.read', 'users.write'])) {
 *   // Show full user management UI
 * }
 * ```
 */
export function hasAllPermissions(user: User | null | undefined, permissions: string[]): boolean {
  const userPermissions = getUserPermissions(user);
  return permissions.every((permission) => userPermissions.includes(permission));
}

/**
 * Gets user's full name
 *
 * @param user - The user object
 * @returns Full name or email if name not available
 *
 * @example
 * ```typescript
 * const fullName = getUserFullName(user);
 * // Returns: "John Doe" or "john@example.com"
 * ```
 */
export function getUserFullName(user: User | null | undefined): string {
  if (!user) {
    return 'Guest';
  }

  const firstName = user.first_name?.trim();
  const lastName = user.last_name?.trim();

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  if (firstName) {
    return firstName;
  }

  if (lastName) {
    return lastName;
  }

  return user.email;
}

/**
 * Gets user's initials for avatar
 *
 * @param user - The user object
 * @returns User initials (max 2 characters)
 *
 * @example
 * ```typescript
 * const initials = getUserInitials(user);
 * // Returns: "JD" for "John Doe"
 * ```
 */
export function getUserInitials(user: User | null | undefined): string {
  if (!user) {
    return 'G';
  }

  const firstName = user.first_name?.trim();
  const lastName = user.last_name?.trim();

  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  if (firstName) {
    return firstName.charAt(0).toUpperCase();
  }

  if (lastName) {
    return lastName.charAt(0).toUpperCase();
  }

  return user.email.charAt(0).toUpperCase();
}
