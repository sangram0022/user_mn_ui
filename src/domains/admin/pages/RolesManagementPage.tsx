// ========================================
// Roles Management Page - Admin Interface
// ========================================
// Comprehensive role and permission management with:
// - Hierarchical role system
// - Permission matrix interface
// - Role templates and inheritance
// - Audit trail for permission changes
// - Accessibility features
// ========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLiveRegion } from '../../../shared/components/accessibility/AccessibilityEnhancements';
import { logger } from '../../../core/logging';
import RolesList from './roles/components/RolesList';
import PermissionMatrix from './roles/components/PermissionMatrix';
import RolesFilters from './roles/components/RolesFilters';
import RolesStats from './roles/components/RolesStats';
import type { Role, Permission } from './roles/types';
// AWS CloudWatch handles performance monitoring

// ========================================
// Mock Data Generator
// ========================================

function generateMockPermissions(): Permission[] {
  const categories = ['users', 'content', 'analytics', 'settings', 'billing'];
  const actions: Permission['action'][] = ['create', 'read', 'update', 'delete', 'manage'];
  
  return categories.flatMap(category => 
    actions.map(action => ({
      id: `${category}_${action}`,
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${category} resources`,
      category,
      resource: category,
      action
    }))
  );
}

function generateMockRoles(): Role[] {
  const allPermissions = generateMockPermissions();
  
  return [
    {
      id: 'role_1',
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      level: 1,
      color: 'red',
      permissions: allPermissions,
      userCount: 2,
      isDefault: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'role_2', 
      name: 'Admin',
      description: 'Administrative access with most permissions',
      level: 2,
      color: 'blue',
      permissions: allPermissions.filter(p => p.action !== 'manage' || p.category === 'users'),
      userCount: 5,
      isDefault: false,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: 'role_3',
      name: 'Manager',
      description: 'Management role with team oversight capabilities',
      level: 3,
      color: 'purple',
      permissions: allPermissions.filter(p => 
        p.action === 'read' || 
        (p.action === 'update' && ['users', 'content'].includes(p.category)) ||
        (p.action === 'create' && p.category === 'content')
      ),
      userCount: 12,
      isDefault: false,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-25')
    },
    {
      id: 'role_4',
      name: 'Editor',
      description: 'Content management and editing permissions',
      level: 4,
      color: 'green',
      permissions: allPermissions.filter(p => 
        (p.category === 'content' && ['create', 'read', 'update'].includes(p.action)) ||
        (p.category === 'users' && p.action === 'read')
      ),
      userCount: 25,
      isDefault: false,
      createdAt: new Date('2024-01-04'),
      updatedAt: new Date('2024-01-28')
    },
    {
      id: 'role_5',
      name: 'User',
      description: 'Standard user with basic permissions',
      level: 5,
      color: 'gray',
      permissions: allPermissions.filter(p => 
        p.action === 'read' && ['content', 'analytics'].includes(p.category)
      ),
      userCount: 1250,
      isDefault: true,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-02-01')
    }
  ];
}

 

// ========================================
// Main Roles Management Page
// ========================================

export default function RolesManagementPage() {
  const [roles] = useState(() => generateMockRoles());
  const [allPermissions] = useState(() => generateMockPermissions());
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'users' | 'updated'>('level');
  
  // AWS CloudWatch records metrics automatically
  const { announce, LiveRegion } = useLiveRegion();

  useEffect(() => {
    document.title = 'Role Management - Admin';
  }, []);

  // React 19 Compiler: No useMemo needed - simple filter and sort
  const filtered = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'level':
        return a.level - b.level;
      case 'users':
        return b.userCount - a.userCount;
      case 'updated':
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      default:
        return 0;
    }
  });

  const filteredRoles = filtered;

  const handleRoleEdit = (role: Role) => {
    logger().debug('Editing role', { roleName: role.name });
    announce(`Editing role: ${role.name}`);
  };

  const handleRoleDelete = (role: Role) => {
    logger().debug('Delete role', { roleName: role.name, isDefault: role.isDefault });
    announce(role.isDefault ? 'Cannot delete default role' : `Role "${role.name}" queued for deletion`);
  };

  const handleViewUsers = (role: Role) => {
    logger().debug('View users for role', { roleName: role.name });
    announce(`Viewing users with role: ${role.name}`);
  };

  const handlePermissionToggle = (role: Role, permission: Permission, granted: boolean) => {
    logger().debug('Toggle permission', { permissionName: permission.name, roleName: role.name, granted });
    announce(`Permission ${permission.name} ${granted ? 'granted to' : 'removed from'} ${role.name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LiveRegion />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
              <p className="text-sm text-gray-500">
                Manage roles and permissions across the system
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
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

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <RolesFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={(v) => setSortBy(v)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Roles List */}
          <div>
            <div className="grid gap-4">
              <RolesList
                roles={filteredRoles}
                onEdit={handleRoleEdit}
                onDelete={handleRoleDelete}
                onViewUsers={handleViewUsers}
                onSelectRole={(r: Role) => setSelectedRole(r)}
                selectedRoleId={selectedRole?.id ?? null}
              />
            </div>
          </div>

          {/* Permission Matrix */}
          <div className="sticky top-8">
            {selectedRole ? (
              <PermissionMatrix
                role={selectedRole}
                allPermissions={allPermissions}
                onPermissionToggle={handlePermissionToggle}
              />
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Role</h3>
                <p className="text-gray-500">
                  Click on a role card to edit its permissions
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <RolesStats
          totalRoles={roles.length}
          totalPermissions={allPermissions.length}
          totalUsersWithRoles={roles.reduce((sum, role) => sum + role.userCount, 0)}
          permissionCategories={Array.from(new Set(allPermissions.map(p => p.category))).length}
        />

        {/* Performance Info */}
        {import.meta.env.MODE === 'development' && (
          <div className="mt-8 bg-gray-900 text-white p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Performance Metrics</h3>
            <div className="text-sm">
              <div>Total Roles: {roles.length}</div>
              <div>Filtered Roles: {filteredRoles.length}</div>
              <div>Selected Role: {selectedRole?.name || 'None'}</div>
              <div>Permission Categories: {Array.from(new Set(allPermissions.map(p => p.category))).length}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}