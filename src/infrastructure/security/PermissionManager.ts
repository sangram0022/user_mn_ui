/**
 * Permission manager for handling user permissions and access control
 */

import { logger } from '../monitoring/logger';
import { authManager, AuthUser } from './AuthManager';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface PermissionCheck {
  permission: string;
  resource?: string;
  conditions?: Record<string, any>;
}

export interface AccessResult {
  granted: boolean;
  reason?: string;
  missingPermissions?: string[];
}

export class PermissionManager {
  private static instance: PermissionManager;
  private permissions: Map<string, Permission> = new Map();
  private userPermissions: Map<string, Set<string>> = new Map();

  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  constructor() {
    this.loadDefaultPermissions();
  }

  private loadDefaultPermissions(): void {
    // Define default system permissions
    const defaultPermissions: Permission[] = [
      // User management permissions
      {
        id: 'users.read',
        name: 'Read Users',
        description: 'View user information',
        resource: 'users',
        action: 'read',
      },
      {
        id: 'users.create',
        name: 'Create Users',
        description: 'Create new users',
        resource: 'users',
        action: 'create',
      },
      {
        id: 'users.update',
        name: 'Update Users',
        description: 'Modify user information',
        resource: 'users',
        action: 'update',
      },
      {
        id: 'users.delete',
        name: 'Delete Users',
        description: 'Remove users from system',
        resource: 'users',
        action: 'delete',
      },

      // Role management permissions
      {
        id: 'roles.read',
        name: 'Read Roles',
        description: 'View role information',
        resource: 'roles',
        action: 'read',
      },
      {
        id: 'roles.create',
        name: 'Create Roles',
        description: 'Create new roles',
        resource: 'roles',
        action: 'create',
      },
      {
        id: 'roles.update',
        name: 'Update Roles',
        description: 'Modify role information',
        resource: 'roles',
        action: 'update',
      },
      {
        id: 'roles.delete',
        name: 'Delete Roles',
        description: 'Remove roles from system',
        resource: 'roles',
        action: 'delete',
      },

      // Workflow permissions
      {
        id: 'workflows.read',
        name: 'Read Workflows',
        description: 'View workflow information',
        resource: 'workflows',
        action: 'read',
      },
      {
        id: 'workflows.create',
        name: 'Create Workflows',
        description: 'Create new workflows',
        resource: 'workflows',
        action: 'create',
      },
      {
        id: 'workflows.update',
        name: 'Update Workflows',
        description: 'Modify workflow information',
        resource: 'workflows',
        action: 'update',
      },
      {
        id: 'workflows.delete',
        name: 'Delete Workflows',
        description: 'Remove workflows from system',
        resource: 'workflows',
        action: 'delete',
      },
      {
        id: 'workflows.execute',
        name: 'Execute Workflows',
        description: 'Run and execute workflows',
        resource: 'workflows',
        action: 'execute',
      },

      // Analytics permissions
      {
        id: 'analytics.read',
        name: 'Read Analytics',
        description: 'View analytics and reports',
        resource: 'analytics',
        action: 'read',
      },
      {
        id: 'analytics.export',
        name: 'Export Analytics',
        description: 'Export analytics data',
        resource: 'analytics',
        action: 'export',
      },

      // System permissions
      {
        id: 'system.admin',
        name: 'System Administration',
        description: 'Full system administration access',
        resource: 'system',
        action: 'admin',
      },
      {
        id: 'system.config',
        name: 'System Configuration',
        description: 'Modify system configuration',
        resource: 'system',
        action: 'config',
      },
      {
        id: 'system.logs',
        name: 'System Logs',
        description: 'Access system logs and monitoring',
        resource: 'system',
        action: 'logs',
      },

      // Profile permissions
      {
        id: 'profile.read',
        name: 'Read Own Profile',
        description: 'View own profile information',
        resource: 'profile',
        action: 'read',
      },
      {
        id: 'profile.update',
        name: 'Update Own Profile',
        description: 'Modify own profile information',
        resource: 'profile',
        action: 'update',
      },
    ];

    defaultPermissions.forEach((permission) => {
      this.permissions.set(permission.id, permission);
    });

    logger.info(`Loaded ${defaultPermissions.length} default permissions`);
  }

  // Permission management methods

  addPermission(permission: Permission): void {
    this.permissions.set(permission.id, permission);
    logger.debug(`Added permission: ${permission.id}`);
  }

  removePermission(permissionId: string): void {
    this.permissions.delete(permissionId);
    logger.debug(`Removed permission: ${permissionId}`);
  }

  getPermission(permissionId: string): Permission | undefined {
    return this.permissions.get(permissionId);
  }

  getAllPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }

  getPermissionsByResource(resource: string): Permission[] {
    return this.getAllPermissions().filter((p) => p.resource === resource);
  }

  // User permission methods

  setUserPermissions(userId: string, permissions: string[]): void {
    this.userPermissions.set(userId, new Set(permissions));
    logger.debug(`Set permissions for user ${userId}: ${permissions.join(', ')}`);
  }

  addUserPermission(userId: string, permissionId: string): void {
    const userPerms = this.userPermissions.get(userId) || new Set();
    userPerms.add(permissionId);
    this.userPermissions.set(userId, userPerms);
    logger.debug(`Added permission ${permissionId} to user ${userId}`);
  }

  removeUserPermission(userId: string, permissionId: string): void {
    const userPerms = this.userPermissions.get(userId);
    if (userPerms) {
      userPerms.delete(permissionId);
      logger.debug(`Removed permission ${permissionId} from user ${userId}`);
    }
  }

  getUserPermissions(userId: string): string[] {
    const userPerms = this.userPermissions.get(userId);
    return userPerms ? Array.from(userPerms) : [];
  }

  // Access control methods

  checkPermission(permissionId: string, user?: AuthUser): AccessResult {
    const currentUser = user || authManager.getUser();

    if (!currentUser) {
      return {
        granted: false,
        reason: 'User not authenticated',
      };
    }

    // Check if user has the permission directly
    if (currentUser.permissions.includes(permissionId)) {
      return { granted: true };
    }

    // Check additional user permissions (if set via setUserPermissions)
    const additionalPerms = this.userPermissions.get(currentUser.id);
    if (additionalPerms && additionalPerms.has(permissionId)) {
      return { granted: true };
    }

    return {
      granted: false,
      reason: 'Insufficient permissions',
      missingPermissions: [permissionId],
    };
  }

  checkPermissions(permissionIds: string[], user?: AuthUser): AccessResult {
    const missingPermissions: string[] = [];

    for (const permissionId of permissionIds) {
      const result = this.checkPermission(permissionId, user);
      if (!result.granted) {
        missingPermissions.push(permissionId);
      }
    }

    if (missingPermissions.length > 0) {
      return {
        granted: false,
        reason: 'Missing required permissions',
        missingPermissions,
      };
    }

    return { granted: true };
  }

  checkAnyPermission(permissionIds: string[], user?: AuthUser): AccessResult {
    for (const permissionId of permissionIds) {
      const result = this.checkPermission(permissionId, user);
      if (result.granted) {
        return { granted: true };
      }
    }

    return {
      granted: false,
      reason: 'None of the required permissions are granted',
      missingPermissions: permissionIds,
    };
  }

  checkResourceAccess(
    resource: string,
    action: string,
    user?: AuthUser,
    conditions?: Record<string, any>
  ): AccessResult {
    const permissionId = `${resource}.${action}`;
    const result = this.checkPermission(permissionId, user);

    if (!result.granted) {
      return result;
    }

    // Check conditions if specified
    if (conditions) {
      const permission = this.getPermission(permissionId);
      if (permission?.conditions) {
        const conditionsMatch = this.evaluateConditions(permission.conditions, conditions, user);
        if (!conditionsMatch) {
          return {
            granted: false,
            reason: 'Permission conditions not met',
          };
        }
      }
    }

    return { granted: true };
  }

  private evaluateConditions(
    permissionConditions: Record<string, any>,
    requestConditions: Record<string, any>,
    user?: AuthUser
  ): boolean {
    // Simple condition evaluation - can be extended for complex rules
    for (const [key, value] of Object.entries(permissionConditions)) {
      if (key === 'owner' && user) {
        // Check if user is the owner of the resource
        if (requestConditions.ownerId !== user.id) {
          return false;
        }
      } else if (requestConditions[key] !== value) {
        return false;
      }
    }

    return true;
  }

  // Role-based permission methods

  getRolePermissions(role: string): string[] {
    // Define role-based permissions
    const rolePermissions: Record<string, string[]> = {
      admin: [
        'system.admin',
        'system.config',
        'system.logs',
        'users.read',
        'users.create',
        'users.update',
        'users.delete',
        'roles.read',
        'roles.create',
        'roles.update',
        'roles.delete',
        'workflows.read',
        'workflows.create',
        'workflows.update',
        'workflows.delete',
        'workflows.execute',
        'analytics.read',
        'analytics.export',
        'profile.read',
        'profile.update',
      ],
      manager: [
        'users.read',
        'users.create',
        'users.update',
        'workflows.read',
        'workflows.create',
        'workflows.update',
        'workflows.execute',
        'analytics.read',
        'analytics.export',
        'profile.read',
        'profile.update',
      ],
      user: [
        'workflows.read',
        'workflows.execute',
        'analytics.read',
        'profile.read',
        'profile.update',
      ],
      viewer: ['workflows.read', 'analytics.read', 'profile.read'],
    };

    return rolePermissions[role] || [];
  }

  checkRolePermission(role: string, permissionId: string): boolean {
    const rolePermissions = this.getRolePermissions(role);
    return rolePermissions.includes(permissionId);
  }

  // Utility methods

  canAccess(
    resource: string,
    action: string,
    user?: AuthUser,
    conditions?: Record<string, any>
  ): boolean {
    return this.checkResourceAccess(resource, action, user, conditions).granted;
  }

  hasPermission(permissionId: string, user?: AuthUser): boolean {
    return this.checkPermission(permissionId, user).granted;
  }

  hasAnyPermission(permissionIds: string[], user?: AuthUser): boolean {
    return this.checkAnyPermission(permissionIds, user).granted;
  }

  hasAllPermissions(permissionIds: string[], user?: AuthUser): boolean {
    return this.checkPermissions(permissionIds, user).granted;
  }

  // Permission middleware helpers

  requirePermission(permissionId: string) {
    return (user?: AuthUser): AccessResult => {
      return this.checkPermission(permissionId, user);
    };
  }

  requireAnyPermission(permissionIds: string[]) {
    return (user?: AuthUser): AccessResult => {
      return this.checkAnyPermission(permissionIds, user);
    };
  }

  requireAllPermissions(permissionIds: string[]) {
    return (user?: AuthUser): AccessResult => {
      return this.checkPermissions(permissionIds, user);
    };
  }

  requireResourceAccess(resource: string, action: string, conditions?: Record<string, any>) {
    return (user?: AuthUser): AccessResult => {
      return this.checkResourceAccess(resource, action, user, conditions);
    };
  }
}

// Create singleton instance
export const permissionManager = PermissionManager.getInstance();

export default permissionManager;
