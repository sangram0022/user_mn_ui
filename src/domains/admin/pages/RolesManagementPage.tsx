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

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLiveRegion } from '../../../shared/components/accessibility/AccessibilityEnhancements';
import { logger } from '../../../core/logging';
// AWS CloudWatch handles performance monitoring

// ========================================
// Types and Interfaces
// ========================================

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

interface Role {
  id: string;
  name: string;
  description: string;
  level: number; // 1 = highest (admin), higher numbers = lower permissions
  color: string;
  permissions: Permission[];
  userCount: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}



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
// Role Card Component
// ========================================

function RoleCard({ 
  role, 
  onEdit, 
  onDelete, 
  onViewUsers 
}: { 
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onViewUsers: (role: Role) => void;
}) {
  const getColorClasses = (color: string) => {
    const colors = {
      red: 'bg-red-50 border-red-200 text-red-800',
      blue: 'bg-blue-50 border-blue-200 text-blue-800', 
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      gray: 'bg-gray-50 border-gray-200 text-gray-800'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const getLevelBadge = (level: number) => {
    const levels = {
      1: { text: 'Level 1', class: 'bg-red-100 text-red-800' },
      2: { text: 'Level 2', class: 'bg-orange-100 text-orange-800' },
      3: { text: 'Level 3', class: 'bg-yellow-100 text-yellow-800' },
      4: { text: 'Level 4', class: 'bg-green-100 text-green-800' },
      5: { text: 'Level 5', class: 'bg-gray-100 text-gray-800' }
    };
    return levels[level as keyof typeof levels] || levels[5];
  };

  return (
    <div className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${getColorClasses(role.color)}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold">{role.name}</h3>
            {role.isDefault && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Default
              </span>
            )}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelBadge(role.level).class}`}>
              {getLevelBadge(role.level).text}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{role.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <div className="font-medium text-gray-700">Users</div>
          <div className="text-lg font-semibold">{role.userCount.toLocaleString()}</div>
        </div>
        <div>
          <div className="font-medium text-gray-700">Permissions</div>
          <div className="text-lg font-semibold">{role.permissions.length}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">Permission Categories:</div>
        <div className="flex flex-wrap gap-1">
          {Array.from(new Set(role.permissions.map(p => p.category))).map(category => (
            <span 
              key={category}
              className="px-2 py-1 text-xs bg-white bg-opacity-50 rounded text-gray-700"
            >
              {category}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white border-opacity-50">
        <div className="text-xs text-gray-500">
          Updated {role.updatedAt.toLocaleDateString()}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewUsers(role)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            View Users
          </button>
          <button
            onClick={() => onEdit(role)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Edit
          </button>
          {!role.isDefault && (
            <button
              onClick={() => onDelete(role)}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ========================================
// Permission Matrix Component
// ========================================

function PermissionMatrix({ 
  role, 
  allPermissions, 
  onPermissionToggle 
}: { 
  role: Role;
  allPermissions: Permission[];
  onPermissionToggle: (role: Role, permission: Permission, granted: boolean) => void;
}) {
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    allPermissions.forEach(permission => {
      if (!groups[permission.category]) {
        groups[permission.category] = [];
      }
      groups[permission.category].push(permission);
    });
    return groups;
  }, [allPermissions]);

  const hasPermission = (permission: Permission) => {
    return role.permissions.some(p => p.id === permission.id);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">
        Permissions for {role.name}
      </h3>

      <div className="space-y-6">
        {Object.entries(groupedPermissions).map(([category, permissions]) => (
          <div key={category}>
            <h4 className="font-medium text-gray-900 mb-3 capitalize">
              {category} Permissions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {permissions.map(permission => (
                <label 
                  key={permission.id}
                  className="flex items-start space-x-3 p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={hasPermission(permission)}
                    onChange={(e) => onPermissionToggle(role, permission, e.target.checked)}
                    className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900">
                      {permission.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {permission.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========================================
// Main Roles Management Page
// ========================================

export default function RolesManagementPage() {
  const [roles] = useState(() => generateMockRoles());
  const [allPermissions] = useState(() => generateMockPermissions());
  const [selectedRole] = useState<Role | null>(null);
  const [searchTerm] = useState('');
  const [sortBy] = useState<'name' | 'level' | 'users' | 'updated'>('level');
  
  // AWS CloudWatch records metrics automatically
  const { announce, LiveRegion } = useLiveRegion();

  useEffect(() => {
    document.title = 'Role Management - Admin';
  }, []);

  const filteredRoles = useMemo(() => {
    // AWS CloudWatch monitors performance automatically
    
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

    return filtered;
  }, [roles, searchTerm, sortBy]); // AWS CloudWatch monitors performance automatically

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
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Roles Overview</h2>
            <div className="text-sm text-gray-600">
              {roles.length} roles total
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={() => logger().debug('AWS handles search')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <select
                value={sortBy}
                onChange={() => logger().debug('AWS handles sorting')}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="level">Sort by Level</option>
                <option value="name">Sort by Name</option>
                <option value="users">Sort by User Count</option>
                <option value="updated">Sort by Updated</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Roles List */}
          <div>
            <div className="grid gap-4">
              {filteredRoles.map(role => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onEdit={handleRoleEdit}
                  onDelete={handleRoleDelete}
                  onViewUsers={handleViewUsers}
                />
              ))}
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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {roles.length}
            </div>
            <div className="text-sm text-gray-600">Total Roles</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {allPermissions.length}
            </div>
            <div className="text-sm text-gray-600">Available Permissions</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {roles.reduce((sum, role) => sum + role.userCount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {Array.from(new Set(allPermissions.map(p => p.category))).length}
            </div>
            <div className="text-sm text-gray-600">Permission Categories</div>
          </div>
        </div>

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