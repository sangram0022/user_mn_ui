/**
 * Admin Role Management Service (RBAC)
 * All API calls for role and permission management
 * 
 * Response Format:
 * All functions interact with backend ApiResponse<T> format:
 * - Success: { success: true, data: T, message?, timestamp? }
 * - Error: { success: false, error: string, field_errors?, message_code?, timestamp? }
 * 
 * Functions use unwrapResponse() to return unwrapped data (T).
 * 
 * Endpoints implemented:
 * - GET    /api/v1/admin/rbac/roles (list all roles)
 * - GET    /api/v1/admin/rbac/roles/:name (get role details)
 * - POST   /api/v1/admin/rbac/roles (create custom role)
 * - PUT    /api/v1/admin/rbac/roles/:name (update role)
 * - DELETE /api/v1/admin/rbac/roles/:name (delete role)
 * - POST   /api/v1/admin/users/:id/roles (assign roles to user)
 * 
 * @see {ApiResponse} @/core/api/types
 * @see {ValidationErrorResponse} @/core/api/types
 */

import { apiGet, apiPost, apiPut, apiDelete, apiDownload } from '@/core/api/apiHelpers';
import { API_PREFIXES, unwrapResponse } from '../../../services/api/common';
import { logger } from '../../../core/logging';
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

const API_PREFIX = API_PREFIXES.ADMIN_RBAC;

// ============================================================================
// Role Management Endpoints
// ============================================================================

/**
 * GET /api/v1/admin/rbac/roles
 * List all roles with optional permissions and user counts
 */
export const listRoles = async (params?: ListRolesParams): Promise<ListRolesResponse> => {
  logger().debug('About to call apiGet', { service: 'adminRoleService.listRoles', endpoint: `${API_PREFIX}/roles` });
  
  const response = await apiGet<ListRolesResponse>(`${API_PREFIX}/roles`, params as Record<string, unknown>);
  
  logger().debug('Response received', {
    service: 'adminRoleService.listRoles',
    hasData: !!response,
  });
  
  return response;
};

/**
 * GET /api/v1/admin/rbac/roles/:name
 * Get detailed information about a specific role
 */
export const getRole = async (
  roleName: string,
  params?: GetRoleParams
): Promise<AdminRole> => {
  const data = await apiGet<GetRoleResponse>(`${API_PREFIX}/roles/${roleName}`, params as Record<string, unknown>);
  return data.role;
};

/**
 * POST /api/v1/admin/rbac/roles
 * Create a new custom role with permissions
 */
export const createRole = async (data: CreateRoleRequest): Promise<AdminRole> => {
  const result = await apiPost<CreateRoleResponse>(`${API_PREFIX}/roles`, data);
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
  return apiPut<UpdateRoleResponse>(`${API_PREFIX}/roles/${roleName}`, data);
};

/**
 * DELETE /api/v1/admin/rbac/roles/:name
 * Delete a custom role (system roles cannot be deleted)
 */
export const deleteRole = async (
  roleName: string,
  options?: DeleteRoleOptions
): Promise<DeleteRoleResponse> => {
  return apiDelete<DeleteRoleResponse>(`${API_PREFIX}/roles/${roleName}`, { params: options });
};

/**
 * POST /api/v1/admin/users/:id/roles
 * Assign one or more roles to a user
 */
export const assignRolesToUser = async (
  userId: string,
  data: AssignRolesRequest
): Promise<AssignRolesResponse> => {
  return apiPost<AssignRolesResponse>(`/api/v1/admin/users/${userId}/roles`, data);
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

/**
 * Export roles to file (CSV, JSON, or XLSX)
 * GET /api/v1/admin/export/roles?format=csv
 */
export const exportRoles = async (
  format: 'csv' | 'json' | 'xlsx' = 'csv',
  filters?: { include_permissions?: boolean; include_users_count?: boolean }
): Promise<Blob> => {
  const allFilters = {
    format,
    ...filters,
  };
  
  return apiDownload('/api/v1/admin/export/roles', allFilters as Record<string, unknown>);
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
  exportRoles,
};

export default adminRoleService;
