/**
 * Admin Role Management - Type Definitions
 * Types for all role management API endpoints (RBAC)
 * 
 * Endpoints covered:
 * - GET    /api/v1/admin/rbac/roles (list)
 * - GET    /api/v1/admin/rbac/roles/:name (get details)
 * - POST   /api/v1/admin/rbac/roles (create)
 * - PUT    /api/v1/admin/rbac/roles/:name (update)
 * - DELETE /api/v1/admin/rbac/roles/:name (delete)
 * - POST   /api/v1/admin/users/:id/roles (assign to user)
 */

// ============================================================================
// Role Entity
// ============================================================================

export type RoleStatus = 'active' | 'inactive';

export interface RolePermission {
  resource: string;
  actions: string[];
  conditions?: Record<string, unknown>;
}

export interface AdminRole {
  role_id: string;
  role_name: string;
  display_name: string;
  description: string;
  level: number;
  status: RoleStatus;
  
  permissions: RolePermission[];
  restrictions?: string[];
  
  users_count?: number;
  users?: RoleUser[];
  
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_modified_by?: string;
}

export interface RoleUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  assigned_at?: string;
}

// ============================================================================
// List Roles - Request/Response
// ============================================================================

export interface ListRolesParams {
  include_permissions?: boolean;
  include_users_count?: boolean;
  status?: 'active' | 'inactive' | 'all';
}

export interface ListRolesResponse {
  roles: AdminRole[];
  total: number;
  metadata: {
    hierarchy: string[];
    system_roles: string[];
    custom_roles: string[];
  };
}

// ============================================================================
// Get Role Details - Request/Response
// ============================================================================

export interface GetRoleParams {
  include_users?: boolean;
  users_limit?: number;
}

export interface GetRoleResponse {
  role: AdminRole;
}

// ============================================================================
// Create Role - Request/Response
// ============================================================================

export interface CreateRoleRequest {
  role_name: string;
  display_name: string;
  description?: string;
  level: number;
  permissions: RolePermission[];
  restrictions?: string[];
}

export interface CreateRoleResponse {
  role: AdminRole;
  message: string;
}

// ============================================================================
// Update Role - Request/Response
// ============================================================================

export interface UpdateRoleRequest {
  display_name?: string;
  description?: string;
  level?: number;
  permissions?: RolePermission[];
  restrictions?: string[];
}

export interface UpdateRoleChanges {
  field: string;
  old_value: unknown;
  new_value: unknown;
}

export interface UpdateRoleResponse {
  role: AdminRole;
  changes: UpdateRoleChanges[];
  message: string;
  affected_users_count?: number;
}

// ============================================================================
// Delete Role - Request/Response
// ============================================================================

export interface DeleteRoleOptions {
  force?: boolean;
  reassign_to?: string;
}

export interface DeleteRoleResponse {
  deleted_role: string;
  users_affected: number;
  users_reassigned_to: string;
  deleted_at: string;
}

// ============================================================================
// Assign Roles to User - Request/Response
// ============================================================================

export interface AssignRolesRequest {
  roles: string[];
  replace?: boolean;
  reason?: string;
}

export interface AssignRolesResponse {
  user_id: string;
  roles_before: string[];
  roles_after: string[];
  roles_added: string[];
  roles_removed?: string[];
  effective_permissions: string[];
  message: string;
}

// ============================================================================
// Role Permissions
// ============================================================================

export const AVAILABLE_RESOURCES = [
  'users',
  'roles',
  'content',
  'audit_logs',
  'analytics',
  'settings',
  'reports',
  'system',
] as const;

export type ResourceType = typeof AVAILABLE_RESOURCES[number];

export const AVAILABLE_ACTIONS = [
  'create',
  'read',
  'update',
  'delete',
  'approve',
  'reject',
  'suspend',
  'export',
  'import',
] as const;

export type ActionType = typeof AVAILABLE_ACTIONS[number];

// ============================================================================
// Role Hierarchy & Validation
// ============================================================================

export interface RoleHierarchy {
  level: number;
  role_name: string;
  display_name: string;
  can_manage: string[];
}

export const ROLE_LEVELS = {
  admin: 100,
  manager: 50,
  auditor: 25,
  user: 10,
} as const;

export const RESERVED_LEVELS = [10, 100] as const;

export const MIN_CUSTOM_ROLE_LEVEL = 1;
export const MAX_CUSTOM_ROLE_LEVEL = 99;

// ============================================================================
// Role Validation Rules
// ============================================================================

export const ROLE_NAME_REGEX = /^[a-z0-9_]{3,50}$/;
export const DISPLAY_NAME_MIN_LENGTH = 3;
export const DISPLAY_NAME_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;

// ============================================================================
// Type Guards
// ============================================================================

export function isAdminRole(obj: unknown): obj is AdminRole {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'role_id' in obj &&
    'role_name' in obj &&
    'permissions' in obj
  );
}

export function isRolePermission(obj: unknown): obj is RolePermission {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'resource' in obj &&
    'actions' in obj &&
    Array.isArray((obj as RolePermission).actions)
  );
}

export function isValidRoleLevel(level: number): boolean {
  return (
    level >= MIN_CUSTOM_ROLE_LEVEL &&
    level <= MAX_CUSTOM_ROLE_LEVEL &&
    !RESERVED_LEVELS.includes(level as typeof RESERVED_LEVELS[number])
  );
}

export function isSystemRole(roleName: string): boolean {
  return ['admin', 'user'].includes(roleName);
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Role with all optional fields required (for creation)
 */
export type RequiredRole = Required<Omit<AdminRole, 'users' | 'users_count' | 'created_by' | 'last_modified_by' | 'restrictions'>>;

/**
 * Role without sensitive information (for public display)
 */
export type PublicRole = Omit<AdminRole, 'created_by' | 'last_modified_by'>;

/**
 * Role summary for dropdown/selection
 */
export interface RoleSummary {
  role_name: string;
  display_name: string;
  level: number;
  users_count?: number;
}
