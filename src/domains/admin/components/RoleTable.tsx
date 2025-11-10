/**
 * RoleTable Component
 * Displays roles in a table with actions
 */

import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';

interface Role {
  role_name: string;
  display_name: string;
  description?: string;
  level: number;
  users_count?: number;
  permissions?: Array<{ resource: string; actions: string[] }>;
}

interface RoleTableProps {
  roles: Role[];
  onEdit: (roleName: string) => void;
  onDelete: (roleName: string) => void;
}

const SYSTEM_ROLES = ['admin', 'user'];

const isSystemRole = (roleName: string) => SYSTEM_ROLES.includes(roleName);

const getRoleLevelBadge = (level: number): { text: string; variant: 'info' | 'success' | 'warning' | 'danger' } => {
  if (level >= 90) return { text: 'Admin', variant: 'danger' };
  if (level >= 70) return { text: 'Manager', variant: 'warning' };
  if (level >= 50) return { text: 'Moderator', variant: 'info' };
  return { text: 'User', variant: 'success' };
};

export default function RoleTable({ roles, onEdit, onDelete }: RoleTableProps) {
  if (roles.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
        <div className="mb-4 text-5xl text-gray-400">🔐</div>
        <p className="mb-2 text-lg text-gray-500">No roles found</p>
        <p className="text-sm text-gray-400">Create a new role to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Level
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              User Count
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {roles.map((role) => {
            const levelBadge = getRoleLevelBadge(role.level);
            const isSystem = isSystemRole(role.role_name);

            return (
              <tr key={role.role_name} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {role.display_name}
                    </span>
                    {isSystem && (
                      <Badge variant="info" size="sm">
                        System
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{role.role_name}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900">{role.level}</span>
                    <Badge variant={levelBadge.variant} size="sm">
                      {levelBadge.text}
                    </Badge>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="max-w-xs truncate text-sm text-gray-900">
                    {role.description || 'No description'}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="text-sm text-gray-900">{role.users_count || 0}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {role.permissions?.length || 0} permissions
                  </span>
                </td>
                <td className="space-x-2 whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <Button
                    onClick={() => onEdit(role.role_name)}
                    variant="outline"
                    size="sm"
                  >
                    {isSystem ? 'View' : 'Edit'}
                  </Button>
                  {!isSystem && (
                    <Button
                      onClick={() => onDelete(role.role_name)}
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
  );
}
