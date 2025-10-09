/**
 * User management adapter functions
 * Provides backward-compatible API wrappers for user CRUD operations
 */

import baseApiClient from '../apiClient';
import type { CreateUserRequest, UpdateUserRequest } from '@shared/types';
import type {
  LegacyUsersResponse,
  LegacyRolesResponse,
  ActionResponse
} from './types';
import {
  toLegacyUser,
  resolvePageInfo,
  createSuccessResponse
} from './types';

/**
 * User creation payload
 */
export interface CreateUserPayload extends Partial<CreateUserRequest> {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Get list of users
 */
export async function getUsers(
  params?: Record<string, unknown>
): Promise<LegacyUsersResponse> {
  const summaries = await baseApiClient.getUsers();
  
  return {
    success: true,
    users: summaries.map(toLegacyUser),
    total: summaries.length,
    page_info: resolvePageInfo(params)
  };
}

/**
 * Get available roles
 */
export async function getRoles(): Promise<LegacyRolesResponse> {
  const roles = await baseApiClient.getRoles();
  
  return {
    success: true,
    roles: roles.map((role, index) => ({
      id: role.id ?? index + 1,
      name: role.name,
      description: role.description ?? role.name,
      permissions: role.permissions ?? []
    }))
  };
}

/**
 * Create a new user
 */
export async function createUser(payload: CreateUserPayload): Promise<ActionResponse> {
  const request: CreateUserRequest = {
    email: payload.email,
    password: payload.password,
    first_name: payload.first_name ?? payload.email.split('@')[0] ?? 'First',
    last_name: payload.last_name ?? 'User',
    role: payload.role,
    is_active: payload.is_active ?? true,
    username: payload.username,
    phone_number: payload.phone_number
  };

  const created = await baseApiClient.createUser(request);
  
  return createSuccessResponse(created, 'User created successfully.');
}

/**
 * Update an existing user
 */
export async function updateUser(
  userId: number | string,
  payload: UpdateUserRequest
): Promise<ActionResponse> {
  const updated = await baseApiClient.updateUser(String(userId), payload);
  
  return createSuccessResponse(updated, 'User updated successfully.');
}

/**
 * Delete a user
 */
export async function deleteUser(userId: number | string): Promise<ActionResponse> {
  const response = await baseApiClient.deleteUser(String(userId));
  
  return createSuccessResponse(
    response,
    response.message ?? 'User deleted successfully.'
  );
}
