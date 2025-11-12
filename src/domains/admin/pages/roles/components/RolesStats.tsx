import type { FC } from 'react';

interface Props {
  totalRoles: number;
  totalPermissions: number;
  totalUsersWithRoles: number;
  permissionCategories: number;
}

const RolesStats: FC<Props> = ({ totalRoles, totalPermissions, totalUsersWithRoles, permissionCategories }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="text-sm text-gray-500">Total Roles</div>
        <div className="text-2xl font-semibold text-gray-900">{totalRoles}</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="text-sm text-gray-500">Available Permissions</div>
        <div className="text-2xl font-semibold text-gray-900">{totalPermissions}</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="text-sm text-gray-500">Users with Roles</div>
        <div className="text-2xl font-semibold text-gray-900">{totalUsersWithRoles}</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="text-sm text-gray-500">Permission Categories</div>
        <div className="text-2xl font-semibold text-gray-900">{permissionCategories}</div>
      </div>
    </div>
  );
};

export default RolesStats;
