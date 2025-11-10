import type { FC } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  onTemplates?: () => void;
}

const RolesHeader: FC<Props> = ({ onTemplates }) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
            <p className="text-sm text-gray-500">Manage roles and permissions across the system</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onTemplates}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              📋 Role Templates
            </button>
            <Link
              to="/admin/roles/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Create New Role
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesHeader;
