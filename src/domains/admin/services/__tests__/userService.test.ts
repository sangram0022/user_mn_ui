import { describe, it, expect, beforeEach } from 'vitest';
import { resetHandlers, useErrorHandlers } from '@/test/utils/mockApi';
import {
  mockAdminUserListResponse,
  mockUserCreateRequest,
  mockUserUpdateRequest,
} from '@/test/utils/mockData';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  approveUser,
  bulkApproveUsers,
  bulkDeleteUsers,
} from '../adminService';
import type {
  ListUsersFilters,
} from '@/domains/admin/types';

describe('adminService (User Management)', () => {
  beforeEach(() => {
    resetHandlers();
  });

  describe('listUsers', () => {
    it('should fetch list of users with default params', async () => {
      const result = await listUsers();

      expect(result).toEqual(mockAdminUserListResponse);
      expect(result.users).toHaveLength(3);
      expect(result.pagination.total_items).toBe(3);
    });

    it('should fetch list of users with filters', async () => {
      const filters: ListUsersFilters = {
        page: 2,
        page_size: 10,
        status: 'active',
        role: 'admin',
        search: 'john',
        sort_by: 'created_at',
        sort_order: 'desc',
      };

      const result = await listUsers(filters);

      expect(result).toBeDefined();
      expect(result.users).toBeDefined();
    });

    it('should handle errors when listing users', async () => {
      useErrorHandlers();

      await expect(listUsers()).rejects.toThrow();
    });
  });

  describe('getUser', () => {
    it('should fetch user detail by ID', async () => {
      const result = await getUser('user-1');

      expect(result).toBeDefined();
      expect(result.user_id).toBe('user-1');
      expect(result.login_stats).toBeDefined();
      expect(result.permissions).toBeDefined();
    });

    it('should throw error for non-existent user', async () => {
      await expect(getUser('user-999')).rejects.toThrow();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const result = await createUser(mockUserCreateRequest);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(mockUserCreateRequest.email);
      expect(result.user.username).toBe(mockUserCreateRequest.username);
    });

    it('should handle validation errors when creating user', async () => {
      useErrorHandlers();

      await expect(createUser(mockUserCreateRequest)).rejects.toThrow();
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const result = await updateUser('user-1', mockUserUpdateRequest);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.first_name).toBe(mockUserUpdateRequest.first_name);
      expect(result.user.last_name).toBe(mockUserUpdateRequest.last_name);
    });

    it('should throw error when updating non-existent user', async () => {
      await expect(
        updateUser('user-999', mockUserUpdateRequest)
      ).rejects.toThrow();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const result = await deleteUser('user-1');
      
      expect(result).toBeDefined();
      expect(result.message).toBeDefined();
    });

    it('should throw error when deleting non-existent user', async () => {
      await expect(deleteUser('user-999')).rejects.toThrow();
    });
  });

  describe('approveUser', () => {
    it('should approve a pending user', async () => {
      const result = await approveUser('user-2');

      expect(result).toBeDefined();
      expect(result.user_id).toBe('user-2');
      expect(result.status).toBe('active');
      expect(result.message).toBeDefined();
    });

    it('should throw error when approving non-existent user', async () => {
      await expect(approveUser('user-999')).rejects.toThrow();
    });
  });

  describe('bulkApproveUsers', () => {
    it('should approve multiple users', async () => {
      const userIds = ['user-2', 'user-3', 'user-4'];

      const result = await bulkApproveUsers(userIds);

      expect(result).toBeDefined();
      expect(result.succeeded).toBeGreaterThanOrEqual(0);
      expect(result.total).toBe(userIds.length);
    });

    it('should handle empty user list', async () => {
      const result = await bulkApproveUsers([]);

      expect(result).toBeDefined();
      expect(result.total).toBe(0);
    });
  });

  describe('bulkDeleteUsers', () => {
    it('should delete multiple users', async () => {
      const userIds = ['user-2', 'user-3'];

      const result = await bulkDeleteUsers(userIds);

      expect(result).toBeDefined();
      expect(result.succeeded).toBeGreaterThanOrEqual(0);
      expect(result.total).toBe(userIds.length);
    });
  });
});
