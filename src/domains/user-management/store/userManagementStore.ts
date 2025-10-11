/**
 * User Management Domain Store (Zustand)
 *
 * High-performance state management for user management
 *
 * @module domains/user-management/store
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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
  createUser: (user: Omit<ManagedUser, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
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
          const queryParams = new URLSearchParams({
            page: pagination.page.toString(),
            pageSize: pagination.pageSize.toString(),
            ...filters,
          });

          // TODO: Replace with actual API call
          const response = await fetch(`/api/users?${queryParams}`);

          if (!response.ok) {
            throw new Error('Failed to fetch users');
          }

          const data = await response.json();

          set({
            users: data.users,
            pagination: {
              ...pagination,
              total: data.total,
              totalPages: data.totalPages,
            },
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch users',
            isLoading: false,
          });
          throw error;
        }
      },

      // Fetch Single User
      fetchUser: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          // TODO: Replace with actual API call
          const response = await fetch(`/api/users/${id}`);

          if (!response.ok) {
            throw new Error('Failed to fetch user');
          }

          const user = await response.json();

          set({
            selectedUser: user,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch user',
            isLoading: false,
          });
          throw error;
        }
      },

      // Create User
      createUser: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          // TODO: Replace with actual API call
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            throw new Error('Failed to create user');
          }

          // Refresh user list
          await get().fetchUsers(get().filters);

          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create user',
            isLoading: false,
          });
          throw error;
        }
      },

      // Update User
      updateUser: async (id, updates) => {
        set({ isLoading: true, error: null });

        try {
          // TODO: Replace with actual API call
          const response = await fetch(`/api/users/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            throw new Error('Failed to update user');
          }

          // Update local state
          set((state) => ({
            users: state.users.map((user) => (user.id === id ? { ...user, ...updates } : user)),
            selectedUser:
              state.selectedUser?.id === id
                ? { ...state.selectedUser, ...updates }
                : state.selectedUser,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update user',
            isLoading: false,
          });
          throw error;
        }
      },

      // Delete User
      deleteUser: async (id) => {
        set({ isLoading: true, error: null });

        try {
          // TODO: Replace with actual API call
          const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete user');
          }

          // Remove from local state
          set((state) => ({
            users: state.users.filter((user) => user.id !== id),
            selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete user',
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
