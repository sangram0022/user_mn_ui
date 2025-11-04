import { useState } from 'react';
import {
  useRoleList,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from '../hooks';
import type { UpdateRoleRequest } from '../types';
import Button from '../../../shared/components/ui/Button';
import Badge from '../../../shared/components/ui/Badge';

const SYSTEM_ROLES = ['admin', 'user'];

// Available permissions grouped by resource
const PERMISSIONS_BY_RESOURCE = {
  users: ['create', 'read', 'update', 'delete', 'approve'],
  roles: ['create', 'read', 'update', 'delete'],
  analytics: ['read', 'export'],
  audit_logs: ['read', 'export'],
  settings: ['read', 'update', 'configure'],
  reports: ['create', 'read', 'export'],
  notifications: ['create', 'read', 'update', 'delete'],
};

export default function RolesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<{ min?: number; max?: number }>({});
  const [sortField, setSortField] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Form state (using string[] for permissions instead of RolePermission[] for simplicity)
  const [formData, setFormData] = useState({
    role_name: '',
    display_name: '',
    description: '',
    level: 50,
    permissions: [] as string[], // Store as "resource:action" strings
  });

  const { data: rolesData, isLoading, isError, error } = useRoleList({
    include_permissions: true,
    include_users_count: true,
  });

  // Client-side filtering and pagination
  let filteredRoles = rolesData?.roles || [];
  
  // Apply search filter
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filteredRoles = filteredRoles.filter(
      (role) =>
        role.role_name.toLowerCase().includes(searchLower) ||
        role.display_name.toLowerCase().includes(searchLower)
    );
  }

  // Apply level filter
  if (levelFilter.min !== undefined) {
    filteredRoles = filteredRoles.filter((role) => role.level >= levelFilter.min!);
  }
  if (levelFilter.max !== undefined) {
    filteredRoles = filteredRoles.filter((role) => role.level <= levelFilter.max!);
  }

  // Apply sorting
  filteredRoles = [...filteredRoles].sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';
    
    if (sortField === 'name') {
      aVal = a.role_name;
      bVal = b.role_name;
    } else if (sortField === 'level') {
      aVal = a.level;
      bVal = b.level;
    }
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  // Apply pagination
  const totalItems = filteredRoles.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const roles = filteredRoles.slice(startIndex, endIndex);

  const pagination = {
    page: currentPage,
    page_size: pageSize,
    total_items: totalItems,
    total_pages: totalPages,
    has_prev: currentPage > 1,
    has_next: currentPage < totalPages,
  };

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateRole = async () => {
    if (!formData.role_name || !formData.display_name) {
      alert('Role name and display name are required');
      return;
    }

    if (formData.role_name.length < 2 || formData.role_name.length > 50) {
      alert('Role name must be between 2 and 50 characters');
      return;
    }

    // Convert string permissions to RolePermission format
    const permissionsMap = new Map<string, Set<string>>();
    formData.permissions.forEach((perm) => {
      const [resource, action] = perm.split(':');
      if (!permissionsMap.has(resource)) {
        permissionsMap.set(resource, new Set());
      }
      permissionsMap.get(resource)?.add(action);
    });

    const permissions = Array.from(permissionsMap.entries()).map(([resource, actions]) => ({
      resource,
      actions: Array.from(actions),
    }));

    try {
      await createRole.mutateAsync({
        role_name: formData.role_name,
        display_name: formData.display_name,
        description: formData.description || undefined,
        level: formData.level,
        permissions,
      });
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create role:', err);
    }
  };

  const handleEditRole = async () => {
    if (!selectedRole) return;

    // Convert string permissions to RolePermission format
    const permissionsMap = new Map<string, Set<string>>();
    formData.permissions.forEach((perm) => {
      const [resource, action] = perm.split(':');
      if (!permissionsMap.has(resource)) {
        permissionsMap.set(resource, new Set());
      }
      permissionsMap.get(resource)?.add(action);
    });

    const permissions = Array.from(permissionsMap.entries()).map(([resource, actions]) => ({
      resource,
      actions: Array.from(actions),
    }));

    const updateData: UpdateRoleRequest = {
      display_name: formData.display_name,
      description: formData.description,
      level: formData.level,
      permissions,
    };

    try {
      await updateRole.mutateAsync({
        roleName: selectedRole,
        data: updateData,
      });
      setShowEditModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      await deleteRole.mutateAsync({ roleName: selectedRole });
      setShowDeleteModal(false);
      setSelectedRole(null);
    } catch (err) {
      console.error('Failed to delete role:', err);
    }
  };

  const openEditModal = (roleName: string) => {
    const role = roles.find((r) => r.role_name === roleName);
    if (!role) return;

    // Convert RolePermission[] to string[]
    const permissionStrings: string[] = [];
    role.permissions.forEach((perm) => {
      perm.actions.forEach((action) => {
        permissionStrings.push(`${perm.resource}:${action}`);
      });
    });

    setSelectedRole(roleName);
    setFormData({
      role_name: role.role_name,
      display_name: role.display_name,
      description: role.description || '',
      level: role.level,
      permissions: permissionStrings,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (roleName: string) => {
    setSelectedRole(roleName);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      role_name: '',
      display_name: '',
      description: '',
      level: 50,
      permissions: [],
    });
    setSelectedRole(null);
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const isSystemRole = (roleName: string) => SYSTEM_ROLES.includes(roleName);

  const getRoleLevelBadge = (level: number) => {
    if (level >= 90) return { variant: 'danger' as const, text: 'Critical' };
    if (level >= 70) return { variant: 'warning' as const, text: 'High' };
    if (level >= 40) return { variant: 'info' as const, text: 'Medium' };
    return { variant: 'success' as const, text: 'Low' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading roles...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">⚠️ Error Loading Roles</div>
          <p className="text-gray-600">{error instanceof Error ? error.message : 'Failed to load roles'}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage roles and permissions ({pagination?.total_items || 0} roles)
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} variant="primary">
          + Create Role
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by role name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Level</label>
            <select
              value={levelFilter.min || ''}
              onChange={(e) =>
                setLevelFilter((prev) => ({
                  ...prev,
                  min: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All</option>
              {[1, 10, 25, 50, 75, 90].map((level) => (
                <option key={level} value={level}>
                  Level {level}+
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Level</label>
            <select
              value={levelFilter.max || ''}
              onChange={(e) =>
                setLevelFilter((prev) => ({
                  ...prev,
                  max: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All</option>
              {[10, 25, 50, 75, 90, 99].map((level) => (
                <option key={level} value={level}>
                  Level {level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  Role Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('level')}
                >
                  Level {sortField === 'level' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map((role) => {
                const levelBadge = getRoleLevelBadge(role.level);
                const isSystem = isSystemRole(role.role_name);

                return (
                  <tr key={role.role_name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{role.display_name}</span>
                        {isSystem && (
                          <Badge variant="info" size="sm">
                            System
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{role.role_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{role.level}</span>
                        <Badge variant={levelBadge.variant} size="sm">
                          {levelBadge.text}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {role.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{role.users_count || 0}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {role.permissions?.length || 0} permissions
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button onClick={() => openEditModal(role.role_name)} variant="outline" size="sm">
                        {isSystem ? 'View' : 'Edit'}
                      </Button>
                      {!isSystem && (
                        <Button
                          onClick={() => openDeleteModal(role.role_name)}
                          variant="danger"
                          size="sm"
                          disabled={typeof role.users_count === 'number' && role.users_count > 0}
                        >
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {roles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">🔐</div>
            <p className="text-gray-500 text-lg mb-2">No roles found</p>
            <p className="text-gray-400 text-sm">Create a new role to get started</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && roles.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, pagination.total_items)} of {pagination.total_items}{' '}
                results
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.has_prev}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.has_next}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Role</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name (Internal) *
                </label>
                <input
                  type="text"
                  value={formData.role_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, role_name: e.target.value.toLowerCase() }))
                  }
                  placeholder="e.g., content_moderator"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  2-50 characters, lowercase, alphanumeric and underscores only
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
                  placeholder="e.g., Content Moderator"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Brief description of this role..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Level (1-99)
                </label>
                <input
                  type="number"
                  value={formData.level}
                  onChange={(e) => setFormData((prev) => ({ ...prev, level: Number(e.target.value) }))}
                  min="1"
                  max="99"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Higher levels have more authority (1=lowest, 99=highest)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="border border-gray-200 rounded-md p-4 max-h-60 overflow-y-auto">
                  {Object.entries(PERMISSIONS_BY_RESOURCE).map(([resource, actions]) => (
                    <div key={resource} className="mb-4 last:mb-0">
                      <div className="font-medium text-sm text-gray-700 mb-2 capitalize">
                        {resource.replace('_', ' ')}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {actions.map((action) => {
                          const permission = `${resource}:${action}`;
                          return (
                            <label key={permission} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(permission)}
                                onChange={() => togglePermission(permission)}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-sm text-gray-700">{action}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateRole}
                  disabled={createRole.isPending}
                  variant="primary"
                  className="flex-1"
                >
                  {createRole.isPending ? 'Creating...' : 'Create Role'}
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isSystemRole(selectedRole || '') ? 'View Role' : 'Edit Role'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name (Internal)
                </label>
                <input
                  type="text"
                  value={formData.role_name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
                  disabled={isSystemRole(selectedRole || '')}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    isSystemRole(selectedRole || '') ? 'bg-gray-100 text-gray-500' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  disabled={isSystemRole(selectedRole || '')}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    isSystemRole(selectedRole || '') ? 'bg-gray-100 text-gray-500' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Level (1-99)
                </label>
                <input
                  type="number"
                  value={formData.level}
                  onChange={(e) => setFormData((prev) => ({ ...prev, level: Number(e.target.value) }))}
                  min="1"
                  max="99"
                  disabled={isSystemRole(selectedRole || '')}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    isSystemRole(selectedRole || '') ? 'bg-gray-100 text-gray-500' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="border border-gray-200 rounded-md p-4 max-h-60 overflow-y-auto">
                  {Object.entries(PERMISSIONS_BY_RESOURCE).map(([resource, actions]) => (
                    <div key={resource} className="mb-4 last:mb-0">
                      <div className="font-medium text-sm text-gray-700 mb-2 capitalize">
                        {resource.replace('_', ' ')}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {actions.map((action) => {
                          const permission = `${resource}:${action}`;
                          return (
                            <label key={permission} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(permission)}
                                onChange={() => togglePermission(permission)}
                                disabled={isSystemRole(selectedRole || '')}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                              />
                              <span className="text-sm text-gray-700">{action}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                {!isSystemRole(selectedRole || '') && (
                  <Button
                    onClick={handleEditRole}
                    disabled={updateRole.isPending}
                    variant="primary"
                    className="flex-1"
                  >
                    {updateRole.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  {isSystemRole(selectedRole || '') ? 'Close' : 'Cancel'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Role Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Role</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete the role <strong>{selectedRole}</strong>? This action cannot
              be undone.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleDeleteRole}
                disabled={deleteRole.isPending}
                variant="danger"
                className="flex-1"
              >
                {deleteRole.isPending ? 'Deleting...' : 'Delete Role'}
              </Button>
              <Button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedRole(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
