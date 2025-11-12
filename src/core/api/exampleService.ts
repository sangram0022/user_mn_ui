/**
 * Example Service Using API Helpers
 * Demonstrates how to use the standardized API helper functions
 * This is a reference implementation for future services
 * 
 * NOTE: This is a reference file only. To use, copy and update imports
 * to match your domain's types.
 */

import { API_PREFIXES } from '@/services/api/common';
import { ApiHelpers } from '@/core/api/apiHelpers';

// Example type imports - update path for your domain
// import type {
//   ListUsersFilters,
//   ListUsersResponse,
//   CreateUserRequest,
//   CreateUserResponse,
//   UpdateUserRequest,
//   UpdateUserResponse,
//   DeleteUserResponse,
//   UserDetailedStats,
// } from '@/domains/admin/types';

// Placeholder types for reference
type ListUsersFilters = Record<string, unknown>;
type ListUsersResponse = { items: unknown[]; pagination: unknown };
type CreateUserRequest = Record<string, unknown>;
type CreateUserResponse = { id: string };
type UpdateUserRequest = Record<string, unknown>;
type UpdateUserResponse = { id: string };
type DeleteUserResponse = { success: boolean };
type UserDetailedStats = { id: string };

const API_PREFIX = API_PREFIXES.ADMIN_USERS;

// ============================================================================
// READ Operations (GET)
// ============================================================================

/**
 * GET /api/v1/admin/users
 * List users with pagination, filtering, sorting, and search
 * Uses ApiHelpers.get() for paginated list
 */
export const listUsers = async (filters?: ListUsersFilters): Promise<ListUsersResponse> => {
  return ApiHelpers.get<ListUsersResponse>(API_PREFIX, filters);
};

/**
 * GET /api/v1/admin/users/:id
 * Get single user by ID with detailed stats
 * Uses ApiHelpers.getOne() for single resource with unwrapping
 */
export const getUser = async (id: string): Promise<UserDetailedStats> => {
  const url = ApiHelpers.buildResourceUrl(API_PREFIX, id);
  return ApiHelpers.getOne<UserDetailedStats>(url);
};

// ============================================================================
// CREATE Operations (POST)
// ============================================================================

/**
 * POST /api/v1/admin/users
 * Create a new user (admin-created users are auto-verified and auto-approved)
 * Uses ApiHelpers.post() for creation with unwrapping
 */
export const createUser = async (data: CreateUserRequest): Promise<CreateUserResponse> => {
  return ApiHelpers.post<CreateUserResponse>(API_PREFIX, data);
};

// ============================================================================
// UPDATE Operations (PUT)
// ============================================================================

/**
 * PUT /api/v1/admin/users/:id
 * Update existing user
 * Uses ApiHelpers.put() for update with unwrapping
 */
export const updateUser = async (id: string, data: UpdateUserRequest): Promise<UpdateUserResponse> => {
  const url = ApiHelpers.buildResourceUrl(API_PREFIX, id);
  return ApiHelpers.put<UpdateUserResponse>(url, data);
};

// ============================================================================
// DELETE Operations (DELETE)
// ============================================================================

/**
 * DELETE /api/v1/admin/users/:id
 * Delete user by ID
 * Uses ApiHelpers.delete() for deletion with unwrapping
 */
export const deleteUser = async (id: string): Promise<DeleteUserResponse> => {
  const url = ApiHelpers.buildResourceUrl(API_PREFIX, id);
  return ApiHelpers.delete<DeleteUserResponse>(url);
};

/**
 * POST /api/v1/admin/users/bulk-delete
 * Bulk delete multiple users
 * Uses ApiHelpers.bulkOperation() for bulk operations
 */
export const bulkDeleteUsers = async (ids: string[]): Promise<DeleteUserResponse> => {
  const url = `${API_PREFIX}/bulk-delete`;
  return ApiHelpers.bulkOperation<DeleteUserResponse>(url, ids);
};

// ============================================================================
// CUSTOM Actions
// ============================================================================

/**
 * POST /api/v1/admin/users/:id/approve
 * Approve pending user
 * Uses ApiHelpers.buildResourceActionUrl() and ApiHelpers.post()
 */
export const approveUser = async (id: string, comment?: string): Promise<UserDetailedStats> => {
  const url = ApiHelpers.buildResourceActionUrl(API_PREFIX, id, 'approve');
  return ApiHelpers.post<UserDetailedStats>(url, { comment });
};

// ============================================================================
// Export
// ============================================================================

const adminUserService = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  approveUser,
};

export default adminUserService;
