import type { FC } from 'react';
import Badge from '@/shared/components/ui/Badge';

interface Props {
  totalPermissions: number;
  assignedUsersCount: number;
  isSystemRole: boolean;
}

const RoleQuickStats: FC<Props> = ({ totalPermissions, assignedUsersCount, isSystemRole }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Permissions</span>
          <span className="text-lg font-bold text-primary-600">{totalPermissions}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Assigned Users</span>
          <span className="text-lg font-bold text-primary-600">{assignedUsersCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Role Type</span>
          <Badge variant={isSystemRole ? 'info' : 'success'} size="sm">
            {isSystemRole ? 'System' : 'Custom'}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Status</span>
          <Badge variant="success" size="sm">Active</Badge>
        </div>
      </div>
    </div>
  );
};

export default RoleQuickStats;
