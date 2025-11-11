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
import { useLiveRegion } from '@/shared/hooks/accessibility';
import { logger } from '@/core/logging';
import { PageErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';
import {
  UserFiltersPanel,
  VirtualUserList,
  generateMockUsers,
  type User,
  type UserFilters,
} from '../components/users-management';
import { UsersHeader, BulkActionsBar } from './users-management/components';

// AWS CloudWatch handles performance monitoring

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
  
  const { announce, LiveRegion } = useLiveRegion();

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
    const user = allUsers.find((u: User) => u.id === userId);
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
      <UsersHeader />

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

        <BulkActionsBar
          selectedCount={selectedUsers.size}
          onBulkEdit={() => announce('Bulk edit triggered')}
          onBulkDelete={() => announce('Bulk delete triggered')}
          onClear={() => {
            setSelectedUsers(new Set());
            announce('Selection cleared');
          }}
        />

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
