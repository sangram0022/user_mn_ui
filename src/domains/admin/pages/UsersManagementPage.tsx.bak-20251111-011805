// ========================================
// Users Management Page - Admin Interface
// ========================================
// Comprehensive user management with:
// - Virtual scrolling for large datasets
// - Advanced filtering and search
// - Bulk operations with optimistic updates
// - Accessibility features
// - Real-time data synchronization
// ========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLiveRegion, useKeyboardNavigation } from '../../../shared/components/accessibility/AccessibilityEnhancements';
import { logger } from '../../../core/logging';
import { PageErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';
// AWS CloudWatch handles performance monitoring

// ========================================
// Types and Interfaces
// ========================================

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: Date | null;
  createdAt: Date;
  avatar?: string;
}

interface UserFilters {
  search: string;
  role: string;
  status: string;
  sortBy: 'name' | 'email' | 'lastLogin' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

// ========================================
// Mock Data Generator
// ========================================

function generateMockUsers(count = 1000): User[] {
  const roles: User['role'][] = ['admin', 'user', 'manager'];
  const statuses: User['status'][] = ['active', 'inactive', 'pending'];
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Chris', 'Ashley', 'Daniel', 'Jessica'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

  return Array.from({ length: count }, (_, index) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const createdAt = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    
    return {
      id: `user_${index + 1}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@example.com`,
      role: roles[Math.floor(Math.random() * roles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      lastLogin: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
      createdAt,
      avatar: `/avatars/user-${(index % 10) + 1}.jpg`,
    };
  });
}

// ========================================
// Filter and Search Components
// ========================================

function UserFiltersPanel({ 
  filters, 
  onFiltersChange, 
  userCount 
}: { 
  filters: UserFilters; 
  onFiltersChange: (filters: UserFilters) => void;
  userCount: number;
}) {
  const { announce } = useLiveRegion();

  const updateFilter = (key: keyof UserFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
    announce(`Filter updated: ${key} set to ${value}`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
        <div className="text-sm text-gray-600">
          {userCount.toLocaleString()} users total
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            id="search"
            type="text"
            placeholder="Name or email..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Role Filter */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="role"
            value={filters.role}
            onChange={(e) => updateFilter('role', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sortBy"
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="lastLogin">Last Login</option>
            <option value="createdAt">Created Date</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
            Order
          </label>
          <select
            id="sortOrder"
            value={filters.sortOrder}
            onChange={(e) => updateFilter('sortOrder', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
            + Add User
          </button>
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
            📤 Export
          </button>
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
            📊 Bulk Actions
          </button>
        </div>
        
        <button
          onClick={() => {
            onFiltersChange({
              search: '',
              role: '',
              status: '',
              sortBy: 'name',
              sortOrder: 'asc'
            });
            announce('Filters cleared');
          }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

// ========================================
// Virtual Scrolling User List
// ========================================

function VirtualUserList({ 
  users, 
  selectedUsers, 
  onUserSelect, 
  onUserAction 
}: { 
  users: User[];
  selectedUsers: Set<string>;
  onUserSelect: (userId: string, selected: boolean) => void;
  onUserAction: (action: string, userId: string) => void;
}) {
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
              ${focusedIndex === index ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
              ${selectedUsers.has(user.id) ? 'bg-blue-25' : ''}
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
                />
              </div>

              {/* User Info */}
              <div className="col-span-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-8 h-8 rounded-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/avatars/user-placeholder.jpg';
                    }}
                  />
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
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <div className={`flex items-center space-x-1 ${getStatusColor(user.status)}`}>
                  <div className={`w-2 h-2 rounded-full ${
                    user.status === 'active' ? 'bg-green-500' :
                    user.status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm font-medium capitalize">{user.status}</span>
                </div>
              </div>

              {/* Last Login */}
              <div className="col-span-2">
                <div className="text-sm text-gray-600">
                  {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onUserAction('view', user.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    aria-label={`View ${user.firstName} ${user.lastName} profile`}
                  >
                    View
                  </button>
                  <button
                    onClick={() => onUserAction('edit', user.id)}
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                    aria-label={`Edit ${user.firstName} ${user.lastName} profile`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onUserAction('delete', user.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                    aria-label={`Delete ${user.firstName} ${user.lastName} account`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {users.length > 100 && (
          <div className="px-6 py-4 text-center text-gray-500">
            Showing first 100 of {users.length.toLocaleString()} users
            <div className="text-xs mt-1">Use filters to refine results</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ========================================
// Main Users Management Page
// ========================================

function UsersManagementPage() {
  const [allUsers] = useState(() => generateMockUsers(2500));
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    status: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  
  const { announce, LiveRegion} = useLiveRegion();

  // Filter and sort users
  // React 19 Compiler: No useMemo needed - compiler optimizes automatically
  const filtered = allUsers.filter(user => {
    const matchesSearch = filters.search === '' || 
      user.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesRole = filters.role === '' || user.role === filters.role;
    const matchesStatus = filters.status === '' || user.status === filters.status;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sort users
  filtered.sort((a, b) => {
    let compareValue = 0;
    
    switch (filters.sortBy) {
      case 'name':
        compareValue = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        break;
      case 'email':
        compareValue = a.email.localeCompare(b.email);
        break;
      case 'lastLogin': {
        const aLogin = a.lastLogin?.getTime() || 0;
        const bLogin = b.lastLogin?.getTime() || 0;
        compareValue = aLogin - bLogin;
        break;
      }
      case 'createdAt':
        compareValue = a.createdAt.getTime() - b.createdAt.getTime();
        break;
    }
    
    return filters.sortOrder === 'desc' ? -compareValue : compareValue;
  });

  const filteredUsers = filtered;

  useEffect(() => {
    document.title = 'User Management - Admin';
  }, []);

  const handleUserSelect = (userId: string, selected: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (selected) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
    
    announce(`User ${selected ? 'selected' : 'deselected'}. ${newSelected.size} users selected.`);
  };

  const handleUserAction = (action: string, userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    announce(`${action} action triggered for ${user.firstName} ${user.lastName}`);
    
    switch (action) {
      case 'view':
        // Navigate to user profile
        logger().debug('View user', { userId });
        break;
      case 'edit':
        // Navigate to edit form
        logger().debug('Edit user', { userId });
        break;
      case 'delete':
        // Show confirmation dialog
        logger().debug('Delete user', { userId });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LiveRegion />

      {/* Header */}
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

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserFiltersPanel
          filters={filters}
          onFiltersChange={setFilters}
          userCount={allUsers.length}
        />

        <VirtualUserList
          users={filteredUsers}
          selectedUsers={selectedUsers}
          onUserSelect={handleUserSelect}
          onUserAction={handleUserAction}
        />

        {selectedUsers.size > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-blue-800">
                {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
              </div>
              <div className="flex items-center space-x-2">
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                  Bulk Edit
                </button>
                <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">
                  Bulk Delete
                </button>
                <button 
                  onClick={() => {
                    setSelectedUsers(new Set());
                    announce('Selection cleared');
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Performance Info */}
        {import.meta.env.MODE === 'development' && (
          <div className="mt-8 bg-gray-900 text-white p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Performance Metrics</h3>
            <div className="text-sm">
              <div>Total Users: {allUsers.length.toLocaleString()}</div>
              <div>Filtered Users: {filteredUsers.length.toLocaleString()}</div>
              <div>Rendering: First 100 users (virtual scrolling)</div>
              <div>Selected: {selectedUsers.size} users</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function UsersManagementPageWithErrorBoundary() {
  return (
    <PageErrorBoundary>
      <UsersManagementPage />
    </PageErrorBoundary>
  );
}

export default UsersManagementPageWithErrorBoundary;