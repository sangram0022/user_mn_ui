import type { User, UserProfile, UserSummary, UserRoleInfo } from '../types';

/**
 * Resolve a displayable role name from various role data structures.
 */
export const getRoleName = (
  role?: string | UserRoleInfo | null,
  fallback = ''
): string => { if (!role) {
    return fallback;
  }

  if (typeof role === 'string') { return role;
  }

  if (role.name) { return role.name;
  }

  return fallback;
};

interface RoleSource { role?: string | UserRoleInfo | null;
  role_name?: string | null; }

/**
 * Derive the most relevant role label from a user-like object.
 */
export const getUserRoleName = <T extends RoleSource | null | undefined>(
  source: T,
  fallback = ''
): string => { if (!source) {
    return fallback;
  }

  const directRole = getRoleName(source.role, fallback);
  if (directRole) { return directRole;
  }

  if (source.role_name) { return source.role_name;
  }

  return fallback;
};

/**
 * Convenience helper to check whether a user-like object has a specific role name.
 */
export const userHasRole = <T extends RoleSource | null | undefined>(
  source: T,
  roleName: string
): boolean => { if (!roleName) {
    return false;
  }

  const currentRole = getUserRoleName(source).toLowerCase();
  return currentRole === roleName.toLowerCase();
};

/**
 * Extract available permissions from a user-like object.
 */
export const getUserPermissions = <T extends RoleSource | null | undefined>(
  source: T
): string[] => { if (!source) {
    return [];
  }

  const role = source.role;

  if (role && typeof role !== 'string' && Array.isArray(role.permissions)) { return role.permissions;
  }

  return [];
};

/**
 * Narrow a generic user type to a union shared across user models.
 */
export type AnyUser = User | UserProfile | UserSummary | null | undefined;