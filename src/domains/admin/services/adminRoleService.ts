/**
 * Admin Role Management Service (RBAC)
 * All API calls for role and permission management
 * 
 * Endpoints implemented:
 * - GET    /api/v1/admin/rbac/roles (list all roles)
 * - GET    /api/v1/admin/rbac/roles/:name (get role details)
 * - POST   /api/v1/admin/rbac/roles (create custom role)
 * - PUT    /api/v1/admin/rbac/roles/:name (update role)
 * - DELETE /api/v1/admin/rbac/roles/:name (delete role)
 * - POST   /api/v1/admin/users/:id/roles (assign roles to user)
 */

import { apiClient } from '../../../services/api/apiClient';
import type {
  AdminRole,
  ListRolesParams,
  ListRolesResponse,
  GetRoleParams,
  GetRoleResponse,
  CreateRoleRequest,
  CreateRoleResponse,
  UpdateRoleRequest,
  UpdateRoleResponse,
  DeleteRoleOptions,
  DeleteRoleResponse,
  AssignRolesRequest,
  AssignRolesResponse,
} from '../types';

const API_PREFIX = '/api/v1/admin/rbac';

// ============================================================================
// Response Adapter
// ============================================================================

function unwrapResponse<T>(response: unknown): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

// ============================================================================
// Role Management Endpoints
// ============================================================================

/**
 * GET /api/v1/admin/rbac/roles
 * List all roles with optional permissions and user counts
 */
export const listRoles = async (params?: ListRolesParams): Promise<ListRolesResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    if (params.include_permissions !== undefined) {
      queryParams.append('include_permissions', String(params.include_permissions));
    }
    if (params.include_users_count !== undefined) {
      queryParams.append('include_users_count', String(params.include_users_count));
    }
    if (params.status) {
      queryParams.append('status', params.status);
    }
  }
  
  const queryString = queryParams.toString();
  const url = queryString ? `${API_PREFIX}/roles?${queryString}` : `${API_PREFIX}/roles`;
  
  const response = await apiClient.get<ListRolesResponse>(url);
  return unwrapResponse<ListRolesResponse>(response.data);
};

/**
 * GET /api/v1/admin/rbac/roles/:name
 * Get detailed information about a specific role
 */
export const getRole = async (
  roleName: string,
  params?: GetRoleParams
): Promise<AdminRole> => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    if (params.include_users !== undefined) {
      queryParams.append('include_users', String(params.include_users));
    }
    if (params.users_limit !== undefined) {
      queryParams.append('users_limit', String(params.users_limit));
    }
  }
  
  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_PREFIX}/roles/${roleName}?${queryString}`
    : `${API_PREFIX}/roles/${roleName}`;
  
  const response = await apiClient.get<GetRoleResponse>(url);
  const data = unwrapResponse<GetRoleResponse>(response.data);
  return data.role;
};

/**
 * POST /api/v1/admin/rbac/roles
 * Create a new custom role with permissions
 */
export const createRole = async (data: CreateRoleRequest): Promise<AdminRole> => {
  const response = await apiClient.post<CreateRoleResponse>(`${API_PREFIX}/roles`, data);
  const result = unwrapResponse<CreateRoleResponse>(response.data);
  return result.role;
};

/**
 * PUT /api/v1/admin/rbac/roles/:name
 * Update an existing role's permissions or metadata
 */
export const updateRole = async (
  roleName: string,
  data: UpdateRoleRequest
): Promise<UpdateRoleResponse> => {
  const response = await apiClient.put<UpdateRoleResponse>(
    `${API_PREFIX}/roles/${roleName}`,
    data
  );
  return unwrapResponse<UpdateRoleResponse>(response.data);
};

/**
 * DELETE /api/v1/admin/rbac/roles/:name
 * Delete a custom role (system roles cannot be deleted)
 */
export const deleteRole = async (
  roleName: string,
  options?: DeleteRoleOptions
): Promise<DeleteRoleResponse> => {
  const queryParams = new URLSearchParams();
  
  if (options) {
    if (options.force !== undefined) {
      queryParams.append('force', String(options.force));
    }
    if (options.reassign_to) {
      queryParams.append('reassign_to', options.reassign_to);
    }
  }
  
  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_PREFIX}/roles/${roleName}?${queryString}`
    : `${API_PREFIX}/roles/${roleName}`;
  
  const response = await apiClient.delete<DeleteRoleResponse>(url);
  return unwrapResponse<DeleteRoleResponse>(response.data);
};

/**
 * POST /api/v1/admin/users/:id/roles
 * Assign one or more roles to a user
 */
export const assignRolesToUser = async (
  userId: string,
  data: AssignRolesRequest
): Promise<AssignRolesResponse> => {
  const response = await apiClient.post<AssignRolesResponse>(
    `/api/v1/admin/users/${userId}/roles`,
    data
  );
  return unwrapResponse<AssignRolesResponse>(response.data);
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Safe role deletion with validation
 */
export const safeDeleteRole = async (
  roleName: string,
  options?: DeleteRoleOptions
): Promise<DeleteRoleResponse> => {
  // Check if system role
  const systemRoles = ['admin', 'user'];
  if (systemRoles.includes(roleName.toLowerCase())) {
    throw new Error(`Cannot delete system role '${roleName}'. System roles cannot be modified.`);
  }
  
  return deleteRole(roleName, options);
};

/**
 * Get roles by hierarchy level
 */
export const getRolesByLevel = async (minLevel: number = 0, maxLevel: number = 100): Promise<AdminRole[]> => {
  const response = await listRoles({ include_permissions: true });
  return response.roles.filter(role => role.level >= minLevel && role.level <= maxLevel);
};

/**
 * Check if user has specific role
 */
export const checkUserRole = async (userId: string, roleName: string): Promise<boolean> => {
  try {
    const userResponse = await apiClient.get(`/api/v1/admin/users/${userId}`);
    const userData = unwrapResponse<{ roles: string[] }>(userResponse.data);
    return userData.roles.includes(roleName);
  } catch {
    return false;
  }
};

// Export all as default object
const adminRoleService = {
  listRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  assignRolesToUser,
  safeDeleteRole,
  getRolesByLevel,
  checkUserRole,
};

export default adminRoleService;
