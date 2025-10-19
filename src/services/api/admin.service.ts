/**
 * Admin API Service
 * Reference: API_DOCUMENTATION_COMPLETE.md - Admin User Management APIs & Admin Role Management APIs
 */

import { apiClient } from '@lib/api/client';
import type {
  AdminUsersQuery,
  CreateUserRequest,
  UpdateUserRequest,
  UserSummary,
  UserRole,
} from '@shared/types';
import { logger } from '@shared/utils/logger';

/**
 * Admin Service
 * Handles administrative operations for user and role management
 */
export class AdminService {
  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  /**
   * List All Users
   * GET /admin/users
   *
   * Retrieve paginated list of all users with optional filtering and sorting.
   *
   * @param params - Query parameters for pagination, filtering, and sorting
   * @returns Array of users
   *
   * @example
   * const users = await adminService.getUsers({
   *   skip: 0,
   *   limit: 20,
   *   sort_by: 'created_at',
   *   order: 'desc'
   * });
   */
  async getUsers(params?: AdminUsersQuery): Promise<UserSummary[]> {
    try {
      logger.debug('[AdminService] Fetching users list', { params });

      const users = await apiClient.getUsers(params);

      logger.info('[AdminService] Users list fetched successfully', {
        count: users.length,
      });

      return users;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AdminService] Failed to fetch users', error);
      } else {
        logger.error('[AdminService] Failed to fetch users');
      }
      throw error;
    }
  }

  /**
   * Get User Details
   * GET /admin/users/{user_id}
   *
   * Retrieve detailed information about a specific user.
   *
   * @param userId - User UUID
   * @returns User details
   *
   * @example
   * const user = await adminService.getUserById('user-123');
   */
  async getUserById(userId: string): Promise<UserSummary> {
    try {
      logger.debug('[AdminService] Fetching user details', { userId });

      const user = await apiClient.getUser(userId);

      logger.info('[AdminService] User details fetched successfully', { userId });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AdminService] Failed to fetch user', error);
      } else {
        logger.error('[AdminService] Failed to fetch user');
      }
      throw error;
    }
  }

  /**
   * Create User (Admin)
   * POST /admin/users
   *
   * Create a new user account as administrator.
   *
   * @param payload - User creation data
   * @returns Created user
   *
   * @example
   * const newUser = await adminService.createUser({
   *   email: 'newuser@example.com',
   *   password: 'SecurePassword123!',
   *   first_name: 'Jane',
   *   last_name: 'Smith',
   *   roles: ['user']
   * });
   */
  async createUser(payload: CreateUserRequest): Promise<UserSummary> {
    try {
      logger.debug('[AdminService] Creating new user', { email: payload.email });

      const user = await apiClient.createUser(payload);

      logger.info('[AdminService] User created successfully', {
        userId: user.user_id,
        email: payload.email,
      });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AdminService] Failed to create user', error);
      } else {
        logger.error('[AdminService] Failed to create user');
      }
      throw error;
    }
  }

  /**
   * Update User
   * PUT /admin/users/{user_id}
   *
   * Update user information and properties.
   *
   * @param userId - User UUID
   * @param payload - Update data
   * @returns Updated user
   *
   * @example
   * const updated = await adminService.updateUser('user-123', {
   *   first_name: 'Jane',
   *   is_active: true
   * });
   */
  async updateUser(userId: string, payload: UpdateUserRequest): Promise<UserSummary> {
    try {
      logger.debug('[AdminService] Updating user', { userId });

      const user = await apiClient.updateUser(userId, payload);

      logger.info('[AdminService] User updated successfully', { userId });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AdminService] Failed to update user', error);
      } else {
        logger.error('[AdminService] Failed to update user');
      }
      throw error;
    }
  }

  /**
   * Delete User
   * DELETE /admin/users/{user_id}
   *
   * Delete a user account permanently.
   *
   * @param userId - User UUID
   * @returns Deletion result
   *
   * @example
   * const result = await adminService.deleteUser('user-123');
   */
  async deleteUser(userId: string) {
    try {
      logger.debug('[AdminService] Deleting user', { userId });

      const result = await apiClient.deleteUser(userId);

      logger.info('[AdminService] User deleted successfully', { userId });

      return result;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AdminService] Failed to delete user', error);
      } else {
        logger.error('[AdminService] Failed to delete user');
      }
      throw error;
    }
  }

  /**
   * Activate User
   * POST /admin/users/{user_id}/activate
   *
   * Activate a deactivated user account.
   *
   * @param userId - User UUID
   * @returns Activation result
   *
   * @example
   * const result = await adminService.activateUser('user-123');
   */
  async activateUser(userId: string) {
    try {
      logger.debug('[AdminService] Activating user', { userId });

      const result = await apiClient.activateUser(userId);

      logger.info('[AdminService] User activated successfully', { userId });

      return result;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AdminService] Failed to activate user', error);
      } else {
        logger.error('[AdminService] Failed to activate user');
      }
      throw error;
    }
  }

  /**
   * Deactivate User
   * POST /admin/users/{user_id}/deactivate
   *
   * Deactivate a user account.
   *
   * @param userId - User UUID
   * @param reason - Reason for deactivation
   * @returns Deactivation result
   *
   * @example
   * const result = await adminService.deactivateUser('user-123', 'Account violation');
   */
  async deactivateUser(userId: string, reason?: string) {
    try {
      logger.debug('[AdminService] Deactivating user', { userId, reason });

      const result = await apiClient.deactivateUser(userId, reason ?? '');

      logger.info('[AdminService] User deactivated successfully', { userId });

      return result;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AdminService] Failed to deactivate user', error);
      } else {
        logger.error('[AdminService] Failed to deactivate user');
      }
      throw error;
    }
  }

  /**
   * Approve User
   * POST /admin/users/{user_id}/approve
   *
   * Approve a pending user for platform access.
   *
   * @param userId - User UUID
   * @returns Approval result
   *
   * @example
   * const result = await adminService.approveUser('user-123');
   */
  async approveUser(userId: string): Promise<UserSummary> {
    try {
      logger.debug('[AdminService] Approving user', { userId });

      const result = await apiClient.approveUser(userId);

      logger.info('[AdminService] User approved successfully', { userId });

      return result;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AdminService] Failed to approve user', error);
      } else {
        logger.error('[AdminService] Failed to approve user');
      }
      throw error;
    }
  }

  /**
   * Reject User
   * POST /admin/users/{user_id}/reject
   *
   * Reject a pending user application.
   *
   * @param userId - User UUID
   * @param reason - Rejection reason
   * @returns Rejection result
   *
   * @example
   * const result = await adminService.rejectUser('user-123', 'Does not meet requirements');
   */
  async rejectUser(userId: string, reason?: string): Promise<UserSummary> {
    try {
      logger.debug('[AdminService] Rejecting user', { userId, reason });

      const result = await apiClient.rejectUser(userId, reason);

      logger.info('[AdminService] User rejected successfully', { userId });

      return result;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AdminService] Failed to reject user', error);
      } else {
        logger.error('[AdminService] Failed to reject user');
      }
      throw error;
    }
  }

  // ============================================================================
  // ROLE MANAGEMENT
  // ============================================================================

  /**
   * Get All Roles
   * GET /admin/roles
   *
   * Retrieve all available roles.
   *
   * @returns Array of roles
   *
   * @example
   * const roles = await adminService.getRoles();
   */
  async getRoles(): Promise<UserRole[]> {
    try {
      logger.debug('[AdminService] Fetching roles');

      const roles = await apiClient.getRoles();

      logger.info('[AdminService] Roles fetched successfully', {
        count: roles.length,
      });

      return roles;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AdminService] Failed to fetch roles', error);
      } else {
        logger.error('[AdminService] Failed to fetch roles');
      }
      throw error;
    }
  }

  /**
   * Create Role
   * POST /admin/roles
   *
   * Create a new role with specified permissions.
   *
   * @param roleData - Role creation data
   * @returns Created role
   *
   * @example
   * const newRole = await adminService.createRole({
   *   name: 'moderator',
   *   description: 'Moderator role',
   *   permissions: ['read_posts', 'delete_posts']
   * });
   */
  async createRole(roleData: { name: string; description: string; permissions: string[] }) {
    try {
      logger.debug('[AdminService] Creating role', { name: roleData.name });

      const role = await apiClient.execute('/admin/roles', {
        method: 'POST',
        body: JSON.stringify(roleData),
      });

      logger.info('[AdminService] Role created successfully', { name: roleData.name });

      return role;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AdminService] Failed to create role', error);
      } else {
        logger.error('[AdminService] Failed to create role');
      }
      throw error;
    }
  }

  /**
   * Update Role
   * PUT /admin/roles/{role_id}
   *
   * Update role information and permissions.
   *
   * @param roleId - Role ID
   * @param roleData - Update data
   * @returns Updated role
   *
   * @example
   * const updated = await adminService.updateRole('role-1', {
   *   description: 'Updated description',
   *   permissions: ['read_posts', 'create_posts', 'delete_posts']
   * });
   */
  async updateRole(
    roleId: string,
    roleData: Partial<{ description: string; permissions: string[] }>
  ) {
    try {
      logger.debug('[AdminService] Updating role', { roleId });

      const role = await apiClient.execute(`/admin/roles/${roleId}`, {
        method: 'PUT',
        body: JSON.stringify(roleData),
      });

      logger.info('[AdminService] Role updated successfully', { roleId });

      return role;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AdminService] Failed to update role', error);
      } else {
        logger.error('[AdminService] Failed to update role');
      }
      throw error;
    }
  }

  /**
   * Delete Role
   * DELETE /admin/roles/{role_id}
   *
   * Delete a role.
   *
   * @param roleId - Role ID
   * @returns Deletion result
   *
   * @example
   * const result = await adminService.deleteRole('role-1');
   */
  async deleteRole(roleId: string) {
    try {
      logger.debug('[AdminService] Deleting role', { roleId });

      const result = await apiClient.execute(`/admin/roles/${roleId}`, {
        method: 'DELETE',
      });

      logger.info('[AdminService] Role deleted successfully', { roleId });

      return result;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AdminService] Failed to delete role', error);
      } else {
        logger.error('[AdminService] Failed to delete role');
      }
      throw error;
    }
  }

  // ============================================================================
  // STATISTICS & ANALYTICS
  // ============================================================================

  /**
   * Get Admin Statistics
   * GET /admin/stats
   *
   * Retrieve system statistics and analytics.
   *
   * @returns Admin statistics
   *
   * @example
   * const stats = await adminService.getStats();
   */
  async getStats() {
    try {
      logger.debug('[AdminService] Fetching statistics');

      const stats = await apiClient.execute('/admin/stats');

      logger.info('[AdminService] Statistics fetched successfully');

      return stats;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AdminService] Failed to fetch statistics', error);
      } else {
        logger.error('[AdminService] Failed to fetch statistics');
      }
      throw error;
    }
  }

  /**
   * Get User Analytics
   *
   * @returns User analytics data
   *
   * @example
   * const analytics = await adminService.getUserAnalytics();
   */
  async getUserAnalytics() {
    try {
      logger.debug('[AdminService] Fetching user analytics');

      const analytics = await apiClient.getUserAnalytics();

      logger.info('[AdminService] User analytics fetched successfully');

      return analytics;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AdminService] Failed to fetch user analytics', error);
      } else {
        logger.error('[AdminService] Failed to fetch user analytics');
      }
      throw error;
    }
  }
}

export const adminService = new AdminService();

export default adminService;
