/**
 * React 19 Optimistic Updates Integration for UserManagementPage
 *
 * This file provides optimistic CRUD helpers that can be integrated
 * into the existing UserManagementPage.tsx
 *
 * Usage:
 * 1. Import useOptimisticCRUD from this file
 * 2. Replace useState([]) for users with useOptimisticCRUD
 * 3. Update CRUD operations to use optimistic methods
 */

import { apiClient } from '@lib/api/client';
import { useOptimisticCRUD, type OptimisticListItem } from '@shared/hooks/useReact19Features';
import type { CreateUserRequest, UpdateUserRequest } from '@shared/types';

// Extend User type to support optimistic flag
export interface OptimisticUser extends OptimisticListItem {
  id: string;
  email: string;
  username?: string | null;
  full_name?: string | null;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_verified: boolean;
  is_approved: boolean;
  roles: string[];
  role_name?: string;
  lifecycle_stage?: string | null;
  activity_score?: number | null;
  last_login_at?: string | null;
  created_at: string;
  isOptimistic?: boolean; // Flag for optimistic UI
}

/**
 * Custom hook for user management with optimistic updates
 *
 * @example
 * ```tsx
 * const {
 *   items: users,
 *   create: createUserOptimistic,
 *   update: updateUserOptimistic,
 *   delete: deleteUserOptimistic,
 *   isOptimistic
 * } = useOptimisticUserManagement(initialUsers);
 *
 * // Usage in handlers
 * const handleDeleteUser = async (userId: string) => {
 *   try {
 *     await deleteUserOptimistic(userId, () => apiClient.deleteUser(userId));
 *     // Success - UI already updated optimistically!
 *   } catch (error) {
 *     // Error - UI automatically rolled back!
 *     showError('Failed to delete user');
 *   }
 * };
 * ```
 */
export function useOptimisticUserManagement(initialUsers: OptimisticUser[]) {
  const crud = useOptimisticCRUD<OptimisticUser>(initialUsers);

  return {
    users: crud.items,

    // Replace entire users list (for initial load/refresh)
    setUsers: crud.setItems,

    // Create user with optimistic update
    createUser: async (userData: CreateUserRequest) => {
      const optimisticUser: OptimisticUser = {
        id: `temp-${Date.now()}`, // Temporary ID
        email: userData.email,
        username: userData.username || null,
        full_name: `${userData.first_name} ${userData.last_name}`,
        first_name: userData.first_name,
        last_name: userData.last_name,
        is_active: userData.is_active ?? true,
        is_verified: false,
        is_approved: false,
        roles: [userData.role || 'user'],
        role_name: userData.role || 'user',
        created_at: new Date().toISOString(),
        isOptimistic: true,
      };

      await crud.create(optimisticUser, async () => {
        const created = await apiClient.createUser(userData);
        // Transform API response to OptimisticUser format
        return {
          ...created,
          id: String(created.id || created.user_id),
          roles: created.roles || ['user'],
          role_name: created.role_name || created.roles?.[0] || 'user',
          isOptimistic: false,
        } as unknown as OptimisticUser;
      });
    },

    // Update user with optimistic update
    updateUser: async (userId: string, updates: UpdateUserRequest) => {
      await crud.update(userId, updates as Partial<OptimisticUser>, async () => {
        const updated = await apiClient.updateUser(userId, updates);
        return {
          ...updated,
          id: String(updated.id || updated.user_id),
          roles: updated.roles || ['user'],
          role_name: updated.role_name || updated.roles?.[0] || 'user',
          isOptimistic: false,
        } as unknown as OptimisticUser;
      });
    },

    // Delete user with optimistic update
    deleteUser: async (userId: string) => {
      await crud.delete(userId, async () => {
        await apiClient.deleteUser(userId);
      });
    },

    // Toggle user active status with optimistic update
    toggleUserStatus: async (userId: string, currentStatus: boolean) => {
      const updates = { is_active: !currentStatus };
      await crud.update(userId, updates as Partial<OptimisticUser>, async () => {
        const updated = await apiClient.updateUser(userId, updates);
        return {
          ...updated,
          id: String(updated.id || updated.user_id),
          roles: updated.roles || ['user'],
          role_name: updated.role_name || updated.roles?.[0] || 'user',
          isOptimistic: false,
        } as unknown as OptimisticUser;
      });
    },

    // Check if user is in optimistic state
    isOptimistic: crud.isOptimistic,

    // Bulk delete with optimistic updates
    bulkDelete: async (userIds: string[]) => {
      // Delete all optimistically in parallel
      await Promise.all(
        userIds.map((id) =>
          crud.delete(id, async () => {
            await apiClient.deleteUser(id);
          })
        )
      );
    },
  };
}

/**
 * Integration Guide for UserManagementPage.tsx
 *
 * Step 1: Replace useState for users
 * ```tsx
 * //  Old way
 * const [users, setUsers] = useState<User[]>([]);
 *
 * //  New way
 * const {
 *   users,
 *   createUser,
 *   updateUser,
 *   deleteUser,
 *   toggleUserStatus,
 *   bulkDelete,
 *   isOptimistic
 * } = useOptimisticUserManagement([]);
 * ```
 *
 * Step 2: Update CRUD handlers
 * ```tsx
 * //  Old way
 * const handleDeleteUser = async (userId: string) => {
 *   setActionLoading(`delete-${userId}`);
 *   try {
 *     await apiClient.deleteUser(userId);
 *     await loadUsers(); // Refetch all users
 *   } catch (error) {
 *     setError('Failed to delete user');
 *   } finally {
 *     setActionLoading(null);
 *   }
 * };
 *
 * //  New way with optimistic updates
 * const handleDeleteUser = async (userId: string) => {
 *   if (!window.confirm('Are you sure?')) return;
 *
 *   setActionLoading(`delete-${userId}`);
 *   try {
 *     await deleteUser(userId); // Instant UI update + API call
 *     // No loadUsers() needed! Already optimistically updated
 *   } catch (error) {
 *     setError('Failed to delete user');
 *     // UI automatically rolls back on error
 *   } finally {
 *     setActionLoading(null);
 *   }
 * };
 * ```
 *
 * Step 3: Add visual indicator for optimistic items
 * ```tsx
 * {users.map((user) => (
 *   <tr
 *     key={user.id}
 *     className={isOptimistic(user) ? 'opacity-60 animate-pulse' : ''}
 *   >
 *     <td>{user.email}</td>
 *     {isOptimistic(user) && (
 *       <td>
 *         <span className="text-xs text-gray-500">Saving...</span>
 *       </td>
 *     )}
 *   </tr>
 * ))}
 * ```
 *
 * Step 4: Update toggle handler
 * ```tsx
 * //  Old way
 * case 'activate':
 *   await apiClient.updateUser(userId, { is_active: true });
 *   await loadUsers();
 *   break;
 *
 * //  New way
 * case 'activate':
 *   await toggleUserStatus(userId, false); // Instant toggle!
 *   break;
 * ```
 *
 * Benefits:
 * -  Instant UI feedback (perceived 50-80% faster)
 * -  Automatic rollback on errors
 * -  No manual state updates needed
 * -  Better UX on slow networks
 * -  Less boilerplate code
 */

export default useOptimisticUserManagement;
