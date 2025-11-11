import { useState, useEffect, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { VirtualTable } from '@/shared/components/VirtualTable';
import { ModernErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';
import { TableSkeleton } from '@/shared/components/loading/Skeletons';
import { useApiQuery } from '@/shared/hooks/useApiModern';
import { logger } from '@/core/logging';
import { useToast } from '@/hooks/useToast';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin: string | null;
}

export default function UserListPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Mock API call using our modern hook
  const { data: fetchedUsers, isLoading } = useApiQuery<User[]>(
    ['users'],
    async () => {
      // Mock API call
      return [];
    },
    {
      enabled: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  useEffect(() => {
    // Generate comprehensive mock user data for virtual scrolling demonstration
    const generateMockUsers = (count: number): User[] => {
      const roles = ['admin', 'user', 'editor', 'moderator', 'viewer', 'analyst', 'support'];
      const statuses = ['active', 'inactive', 'suspended'] as const;
      const domains = ['company.com', 'example.com', 'test.org', 'demo.net', 'sample.io'];
      const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Emma', 'Alex', 'Lisa', 'Chris', 'Anna'];
      const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'];
      
      return Array.from({ length: count }, (_, i) => ({
        id: `user_${i + 1}`,
        email: `${firstNames[i % firstNames.length].toLowerCase()}${i % 100}@${domains[i % domains.length]}`,
        firstName: firstNames[i % firstNames.length],
        lastName: lastNames[i % lastNames.length],
        role: roles[i % roles.length],
        status: statuses[i % statuses.length],
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastLogin: Math.random() > 0.2 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null
      }));
    };

    // Use mock data if API data isn't available
    if (!fetchedUsers || fetchedUsers.length === 0) {
      setUsers(generateMockUsers(5000)); // Generate 5000 users for performance demonstration
    } else {
      setUsers(fetchedUsers);
    }
  }, [fetchedUsers]);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === '' || user.role === selectedRole;
    const matchesStatus = selectedStatus === '' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Define columns for virtual table
  const columns = ['Name', 'Email', 'Role', 'Status', 'Created At', 'Last Login', 'Actions'];

  // Convert user data to table format
  const tableData = filteredUsers.map(user => ({
    Name: `${user.firstName} ${user.lastName}`,
    Email: user.email,
    Role: user.role,
    Status: user.status,
    'Created At': new Date(user.createdAt).toLocaleDateString(),
    'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
    Actions: user.id,
    _user: user // Store the full user object for actions
  }));

  // Custom cell renderer for user data
  const renderUserCell = (value: unknown, key: string, rowIndex?: number) => {
    const user = tableData[rowIndex!]._user;
    
    switch (key) {
      case 'Name': {
        return (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-linear-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium mr-3">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <div className="font-medium text-gray-900">{String(value)}</div>
              <div className="text-sm text-gray-500">ID: {user.id}</div>
            </div>
          </div>
        );
      }
      
      case 'Role': {
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value === 'admin' 
              ? 'bg-red-100 text-red-800' 
              : value === 'editor' 
                ? 'bg-blue-100 text-blue-800'
                : value === 'moderator'
                  ? 'bg-yellow-100 text-yellow-800'
                  : value === 'analyst'
                    ? 'bg-purple-100 text-purple-800'
                    : value === 'support'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
          }`}>
            {String(value)}
          </span>
        );
      }
      
      case 'Status': {
        return (
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full mr-2 ${
              value === 'active' 
                ? 'bg-green-400' 
                : value === 'inactive'
                  ? 'bg-yellow-400'
                  : 'bg-red-400'
            }`} />
            <span className={`text-sm ${
              value === 'active' 
                ? 'text-green-800' 
                : value === 'inactive'
                  ? 'text-yellow-800'
                  : 'text-red-800'
            }`}>
              {String(value)}
            </span>
          </div>
        );
      }
      
      case 'Last Login': {
        return (
          <span className={value === 'Never' ? 'text-gray-400 italic' : 'text-gray-700'}>
            {String(value)}
          </span>
        );
      }
      
      case 'Actions': {
        return (
          <div className="flex gap-2">
            <button 
              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
              onClick={() => {
                logger().info('Edit user action', { userId: user.id });
                toast.info('Edit user functionality coming soon');
              }}
            >
              Edit
            </button>
            <button 
              className="text-green-600 hover:text-green-900 text-sm font-medium"
              onClick={() => {
                logger().info('View user action', { userId: user.id });
                toast.info('View user functionality coming soon');
              }}
            >
              View
            </button>
            <button 
              className={`text-sm font-medium ${
                user.status === 'suspended' 
                  ? 'text-green-600 hover:text-green-900' 
                  : 'text-red-600 hover:text-red-900'
              }`}
              onClick={() => {
                const action = user.status === 'suspended' ? 'activate' : 'suspend';
                logger().info(`Toggle user status: ${action}`, { userId: user.id });
                toast.info(`Toggle status functionality coming soon`);
              }}
            >
              {user.status === 'suspended' ? 'Activate' : 'Suspend'}
            </button>
          </div>
        );
      }
      
      default:
        return String(value);
    }
  };

  const uniqueRoles = [...new Set(users.map(user => user.role))].sort();
  const uniqueStatuses = ['active', 'inactive', 'suspended'];

  return (
    <ModernErrorBoundary level="page">
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('nav.users')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage {users.length} users with high-performance virtual scrolling
            </p>
          </div>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            onClick={() => {
              logger().info('Create new user action');
              toast.info('Create user functionality coming soon');
            }}
          >
            {t('common.create')} User
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Users
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role Filter
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status Filter
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRole('');
                  setSelectedStatus('');
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Showing {filteredUsers.length} of {users.length} users</span>
            {searchTerm && <span>• Search: "{searchTerm}"</span>}
            {selectedRole && <span>• Role: {selectedRole}</span>}
            {selectedStatus && <span>• Status: {selectedStatus}</span>}
          </div>
        </div>

        {/* Users Table with Virtual Scrolling */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <Suspense fallback={<TableSkeleton rows={10} columns={6} />}>
            {isLoading ? (
              <TableSkeleton rows={10} columns={6} />
            ) : (
              <VirtualTable
                columns={columns}
                data={tableData}
                rowHeight={72}
                maxHeight={700}
                renderCell={renderUserCell}
              />
            )}
          </Suspense>
        </div>
      </div>
    </ModernErrorBoundary>
  );
}
