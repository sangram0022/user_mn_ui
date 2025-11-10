import { Link } from 'react-router-dom';
import Badge from '@/shared/components/ui/Badge';
import { formatShortDate } from '@/shared/utils/dateFormatters';
import { formatUserRole } from '@/shared/utils/textFormatters';
import { buildRoute } from '@/core/routing/config';

interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  username?: string;
  roles: string[];
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
}

interface UsersTableProps {
  users: User[];
  selectedUsers: Set<string>;
  sortField: 'first_name' | 'last_name' | 'email' | 'created_at';
  sortDirection: 'asc' | 'desc';
  onToggleSelection: (userId: string) => void;
  onToggleSelectAll: () => void;
  onSort: (field: 'first_name' | 'last_name' | 'email' | 'created_at') => void;
  onDeleteUser: (userId: string) => void;
  isDeleting: boolean;
}

export function UsersTable({
  users,
  selectedUsers,
  sortField,
  sortDirection,
  onToggleSelection,
  onToggleSelectAll,
  onSort,
  onDeleteUser,
  isDeleting,
}: UsersTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedUsers.size === users.length && users.length > 0}
                onChange={onToggleSelectAll}
                className="rounded border-gray-300"
              />
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('first_name')}
            >
              First Name {sortField === 'first_name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('last_name')}
            >
              Last Name {sortField === 'last_name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('email')}
            >
              Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Approved
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort('created_at')}
            >
              Created {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.user_id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedUsers.has(user.user_id)}
                  onChange={() => onToggleSelection(user.user_id)}
                  className="rounded border-gray-300"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{user.first_name}</div>
                <div className="text-sm text-gray-500">{user.username || user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{user.last_name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant="info">{formatUserRole((Array.isArray(user.roles) && user.roles[0]) || 'user')}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge 
                  variant={user.is_active ? 'success' : 'danger'}
                >
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge 
                  variant={user.is_approved ? 'success' : 'warning'}
                >
                  {user.is_approved ? 'Approved' : 'Pending'}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatShortDate(user.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link 
                  to={buildRoute.adminUserView(user.user_id)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                >
                  View
                </Link>
                <Link 
                  to={buildRoute.adminUserEdit(user.user_id)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Edit
                </Link>
                <button 
                  onClick={() => onDeleteUser(user.user_id)}
                  className="text-red-600 hover:text-red-900"
                  disabled={isDeleting}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
