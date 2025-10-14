import { Eye, Filter, Plus, Search, Trash2, UserCheck, Users, UserX } from 'lucide-react';
import type { FC, FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { logger } from './../../../shared/utils/logger';

import { apiClient } from '@lib/api';
import type { CreateUserRequest, UpdateUserRequest, UserRole, UserSummary } from '@shared/types';
import { getUserPermissions, getUserRoleName } from '@shared/utils/user';
import { useAuth } from '../../auth';

type Role = UserRole;

interface User {
  id: string;
  email: string;
  username?: string | null;
  full_name?: string | null;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_verified: boolean;
  is_approved: boolean;
  role: Role;
  lifecycle_stage?: string | null;
  activity_score?: number | null;
  last_login_at?: string | null;
  created_at: string;
}

interface CreateUserData {
  email: string;
  password: string;
  username?: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
}

interface UpdateUserData {
  email?: string;
  username?: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
}

const UserManagementEnhanced: FC = () => {
  const { hasPermission, user } = useAuth();

  const debugEnabled = useMemo(() => {
    if (!import.meta.env.DEV) {
      return false;
    }

    if (typeof window === 'undefined') {
      return false;
    }

    try {
      return window.sessionStorage.getItem('DEBUG_USER_MANAGEMENT') === 'true';
    } catch {
      return false;
    }
  }, []);

  const debugLog = useCallback(
    (...args: unknown[]) => {
      if (debugEnabled) {
        logger.debug('[UserManagementEnhanced]', { ...args });
      }
    },
    [debugEnabled]
  );

  useEffect(() => {
    if (!debugEnabled) {
      return;
    }

    debugLog('Permission snapshot', {
      user,
      role: user?.role,
      isSuperuser: user?.is_superuser,
      permissions: getUserPermissions(user),
      hasUserRead: hasPermission('user:read'),
      isAdmin: hasPermission('admin'),
      roleName: getUserRoleName(user),
    });

    debugLog(
      user
        ? 'Component rendering with active user context'
        : 'Component rendering without user context'
    );
  }, [debugEnabled, debugLog, hasPermission, user]);

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const roleMap = useMemo(() => {
    const map = new Map<string, Role>();
    roles.forEach((role) => {
      map.set(role.name, role);
      map.set(role.name.toLowerCase(), role);
      map.set(String(role.id), role);
      if (role.description) {
        map.set(role.description, role);
        map.set(role.description.toLowerCase(), role);
      }
    });
    return map;
  }, [roles]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [pagination, setPagination] = useState({ skip: 0, limit: 20, total: 0, hasMore: false });

  // Modals and selections
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set<string>());
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const buildCreateUserRequest = useCallback((data: CreateUserData): CreateUserRequest => {
    const trimmedName = data.full_name?.trim();
    const nameSegments = trimmedName ? trimmedName.split(' ') : [];
    const firstName = nameSegments[0] ?? data.email.split('@')[0] ?? 'First';
    const lastName = nameSegments.length > 1 ? nameSegments.slice(1).join(' ') : 'User';
    const username = data.username?.trim();
    const role = data.role?.trim();

    return {
      email: data.email,
      password: data.password,
      first_name: firstName || 'First',
      last_name: lastName || 'User',
      role: role && role.length > 0 ? role : undefined,
      is_active: data.is_active ?? true,
      username: username && username.length > 0 ? username : undefined,
    };
  }, []);

  const buildUpdateUserRequest = useCallback((data: UpdateUserData): UpdateUserRequest => {
    const request: UpdateUserRequest = {};

    if (data.role) {
      const trimmedRole = data.role.trim();
      if (trimmedRole) {
        request.role = trimmedRole;
      }
    }

    if (typeof data.is_active === 'boolean') {
      request.is_active = data.is_active;
    }

    if (typeof data.username === 'string') {
      const trimmed = data.username.trim();
      if (trimmed) {
        request.username = trimmed;
      }
    }

    if (data.full_name) {
      const trimmed = data.full_name.trim();
      if (trimmed) {
        request.full_name = trimmed;
        const segments = trimmed.split(' ');
        request.first_name = segments[0];
        if (segments.length > 1) {
          request.last_name = segments.slice(1).join(' ');
        }
      }
    }

    return request;
  }, []);

  // Define functions before useEffect
  const loadUsers = useCallback(async () => {
    let tokenAvailable = false;
    if (typeof window !== 'undefined') {
      try {
        tokenAvailable = !!window.localStorage.getItem('access_token');
      } catch {
        tokenAvailable = false;
      }
    }

    debugLog('Loading users', {
      tokenAvailable,
      permissions: getUserPermissions(user),
      params: {
        skip: pagination.skip,
        limit: pagination.limit,
        searchTerm,
        filterRole,
        filterActive,
      },
    });

    try {
      setIsLoading(true);
      setError(null);

      const params: Record<string, string | number | boolean> = {
        skip: pagination.skip,
        limit: pagination.limit,
      };

      if (searchTerm) params['search'] = searchTerm;
      if (filterRole) params['role'] = filterRole;
      if (filterActive !== undefined) params['is_active'] = filterActive;

      debugLog('Requesting users with params', params);

      const summaries = await apiClient.getUsers(params);

      const mappedUsers = summaries.map((summary: UserSummary, index) => {
        const roleCandidates = [
          summary.role,
          summary.role?.toLowerCase(),
          summary.role_name,
          summary.role_name?.toLowerCase(),
          summary.id != null ? String(summary.id) : undefined,
        ].filter((candidate): candidate is string => Boolean(candidate));

        const resolvedRole =
          roleCandidates.reduce<Role | undefined>((acc, key) => {
            if (acc) {
              return acc;
            }
            return roleMap.get(key);
          }, undefined) ??
          ({
            id: typeof summary.id === 'number' ? summary.id : index + 1,
            name: summary.role,
            description: summary.role_name ?? summary.role,
            permissions: [],
          } satisfies Role);

        const fallbackName = `${summary.first_name ?? ''} ${summary.last_name ?? ''}`.trim();

        const userId =
          summary.user_id ?? (summary.id != null ? String(summary.id) : String(index + 1));

        return {
          id: userId,
          email: summary.email,
          username: summary.username ?? null,
          full_name: summary.full_name ?? (fallbackName || summary.email),
          first_name: summary.first_name,
          last_name: summary.last_name,
          is_active: summary.is_active,
          is_verified: summary.is_verified,
          is_approved: summary.is_approved,
          role: resolvedRole,
          lifecycle_stage: summary.role_name ?? null,
          activity_score: null,
          last_login_at: summary.last_login_at ?? null,
          created_at: summary.created_at,
        } satisfies User;
      });

      debugLog('Users loaded successfully', { count: mappedUsers.length });

      setUsers(mappedUsers);
      setPagination((prev) => ({
        ...prev,
        total: mappedUsers.length,
        hasMore: mappedUsers.length >= prev.limit,
      }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logger.error('Failed to load users', undefined, { err });

      setError(`Failed to load users: ${errorMessage}`);

      // If it's an authentication error, provide specific guidance
      if (
        errorMessage.includes('401') ||
        errorMessage.includes('Authentication') ||
        errorMessage.includes('Unauthorized')
      ) {
        setError(
          'Authentication error: Please try logging out and logging back in. If the problem persists, contact your administrator.'
        );
      }
    } finally {
      setIsLoading(false);
      debugLog('loadUsers completed');
    }
  }, [
    debugLog,
    filterActive,
    filterRole,
    pagination.limit,
    pagination.skip,
    roleMap,
    searchTerm,
    user,
  ]);

  const loadRoles = useCallback(async () => {
    try {
      debugLog('Loading roles from backend...');
      const fetchedRoles = await apiClient.getRoles();

      const normalizedRoles = fetchedRoles.map((role, index) => ({
        ...role,
        id:
          typeof role.id === 'number' ? role.id : Number.parseInt(String(role.id), 10) || index + 1,
        permissions: role.permissions ?? [],
      }));

      debugLog('Roles loaded successfully', normalizedRoles);
      setRoles(normalizedRoles);
    } catch (err) {
      logger.error('Failed to load roles', undefined, { err });
      // Fallback to default roles if backend fails
      setRoles([
        { id: 1, name: 'admin', description: 'Administrator', permissions: ['admin'] },
        { id: 2, name: 'user', description: 'Standard User', permissions: [] },
        {
          id: 3,
          name: 'manager',
          description: 'Manager',
          permissions: ['user:read', 'user:write'],
        },
      ]);
    }
  }, [debugLog]);

  useEffect(() => {
    debugLog('UserManagementEnhanced mounted', {
      userEmail: user?.email,
      hasAdminPermission: hasPermission('admin'),
    });
    loadRoles();
  }, [debugLog, hasPermission, loadRoles, user?.email]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setPagination((prev) => {
      if (prev.skip === 0) {
        return prev;
      }

      return { ...prev, skip: 0 };
    });
  }, [filterActive, filterRole, searchTerm]);

  const handleUserAction = async (action: string, userId: string, data?: UpdateUserData) => {
    try {
      setActionLoading(`${action}-${userId}`);

      switch (action) {
        case 'activate':
          await apiClient.updateUser(userId, { is_active: true });
          break;
        case 'deactivate':
          await apiClient.updateUser(userId, { is_active: false });
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this user?')) {
            await apiClient.deleteUser(userId);
          } else {
            return;
          }
          break;
        case 'update':
          if (data) {
            const payload = buildUpdateUserRequest(data);
            if (Object.keys(payload).length === 0) {
              debugLog('No changes detected for user update, skipping API call', payload);
              break;
            }

            await apiClient.updateUser(userId, payload);
          }
          break;
        default:
          if (import.meta.env.DEV) {
            logger.warn('Unknown action:', { action });
          }
      }

      await loadUsers();
    } catch (error) {
      logger.error(
        `Action ${action} failed:`,
        error instanceof Error ? error : new Error(String(error))
      );
      setError(`Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      setActionLoading('create-user');
      await apiClient.createUser(buildCreateUserRequest(userData));
      setShowCreateModal(false);
      await loadUsers();
    } catch (error) {
      logger.error('Create user failed:', undefined, { error });
      setError('Failed to create user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedUsers.size} users?`)) {
      try {
        setActionLoading('bulk-delete');

        await Promise.all(Array.from(selectedUsers, (userId) => apiClient.deleteUser(userId)));

        setSelectedUsers(new Set<string>());
        await loadUsers();
      } catch (error) {
        logger.error('Bulk delete failed:', undefined, { error });
        setError('Failed to delete some users');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleSelectUser = (userId: string, selected: boolean) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUsers(new Set<string>(users.map((user) => user.id)));
    } else {
      setSelectedUsers(new Set<string>());
    }
  };

  if (!hasPermission('user:read') && !user?.is_superuser) {
    debugLog('Access denied - insufficient permissions', {
      user,
      isSuperuser: user?.is_superuser,
      permissions: {
        'user:read': hasPermission('user:read'),
        admin: hasPermission('admin'),
        'user:write': hasPermission('user:write'),
        'user:delete': hasPermission('user:delete'),
      },
    });
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-12 text-center">
        <h3 className="mb-4 text-red-600">⛔ Access Denied</h3>
        <p className="text-red-900">You don't have permission to manage users.</p>
        <p className="mt-4 text-sm text-red-900">Required: user:read permission</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 flex items-center gap-2 text-gray-900">
            <Users className="h-6 w-6" />
            User Management
          </h1>
          <p className="m-0 text-gray-600">
            Manage user accounts, roles, and permissions ({users.length} total users)
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Bulk Actions */}
          {selectedUsers.size > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-sky-100 px-4 py-2 text-sky-700">
              <span>{selectedUsers.size} selected</span>
              <button
                onClick={handleBulkDelete}
                disabled={actionLoading === 'bulk-delete'}
                className="flex cursor-pointer items-center gap-1 rounded border-none bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-3 w-3" />
                {actionLoading === 'bulk-delete' ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setSelectedUsers(new Set<string>())}
                className="cursor-pointer rounded border-none bg-gray-600 px-2 py-1 text-xs text-white hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          )}

          {hasPermission('user:write') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-lg border-none bg-blue-500 px-6 py-3 font-medium text-white hover:bg-blue-600"
            >
              <Plus className="h-4 w-4" />
              Create New User
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <div className="grid items-end gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="flex flex-col gap-2 font-medium text-gray-700">
              <span>
                <Search className="mr-2 inline h-4 w-4" />
                Search Users
              </span>
              <input
                type="text"
                placeholder="Search by email, username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
          </div>

          <div>
            <label className="flex flex-col gap-2 font-medium text-gray-700">
              <span>
                <Filter className="mr-2 inline h-4 w-4" />
                Filter by Role
              </span>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label className="flex flex-col gap-2 font-medium text-gray-700">
              <span>Status</span>
              <select
                value={filterActive === undefined ? '' : filterActive.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterActive(value === '' ? undefined : value === 'true');
                }}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterRole('');
              setFilterActive(undefined);
            }}
            className="cursor-pointer rounded-md border-none bg-gray-600 px-4 py-3 font-medium text-white hover:bg-gray-700"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="text-gray-600">Loading users...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-gray-900">No users found</h3>
            <p className="text-gray-600">
              {searchTerm || filterRole || filterActive !== undefined
                ? 'Try adjusting your filters'
                : 'Get started by creating your first user'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="p-4 text-left font-semibold text-gray-700">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === users.length && users.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="mr-2"
                      />
                      User
                    </th>
                    <th className="p-4 text-left font-semibold text-gray-700">Role</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Created</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.full_name || user.username || user.email}
                            </div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-2xl px-3 py-1 text-sm font-medium ${
                            user.role.name === 'admin'
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-blue-50 text-sky-600'
                          }`}
                        >
                          {user.role.name}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {user.is_active ? (
                            <UserCheck className="h-4 w-4 text-green-600" />
                          ) : (
                            <UserX className="h-4 w-4 text-red-600" />
                          )}
                          <span
                            className={`font-medium ${
                              user.is_active ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="flex cursor-pointer items-center gap-1 rounded border-none bg-blue-500 p-2 text-white hover:bg-blue-600"
                            title="View/Edit User"
                          >
                            <Eye className="h-3 w-3" />
                          </button>

                          {hasPermission('user:write') && (
                            <>
                              <button
                                onClick={() =>
                                  handleUserAction(
                                    user.is_active ? 'deactivate' : 'activate',
                                    user.id
                                  )
                                }
                                disabled={actionLoading?.includes(user.id)}
                                className={`flex cursor-pointer items-center gap-1 rounded border-none p-2 text-white disabled:cursor-not-allowed disabled:opacity-50 ${
                                  user.is_active
                                    ? 'bg-amber-500 hover:bg-amber-600'
                                    : 'bg-green-500 hover:bg-green-600'
                                }`}
                                title={user.is_active ? 'Deactivate User' : 'Activate User'}
                              >
                                {user.is_active ? (
                                  <UserX className="h-3 w-3" />
                                ) : (
                                  <UserCheck className="h-3 w-3" />
                                )}
                              </button>

                              <button
                                onClick={() => handleUserAction('delete', user.id)}
                                disabled={actionLoading?.includes(user.id)}
                                className="flex cursor-pointer items-center gap-1 rounded border-none bg-red-500 p-2 text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Delete User"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-8 py-4">
              <div className="text-gray-600">
                Showing {pagination.skip + 1} -{' '}
                {Math.min(pagination.skip + pagination.limit, pagination.total)} of{' '}
                {pagination.total}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      skip: Math.max(0, prev.skip - prev.limit),
                    }))
                  }
                  disabled={pagination.skip === 0}
                  className={`rounded-md border-none px-4 py-2 text-white ${
                    pagination.skip === 0
                      ? 'cursor-not-allowed bg-gray-300'
                      : 'cursor-pointer bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      skip: prev.skip + prev.limit,
                    }))
                  }
                  disabled={!pagination.hasMore}
                  className={`rounded-md border-none px-4 py-2 text-white ${
                    !pagination.hasMore
                      ? 'cursor-not-allowed bg-gray-300'
                      : 'cursor-pointer bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          roles={roles}
          onSave={handleCreateUser}
          onClose={() => setShowCreateModal(false)}
          isLoading={actionLoading === 'create-user'}
        />
      )}

      {/* Edit User Modal */}
      {showUserModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          roles={roles}
          onSave={(data) => {
            handleUserAction('update', selectedUser.id, data);
            setShowUserModal(false);
          }}
          onClose={() => setShowUserModal(false)}
          isLoading={actionLoading?.includes(selectedUser.id) || false}
        />
      )}
    </div>
  );
};

// Create User Modal Component
const CreateUserModal: FC<{
  roles: Role[];
  onSave: (data: CreateUserData) => void;
  onClose: () => void;
  isLoading: boolean;
}> = ({ roles, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    username: '',
    full_name: '',
    role: 'user',
    is_active: true,
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-[1000] flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-[90%] max-w-[500px] overflow-y-auto rounded-xl bg-white p-8">
        <h2 className="mb-6 text-gray-900">Create New User</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="flex flex-col gap-2 font-medium text-gray-700">
              <span>Email *</span>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </label>
          </div>

          <div className="mb-4">
            <label className="flex flex-col gap-2 font-medium text-gray-700">
              <span>Password *</span>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
                minLength={8}
              />
            </label>
          </div>

          <div className="mb-4">
            <label className="flex flex-col gap-2 font-medium text-gray-700">
              <span>Username</span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
          </div>

          <div className="mb-4">
            <label className="flex flex-col gap-2 font-medium text-gray-700">
              <span>Full Name</span>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
          </div>

          <div className="mb-4">
            <label className="flex flex-col gap-2 font-medium text-gray-700">
              <span>Role</span>
              <select
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name} - {role.description}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mb-8">
            <label className="flex cursor-pointer items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
              Active User
            </label>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="cursor-pointer rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer rounded-md border-none bg-blue-500 px-6 py-3 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit User Modal Component
const EditUserModal: FC<{
  user: User;
  roles: Role[];
  onSave: (data: UpdateUserData) => void;
  onClose: () => void;
  isLoading: boolean;
}> = ({ user, roles, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState<UpdateUserData>({
    email: user.email,
    username: user.username || '',
    full_name: user.full_name || '',
    role: user.role.name,
    is_active: user.is_active,
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-[1000] flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-[90%] max-w-[500px] overflow-y-auto rounded-xl bg-white p-8">
        <h2 className="mb-6 text-gray-900">Edit User</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="flex flex-col gap-2 font-medium text-gray-700">
              <span>Email</span>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
          </div>

          <div className="mb-4">
            <label className="flex flex-col gap-2 font-medium text-gray-700">
              <span>Username</span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
          </div>

          <div className="mb-4">
            <label className="flex flex-col gap-2 font-medium text-gray-700">
              <span>Full Name</span>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </label>
          </div>

          <div className="mb-4">
            <label className="flex flex-col gap-2 font-medium text-gray-700">
              <span>Role</span>
              <select
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name} - {role.description}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mb-8">
            <label className="flex cursor-pointer items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
              Active User
            </label>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="cursor-pointer rounded-md border border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer rounded-md border-none bg-blue-500 px-6 py-3 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagementEnhanced;
