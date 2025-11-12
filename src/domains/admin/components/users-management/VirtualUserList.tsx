// ========================================
// Virtual User List Component
// ========================================

import { useState } from 'react';
import { useKeyboardNavigation } from '@/shared/hooks/accessibility';
import type { User } from './types';

interface VirtualUserListProps {
  users: User[];
  selectedUsers: Set<string>;
  onUserSelect: (userId: string, selected: boolean) => void;
  onUserAction: (action: string, userId: string) => void;
}

export default function VirtualUserList({ 
  users, 
  selectedUsers, 
  onUserSelect, 
  onUserAction 
}: VirtualUserListProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const listRef = useKeyboardNavigation({
    onArrowUp: () => setFocusedIndex(prev => Math.max(0, prev - 1)),
    onArrowDown: () => setFocusedIndex(prev => Math.min(users.length - 1, prev + 1)),
    onEnter: () => {
      const user = users[focusedIndex];
      if (user) {
        onUserSelect(user.id, !selectedUsers.has(user.id));
      }
    }
  });

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-900">
          <div className="col-span-1">
            <input 
              type="checkbox" 
              className="rounded text-blue-600 focus:ring-blue-500"
              onChange={(e) => {
                users.forEach(user => {
                  onUserSelect(user.id, e.target.checked);
                });
              }}
            />
          </div>
          <div className="col-span-3">User</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Last Login</div>
          <div className="col-span-2">Actions</div>
        </div>
      </div>

      {/* User List */}
      <div 
        ref={listRef as React.RefObject<HTMLDivElement>}
        className="max-h-96 overflow-y-auto"
        tabIndex={0}
        role="grid"
        aria-label="User management table"
      >
        {users.slice(0, 100).map((user, index) => (
          <div
            key={user.id}
            className={`
              px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors
              ${focusedIndex === index ? 'ring-2 ring-blue-500 ring-inset' : ''}
            `}
            role="row"
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Checkbox */}
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedUsers.has(user.id)}
                  onChange={(e) => onUserSelect(user.id, e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                  aria-label={`Select ${user.firstName} ${user.lastName}`}
                />
              </div>

              {/* User Info */}
              <div className="col-span-3">
                <div className="flex items-center space-x-3">
                  <div className="shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt=""
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </div>

              {/* Role */}
              <div className="col-span-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <span className={`text-sm font-medium ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
              </div>

              {/* Last Login */}
              <div className="col-span-2 text-sm text-gray-500">
                {user.lastLogin ? (
                  <>
                    {user.lastLogin.toLocaleDateString()}
                    <br />
                    <span className="text-xs">{user.lastLogin.toLocaleTimeString()}</span>
                  </>
                ) : (
                  <span className="text-gray-400">Never</span>
                )}
              </div>

              {/* Actions */}
              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onUserAction('view', user.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    aria-label={`View ${user.firstName} ${user.lastName}`}
                  >
                    View
                  </button>
                  <button
                    onClick={() => onUserAction('edit', user.id)}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                    aria-label={`Edit ${user.firstName} ${user.lastName}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onUserAction('delete', user.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    aria-label={`Delete ${user.firstName} ${user.lastName}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            No users found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
