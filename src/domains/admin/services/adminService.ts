/**
 * Admin User Management Service
 * All API calls for admin user management operations
 * 
 * Endpoints implemented:
 * - GET    /api/v1/admin/users (list with pagination/filters)
 * - POST   /api/v1/admin/users (create user)
 * - GET    /api/v1/admin/users/:id (get user details)
 * - PUT    /api/v1/admin/users/:id (update user)
 * - DELETE /api/v1/admin/users/:id (delete user)
 * - POST   /api/v1/admin/users/:id/approve (approve user)
 * - GET    /api/v1/admin/export/users (export users)
 * 
 * Following patterns from authService.ts:
 * - Uses apiClient for HTTP requests
 * - Implements unwrapResponse for consistent response handling
 * - Comprehensive error handling
 * - Type-safe with TypeScript
 */

import { apiClient } from '../../../services/api/apiClient';
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

const API_PREFIX = '/api/v1/admin';

// ============================================================================
// Response Adapter (DRY Principle)
// Handle both wrapped and unwrapped responses
// ============================================================================

/**
 * Unwrap ApiResponse<T> format to just T
 * Backend may return { success, message, data: {...} } or just {...}
 */
function unwrapResponse<T>(response: unknown): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

// ============================================================================
// User Management Endpoints
// ============================================================================

/**
 * GET /api/v1/admin/users
 * List users with pagination, filtering, sorting, and search
 * Backend returns properly wrapped response with users array, pagination, filters, and summary
 */
export const listUsers = async (filters?: ListUsersFilters): Promise<ListUsersResponse> => {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, String(v)));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
  }
  
  const queryString = queryParams.toString();
  const url = queryString ? `${API_PREFIX}/users?${queryString}` : `${API_PREFIX}/users`;
  
  const response = await apiClient.get<ListUsersResponse>(url);
  return response.data;
};

/**
 * POST /api/v1/admin/users
 * Create a new user (admin-created users are auto-verified and auto-approved)
 */
export const createUser = async (data: CreateUserRequest): Promise<CreateUserResponse> => {
  const response = await apiClient.post<CreateUserResponse>(`${API_PREFIX}/users`, data);
  return unwrapResponse<CreateUserResponse>(response.data);
};

/**
 * GET /api/v1/admin/users/:id
 * Get detailed user information including login statistics
 */
export const getUser = async (userId: string): Promise<UserDetailedStats> => {
  const response = await apiClient.get<UserDetailedStats>(`${API_PREFIX}/users/${userId}`);
  return unwrapResponse<UserDetailedStats>(response.data);
};

/**
 * PUT /api/v1/admin/users/:id
 * Update user information (partial updates supported)
 */
export const updateUser = async (
  userId: string,
  data: UpdateUserRequest
): Promise<UpdateUserResponse> => {
  const response = await apiClient.put<UpdateUserResponse>(`${API_PREFIX}/users/${userId}`, data);
  return unwrapResponse<UpdateUserResponse>(response.data);
};

/**
 * DELETE /api/v1/admin/users/:id
 * Delete a user (soft or hard delete with options)
 */
export const deleteUser = async (
  userId: string,
  options?: DeleteUserOptions
): Promise<DeleteUserResponse> => {
  const queryParams = new URLSearchParams();
  
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const queryString = queryParams.toString();
  const url = queryString 
    ? `${API_PREFIX}/users/${userId}?${queryString}`
    : `${API_PREFIX}/users/${userId}`;
  
  const response = await apiClient.delete<DeleteUserResponse>(url);
  return unwrapResponse<DeleteUserResponse>(response.data);
};

/**
 * POST /api/v1/admin/users/:id/approve
 * Approve a pending user registration with optional benefits
 */
export const approveUser = async (
  userId: string,
  data?: ApproveUserRequest
): Promise<ApproveUserResponse> => {
  const response = await apiClient.post<ApproveUserResponse>(
    `${API_PREFIX}/users/${userId}/approve`,
    data || {}
  );
  return unwrapResponse<ApproveUserResponse>(response.data);
};

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Perform bulk operations on multiple users
 */
export const bulkUserAction = async (action: BulkUserAction): Promise<BulkOperationResult> => {
  const response = await apiClient.post<BulkOperationResult>(
    `${API_PREFIX}/users/bulk`,
    action
  );
  return unwrapResponse<BulkOperationResult>(response.data);
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
  const params = new URLSearchParams();
  params.append('format', request.format);
  
  // Add filters to query params
  if (request.filters) {
    Object.entries(request.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }
  
  const response = await apiClient.get(
    `/api/v1/admin/export/users?${params.toString()}`,
    {
      responseType: 'blob',
    }
  );
  
  return response.data;
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
