/**
 * PendingUsersTable Component
 * Displays pending users awaiting approval with selection
 */

import Button from '@/shared/components/ui/Button';
import { formatShortDate } from '@/shared/utils/dateFormatters';
import type { AdminUser } from '../types';

type User = AdminUser;

interface PendingUsersTableProps {
  users: User[];
  selectedUsers: Set<string>;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSelectAll: () => void;
  onSelectUser: (userId: string) => void;
  onSort: (field: string) => void;
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
}

export default function PendingUsersTable({
  users,
  selectedUsers,
  sortField,
  sortOrder,
  onSelectAll,
  onSelectUser,
  onSort,
  onApprove,
  onReject,
}: PendingUsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="p-12 text-center">
          <div className="mb-4 text-5xl text-gray-400">✅</div>
          <p className="text-lg text-gray-500">No pending approvals</p>
          <p className="text-sm text-gray-400">All users have been processed</p>
        </div>
      </div>
    );
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return '';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.size === users.length && users.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                onClick={() => onSort('first_name')}
              >
                User {getSortIcon('first_name')}
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                onClick={() => onSort('email')}
              >
                Email {getSortIcon('email')}
              </th>
              <th
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                onClick={() => onSort('created_at')}
              >
                Registered {getSortIcon('created_at')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map((user) => (
              <tr key={user.user_id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.user_id)}
                    onChange={() => onSelectUser(user.user_id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div className="shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                        <span className="text-sm font-medium text-primary-600">
                          {user.first_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">@{user.username || user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900">{user.email}</div>
                  <div className="text-xs text-gray-500">
                    {user.is_verified && '✓ Verified'}
                    {!user.is_verified && '⚠ Not Verified'}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {formatShortDate(user.created_at)}
                </td>
                <td className="space-x-2 whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <Button onClick={() => onApprove(user.user_id)} variant="success" size="sm">
                    Approve
                  </Button>
                  <Button onClick={() => onReject(user.user_id)} variant="danger" size="sm">
                    Reject
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
