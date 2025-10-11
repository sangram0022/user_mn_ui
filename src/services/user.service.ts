/**
 * User Management Service
 * Handles user profile and admin user management operations
 */

import { API_ENDPOINTS } from '../config/api.config';
import {
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
import apiService from './api.service';

class UserService {
  // ==================== Profile Endpoints ====================

  /**
   * Get current user's profile
   */
  async getMyProfile(): Promise<UserProfile> {
    return apiService.get<UserProfile>(API_ENDPOINTS.PROFILE.ME);
  }

  /**
   * Update current user's profile
   */
  async updateMyProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return apiService.put<UserProfile>(API_ENDPOINTS.PROFILE.ME, data);
  }

  // ==================== Admin User Management ====================

  /**
   * Get list of users (admin only)
   */
  async getUsers(params?: UserListParams): Promise<User[]> {
    return apiService.get<User[]>(API_ENDPOINTS.ADMIN.USERS, { params });
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId: string): Promise<User> {
    return apiService.get<User>(API_ENDPOINTS.ADMIN.USER_DETAIL(userId));
  }

  /**
   * Create new user (admin only)
   */
  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    return apiService.post<CreateUserResponse>(API_ENDPOINTS.ADMIN.USERS, data);
  }

  /**
   * Update user (admin only)
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<User> {
    return apiService.put<User>(API_ENDPOINTS.ADMIN.USER_DETAIL(userId), data);
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<DeleteUserResponse> {
    return apiService.delete<DeleteUserResponse>(API_ENDPOINTS.ADMIN.USER_DETAIL(userId));
  }

  /**
   * Approve user (admin only)
   */
  async approveUser(data: ApproveUserRequest): Promise<ApproveUserResponse> {
    return apiService.post<ApproveUserResponse>(API_ENDPOINTS.ADMIN.APPROVE_USER, data);
  }

  /**
   * Reject user (admin only)
   */
  async rejectUser(userId: string, data: RejectUserRequest): Promise<RejectUserResponse> {
    return apiService.post<RejectUserResponse>(API_ENDPOINTS.ADMIN.REJECT_USER(userId), data);
  }

  // ==================== Roles & Permissions ====================

  /**
   * Get available roles
   */
  async getRoles(): Promise<Role[]> {
    return apiService.get<Role[]>(API_ENDPOINTS.ADMIN.ROLES);
  }

  // ==================== Statistics ====================

  /**
   * Get admin statistics
   */
  async getAdminStats(): Promise<AdminStats> {
    return apiService.get<AdminStats>(API_ENDPOINTS.ADMIN.STATS);
  }

  // ==================== Audit Logs (Admin) ====================

  /**
   * Get audit logs (admin only)
   */
  async getAdminAuditLogs(params?: AuditLogListParams): Promise<AuditLog[]> {
    return apiService.get<AuditLog[]>(API_ENDPOINTS.ADMIN.AUDIT_LOGS, { params });
  }
}

export default new UserService();
