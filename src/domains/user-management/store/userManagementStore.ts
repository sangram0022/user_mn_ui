/**
 * User Management Domain Store (Zustand)
 *
 * High-performance state management for user management
 *
 * @module domains/user-management/store
 */

import { logger } from '@shared/utils/logger';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { adminService } from '../../../services/api';
import {
  mapManagedUserToUpdateRequest,
  mapUsersToManagedUsers,
  mapUserToManagedUser,
} from '../mappers/userMappers';

/**
 * User for management (different from authenticated user)
 */
export interface ManagedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

/**
 * User creation data (includes password for new users)
 */
export interface CreateManagedUser extends Omit<ManagedUser, 'id' | 'createdAt' | 'updatedAt'> {
  password: string;
}

/**
 * User filters
 */
export interface UserFilters {
  search?: string;
  role?: ManagedUser['role'];
  status?: ManagedUser['status'];
  sortBy?: 'email' | 'createdAt' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * User Management State Interface
 */
export interface UserManagementState {
  // State
  users: ManagedUser[];
  selectedUser: ManagedUser | null;
  filters: UserFilters;
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUsers: (filters?: UserFilters) => Promise<void>;
  fetchUser: (id: string) => Promise<void>;
  createUser: (user: CreateManagedUser) => Promise<void>;
  updateUser: (id: string, updates: Partial<ManagedUser>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  suspendUser: (id: string) => Promise<void>;
  activateUser: (id: string) => Promise<void>;

  // Filter actions
  setFilters: (filters: Partial<UserFilters>) => void;
  clearFilters: () => void;

  // Pagination actions
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // Selection actions
  selectUser: (user: ManagedUser | null) => void;

  // Internal actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * User Management Store
 */
export const useUserManagementStore = create<UserManagementState>()(
  devtools(
    (set, get) => ({
      // Initial State
      users: [],
      selectedUser: null,
      filters: {},
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      },
      isLoading: false,
      error: null,

      // Fetch Users
      fetchUsers: async (filters?: UserFilters) => {
        set({ isLoading: true, error: null });

        try {
          const { pagination } = get();

          // Call actual backend API
          const users = await adminService.getUsers({
            page: pagination.page,
            limit: pagination.pageSize,
            role: filters?.role,
            is_active:
              filters?.status === 'active'
                ? true
                : filters?.status === 'inactive'
                  ? false
                  : undefined,
            // search: filters?.search, // Not supported by API yet - using client-side filtering instead
          });

          // Map backend UserSummary[] to ManagedUser[]
          const managedUsers = mapUsersToManagedUsers(users as never);

          // Filter by search term if provided (client-side filtering)
          let filteredUsers = managedUsers;
          if (filters?.search) {
            const searchLower = filters.search.toLowerCase();
            filteredUsers = managedUsers.filter(
              (user) =>
                user.email.toLowerCase().includes(searchLower) ||
                user.firstName.toLowerCase().includes(searchLower) ||
                user.lastName.toLowerCase().includes(searchLower)
            );
          }

          // Sort if specified
          if (filters?.sortBy) {
            filteredUsers.sort((a, b) => {
              const aVal = a[filters.sortBy!];
              const bVal = b[filters.sortBy!];
              if (aVal === undefined || bVal === undefined) return 0;
              const order = filters.sortOrder === 'desc' ? -1 : 1;
              return (aVal > bVal ? 1 : -1) * order;
            });
          }

          set({
            users: filteredUsers,
            pagination: {
              ...pagination,
              total: filteredUsers.length,
              totalPages: Math.ceil(filteredUsers.length / pagination.pageSize),
            },
            isLoading: false,
          });

          logger.info('[UserManagement] Successfully fetched users', {
            count: filteredUsers.length,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
          logger.error(
            '[UserManagement] Failed to fetch users',
            error instanceof Error ? error : new Error(errorMessage)
          );

          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // Fetch Single User
      fetchUser: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          // Call actual backend API
          // TODO: Backend API doesn't have GET /admin/users/{id} endpoint yet
          // Temporary workaround: fetch all users and find by ID
          const users = await adminService.getUsers();
          const user = users.find((u) => u.id === id);
          if (!user) {
            throw new Error(`User with ID ${id} not found`);
          }

          // Map backend User to ManagedUser
          const managedUser = mapUserToManagedUser(user as never);

          set({
            selectedUser: managedUser,
            isLoading: false,
          });

          logger.info('[UserManagement] Successfully fetched user', { userId: id });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
          logger.error(
            '[UserManagement] Failed to fetch user',
            error instanceof Error ? error : new Error(errorMessage)
          );

          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // Create User
      createUser: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          // Validate that password is provided in userData
          if (!userData.password) {
            throw new Error('Password is required to create a user');
          }

          // Call actual backend API
          await adminService.createUser({
            email: userData.email,
            password: userData.password,
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
          });

          // Refresh user list
          await get().fetchUsers(get().filters);

          set({ isLoading: false });
          logger.info('[UserManagement] Successfully created user', { email: userData.email });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
          logger.error(
            '[UserManagement] Failed to create user',
            error instanceof Error ? error : new Error(errorMessage)
          );

          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // Update User
      updateUser: async (id, updates) => {
        set({ isLoading: true, error: null });

        try {
          // Map frontend updates to backend format
          const backendUpdates = mapManagedUserToUpdateRequest(updates);

          // Call actual backend API
          await adminService.updateUser(id, backendUpdates);

          // Update local state
          set((state) => ({
            users: state.users.map((user) => (user.id === id ? { ...user, ...updates } : user)),
            selectedUser:
              state.selectedUser?.id === id
                ? { ...state.selectedUser, ...updates }
                : state.selectedUser,
            isLoading: false,
          }));

          logger.info('[UserManagement] Successfully updated user', { userId: id });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
          logger.error(
            '[UserManagement] Failed to update user',
            error instanceof Error ? error : new Error(errorMessage)
          );

          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // Delete User
      deleteUser: async (id) => {
        set({ isLoading: true, error: null });

        try {
          // Call actual backend API
          await adminService.deleteUser(id);

          // Remove from local state
          set((state) => ({
            users: state.users.filter((user) => user.id !== id),
            selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
            isLoading: false,
          }));

          logger.info('[UserManagement] Successfully deleted user', { userId: id });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
          logger.error(
            '[UserManagement] Failed to delete user',
            error instanceof Error ? error : new Error(errorMessage)
          );

          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // Suspend User
      suspendUser: async (id) => {
        await get().updateUser(id, { status: 'suspended' });
      },

      // Activate User
      activateUser: async (id) => {
        await get().updateUser(id, { status: 'active' });
      },

      // Set Filters
      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));

        get().fetchUsers(get().filters);
      },

      // Clear Filters
      clearFilters: () => {
        set({ filters: {} });
        get().fetchUsers();
      },

      // Set Page
      setPage: (page) => {
        set((state) => ({
          pagination: { ...state.pagination, page },
        }));

        get().fetchUsers(get().filters);
      },

      // Set Page Size
      setPageSize: (pageSize) => {
        set((state) => ({
          pagination: { ...state.pagination, pageSize, page: 1 },
        }));

        get().fetchUsers(get().filters);
      },

      // Select User
      selectUser: (user) => {
        set({ selectedUser: user });
      },

      // Set Loading
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Set Error
      setError: (error) => {
        set({ error });
      },

      // Clear Error
      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'UserManagementStore' }
  )
);

/**
 * Selectors
 */
export const userManagementSelectors = {
  users: (state: UserManagementState) => state.users,
  selectedUser: (state: UserManagementState) => state.selectedUser,
  filters: (state: UserManagementState) => state.filters,
  pagination: (state: UserManagementState) => state.pagination,
  isLoading: (state: UserManagementState) => state.isLoading,
  error: (state: UserManagementState) => state.error,
};
