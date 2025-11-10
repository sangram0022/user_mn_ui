// ========================================
// Role Detail Page - Refactored
// ========================================

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRole, useUpdateRole } from '../hooks';
import type { UpdateRoleRequest } from '../types';
import Button from '../../../shared/components/ui/Button';
import Badge from '../../../shared/components/ui/Badge';
import RoleOverview from './role-detail/components/RoleOverview';
import RoleQuickStats from './role-detail/components/RoleQuickStats';
import { logger } from '../../../core/logging';
import { SYSTEM_ROLES, RESOURCES, ACTIONS, RESOURCE_ACTIONS, getRoleLevelBadge } from '../components/role-detail/constants';
import { useRolePermissions } from '../components/role-detail/useRolePermissions';
import PermissionsMatrix from './role-detail/components/PermissionsMatrix';

export default function RoleDetailPage() {
  const { roleName } = useParams<{ roleName: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const { data: role, isLoading, isError, error } = useRole(roleName!, {
    include_users: true,
    users_limit: 100,
  });

  const updateRole = useUpdateRole();

  const {
    formData,
    setFormData,
    togglePermission,
    selectAllForResource,
    deselectAllForResource,
    selectAllForAction,
    deselectAllForAction,
    hasPermission,
    isResourceFullySelected,
    isActionFullySelected,
    getTotalPermissions,
  } = useRolePermissions(role);

  const isSystemRole = roleName ? SYSTEM_ROLES.includes(roleName) : false;

  const handleSave = async () => {
    if (!roleName) return;

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
    // Form data will reset via useEffect in useRolePermissions hook
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
  const totalPermissions = getTotalPermissions();

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
        <RoleOverview
          formData={formData}
          setFormData={setFormData}
          isSystemRole={isSystemRole}
          isEditing={isEditing}
        />

        <RoleQuickStats
          totalPermissions={totalPermissions}
          assignedUsersCount={role.users?.length || 0}
          isSystemRole={isSystemRole}
        />
      </div>

      {/* Permissions Matrix */}
      <div>
        <PermissionsMatrix
          resources={RESOURCES}
          actions={ACTIONS}
          resourceActions={RESOURCE_ACTIONS}
          isEditing={isEditing}
          isSystemRole={isSystemRole}
          hasPermission={hasPermission}
          isActionFullySelected={isActionFullySelected}
          isResourceFullySelected={isResourceFullySelected}
          togglePermission={togglePermission}
          selectAllForResource={selectAllForResource}
          deselectAllForResource={deselectAllForResource}
          selectAllForAction={selectAllForAction}
          deselectAllForAction={deselectAllForAction}
        />
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
                    Assigned Date
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.status === 'active' ? 'success' : 'warning'} size="sm">
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.assigned_at ? new Date(user.assigned_at).toLocaleDateString() : 'N/A'}
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
