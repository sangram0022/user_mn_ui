import { Eye, Filter, Plus, Search, Trash2, UserCheck, Users, UserX } from 'lucide-react';
import type { FC, FormEvent } from 'react';
import {
  startTransition,
  useActionState,
  useCallback,
  useDeferredValue,
  useEffect,
  useState,
  useTransition,
} from 'react';
import { logger } from './../../../shared/utils/logger';

import { useToast } from '@hooks/useToast';
import { useVirtualScroll } from '@hooks/useVirtualScroll';
import { SkeletonTable } from '@shared/components/ui/Skeleton';
import type { CreateUserRequest, UpdateUserRequest, UserRole, UserSummary } from '@shared/types';
import { PageMetadata } from '@shared/ui';
import { formatDate } from '@shared/utils';
import { prefetchRoute } from '@shared/utils/resource-loading';
import { getUserPermissions, getUserRoleName } from '@shared/utils/user';
import { adminService, rbacService } from '../../../services/api';
import { useAuth } from '../../auth';
import {
  useOptimisticUserManagement,
  type OptimisticUser,
} from '../hooks/useOptimisticUserManagement';

type Role = UserRole;

// Use OptimisticUser from the hook instead of local interface
type User = OptimisticUser;

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
  const { toast } = useToast();

  //  AWS-Optimized: Using CloudWatch for infrastructure monitoring
  // User feedback is provided through toast notifications

  const debugEnabled = (() => {
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
  })();

  // React 19 Compiler handles memoization
  const debugLog = (...args: unknown[]) => {
    if (debugEnabled) {
      logger.debug('[UserManagementEnhanced]', { ...args });
    }
  };

  useEffect(() => {
    if (!debugEnabled) {
      return;
    }

    debugLog('Permission snapshot', {
      user,
      roles: user?.roles,
      isSuperuser: user?.is_superuser,
      permissions: user ? getUserPermissions(user) : [],
      hasUserRead: hasPermission('user:read'),
      isAdmin: hasPermission('admin'),
      roleName: user ? getUserRoleName(user) : 'unknown',
    });

    debugLog(
      user
        ? 'Component rendering with active user context'
        : 'Component rendering without user context'
    );
  }, [debugEnabled, debugLog, hasPermission, user]);

  //  React 19: Optimistic User Management with instant UI updates
  const {
    users,
    setUsers,
    createUser: createUserOptimistic,
    updateUser: updateUserOptimistic,
    deleteUser: deleteUserOptimistic,
    toggleUserStatus: toggleUserStatusOptimistic,
    bulkDelete: bulkDeleteOptimistic,
    isOptimistic,
  } = useOptimisticUserManagement([]);

  //  React 19: Consolidated state (11 useState  5 state groups)
  const [roles, setRoles] = useState<Role[]>([]);
  const roleMap = (() => {
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
  })();

  // 1. Server data state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Filters state (consolidated 3  1)
  const [filters, setFilters] = useState({
    searchTerm: '',
    role: '',
    isActive: undefined as boolean | undefined,
  });

  //  React 19: useDeferredValue for search to avoid blocking input
  const deferredSearchTerm = useDeferredValue(filters.searchTerm);

  //  React 19: useTransition for filter changes
  const [isPending, startTransition] = useTransition();

  // 3. Pagination state
  const [pagination, setPagination] = useState({ skip: 0, limit: 20, total: 0, hasMore: false });

  // 4. UI state (consolidated 4  1)
  const [uiState, setUIState] = useState({
    selectedUser: null as User | null,
    showUserModal: false,
    showCreateModal: false,
    selectedUsers: new Set<string>(),
  });

  // 5. Action loading state
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  //  React 19: Virtual scrolling configuration for performance
  const ITEM_HEIGHT = 80; // Height of each table row in pixels
  const CONTAINER_HEIGHT = 600; // Height of scrollable viewport
  const OVERSCAN = 5; // Extra items to render for smooth scrolling

  // Initialize virtual scrolling
  const { virtualItems, totalHeight, containerRef, scrollToIndex } = useVirtualScroll({
    items: users,
    itemHeight: ITEM_HEIGHT,
    containerHeight: CONTAINER_HEIGHT,
    overscan: OVERSCAN,
  });

  const buildCreateUserRequest = (data: CreateUserData): CreateUserRequest => {
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
  };

  const buildUpdateUserRequest = (data: UpdateUserData): UpdateUserRequest => {
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
  };

  // Define functions before useEffect
  // React 19 Compiler handles memoization
  const loadUsers = useCallback(async () => {
    debugLog('Loading users...', {
      skip: pagination.skip,
      limit: pagination.limit,
      searchTerm: deferredSearchTerm, //  Use deferred value
      filterRole: filters.role, //  From consolidated state
      filterActive: filters.isActive, //  From consolidated state
    });

    try {
      setIsLoading(true);
      setError(null);

      const params: Record<string, string | number | boolean> = {
        skip: pagination.skip,
        limit: pagination.limit,
      };

      if (deferredSearchTerm) params['search'] = deferredSearchTerm; //  Use deferred value
      if (filters.role) params['role'] = filters.role; //  From consolidated state
      if (filters.isActive !== undefined) params['is_active'] = filters.isActive; //  From consolidated state

      debugLog('Requesting users with params', params);

      // Use enhanced adminService with pagination
      const response = await adminService.getUsers({
        page: typeof params['page'] === 'number' ? params['page'] : 1,
        limit: typeof params['page_size'] === 'number' ? params['page_size'] : 100,
        role: typeof params['role'] === 'string' ? params['role'] : undefined,
        is_active: typeof params['is_active'] === 'boolean' ? params['is_active'] : undefined,
      });

      const summaries = response.items;

      const mappedUsers = summaries.map((summary, index) => {
        // Extract first role from roles array for compatibility
        const primaryRole = summary.roles?.[0] || 'user';

        const roleCandidates = [
          primaryRole,
          primaryRole.toLowerCase(),
          summary.roles?.[0]?.toLowerCase(),
        ].filter((candidate): candidate is string => Boolean(candidate));

        const resolvedRole =
          roleCandidates.reduce<Role | undefined>((acc, key) => {
            if (acc) {
              return acc;
            }
            return roleMap.get(key);
          }, undefined) ??
          ({
            id: index + 1,
            name: primaryRole,
            description: primaryRole,
            permissions: [],
          } satisfies Role);

        const fallbackName = `${summary.first_name ?? ''} ${summary.last_name ?? ''}`.trim();

        return {
          id: summary.user_id,
          email: summary.email,
          username: null,
          full_name: fallbackName || summary.email,
          first_name: summary.first_name,
          last_name: summary.last_name,
          is_active: summary.is_active,
          is_verified: summary.is_verified,
          is_approved: summary.is_approved,
          role: resolvedRole,
          roles: summary.roles, // Add roles array for OptimisticUser compatibility
          lifecycle_stage: primaryRole,
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
        const authError =
          'Authentication error: Please try logging out and logging back in. If the problem persists, contact your administrator.';
        setError(authError);
        toast.error(authError);
      } else {
        toast.error(`Failed to load users: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
      debugLog('loadUsers completed');
    }
  }, [
    debugLog,
    deferredSearchTerm,
    filters.isActive,
    filters.role,
    pagination.limit,
    pagination.skip,
    roleMap,
    setUsers,
    toast,
  ]); // ?? FIX: Memoize to prevent infinite loops

  const loadRoles = useCallback(async () => {
    try {
      debugLog('Loading roles from backend...');
      const fetchedRoles = await rbacService.listRoles();

      const normalizedRoles = fetchedRoles.map((role, index) => ({
        id:
          typeof role.role_id === 'string'
            ? Number.parseInt(role.role_id, 10) || index + 1
            : index + 1,
        name: role.role_name,
        description: role.description,
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
  }, [debugLog]); // Only depends on debugLog which is stable

  // Prefetch likely next routes for improved navigation performance
  useEffect(() => {
    prefetchRoute('/users/roles');
    prefetchRoute('/profile');
    prefetchRoute('/dashboard');
  }, []);

  useEffect(() => {
    if (hasPermission('user:read') || user?.is_superuser) {
      debugLog('UserManagementEnhanced mounted', {
        userEmail: user?.email,
        hasAdminPermission: hasPermission('admin'),
      });
      loadRoles();
    }
  }, [debugLog, loadRoles, hasPermission, user]); // ?? FIX: Only depend on memoized loadRoles

  useEffect(() => {
    if (hasPermission('user:read') || user?.is_superuser) {
      loadUsers();
    }
  }, [loadUsers, hasPermission, user]); // ?? FIX: Only depend on memoized loadUsers

  useEffect(() => {
    setPagination((prev) => {
      if (prev.skip === 0) {
        return prev;
      }

      return { ...prev, skip: 0 };
    });
  }, [filters.isActive, filters.role, filters.searchTerm]); //  React 19: Consolidated state dependencies

  const handleUserAction = async (action: string, userId: string, data?: UpdateUserData) => {
    try {
      setActionLoading(`${action}-${userId}`);

      switch (action) {
        case 'activate':
          //  React 19: Optimistic status toggle - instant UI update
          await toggleUserStatusOptimistic(userId, false);
          break;
        case 'deactivate':
          //  React 19: Optimistic status toggle - instant UI update
          await toggleUserStatusOptimistic(userId, true);
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this user?')) {
            //  React 19: Optimistic delete - instant UI update
            await deleteUserOptimistic(userId);
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

            //  React 19: Optimistic update - instant UI update
            await updateUserOptimistic(userId, payload);
          }
          break;
        default:
          if (import.meta.env.DEV) {
            logger.warn('Unknown action:', { action });
          }
      }

      // Show success toast
      const actionLabel =
        action === 'activate'
          ? 'activated'
          : action === 'deactivate'
            ? 'deactivated'
            : action === 'delete'
              ? 'deleted'
              : action;
      toast.success(`User ${actionLabel} successfully`);

      //  No need to call loadUsers() - optimistic updates already handled it!
    } catch (error) {
      logger.error(
        `Action ${action} failed:`,
        error instanceof Error ? error : new Error(String(error))
      );
      const errorMsg = `Failed to ${action} user`;
      setError(errorMsg);
      toast.error(errorMsg, {
        action: {
          label: 'Retry',
          onClick: () => handleUserAction(action, userId),
        },
      });
      //  UI automatically rolls back on error
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      setActionLoading('create-user');
      //  React 19: Optimistic create - instant UI update
      await createUserOptimistic(buildCreateUserRequest(userData));
      setUIState((prev) => ({ ...prev, showCreateModal: false })); //  Consolidated state
      toast.success('User created successfully!');
      //  No need to call loadUsers() - optimistic updates already handled it!
    } catch (error) {
      logger.error('Create user failed:', undefined, { error });
      const errorMsg = 'Failed to create user';
      setError(errorMsg);
      toast.error(errorMsg, {
        action: {
          label: 'Try Again',
          onClick: () => setUIState((prev) => ({ ...prev, showCreateModal: true })),
        },
      });
      //  UI automatically rolls back on error
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (uiState.selectedUsers.size === 0) return; //  Consolidated state

    const count = uiState.selectedUsers.size;
    if (window.confirm(`Are you sure you want to delete ${count} users?`)) {
      try {
        setActionLoading('bulk-delete');

        //  React 19: Optimistic bulk delete - instant UI update
        await bulkDeleteOptimistic(Array.from(uiState.selectedUsers)); //  Consolidated state

        setUIState((prev) => ({ ...prev, selectedUsers: new Set<string>() })); //  Consolidated state
        toast.success(`Successfully deleted ${count} user${count > 1 ? 's' : ''}`);
        //  No need to call loadUsers() - optimistic updates already handled it!
      } catch (error) {
        logger.error('Bulk delete failed:', undefined, { error });
        const errorMsg = 'Failed to delete some users';
        setError(errorMsg);
        toast.error(errorMsg);
        //  UI automatically rolls back on error
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleSelectUser = (userId: string, selected: boolean) => {
    setUIState((prev) => {
      const newSet = new Set(prev.selectedUsers);
      if (selected) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return { ...prev, selectedUsers: newSet }; //  Return full state object
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setUIState((prev) => ({
        ...prev,
        selectedUsers: new Set<string>(users.map((user) => user.id)),
      }));
    } else {
      setUIState((prev) => ({ ...prev, selectedUsers: new Set<string>() }));
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
      <div className="rounded-xl border border-[color:var(--color-error)] bg-[color:var(--color-error-50)] p-12 text-center">
        <h3 className="mb-4 text-[color:var(--color-error)]"> Access Denied</h3>
        <p className="text-[color:var(--color-error-700)]">
          You don&apos;t have permission to manage users.
        </p>
        <p className="mt-4 text-sm text-[color:var(--color-error-700)]">
          Required: user:read permission
        </p>
      </div>
    );
  }

  return (
    <>
      {/* React 19: Declarative metadata */}
      <PageMetadata
        title="Users"
        description="Manage your users efficiently with advanced filtering and search capabilities"
        keywords="users, user management, user list, user administration, RBAC"
      />

      <div className="page-wrapper">
        <div className="container-full">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-2 flex items-center gap-2 text-[color:var(--color-text-primary)]">
                <Users className="icon-lg" aria-hidden="true" />
                User Management
              </h1>
              <p className="m-0 text-[color:var(--color-text-secondary)]" role="status">
                Manage user accounts, roles, and permissions ({users.length} total users)
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/*  React 19: Enhanced bulk actions with ARIA live regions */}
              {uiState.selectedUsers.size > 0 && (
                <div
                  className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-[var(--color-primary)]"
                  role="status"
                  aria-live="polite"
                >
                  <span aria-label={`${uiState.selectedUsers.size} users selected`}>
                    {uiState.selectedUsers.size} selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    disabled={actionLoading === 'bulk-delete'}
                    className="flex cursor-pointer items-center gap-1 max-md:gap-2 rounded border-none bg-[color:var(--color-error-50)]0 px-3 py-2 max-md:px-4 max-md:py-3 text-xs max-md:text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-error)] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-error)] focus:ring-offset-2 transition-all min-h-[32px] max-md:min-h-[44px]"
                    aria-label={`Delete ${uiState.selectedUsers.size} selected users`}
                    aria-busy={actionLoading === 'bulk-delete'}
                  >
                    <Trash2 className="icon-responsive-xs" aria-hidden="true" />
                    <span>{actionLoading === 'bulk-delete' ? 'Deleting...' : 'Delete'}</span>
                  </button>
                  <button
                    onClick={() =>
                      setUIState((prev) => ({ ...prev, selectedUsers: new Set<string>() }))
                    }
                    className="cursor-pointer rounded border-none bg-[color:var(--color-background-tertiary)] px-3 py-2 max-md:px-4 max-md:py-3 text-xs max-md:text-sm text-[var(--color-text-primary)] hover:bg-[color:var(--color-background-elevated)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-background-tertiary)] focus:ring-offset-2 transition-all min-h-[32px] max-md:min-h-[44px]"
                    aria-label="Clear selection"
                  >
                    Clear
                  </button>
                </div>
              )}

              {hasPermission('user:write') && (
                <button
                  onClick={() => setUIState((prev) => ({ ...prev, showCreateModal: true }))}
                  className="flex items-center gap-2 rounded-lg border-none bg-[color:var(--color-primary)] px-6 py-3 font-medium text-[var(--color-text-primary)] hover:bg-[color:var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] focus:ring-offset-2 transition-all"
                  aria-label="Create new user"
                >
                  <Plus className="icon-sm" aria-hidden="true" />
                  Create New User
                </button>
              )}
            </div>
          </div>

          {/*  React 19: Accessible filters with semantic HTML */}
          <div
            className="mb-8 rounded-xl border border-[color:var(--color-border-primary)] bg-[color:var(--color-background-secondary)] p-6"
            role="search"
          >
            <h2 className="sr-only">Filter users</h2>
            <div className="grid items-end gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label
                  htmlFor="search-users"
                  className="flex flex-col gap-2 font-medium text-[color:var(--color-text-primary)]"
                >
                  <span>
                    <Search className="mr-2 inline icon-sm" aria-hidden="true" />
                    Search Users
                    {/*  Show pending indicator when search is deferred */}
                    {filters.searchTerm !== deferredSearchTerm && (
                      <span
                        className="ml-2 text-xs text-[color:var(--color-primary)]"
                        role="status"
                        aria-live="polite"
                      >
                        Searching...
                      </span>
                    )}
                  </span>
                  <input
                    id="search-users"
                    type="text"
                    placeholder="Search by email, username..."
                    value={filters.searchTerm}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
                    }
                    className="w-full rounded-md border border-[color:var(--color-border-primary)] bg-[var(--color-surface-primary)] px-3 py-2 text-[color:var(--color-text-primary)] focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:outline-none transition-all"
                    aria-label="Search users by email or username"
                    aria-describedby={
                      filters.searchTerm !== deferredSearchTerm ? 'search-status' : undefined
                    }
                  />
                </label>
              </div>

              <div>
                <label
                  htmlFor="filter-role"
                  className="flex flex-col gap-2 font-medium text-[color:var(--color-text-primary)]"
                >
                  <span>
                    <Filter className="mr-2 inline icon-sm" aria-hidden="true" />
                    Filter by Role
                    {/*  Show transition pending indicator */}
                    {isPending && (
                      <span
                        className="ml-2 text-xs text-[color:var(--color-primary)]"
                        role="status"
                        aria-live="polite"
                      >
                        Updating...
                      </span>
                    )}
                  </span>
                  <select
                    id="filter-role"
                    value={filters.role}
                    onChange={(e) => {
                      //  React 19: Mark filter change as non-urgent
                      startTransition(() => {
                        setFilters((prev) => ({ ...prev, role: e.target.value }));
                      });
                    }}
                    className="w-full rounded-md border border-[color:var(--color-border-primary)] bg-[var(--color-surface-primary)] px-3 py-2 text-[color:var(--color-text-primary)] focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:outline-none transition-all"
                    aria-label="Filter users by role"
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
                <label
                  htmlFor="filter-status"
                  className="flex flex-col gap-2 font-medium text-[color:var(--color-text-primary)]"
                >
                  <span>Status</span>
                  <select
                    id="filter-status"
                    value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilters((prev) => ({
                        ...prev,
                        isActive: value === '' ? undefined : value === 'true',
                      }));
                    }}
                    className="w-full rounded-md border border-[color:var(--color-border-primary)] bg-[var(--color-surface-primary)] px-3 py-2 text-[color:var(--color-text-primary)] focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:outline-none transition-all"
                    aria-label="Filter users by status"
                  >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </label>
              </div>

              <button
                onClick={() => {
                  setFilters({ searchTerm: '', role: '', isActive: undefined });
                }}
                className="cursor-pointer rounded-md border-none bg-[color:var(--color-background-tertiary)] px-4 py-3 font-medium text-[var(--color-text-primary)] hover:bg-[color:var(--color-background-elevated)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-background-tertiary)] focus:ring-offset-2 transition-all"
                aria-label="Clear all filters"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-[color:var(--color-error)] bg-[color:var(--color-error-50)] p-4 text-[color:var(--color-error)]">
              {error}
            </div>
          )}

          {/* Users Table */}
          <div className="overflow-hidden rounded-xl border border-[color:var(--color-border-primary)] bg-[var(--color-surface-primary)]">
            {isLoading ? (
              <div className="p-4">
                <SkeletonTable rows={8} columns={5} showHeader />
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-[color:var(--color-text-tertiary)]" />
                <h3 className="mb-2 text-[color:var(--color-text-primary)]">No users found</h3>
                <p className="text-[color:var(--color-text-secondary)]">
                  {filters.searchTerm || filters.role || filters.isActive !== undefined
                    ? 'Try adjusting your filters'
                    : 'Get started by creating your first user'}
                </p>
              </div>
            ) : (
              <>
                {/*  Virtual Scrolling: Fixed Header */}
                <div
                  className="border-b-2 border-[color:var(--color-border-primary)] bg-[color:var(--color-background-secondary)]"
                  role="rowgroup"
                >
                  <table className="w-full border-collapse" role="presentation">
                    <thead>
                      <tr role="row">
                        <th
                          className="p-4 text-left font-semibold text-[color:var(--color-text-primary)]"
                          scope="col"
                        >
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                uiState.selectedUsers.size === users.length && users.length > 0
                              }
                              onChange={(e) => handleSelectAll(e.target.checked)}
                              className="form-checkbox-lg rounded border-[color:var(--color-border-primary)] text-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)] focus:ring-offset-2 flex-shrink-0"
                              aria-label="Select all users"
                            />
                            <span>User</span>
                          </label>
                        </th>
                        <th
                          className="p-4 text-left font-semibold text-[color:var(--color-text-primary)]"
                          scope="col"
                        >
                          Role
                        </th>
                        <th
                          className="p-4 text-left font-semibold text-[color:var(--color-text-primary)]"
                          scope="col"
                        >
                          Status
                        </th>
                        <th
                          className="p-4 text-left font-semibold text-[color:var(--color-text-primary)]"
                          scope="col"
                        >
                          Created
                        </th>
                        <th
                          className="p-4 text-left font-semibold text-[color:var(--color-text-primary)]"
                          scope="col"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>

                {/*  Virtual Scrolling: Scrollable Body */}
                <div
                  ref={containerRef}
                  className="virtual-container overflow-x-auto"
                  style={
                    {
                      '--container-height': `${CONTAINER_HEIGHT}px`,
                    } as React.CSSProperties
                  }
                  role="region"
                  aria-label="User list"
                >
                  <div
                    className="virtual-spacer"
                    style={{ '--total-height': `${totalHeight}px` } as React.CSSProperties}
                  >
                    {virtualItems.map(({ index, data: user, offsetTop }) => (
                      <div
                        key={user.id}
                        className="virtual-row"
                        style={
                          {
                            '--row-height': `${ITEM_HEIGHT}px`,
                            '--row-offset': `${offsetTop}px`,
                          } as React.CSSProperties
                        }
                      >
                        <table className="w-full border-collapse" role="presentation">
                          <tbody>
                            <tr
                              className={`border-b border-[color:var(--color-border-primary)] ${index % 2 === 0 ? 'bg-[var(--color-surface-primary)]' : 'bg-[color:var(--color-background-secondary)]'} ${
                                isOptimistic(user) ? 'opacity-60 transition-opacity' : ''
                              }`}
                              role="row"
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <label className="flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={uiState.selectedUsers.has(user.id)}
                                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                                      disabled={isOptimistic(user)}
                                      className="form-checkbox-lg rounded border-[color:var(--color-border-primary)] text-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)] focus:ring-offset-2 flex-shrink-0"
                                      aria-label={`Select ${user.full_name || user.email}`}
                                    />
                                  </label>
                                  <div>
                                    <div className="font-medium text-[color:var(--color-text-primary)] flex items-center gap-2">
                                      {user.full_name || user.username || user.email}
                                      {/*  React 19: Visual indicator for optimistic updates */}
                                      {isOptimistic(user) && (
                                        <span className="text-xs text-[var(--color-warning)] font-normal animate-bounce-subtle">
                                          Saving...
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm text-[color:var(--color-text-secondary)]">
                                      {user.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <span
                                  className={`badge ${
                                    user.roles?.includes('admin')
                                      ? 'badge-admin animate-bounce-subtle'
                                      : 'badge-role'
                                  }`}
                                >
                                  {user.roles?.[0] || 'user'}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  {user.is_active ? (
                                    <UserCheck className="icon-sm icon-success" />
                                  ) : (
                                    <UserX className="icon-sm icon-error" />
                                  )}
                                  <span
                                    className={`font-medium ${
                                      user.is_active
                                        ? 'text-[color:var(--color-success)]'
                                        : 'text-[color:var(--color-error)]'
                                    }`}
                                  >
                                    {user.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 text-[color:var(--color-text-secondary)]">
                                {formatDate(user.created_at)}
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2" role="group" aria-label="User actions">
                                  {/*  React 19: Enhanced accessibility with ARIA labels */}
                                  <button
                                    onClick={() => {
                                      setUIState((prev) => ({
                                        ...prev,
                                        selectedUser: user,
                                        showUserModal: true,
                                      }));
                                    }}
                                    className="flex cursor-pointer items-center gap-1 rounded border-none bg-[color:var(--color-primary)] p-2 text-[var(--color-text-primary)] hover:bg-[color:var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] focus:ring-offset-2 transition-all"
                                    title="View/Edit User"
                                    aria-label={`View or edit ${user.full_name || user.email}`}
                                  >
                                    <Eye className="h-3 w-3" aria-hidden="true" />
                                    <span className="sr-only">View/Edit</span>
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
                                        className={`flex cursor-pointer items-center gap-1 rounded border-none p-2 text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                                          user.is_active
                                            ? 'bg-[var(--color-warning)] hover:bg-[var(--color-warning)] focus:ring-[var(--color-warning)]'
                                            : 'bg-[var(--color-success)] hover:bg-[var(--color-success)] focus:ring-[var(--color-success)]'
                                        }`}
                                        title={user.is_active ? 'Deactivate User' : 'Activate User'}
                                        aria-label={`${user.is_active ? 'Deactivate' : 'Activate'} ${user.full_name || user.email}`}
                                        aria-busy={actionLoading?.includes(user.id)}
                                      >
                                        {user.is_active ? (
                                          <UserX className="h-3 w-3" aria-hidden="true" />
                                        ) : (
                                          <UserCheck className="h-3 w-3" aria-hidden="true" />
                                        )}
                                        <span className="sr-only">
                                          {user.is_active ? 'Deactivate' : 'Activate'}
                                        </span>
                                      </button>

                                      <button
                                        onClick={() => handleUserAction('delete', user.id)}
                                        disabled={actionLoading?.includes(user.id)}
                                        className="flex cursor-pointer items-center gap-1 rounded border-none bg-[color:var(--color-error-50)]0 p-2 text-[var(--color-text-primary)] hover:bg-[var(--color-error)] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-error)] focus:ring-offset-2 transition-all"
                                        title="Delete User"
                                        aria-label={`Delete ${user.full_name || user.email}`}
                                        aria-busy={actionLoading?.includes(user.id)}
                                      >
                                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                                        <span className="sr-only">Delete</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>

                {/*  Virtual Scrolling: Footer with Scroll to Top */}
                <div
                  className="flex items-center justify-between border-t border-[color:var(--color-border-primary)] bg-[color:var(--color-background-secondary)] px-8 py-4"
                  role="navigation"
                  aria-label="Table navigation"
                >
                  <div
                    className="text-[color:var(--color-text-secondary)]"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    Showing {virtualItems.length} of {users.length} users
                    {users.length > virtualItems.length && ' (virtual scrolling active)'}
                  </div>
                  <div className="flex gap-2" role="group" aria-label="Scroll controls">
                    <button
                      onClick={() => scrollToIndex(0)}
                      className="cursor-pointer rounded-md border-none bg-[color:var(--color-primary)] px-4 py-2 font-medium text-[var(--color-text-primary)] hover:bg-[color:var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] focus:ring-offset-2 transition-all"
                      title="Scroll to top"
                      aria-label="Scroll to top of user list"
                    >
                      Top
                    </button>
                    <button
                      onClick={() => scrollToIndex(users.length - 1)}
                      className="cursor-pointer rounded-md border-none bg-[color:var(--color-primary)] px-4 py-2 font-medium text-[var(--color-text-primary)] hover:bg-[color:var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] focus:ring-offset-2 transition-all"
                      title="Scroll to bottom"
                      aria-label="Scroll to bottom of user list"
                    >
                      Bottom
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Create User Modal */}
          {uiState.showCreateModal && (
            <CreateUserModal
              roles={roles}
              onSave={handleCreateUser}
              onClose={() => setUIState((prev) => ({ ...prev, showCreateModal: false }))}
              isLoading={actionLoading === 'create-user'}
            />
          )}

          {/* Edit User Modal */}
          {uiState.showUserModal && uiState.selectedUser && (
            <EditUserModal
              user={uiState.selectedUser}
              roles={roles}
              onSave={(data) => {
                handleUserAction('update', uiState.selectedUser!.id, data);
                setUIState((prev) => ({ ...prev, showUserModal: false }));
              }}
              onClose={() => setUIState((prev) => ({ ...prev, showUserModal: false }))}
              isLoading={actionLoading?.includes(uiState.selectedUser.id) || false}
            />
          )}
        </div>
      </div>
    </>
  );
};

// Server action for creating user
interface CreateUserState {
  success: boolean;
  error: string | null;
  data?: UserSummary;
}

async function createUserAction(
  _prevState: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;
  const fullName = formData.get('full_name') as string;
  const role = formData.get('role') as string;
  const isActive = formData.get('is_active') === 'true';

  // Basic validation
  if (!email || !password) {
    return { success: false, error: 'Email and password are required', data: undefined };
  }

  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters', data: undefined };
  }

  // Build request
  const trimmedName = fullName?.trim();
  const nameSegments = trimmedName ? trimmedName.split(' ') : [];
  const firstName = nameSegments[0] ?? email.split('@')[0] ?? 'First';
  const lastName = nameSegments.length > 1 ? nameSegments.slice(1).join(' ') : 'User';
  const trimmedUsername = username?.trim();
  const trimmedRole = role?.trim();

  const request: CreateUserRequest = {
    email,
    password,
    first_name: firstName || 'First',
    last_name: lastName || 'User',
    role: trimmedRole && trimmedRole.length > 0 ? trimmedRole : undefined,
    is_active: isActive ?? true,
    username: trimmedUsername && trimmedUsername.length > 0 ? trimmedUsername : undefined,
  };

  try {
    const user = await adminService.createUser(request);
    return { success: true, error: null, data: user };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
    logger.error('Create user failed:', undefined, { error });
    return { success: false, error: errorMessage, data: undefined };
  }
}

const CreateUserModal: FC<{
  roles: Role[];
  onSave: (data: CreateUserData) => void;
  onClose: () => void;
  isLoading: boolean;
}> = ({ roles, onSave, onClose }) => {
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    username: '',
    full_name: '',
    role: 'user',
    is_active: true,
  });

  // Use React 19's useActionState for form handling
  const [state, submitAction, isPending] = useActionState(createUserAction, {
    success: false,
    error: null,
    data: undefined,
  });

  // Handle successful user creation
  useEffect(() => {
    if (state.success && state.data) {
      // Call the parent's onSave to refresh the user list
      onSave(formData);
      onClose();
    }
  }, [state.success, state.data, formData, onSave, onClose]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create FormData from the form
    const form = e.currentTarget;
    const formDataObj = new FormData(form);

    // Add is_active to FormData
    formDataObj.set('is_active', formData.is_active ? 'true' : 'false');

    // React 19: Wrap action in startTransition to avoid warnings
    startTransition(() => {
      submitAction(formDataObj);
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-[1000] flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-[90%] max-w-[500px] overflow-y-auto rounded-xl bg-[var(--color-surface-primary)] p-8">
        <h2 className="mb-6 text-[color:var(--color-text-primary)]">Create New User</h2>

        {/* Error Alert */}
        {state.error && (
          <div className="mb-4 rounded-lg border border-[color:var(--color-error)] bg-[color:var(--color-error-50)] p-4 text-[var(--color-error)]">
            {state.error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="flex flex-col gap-2 font-medium text-[color:var(--color-text-primary)]">
              <span>Email *</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-md border border-[color:var(--color-border-primary)] bg-[var(--color-surface-primary)] px-3 py-2 text-[color:var(--color-text-primary)] focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
                required
              />
            </label>
          </div>

          <div className="mb-4">
            <label className="flex flex-col gap-2 font-medium text-[color:var(--color-text-primary)]">
              <span>Password *</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full rounded-md border border-[color:var(--color-border-primary)] bg-[var(--color-surface-primary)] px-3 py-2 text-[color:var(--color-text-primary)] focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
                required
                minLength={8}
              />
            </label>
          </div>

          <div className="mb-4">
            <label className="flex flex-col gap-2 font-medium text-[color:var(--color-text-primary)]">
              <span>Username</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                className="w-full rounded-md border border-[color:var(--color-border-primary)] bg-[var(--color-surface-primary)] px-3 py-2 text-[color:var(--color-text-primary)] focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
              />
            </label>
          </div>

          <div className="mb-4">
            <label className="flex flex-col gap-2 font-medium text-[color:var(--color-text-primary)]">
              <span>Full Name</span>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                className="w-full rounded-md border border-[color:var(--color-border-primary)] bg-[var(--color-surface-primary)] px-3 py-2 text-[color:var(--color-text-primary)] focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
              />
            </label>
          </div>

          <div className="mb-4">
            <label className="flex flex-col gap-2 font-medium text-[color:var(--color-text-primary)]">
              <span>Role</span>
              <select
                name="role"
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                className="w-full rounded-md border border-[color:var(--color-border-primary)] bg-[var(--color-surface-primary)] px-3 py-2 text-[color:var(--color-text-primary)] focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
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
            <label className="flex cursor-pointer items-center gap-3 text-[color:var(--color-text-primary)]">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                className="form-checkbox rounded border-[color:var(--color-border-primary)] text-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)] flex-shrink-0"
              />
              <span>Active User</span>
            </label>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="cursor-pointer rounded-md border border-[color:var(--color-border-primary)] bg-[var(--color-surface-primary)] px-6 py-3 text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-background-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="cursor-pointer rounded-md border-none bg-[color:var(--color-primary)] px-6 py-3 text-[var(--color-text-primary)] hover:bg-[color:var(--color-primary-600)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? 'Creating...' : 'Create User'}
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
    role: user.roles?.[0] || user.role_name || 'user',
    is_active: user.is_active,
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-[1000] flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-[90%] max-w-[500px] overflow-y-auto rounded-xl bg-[var(--color-surface-primary)] p-8">
        <h2 className="mb-6 text-[color:var(--color-text-primary)]">Edit User</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="flex flex-col gap-2 font-medium text-[color:var(--color-text-primary)]">
              <span>Email</span>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-md border border-[color:var(--color-border-primary)] bg-[var(--color-surface-primary)] px-3 py-2 text-[color:var(--color-text-primary)] focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
              />
            </label>
          </div>

          <div className="mb-4">
            <label className="flex flex-col gap-2 font-medium text-[color:var(--color-text-primary)]">
              <span>Username</span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                className="w-full rounded-md border border-[color:var(--color-border-primary)] bg-[var(--color-surface-primary)] px-3 py-2 text-[color:var(--color-text-primary)] focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
              />
            </label>
          </div>

          <div className="mb-4">
            <label className="flex flex-col gap-2 font-medium text-[color:var(--color-text-primary)]">
              <span>Full Name</span>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                className="w-full rounded-md border border-[color:var(--color-border-primary)] bg-[var(--color-surface-primary)] px-3 py-2 text-[color:var(--color-text-primary)] focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
              />
            </label>
          </div>

          <div className="mb-4">
            <label className="flex flex-col gap-2 font-medium text-[color:var(--color-text-primary)]">
              <span>Role</span>
              <select
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                className="w-full rounded-md border border-[color:var(--color-border-primary)] bg-[var(--color-surface-primary)] px-3 py-2 text-[color:var(--color-text-primary)] focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
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
            <label className="flex cursor-pointer items-center gap-3 text-[color:var(--color-text-primary)]">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                className="form-checkbox rounded border-[color:var(--color-border-primary)] text-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)] flex-shrink-0"
              />
              <span>Active User</span>
            </label>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="cursor-pointer rounded-md border border-[color:var(--color-border-primary)] bg-[var(--color-surface-primary)] px-6 py-3 text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-background-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer rounded-md border-none bg-[color:var(--color-primary)] px-6 py-3 text-[var(--color-text-primary)] hover:bg-[color:var(--color-primary-600)] disabled:cursor-not-allowed disabled:opacity-50"
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
