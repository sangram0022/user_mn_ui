/**
 * RBAC Service
 * Wraps admin/rbac endpoints from backend and exposes typed methods for the UI.
 */

import { apiClient } from '@lib/api/client';
import type { RoleResponse, UserRole } from '@shared/types';
import { logger } from '@shared/utils/logger';

export class RBACService {
  async listRoles(): Promise<RoleResponse[]> {
    try {
      logger.debug('[RBAC] Listing roles');
      return await apiClient.getAllRoles();
    } catch (error) {
      logger.error('[RBAC] Failed to list roles', error as Error);
      throw error;
    }
  }

  async getRole(roleId: string): Promise<RoleResponse> {
    try {
      logger.debug('[RBAC] Get role', { roleId });
      return await apiClient.getRole(roleId);
    } catch (error) {
      logger.error('[RBAC] Failed to get role', error as Error);
      throw error;
    }
  }

  async createRole(payload: { role_name: string; description: string; permissions: string[] }) {
    try {
      logger.debug('[RBAC] Creating role', { payload });
      return await apiClient.createRole(payload);
    } catch (error) {
      logger.error('[RBAC] Failed to create role', error as Error);
      throw error;
    }
  }

  async updateRole(
    roleId: string,
    payload: {
      role_name?: string;
      description?: string;
      permissions?: string[];
      priority?: number;
      inherits_from?: string[];
      metadata?: Record<string, unknown>;
    }
  ) {
    try {
      logger.debug('[RBAC] Updating role', { roleId });
      return await apiClient.updateRole(roleId, payload);
    } catch (error) {
      logger.error('[RBAC] Failed to update role', error as Error);
      throw error;
    }
  }

  async deleteRole(roleId: string) {
    try {
      logger.debug('[RBAC] Deleting role', { roleId });
      return await apiClient.deleteRole(roleId);
    } catch (error) {
      logger.error('[RBAC] Failed to delete role', error as Error);
      throw error;
    }
  }

  async assignRoleToUser(userId: string, roleId: string) {
    try {
      logger.debug('[RBAC] Assigning role to user', { userId, roleId });
      return await apiClient.assignRoleToUser(userId, roleId);
    } catch (error) {
      logger.error('[RBAC] Failed to assign role', error as Error);
      throw error;
    }
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    try {
      logger.debug('[RBAC] Removing role from user', { userId, roleId });
      return await apiClient.revokeRoleFromUser(userId, roleId);
    } catch (error) {
      logger.error('[RBAC] Failed to remove role', error as Error);
      throw error;
    }
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    try {
      logger.debug('[RBAC] Fetching user roles', { userId });
      return await apiClient.execute(`/admin/rbac/users/${userId}/roles`, { method: 'GET' });
    } catch (error) {
      logger.error('[RBAC] Failed to fetch user roles', error as Error);
      throw error;
    }
  }

  async getUserRolesAndPermissions(userId: string) {
    try {
      logger.debug('[RBAC] Fetching user roles and permissions', { userId });
      return await apiClient.getUserRolesAndPermissions(userId);
    } catch (error) {
      logger.error('[RBAC] Failed to fetch user roles and permissions', error as Error);
      throw error;
    }
  }

  async listPermissions(): Promise<Record<string, string[]>> {
    try {
      logger.debug('[RBAC] Listing permissions');
      return await apiClient.listPermissions();
    } catch (error) {
      logger.error('[RBAC] Failed to list permissions', error as Error);
      throw error;
    }
  }

  async getCacheStats() {
    try {
      logger.debug('[RBAC] Fetching cache stats');
      return await apiClient.getRBACCacheStats();
    } catch (error) {
      logger.error('[RBAC] Failed to fetch cache stats', error as Error);
      throw error;
    }
  }

  async clearCache() {
    try {
      logger.debug('[RBAC] Clearing cache');
      return await apiClient.clearRBACCache();
    } catch (error) {
      logger.error('[RBAC] Failed to clear cache', error as Error);
      throw error;
    }
  }

  async syncDatabase() {
    try {
      logger.debug('[RBAC] Syncing database');
      return await apiClient.syncRBACDatabase();
    } catch (error) {
      logger.error('[RBAC] Failed to sync database', error as Error);
      throw error;
    }
  }
}

export const rbacService = new RBACService();

export default rbacService;
