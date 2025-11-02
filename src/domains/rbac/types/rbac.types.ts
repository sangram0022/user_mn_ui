/**
 * ========================================
 * RBAC Type System
 * ========================================
 * Central type definitions for Role-Based Access Control
 * All types are TypeScript-first with full type safety
 *
 * @source Backend: user_mn Python FastAPI
 * @backend_compatibility: Aligns with user roles and permissions
 * ========================================
 */

/**
 * Role hierarchy levels - determines access scope
 * Higher numbers = more permissions
 * Each role inherits ALL permissions from levels below
 */
export const RoleLevel = {
  PUBLIC: 0, // No authentication required
  USER: 1, // Authenticated user
  EMPLOYEE: 2, // Employee (internal)
  MANAGER: 3, // Management level
  ADMIN: 4, // Administrator
  SUPER_ADMIN: 5, // Super administrator (all access)
  AUDITOR: 4, // Special auditor role (not hierarchical)
} as const;

export type RoleLevelType = (typeof RoleLevel)[keyof typeof RoleLevel];

/**
 * All possible user roles in the system
 * Maps 1:1 with backend role definitions
 * Backend source: user_mn/src/app/core/models.py User.roles
 */
export type UserRole =
  | 'public'
  | 'user'
  | 'employee'
  | 'manager'
  | 'admin'
  | 'super_admin'
  | 'auditor';

/**
 * Permission format: "domain:action"
 * Examples: "users:delete", "users:*", "admin:*"
 *
 * Domains:
 * - auth: Authentication (login, logout, register, etc.)
 * - profile: User profile (view_own, edit_own, etc.)
 * - users: User management (view_list, create, delete, etc.)
 * - rbac: RBAC management (view_roles, assign_roles, etc.)
 * - audit: Audit logging (view logs, export, etc.)
 * - admin: Admin dashboard (system config, monitoring, etc.)
 * - email: Email operations (send verification, verify, etc.)
 * - mfa: Multi-factor authentication (enable, disable, verify)
 * - sessions: Session management (view, revoke)
 * - features: Feature management
 * - gdpr: GDPR operations (export data, delete data)
 *
 * Wildcards:
 * - "*" at any level matches everything below
 * - Examples: "users:*", "*:*"
 */
export type Permission = string;

/**
 * Options for flexible permission checking
 * Used in hasAccess() method for complex scenarios
 */
export interface AccessCheckOptions {
  /**
   * Required role(s) - user must have at least one
   * Array = OR logic (has admin OR manager)
   * String = single role
   */
  requiredRole?: UserRole | UserRole[];

  /**
   * Required permission(s)
   * If requireAllPermissions=true: user must have ALL
   * If requireAllPermissions=false: user must have ANY (default)
   */
  requiredPermissions?: Permission | Permission[];

  /**
   * If true, user must have ALL required permissions
   * If false (default), user must have ANY
   * Only applies when requiredPermissions is an array
   */
  requireAllPermissions?: boolean;
}

/**
 * Context value type - all methods available in usePermissions()
 * Matches RbacProvider capabilities
 */
export interface RbacContextValue {
  /**
   * User's current roles
   */
  userRoles: UserRole[];

  /**
   * User's computed permissions
   */
  permissions: Permission[];

  /**
   * Check if user has specific role
   * @param role Single role or array of roles (OR logic)
   * @returns true if user has at least one role
   */
  hasRole(role: UserRole | UserRole[]): boolean;

  /**
   * Check if user has specific permission
   * Supports wildcard matching: "users:*" matches "users:delete"
   * @param permission Permission string, e.g., "users:delete"
   * @returns true if user has permission
   */
  hasPermission(permission: Permission): boolean;

  /**
   * Check if user has ALL required permissions
   * @param permissions Array of permission strings
   * @returns true only if user has every permission
   */
  hasAllPermissions(permissions: Permission[]): boolean;

  /**
   * Check if user has ANY of the required permissions
   * @param permissions Array of permission strings
   * @returns true if user has at least one permission
   */
  hasAnyPermission(permissions: Permission[]): boolean;

  /**
   * Complex permission checking with role + permission requirements
   * Useful for sophisticated access control rules
   * @param options Role and permission requirements
   * @returns true if all requirements are met
   */
  hasAccess(options: AccessCheckOptions): boolean;

  /**
   * Get numeric role level
   * @param role User role
   * @returns RoleLevel number (0-5)
   */
  getRoleLevel(role: UserRole): RoleLevelType;

  /**
   * Check if user meets minimum role level
   * Higher levels include lower levels
   * @param minimumLevel Minimum RoleLevel required
   * @returns true if user's role level >= minimumLevel
   */
  hasRoleLevel(minimumLevel: RoleLevelType): boolean;

  /**
   * Check if user can access specific API endpoint
   * Based on backend endpoint configuration
   * @param method HTTP method (GET, POST, PUT, DELETE)
   * @param path API path, e.g., "/api/users"
   * @returns true if user can access endpoint
   */
  canAccessEndpoint(method: string, path: string): boolean;

  /**
   * Get what's needed to access specific endpoint
   * @param method HTTP method
   * @param path API path
   * @returns Required roles and permissions
   */
  getEndpointPermissions(method: string, path: string): {
    requiredRoles: UserRole[];
    requiredPermissions: Permission[];
  } | null;
}

/**
 * Props for CanAccess component
 * Conditional rendering based on permissions
 */
export interface CanAccessProps {
  /**
   * Content to show if user has access
   */
  children: React.ReactNode;

  /**
   * Required role(s)
   */
  requiredRole?: UserRole | UserRole[];

  /**
   * Required permission(s)
   */
  requiredPermissions?: Permission | Permission[];

  /**
   * If true, user must have ALL permissions
   * If false (default), user must have ANY
   */
  requireAllPermissions?: boolean;

  /**
   * Content to show if user lacks access
   * If not provided, nothing is shown (null)
   */
  fallback?: React.ReactNode;

  /**
   * CSS class name for wrapper div
   */
  className?: string;
}

/**
 * Props for RoleBasedButton component
 * Permission-aware button with tooltip support
 */
export interface RoleBasedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Required role(s) to enable button
   */
  requiredRole?: UserRole | UserRole[];

  /**
   * Required permission(s) to enable button
   */
  requiredPermissions?: Permission | Permission[];

  /**
   * If true, user must have ALL permissions
   * If false (default), user must have ANY
   */
  requireAllPermissions?: boolean;

  /**
   * Tooltip text shown when button is disabled
   */
  tooltipOnDisabled?: string;

  /**
   * If true, always show tooltip when disabled
   */
  showTooltip?: boolean;
}

/**
 * Backend API endpoint configuration
 * Each endpoint specifies required roles/permissions
 */
export interface ApiEndpointConfig {
  /**
   * API path, e.g., "/api/users"
   * Supports wildcards: "/api/users/*"
   */
  path: string;

  /**
   * HTTP method: GET, POST, PUT, DELETE
   */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

  /**
   * Roles required to access this endpoint
   * At least one role must be present
   */
  requiredRoles: UserRole[];

  /**
   * Permissions required to access this endpoint
   * At least one permission must be present
   */
  requiredPermissions: Permission[];

  /**
   * If true, no authentication required
   */
  public?: boolean;

  /**
   * Human-readable description
   */
  description: string;
}

/**
 * Backend API endpoint (for endpoint mapping)
 * Extended from ApiEndpointConfig
 */
export interface BackendApiEndpoint extends ApiEndpointConfig {
  /**
   * Endpoint unique ID
   */
  id?: string;

  /**
   * Feature category this endpoint belongs to
   */
  category?: string;
}

/**
 * RBAC Provider props
 */
export interface RbacProviderProps {
  /**
   * User's roles (from AuthContext)
   */
  userRoles: UserRole[];

  /**
   * Computed permissions for user's roles
   * Optional - will be computed if not provided
   */
  permissions?: Permission[];

  /**
   * Child components
   */
  children: React.ReactNode;
}

/**
 * Permission check result
 * Used internally for computation
 */
export interface PermissionCheckResult {
  /**
   * Whether the check passed
   */
  passed: boolean;

  /**
   * Reason for pass/fail (debug info)
   */
  reason: string;

  /**
   * Permissions used for check
   */
  permissions: Permission[];
}

/**
 * Role hierarchy entry
 * Maps role to its level
 */
export interface RoleHierarchyEntry {
  /**
   * Role name
   */
  role: UserRole;

  /**
   * Role level (0-5)
   */
  level: RoleLevelType;

  /**
   * Permissions for this role (after inheritance)
   */
  permissions: Permission[];
}

/**
 * Role to Permission Mapping
 * Maps roles to their permissions
 */
export type RolePermissionMapping = Record<UserRole, Permission[]>;
