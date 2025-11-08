import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRole, useUpdateRole } from '../hooks';
import type { UpdateRoleRequest } from '../types';
import Button from '../../../shared/components/ui/Button';
import Badge from '../../../shared/components/ui/Badge';
import { logger } from '../../../core/logging';

const SYSTEM_ROLES = ['admin', 'user'];

// Define all available resources and actions
const RESOURCES = [
  'users',
  'roles',
  'analytics',
  'audit_logs',
  'settings',
  'reports',
  'notifications',
] as const;

const ACTIONS = ['create', 'read', 'update', 'delete', 'approve', 'export', 'configure'] as const;

// Define which actions are available for each resource
const RESOURCE_ACTIONS: Record<string, string[]> = {
  users: ['create', 'read', 'update', 'delete', 'approve'],
  roles: ['create', 'read', 'update', 'delete'],
  analytics: ['read', 'export'],
  audit_logs: ['read', 'export'],
  settings: ['read', 'update', 'configure'],
  reports: ['create', 'read', 'export'],
  notifications: ['create', 'read', 'update', 'delete'],
};

export default function RoleDetailPage() {
  const { roleName } = useParams<{ roleName: string }>();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    description: '',
    level: 1,
    permissions: new Map<string, Set<string>>(), // resource -> actions set
  });

  const { data: roleData, isLoading, isError, error } = useRole(roleName!, {
    include_users: true,
    users_limit: 100,
  });

  const updateRole = useUpdateRole();
  const role = roleData;

  // Initialize form data when role loads
  useEffect(() => {
    if (role) {
      const permissionsMap = new Map<string, Set<string>>();
      
      // Convert RolePermission[] to Map<resource, Set<actions>>
      role.permissions.forEach((perm) => {
        permissionsMap.set(perm.resource, new Set(perm.actions));
      });

      setFormData({
        display_name: role.display_name,
        description: role.description || '',
        level: role.level,
        permissions: permissionsMap,
      });
    }
  }, [role]);

  const isSystemRole = roleName ? SYSTEM_ROLES.includes(roleName) : false;

  const handleSave = async () => {
    if (!roleName) return;

    // Convert permissions map to API format
    const permissions = Array.from(formData.permissions.entries()).map(([resource, actions]) => ({
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
        roleName,
        data: updateData,
      });
      setIsEditing(false);
    } catch (err) {
      logger().error('Failed to update role', err instanceof Error ? err : new Error(String(err)), { roleName });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    
    // Reset to original data
    if (role) {
      const permissionsMap = new Map<string, Set<string>>();
      role.permissions.forEach((perm) => {
        permissionsMap.set(perm.resource, new Set(perm.actions));
      });

      setFormData({
        display_name: role.display_name,
        description: role.description || '',
        level: role.level,
        permissions: permissionsMap,
      });
    }
  };

  const togglePermission = (resource: string, action: string) => {
    if (isSystemRole || !isEditing) return;

    setFormData((prev) => {
      const newPermissions = new Map(prev.permissions);
      const actions = newPermissions.get(resource) || new Set<string>();
      
      if (actions.has(action)) {
        actions.delete(action);
        if (actions.size === 0) {
          newPermissions.delete(resource);
        } else {
          newPermissions.set(resource, actions);
        }
      } else {
        actions.add(action);
        newPermissions.set(resource, actions);
      }

      return { ...prev, permissions: newPermissions };
    });
  };

  const selectAllForResource = (resource: string) => {
    if (isSystemRole || !isEditing) return;

    setFormData((prev) => {
      const newPermissions = new Map(prev.permissions);
      const availableActions = RESOURCE_ACTIONS[resource] || [];
      newPermissions.set(resource, new Set(availableActions));
      return { ...prev, permissions: newPermissions };
    });
  };

  const deselectAllForResource = (resource: string) => {
    if (isSystemRole || !isEditing) return;

    setFormData((prev) => {
      const newPermissions = new Map(prev.permissions);
      newPermissions.delete(resource);
      return { ...prev, permissions: newPermissions };
    });
  };

  const selectAllForAction = (action: string) => {
    if (isSystemRole || !isEditing) return;

    setFormData((prev) => {
      const newPermissions = new Map(prev.permissions);
      
      RESOURCES.forEach((resource) => {
        const availableActions = RESOURCE_ACTIONS[resource] || [];
        if (availableActions.includes(action)) {
          const actions = newPermissions.get(resource) || new Set<string>();
          actions.add(action);
          newPermissions.set(resource, actions);
        }
      });

      return { ...prev, permissions: newPermissions };
    });
  };

  const deselectAllForAction = (action: string) => {
    if (isSystemRole || !isEditing) return;

    setFormData((prev) => {
      const newPermissions = new Map(prev.permissions);
      
      newPermissions.forEach((actions, resource) => {
        actions.delete(action);
        if (actions.size === 0) {
          newPermissions.delete(resource);
        }
      });

      return { ...prev, permissions: newPermissions };
    });
  };

  const hasPermission = (resource: string, action: string): boolean => {
    return formData.permissions.get(resource)?.has(action) || false;
  };

  const isResourceFullySelected = (resource: string): boolean => {
    const availableActions = RESOURCE_ACTIONS[resource] || [];
    const selectedActions = formData.permissions.get(resource);
    return availableActions.length > 0 && selectedActions?.size === availableActions.length;
  };

  const isActionFullySelected = (action: string): boolean => {
    let hasAll = true;
    RESOURCES.forEach((resource) => {
      const availableActions = RESOURCE_ACTIONS[resource] || [];
      if (availableActions.includes(action)) {
        if (!hasPermission(resource, action)) {
          hasAll = false;
        }
      }
    });
    return hasAll;
  };

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
          <p className="mt-4 text-gray-600">Loading role details...</p>
        </div>
      </div>
    );
  }

  if (isError || !role) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">⚠️ Error Loading Role</div>
          <p className="text-gray-600">{error instanceof Error ? error.message : 'Role not found'}</p>
          <Button onClick={() => navigate('/admin/roles')} className="mt-4">
            Back to Roles
          </Button>
        </div>
      </div>
    );
  }

  const levelBadge = getRoleLevelBadge(role.level);
  const totalPermissions = Array.from(formData.permissions.values()).reduce(
    (sum, actions) => sum + actions.size,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Button onClick={() => navigate('/admin/roles')} variant="ghost" size="sm">
              ← Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{role.display_name}</h1>
            {isSystemRole && (
              <Badge variant="info" size="sm">
                System Role
              </Badge>
            )}
            <Badge variant={levelBadge.variant} size="sm">
              Level {role.level} - {levelBadge.text}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Internal Name: <code className="bg-gray-100 px-2 py-1 rounded">{role.role_name}</code>
          </p>
        </div>

        {!isSystemRole && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={updateRole.isPending}
                  variant="primary"
                >
                  {updateRole.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="primary">
                Edit Role
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Role Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
              disabled={isSystemRole || !isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                isSystemRole || !isEditing ? 'bg-gray-100 text-gray-500' : ''
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              disabled={isSystemRole || !isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                isSystemRole || !isEditing ? 'bg-gray-100 text-gray-500' : ''
              }`}
              placeholder="Brief description of this role..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Level (1-99)</label>
            <input
              type="number"
              value={formData.level}
              onChange={(e) => setFormData((prev) => ({ ...prev, level: Number(e.target.value) }))}
              min="1"
              max="99"
              disabled={isSystemRole || !isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                isSystemRole || !isEditing ? 'bg-gray-100 text-gray-500' : ''
              }`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Higher levels have more authority (1=lowest, 99=highest)
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Assigned Users</h3>
            <p className="text-3xl font-bold text-gray-900">{role.users_count || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Permissions</h3>
            <p className="text-3xl font-bold text-gray-900">{totalPermissions}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
            <Badge variant={role.status === 'active' ? 'success' : 'warning'}>
              {role.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Permission Matrix</h2>
          {!isSystemRole && isEditing && (
            <p className="text-sm text-gray-600">
              Click row/column headers to select all, or individual cells to toggle
            </p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Resource</th>
                {ACTIONS.map((action) => {
                  const isFullySelected = isActionFullySelected(action);
                  return (
                    <th
                      key={action}
                      className={`px-4 py-3 text-center text-sm font-semibold text-gray-700 ${
                        isEditing && !isSystemRole ? 'cursor-pointer hover:bg-gray-50' : ''
                      }`}
                      onClick={() => {
                        if (isEditing && !isSystemRole) {
                          if (isFullySelected) {
                            deselectAllForAction(action);
                          } else {
                            selectAllForAction(action);
                          }
                        }
                      }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="capitalize">{action}</span>
                        {isEditing && !isSystemRole && (
                          <input
                            type="checkbox"
                            checked={isFullySelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (isFullySelected) {
                                deselectAllForAction(action);
                              } else {
                                selectAllForAction(action);
                              }
                            }}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        )}
                      </div>
                    </th>
                  );
                })}
                {isEditing && !isSystemRole && (
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">All</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {RESOURCES.map((resource) => {
                const availableActions = RESOURCE_ACTIONS[resource] || [];
                const isFullySelected = isResourceFullySelected(resource);
                
                return (
                  <tr key={resource} className="hover:bg-gray-50">
                    <td
                      className={`px-4 py-3 text-sm font-medium text-gray-900 capitalize ${
                        isEditing && !isSystemRole ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => {
                        if (isEditing && !isSystemRole) {
                          if (isFullySelected) {
                            deselectAllForResource(resource);
                          } else {
                            selectAllForResource(resource);
                          }
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {isEditing && !isSystemRole && (
                          <input
                            type="checkbox"
                            checked={isFullySelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (isFullySelected) {
                                deselectAllForResource(resource);
                              } else {
                                selectAllForResource(resource);
                              }
                            }}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        )}
                        <span>{resource.replace('_', ' ')}</span>
                      </div>
                    </td>
                    {ACTIONS.map((action) => {
                      const isAvailable = availableActions.includes(action);
                      const isChecked = hasPermission(resource, action);

                      return (
                        <td
                          key={`${resource}-${action}`}
                          className={`px-4 py-3 text-center ${
                            isAvailable && isEditing && !isSystemRole
                              ? 'cursor-pointer hover:bg-primary-50'
                              : ''
                          }`}
                          onClick={() => {
                            if (isAvailable) {
                              togglePermission(resource, action);
                            }
                          }}
                        >
                          {isAvailable ? (
                            <div className="flex justify-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(resource, action)}
                                disabled={isSystemRole || !isEditing}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                              />
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                    {isEditing && !isSystemRole && (
                      <td className="px-4 py-3 text-center">
                        <Button
                          onClick={() =>
                            isFullySelected
                              ? deselectAllForResource(resource)
                              : selectAllForResource(resource)
                          }
                          variant="ghost"
                          size="sm"
                        >
                          {isFullySelected ? 'None' : 'All'}
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assigned Users */}
      {role.users && role.users.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Assigned Users ({role.users.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {role.users.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-xs text-gray-500">{user.user_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.status === 'active' ? 'success' : 'gray'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.assigned_at ? new Date(user.assigned_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
