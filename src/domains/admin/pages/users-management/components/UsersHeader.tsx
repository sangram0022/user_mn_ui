import { Link } from 'react-router-dom';

export default function UsersHeader() {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500">
              Manage all users, roles, and permissions
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              to="/users/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Add New User
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
