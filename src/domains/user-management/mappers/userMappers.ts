/**
 * Type mappers for User Management domain
 * Maps between backend API types and frontend domain types
 *
 * @module domains/user-management/mappers
 */

import type { UpdateUserRequest, User } from '../../../types/api.types';
import type { ManagedUser } from '../store/userManagementStore';

/**
 * Map backend User to frontend ManagedUser
 */
export function mapUserToManagedUser(user: User): ManagedUser {
  return {
    id: user.user_id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: (user.roles?.[0] || 'user') as 'admin' | 'user' | 'moderator',
    status: user.is_active ? 'active' : 'inactive',
    createdAt: user.created_at,
    updatedAt: user.updated_at || user.created_at,
    lastLoginAt: user.last_login_at,
  };
}

/**
 * Map frontend ManagedUser updates to backend UpdateUserRequest
 */
export function mapManagedUserToUpdateRequest(
  updates: Partial<ManagedUser>
): Partial<UpdateUserRequest> {
  const request: Partial<UpdateUserRequest> = {};

  if (updates.firstName !== undefined) {
    request.first_name = updates.firstName;
  }

  if (updates.lastName !== undefined) {
    request.last_name = updates.lastName;
  }

  if (updates.role !== undefined) {
    request.role = updates.role;
  }

  if (updates.status !== undefined) {
    request.is_active = updates.status === 'active';
  }

  return request;
}

/**
 * Map multiple backend Users to frontend ManagedUsers
 */
export function mapUsersToManagedUsers(users: User[]): ManagedUser[] {
  return users.map(mapUserToManagedUser);
}
