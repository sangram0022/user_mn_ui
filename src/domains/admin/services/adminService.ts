/**
 * Admin User Management Service
 * All API calls for admin user management operations
 * 
 * Response Format:
 * All functions interact with backend ApiResponse<T> format:
 * - Success: { success: true, data: T, message?, timestamp? }
 * - Error: { success: false, error: string, field_errors?, message_code?, timestamp? }
 * 
 * Most functions use unwrapResponse() to return unwrapped data (T).
 * List operations may return full response for pagination metadata.
 * 
 * Endpoints implemented:
 * - GET    /api/v1/admin/users (list with pagination/filters)
 * - POST   /api/v1/admin/users (create user)
 * - GET    /api/v1/admin/users/:id (get user details)
 * - PUT    /api/v1/admin/users/:id (update user)
 * - DELETE /api/v1/admin/users/:id (delete user)
 * - POST   /api/v1/admin/users/:id/approve (approve user)
 * - POST   /api/v1/admin/users/bulk-action (bulk operations)
 * - GET    /api/v1/admin/export/users (export users to CSV/Excel)
 * 
 * @see {ApiResponse} @/core/api/types
 * @see {ValidationErrorResponse} @/core/api/types
 * @see {PaginatedApiResponse} @/core/api/types
 */

import { apiGet, apiPost, apiPut, apiDelete, apiDownload } from '@/core/api/apiHelpers';
import { API_PREFIXES } from '../../../services/api/common';
import type {
  ListUsersFilters,
  ListUsersResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteUserOptions,
  DeleteUserResponse,
  UserDetailedStats,
  ApproveUserRequest,
  ApproveUserResponse,
  BulkUserAction,
  BulkOperationResult,
  ExportUsersRequest,
} from '../types';

const API_PREFIX = API_PREFIXES.ADMIN;

// ============================================================================
// User Management Endpoints
// ============================================================================

/**
 * GET /api/v1/admin/users
 * List users with pagination, filtering, sorting, and search
 * Backend returns wrapped response with users array, pagination, filters, and summary
 */
export const listUsers = async (filters?: ListUsersFilters): Promise<ListUsersResponse> => {
  return apiGet<ListUsersResponse>(`${API_PREFIX}/users`, filters as Record<string, unknown>);
};

/**
 * POST /api/v1/admin/users
 * Create a new user (admin-created users are auto-verified and auto-approved)
 */
export const createUser = async (data: CreateUserRequest): Promise<CreateUserResponse> => {
  return apiPost<CreateUserResponse>(`${API_PREFIX}/users`, data);
};

/**
 * GET /api/v1/admin/users/:id
 * Get detailed user information including login statistics
 */
export const getUser = async (userId: string): Promise<UserDetailedStats> => {
  return apiGet<UserDetailedStats>(`${API_PREFIX}/users/${userId}`);
};

/**
 * PUT /api/v1/admin/users/:id
 * Update user information (partial updates supported)
 */
export const updateUser = async (
  userId: string,
  data: UpdateUserRequest
): Promise<UpdateUserResponse> => {
  return apiPut<UpdateUserResponse>(`${API_PREFIX}/users/${userId}`, data);
};

/**
 * DELETE /api/v1/admin/users/:id
 * Delete a user (soft or hard delete with options)
 */
export const deleteUser = async (
  userId: string,
  options?: DeleteUserOptions
): Promise<DeleteUserResponse> => {
  return apiDelete<DeleteUserResponse>(`${API_PREFIX}/users/${userId}`, { params: options });
};

/**
 * POST /api/v1/admin/users/:id/approve
 * Approve a pending user registration with optional benefits
 */
export const approveUser = async (
  userId: string,
  data?: ApproveUserRequest
): Promise<ApproveUserResponse> => {
  return apiPost<ApproveUserResponse>(
    `${API_PREFIX}/users/${userId}/approve`,
    data || {}
  );
};

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Perform bulk operations on multiple users
 */
export const bulkUserAction = async (action: BulkUserAction): Promise<BulkOperationResult> => {
  return apiPost<BulkOperationResult>(`${API_PREFIX}/users/bulk`, action);
};

/**
 * Bulk approve multiple users
 */
export const bulkApproveUsers = async (
  userIds: string[],
  options?: ApproveUserRequest
): Promise<BulkOperationResult> => {
  return bulkUserAction({
    operation: 'approve',
    user_ids: userIds,
    options: options as Record<string, unknown>,
  });
};

/**
 * Bulk delete multiple users
 */
export const bulkDeleteUsers = async (
  userIds: string[],
  options?: DeleteUserOptions
): Promise<BulkOperationResult> => {
  return bulkUserAction({
    operation: 'delete',
    user_ids: userIds,
    options: options as Record<string, unknown>,
  });
};

// ============================================================================
// Export Functionality
// ============================================================================

/**
 * Export users to file (CSV, JSON, or XLSX)
 * GET /api/v1/admin/export/users?format=csv
 */
export const exportUsers = async (request: ExportUsersRequest): Promise<Blob> => {
  const filters = {
    format: request.format,
    ...request.filters,
  };
  
  return apiDownload('/api/v1/admin/export/users', filters as Record<string, unknown>);
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Safe user deletion with confirmation
 */
export const safeDeleteUser = async (
  userId: string,
  currentUserId: string,
  options?: DeleteUserOptions
): Promise<DeleteUserResponse> => {
  if (userId === currentUserId) {
    throw new Error('Cannot delete your own account. Please contact another administrator.');
  }
  
  return deleteUser(userId, options);
};

// Export all as default object
const adminUserService = {
  listUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  approveUser,
  bulkUserAction,
  bulkApproveUsers,
  bulkDeleteUsers,
  exportUsers,
  safeDeleteUser,
};

export default adminUserService;
