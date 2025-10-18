/**
 * User Management Service - Updated for Backend Integration
 *
 * This service provides user management functionality using the improved
 * backend API client for proper FastAPI integration.
 */

import { backendApiClient } from '../lib/api/backend-client';
import { logger } from '../shared/utils/logger';
import type {
  CreateUserRequest,
  CreateUserResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateUserRequest,
  User,
  UserProfile,
} from '../types/api.types';

class UserService {
  // ========================================================================
  // Authentication Methods
  // ========================================================================

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await backendApiClient.login(credentials);
      logger.info('User login successful', { userId: response.user_id });
      return response;
    } catch (error) {
      logger.error('Login failed', error instanceof Error ? error : new Error(String(error)), {
        email: credentials.email,
      });
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await backendApiClient.register(userData);
      logger.info('User registration successful', { userId: response.user_id });
      return response;
    } catch (error) {
      logger.error(
        'Registration failed',
        error instanceof Error ? error : new Error(String(error)),
        { email: userData.email }
      );
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await backendApiClient.logout();
      logger.info('User logout successful');
    } catch (error) {
      logger.error('Logout failed', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  // ========================================================================
  // Profile Management
  // ========================================================================

  async getProfile(): Promise<UserProfile> {
    try {
      const profile = await backendApiClient.getProfile();
      logger.debug('Profile fetched successfully', { userId: profile.user_id });
      return profile;
    } catch (error) {
      logger.error(
        'Failed to fetch profile',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const updatedProfile = await backendApiClient.updateProfile(updates);
      logger.info('Profile updated successfully', { userId: updatedProfile.user_id });
      return updatedProfile;
    } catch (error) {
      logger.error(
        'Failed to update profile',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  // ========================================================================
  // Admin User Management
  // ========================================================================

  async getUsers(
    params: {
      page?: number;
      page_size?: number;
      role?: string;
      is_active?: boolean;
      search?: string;
    } = {}
  ): Promise<User[]> {
    try {
      const users = await backendApiClient.getUsers(params);
      logger.debug('Users fetched successfully', {
        count: users.length,
        params,
      });
      return users;
    } catch (error) {
      logger.error(
        'Failed to fetch users',
        error instanceof Error ? error : new Error(String(error)),
        { params }
      );
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User> {
    try {
      const user = await backendApiClient.getUserById(userId);
      logger.debug('User fetched successfully', { userId });
      return user;
    } catch (error) {
      logger.error(
        'Failed to fetch user',
        error instanceof Error ? error : new Error(String(error)),
        { userId }
      );
      throw error;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      const response = await backendApiClient.createUser(userData);
      logger.info('User created successfully', {
        userId: response.user_id,
        email: response.email,
      });
      return response;
    } catch (error) {
      logger.error(
        'Failed to create user',
        error instanceof Error ? error : new Error(String(error)),
        { email: userData.email }
      );
      throw error;
    }
  }

  async updateUser(userId: string, updates: UpdateUserRequest): Promise<User> {
    try {
      const updatedUser = await backendApiClient.updateUser(userId, updates);
      logger.info('User updated successfully', { userId });
      return updatedUser;
    } catch (error) {
      logger.error(
        'Failed to update user',
        error instanceof Error ? error : new Error(String(error)),
        { userId }
      );
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    try {
      const result = await backendApiClient.deleteUser(userId);
      logger.info('User deleted successfully', { userId });
      return result;
    } catch (error) {
      logger.error(
        'Failed to delete user',
        error instanceof Error ? error : new Error(String(error)),
        { userId }
      );
      throw error;
    }
  }

  // ========================================================================
  // Convenience Methods for Frontend
  // ========================================================================

  /**
   * Activate a user (admin operation)
   */
  async activateUser(userId: string): Promise<User> {
    return this.updateUser(userId, { is_active: true });
  }

  /**
   * Deactivate a user (admin operation)
   */
  async deactivateUser(userId: string): Promise<User> {
    return this.updateUser(userId, { is_active: false });
  }

  /**
   * Change user role (admin operation)
   */
  async changeUserRole(userId: string, role: string): Promise<User> {
    return this.updateUser(userId, { role });
  }

  /**
   * Search users by email or name
   */
  async searchUsers(
    query: string,
    filters: {
      role?: string;
      is_active?: boolean;
      page?: number;
      page_size?: number;
    } = {}
  ): Promise<User[]> {
    return this.getUsers({
      ...filters,
      search: query,
    });
  }

  // ========================================================================
  // Auth State Management
  // ========================================================================

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return Boolean(token);
  }

  /**
   * Get current user from storage
   */
  getCurrentUser(): User | UserProfile | null {
    const userDataStr = localStorage.getItem('user_data');
    return userDataStr ? JSON.parse(userDataStr) : null;
  }

  /**
   * Clear authentication state
   */
  clearAuthState(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  }

  // ========================================================================
  // Extended Authentication Methods
  // ========================================================================

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      const result = await backendApiClient.changePassword(currentPassword, newPassword);
      logger.info('Password changed successfully');
      return result;
    } catch (error) {
      logger.error(
        'Failed to change password',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const result = await backendApiClient.forgotPassword(email);
      logger.info('Password reset email sent', { email });
      return result;
    } catch (error) {
      logger.error(
        'Failed to send password reset email',
        error instanceof Error ? error : new Error(String(error)),
        { email }
      );
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const result = await backendApiClient.resetPassword(token, newPassword);
      logger.info('Password reset successfully');
      return result;
    } catch (error) {
      logger.error(
        'Failed to reset password',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<{ message: string; verified_at: string }> {
    try {
      const result = await backendApiClient.verifyEmail(token);
      logger.info('Email verified successfully');
      return result;
    } catch (error) {
      logger.error(
        'Failed to verify email',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    try {
      const result = await backendApiClient.resendVerification(email);
      logger.info('Verification email resent', { email });
      return result;
    } catch (error) {
      logger.error(
        'Failed to resend verification email',
        error instanceof Error ? error : new Error(String(error)),
        { email }
      );
      throw error;
    }
  }

  // ========================================================================
  // RBAC Methods
  // ========================================================================

  async getRoles(): Promise<
    Array<{
      role_id: string;
      role_name: string;
      description: string;
      permissions: string[];
    }>
  > {
    try {
      const roles = await backendApiClient.getRoles();
      logger.debug('Roles fetched successfully', { count: roles.length });
      return roles;
    } catch (error) {
      logger.error(
        'Failed to fetch roles',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  async getUserRoles(userId: string): Promise<{
    user_id: string;
    roles: string[];
    permissions: string[];
  }> {
    try {
      const userRoles = await backendApiClient.getUserRoles(userId);
      logger.debug('User roles fetched successfully', { userId });
      return userRoles;
    } catch (error) {
      logger.error(
        'Failed to fetch user roles',
        error instanceof Error ? error : new Error(String(error)),
        { userId }
      );
      throw error;
    }
  }

  // ========================================================================
  // GDPR Methods
  // ========================================================================

  async exportMyData(format: 'json' | 'csv' = 'json'): Promise<Blob> {
    try {
      const data = await backendApiClient.exportMyData(format);
      logger.info('Data export successful', { format });
      return data;
    } catch (error) {
      logger.error(
        'Failed to export data',
        error instanceof Error ? error : new Error(String(error)),
        { format }
      );
      throw error;
    }
  }

  async deleteMyAccount(): Promise<{ message: string; deleted_at: string }> {
    try {
      const result = await backendApiClient.deleteMyAccount();
      logger.info('Account deleted successfully');
      this.clearAuthState();
      return result;
    } catch (error) {
      logger.error(
        'Failed to delete account',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  // ========================================================================
  // Health Check Methods
  // ========================================================================

  async healthCheck(): Promise<{ status: string }> {
    try {
      const health = await backendApiClient.healthCheck();
      logger.debug('Health check successful', health);
      return health;
    } catch (error) {
      logger.error(
        'Health check failed',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  // ========================================================================
  // Frontend Error Logging
  // ========================================================================

  async logFrontendError(error: {
    message: string;
    stack?: string;
    url: string;
    timestamp: string;
    user_agent?: string;
    level?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ message: string }> {
    try {
      const result = await backendApiClient.logFrontendError(error);
      logger.debug('Frontend error logged successfully');
      return result;
    } catch (logError) {
      logger.error(
        'Failed to log frontend error',
        logError instanceof Error ? logError : new Error(String(logError))
      );
      throw logError;
    }
  }
}

// Create and export service instance
export const userService = new UserService();
export default userService;
