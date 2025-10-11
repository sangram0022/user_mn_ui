/**
 * Role manager for handling user roles and role-based access control
 */

import { logger } from '../monitoring/logger';
import { permissionManager } from './PermissionManager';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleAssignment {
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
}

export class RoleManager {
  private static instance: RoleManager;
  private roles: Map<string, Role> = new Map();
  private userRoles: Map<string, Set<string>> = new Map();
  private roleAssignments: Map<string, RoleAssignment[]> = new Map();

  static getInstance(): RoleManager {
    if (!RoleManager.instance) {
      RoleManager.instance = new RoleManager();
    }
    return RoleManager.instance;
  }

  constructor() {
    this.loadDefaultRoles();
  }

  private loadDefaultRoles(): void {
    const defaultRoles: Role[] = [
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Full system access with all permissions',
        permissions: permissionManager.getRolePermissions('admin'),
        isSystem: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'manager',
        name: 'Manager',
        description: 'Management access with user and workflow permissions',
        permissions: permissionManager.getRolePermissions('manager'),
        isSystem: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user',
        name: 'User',
        description: 'Standard user access with basic permissions',
        permissions: permissionManager.getRolePermissions('user'),
        isSystem: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'viewer',
        name: 'Viewer',
        description: 'Read-only access to workflows and analytics',
        permissions: permissionManager.getRolePermissions('viewer'),
        isSystem: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    defaultRoles.forEach((role) => {
      this.roles.set(role.id, role);
    });

    logger.info(`Loaded ${defaultRoles.length} default roles`);
  }

  // Role management methods

  createRole(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Role {
    const role: Role = {
      ...roleData,
      id: this.generateRoleId(roleData.name),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.roles.set(role.id, role);
    logger.info(`Created role: ${role.name} (${role.id})`);

    return role;
  }

  updateRole(
    roleId: string,
    updates: Partial<Omit<Role, 'id' | 'createdAt' | 'updatedAt'>>
  ): Role | null {
    const role = this.roles.get(roleId);
    if (!role) {
      logger.warn(`Role not found: ${roleId}`);
      return null;
    }

    if (role.isSystem) {
      logger.warn(`Cannot update system role: ${roleId}`);
      return null;
    }

    const updatedRole: Role = {
      ...role,
      ...updates,
      updatedAt: new Date(),
    };

    this.roles.set(roleId, updatedRole);
    logger.info(`Updated role: ${roleId}`);

    return updatedRole;
  }

  deleteRole(roleId: string): boolean {
    const role = this.roles.get(roleId);
    if (!role) {
      logger.warn(`Role not found: ${roleId}`);
      return false;
    }

    if (role.isSystem) {
      logger.warn(`Cannot delete system role: ${roleId}`);
      return false;
    }

    // Remove role from all users
    this.userRoles.forEach((userRoleSet, userId) => {
      if (userRoleSet.has(roleId)) {
        userRoleSet.delete(roleId);
        logger.info(`Removed role ${roleId} from user ${userId}`);
      }
    });

    // Remove role assignments
    this.roleAssignments.delete(roleId);

    this.roles.delete(roleId);
    logger.info(`Deleted role: ${roleId}`);

    return true;
  }

  getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId);
  }

  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  getActiveRoles(): Role[] {
    return this.getAllRoles().filter((role) => role.isActive);
  }

  getSystemRoles(): Role[] {
    return this.getAllRoles().filter((role) => role.isSystem);
  }

  getCustomRoles(): Role[] {
    return this.getAllRoles().filter((role) => !role.isSystem);
  }

  // User role assignment methods

  assignRole(userId: string, roleId: string, assignedBy: string, expiresAt?: Date): boolean {
    const role = this.roles.get(roleId);
    if (!role || !role.isActive) {
      logger.warn(`Role not found or inactive: ${roleId}`);
      return false;
    }

    // Add to user roles
    const userRoleSet = this.userRoles.get(userId) || new Set();
    userRoleSet.add(roleId);
    this.userRoles.set(userId, userRoleSet);

    // Create role assignment record
    const assignment: RoleAssignment = {
      userId,
      roleId,
      assignedBy,
      assignedAt: new Date(),
      expiresAt,
    };

    const userAssignments = this.roleAssignments.get(userId) || [];
    userAssignments.push(assignment);
    this.roleAssignments.set(userId, userAssignments);

    logger.info(`Assigned role ${roleId} to user ${userId}`);
    return true;
  }

  removeRole(userId: string, roleId: string): boolean {
    const userRoleSet = this.userRoles.get(userId);
    if (!userRoleSet || !userRoleSet.has(roleId)) {
      logger.warn(`User ${userId} does not have role ${roleId}`);
      return false;
    }

    userRoleSet.delete(roleId);

    // Remove assignment record
    const userAssignments = this.roleAssignments.get(userId) || [];
    const filteredAssignments = userAssignments.filter((a) => a.roleId !== roleId);
    this.roleAssignments.set(userId, filteredAssignments);

    logger.info(`Removed role ${roleId} from user ${userId}`);
    return true;
  }

  getUserRoles(userId: string): string[] {
    const userRoleSet = this.userRoles.get(userId);
    if (!userRoleSet) return [];

    // Filter out expired roles
    const now = new Date();
    const validRoles: string[] = [];

    userRoleSet.forEach((roleId) => {
      const assignments = this.roleAssignments.get(userId) || [];
      const assignment = assignments.find((a) => a.roleId === roleId);

      if (!assignment || !assignment.expiresAt || assignment.expiresAt > now) {
        validRoles.push(roleId);
      } else {
        // Remove expired role
        userRoleSet.delete(roleId);
        logger.info(`Removed expired role ${roleId} from user ${userId}`);
      }
    });

    return validRoles;
  }

  getUserRoleObjects(userId: string): Role[] {
    const roleIds = this.getUserRoles(userId);
    return roleIds
      .map((roleId) => this.roles.get(roleId))
      .filter((role): role is Role => role !== undefined);
  }

  getUserPermissions(userId: string): string[] {
    const userRoles = this.getUserRoleObjects(userId);
    const permissions = new Set<string>();

    userRoles.forEach((role) => {
      role.permissions.forEach((permission) => permissions.add(permission));
    });

    return Array.from(permissions);
  }

  hasRole(userId: string, roleId: string): boolean {
    const userRoles = this.getUserRoles(userId);
    return userRoles.includes(roleId);
  }

  hasAnyRole(userId: string, roleIds: string[]): boolean {
    const userRoles = this.getUserRoles(userId);
    return roleIds.some((roleId) => userRoles.includes(roleId));
  }

  hasAllRoles(userId: string, roleIds: string[]): boolean {
    const userRoles = this.getUserRoles(userId);
    return roleIds.every((roleId) => userRoles.includes(roleId));
  }

  // Role hierarchy and inheritance methods

  isRoleHierarchyValid(roleId: string): boolean {
    // Prevent circular inheritance
    const visited = new Set<string>();

    const checkCircular = (currentRoleId: string): boolean => {
      if (visited.has(currentRoleId)) return false;
      visited.add(currentRoleId);

      const role = this.roles.get(currentRoleId);
      if (!role) return true;

      // Check if this role inherits from others (would need to implement inheritance)
      return true;
    };

    return checkCircular(roleId);
  }

  // Role permission management

  addPermissionToRole(roleId: string, permission: string): boolean {
    const role = this.roles.get(roleId);
    if (!role) {
      logger.warn(`Role not found: ${roleId}`);
      return false;
    }

    if (role.isSystem) {
      logger.warn(`Cannot modify system role: ${roleId}`);
      return false;
    }

    if (!role.permissions.includes(permission)) {
      role.permissions.push(permission);
      role.updatedAt = new Date();
      this.roles.set(roleId, role);
      logger.info(`Added permission ${permission} to role ${roleId}`);
    }

    return true;
  }

  removePermissionFromRole(roleId: string, permission: string): boolean {
    const role = this.roles.get(roleId);
    if (!role) {
      logger.warn(`Role not found: ${roleId}`);
      return false;
    }

    if (role.isSystem) {
      logger.warn(`Cannot modify system role: ${roleId}`);
      return false;
    }

    const index = role.permissions.indexOf(permission);
    if (index > -1) {
      role.permissions.splice(index, 1);
      role.updatedAt = new Date();
      this.roles.set(roleId, role);
      logger.info(`Removed permission ${permission} from role ${roleId}`);
    }

    return true;
  }

  roleHasPermission(roleId: string, permission: string): boolean {
    const role = this.roles.get(roleId);
    return role ? role.permissions.includes(permission) : false;
  }

  // Utility methods

  getUsersByRole(roleId: string): string[] {
    const users: string[] = [];

    this.userRoles.forEach((userRoleSet, userId) => {
      if (userRoleSet.has(roleId)) {
        users.push(userId);
      }
    });

    return users;
  }

  getRoleAssignments(userId: string): RoleAssignment[] {
    return this.roleAssignments.get(userId) || [];
  }

  getAllRoleAssignments(): Map<string, RoleAssignment[]> {
    return new Map(this.roleAssignments);
  }

  cleanupExpiredRoles(): void {
    const now = new Date();
    let cleanedCount = 0;

    this.userRoles.forEach((userRoleSet, userId) => {
      const assignments = this.roleAssignments.get(userId) || [];

      assignments.forEach((assignment) => {
        if (assignment.expiresAt && assignment.expiresAt <= now) {
          userRoleSet.delete(assignment.roleId);
          cleanedCount++;
        }
      });

      // Update assignments to remove expired ones
      const validAssignments = assignments.filter((a) => !a.expiresAt || a.expiresAt > now);
      this.roleAssignments.set(userId, validAssignments);
    });

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} expired role assignments`);
    }
  }

  private generateRoleId(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  // Export/Import for persistence
  exportRoleData(): {
    roles: Role[];
    userRoles: Record<string, string[]>;
    assignments: Record<string, RoleAssignment[]>;
  } {
    return {
      roles: this.getAllRoles(),
      userRoles: Object.fromEntries(
        Array.from(this.userRoles.entries()).map(([userId, roleSet]) => [
          userId,
          Array.from(roleSet),
        ])
      ),
      assignments: Object.fromEntries(this.roleAssignments),
    };
  }

  importRoleData(data: {
    roles?: Role[];
    userRoles?: Record<string, string[]>;
    assignments?: Record<string, RoleAssignment[]>;
  }): void {
    if (data.roles) {
      data.roles.forEach((role) => {
        this.roles.set(role.id, role);
      });
      logger.info(`Imported ${data.roles.length} roles`);
    }

    if (data.userRoles) {
      Object.entries(data.userRoles).forEach(([userId, roleIds]) => {
        this.userRoles.set(userId, new Set(roleIds));
      });
      logger.info(`Imported user roles for ${Object.keys(data.userRoles).length} users`);
    }

    if (data.assignments) {
      Object.entries(data.assignments).forEach(([userId, assignments]) => {
        this.roleAssignments.set(userId, assignments);
      });
      logger.info(`Imported role assignments for ${Object.keys(data.assignments).length} users`);
    }
  }
}

// Create singleton instance
export const roleManager = RoleManager.getInstance();

export default roleManager;
