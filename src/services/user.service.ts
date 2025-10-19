/**
 * User Management Service
 * Handles user profile and admin user management operations
 * Refactored to use unified apiClient from lib/api/client.ts
 *
 * NOTE: This service uses apiClient.execute() for endpoints not yet
 * fully mapped in apiClient, maintaining backward compatibility.
 */

import { API_ENDPOINTS } from '@config/api.config';
import { apiClient } from '@lib/api/client';
import type {
  AdminStats,
  ApproveUserRequest,
  ApproveUserResponse,
  AuditLog,
  AuditLogListParams,
  CreateUserRequest,
  CreateUserResponse,
  DeleteUserResponse,
  RejectUserRequest,
  RejectUserResponse,
  Role,
  UpdateProfileRequest,
  UpdateUserRequest,
  User,
  UserListParams,
  UserProfile,
} from '../types/api.types';

class UserService {
  // ==================== Profile Endpoints ====================

  /**
   * Get current user's profile
   */
  async getMyProfile(): Promise<UserProfile> {
    return apiClient.execute<UserProfile>(API_ENDPOINTS.PROFILE.ME);
  }

  /**
   * Update current user's profile
   */
  async updateMyProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return apiClient.execute<UserProfile>(API_ENDPOINTS.PROFILE.ME, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ==================== Admin User Management ====================

  /**
   * Get list of users (admin only)
   */
  async getUsers(params?: UserListParams): Promise<User[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    const path = query ? `${API_ENDPOINTS.ADMIN.USERS}?${query}` : API_ENDPOINTS.ADMIN.USERS;

    return apiClient.execute<User[]>(path);
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId: string): Promise<User> {
    return apiClient.execute<User>(API_ENDPOINTS.ADMIN.USER_DETAIL(userId));
  }

  /**
   * Create new user (admin only)
   */
  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    return apiClient.execute<CreateUserResponse>(API_ENDPOINTS.ADMIN.USERS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update user (admin only)
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<User> {
    return apiClient.execute<User>(API_ENDPOINTS.ADMIN.USER_DETAIL(userId), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<DeleteUserResponse> {
    return apiClient.execute<DeleteUserResponse>(API_ENDPOINTS.ADMIN.USER_DETAIL(userId), {
      method: 'DELETE',
    });
  }

  /**
   * Approve user (admin only)
   */
  async approveUser(data: ApproveUserRequest): Promise<ApproveUserResponse> {
    return apiClient.execute<ApproveUserResponse>(API_ENDPOINTS.ADMIN.APPROVE_USER, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Reject user (admin only)
   */
  async rejectUser(userId: string, data: RejectUserRequest): Promise<RejectUserResponse> {
    return apiClient.execute<RejectUserResponse>(API_ENDPOINTS.ADMIN.REJECT_USER(userId), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== Roles & Permissions ====================

  /**
   * Get available roles
   */
  async getRoles(): Promise<Role[]> {
    return apiClient.execute<Role[]>(API_ENDPOINTS.ADMIN.ROLES);
  }

  // ==================== Statistics ====================

  /**
   * Get admin statistics
   */
  async getAdminStats(): Promise<AdminStats> {
    return apiClient.execute<AdminStats>(API_ENDPOINTS.ADMIN.STATS);
  }

  // ==================== Audit Logs (Admin) ====================

  /**
   * Get audit logs (admin only)
   */
  async getAdminAuditLogs(params?: AuditLogListParams): Promise<AuditLog[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    const path = query
      ? `${API_ENDPOINTS.ADMIN.AUDIT_LOGS}?${query}`
      : API_ENDPOINTS.ADMIN.AUDIT_LOGS;

    return apiClient.execute<AuditLog[]>(path);
  }
}

export default new UserService();
