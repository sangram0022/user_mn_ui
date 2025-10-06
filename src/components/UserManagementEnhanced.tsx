import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/apiClientLegacy';
import { Plus, Trash2, Eye, Users, UserCheck, UserX, Search, Filter } from 'lucide-react';
import { getUserPermissions, getUserRoleName } from '../utils/user';

interface User {
  id: number;
  email: string;
  username?: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  role: {
    id: number;
    name: string;
    description: string;
  };
  lifecycle_stage?: string;
  activity_score?: number;
  last_login_at?: string;
  created_at: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

interface CreateUserData {
  email: string;
  password: string;
  username?: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
}

interface UpdateUserData {
  email?: string;
  username?: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
}

const UserManagementEnhanced: React.FC = () => {
  const { hasPermission, user } = useAuth();
  
  const debugEnabled = useMemo(() => {
    if (!import.meta.env.DEV) {
      return false;
    }

    if (typeof window === 'undefined') {
      return false;
    }

    try {
      return window.sessionStorage.getItem('DEBUG_USER_MANAGEMENT') === 'true';
    } catch {
      return false;
    }
  }, []);

  const debugLog = useCallback((...args: unknown[]) => {
    if (debugEnabled) {
      console.debug('[UserManagementEnhanced]', ...args);
    }
  }, [debugEnabled]);

  useEffect(() => {
    if (!debugEnabled) {
      return;
    }

    debugLog('Permission snapshot', {
      user,
      role: user?.role,
      isSuperuser: user?.is_superuser,
      permissions: getUserPermissions(user),
      hasUserRead: hasPermission('user:read'),
      isAdmin: hasPermission('admin'),
      roleName: getUserRoleName(user)
    });

    debugLog(user ? 'Component rendering with active user context' : 'Component rendering without user context');
  }, [debugEnabled, debugLog, hasPermission, user]);
  
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 20,
    total: 0,
    hasMore: false
  });
  
  // Modals and selections
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Define functions before useEffect
  const loadUsers = useCallback(async () => {
    let tokenAvailable = false;
    if (typeof window !== 'undefined') {
      try {
        tokenAvailable = !!window.localStorage.getItem('access_token');
      } catch {
        tokenAvailable = false;
      }
    }

    debugLog('Loading users', {
      tokenAvailable,
      permissions: getUserPermissions(user),
      params: {
        skip: pagination.skip,
        limit: pagination.limit,
        searchTerm,
        filterRole,
        filterActive
      }
    });
    
    try {
      setIsLoading(true);
      setError(null);

      const params: Record<string, string | number | boolean> = {
        skip: pagination.skip,
        limit: pagination.limit
      };

      if (searchTerm) params.search = searchTerm;
      if (filterRole) params.role = filterRole;
      if (filterActive !== undefined) params.is_active = filterActive;

      debugLog('Requesting users with params', params);
      
      const response = await apiClient.getUsers(params);
      
      if (response.success) {
        debugLog('Users loaded successfully', {
          total: response.total,
          count: response.users?.length
        });
        setUsers(response.users || []);
        setPagination(prev => ({
          ...prev,
          total: response.total || 0,
          hasMore: response.page_info?.has_more || false
        }));
      } else {
        console.error('❌ API response indicates failure:', response);
        throw new Error('Failed to load users');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Failed to load users', err);
      
      setError(`Failed to load users: ${errorMessage}`);
      
      // If it's an authentication error, provide specific guidance
      if (errorMessage.includes('401') || errorMessage.includes('Authentication') || errorMessage.includes('Unauthorized')) {
        setError('Authentication error: Please try logging out and logging back in. If the problem persists, contact your administrator.');
      }
    } finally {
      setIsLoading(false);
      debugLog('loadUsers completed');
    }
  }, [debugLog, filterActive, filterRole, pagination.limit, pagination.skip, searchTerm, user]);

  const loadRoles = useCallback(async () => {
    try {
      debugLog('Loading roles from backend...');
      const response = await apiClient.getRoles();
      
      if (response.success && response.roles) {
        debugLog('Roles loaded successfully', response.roles);
        setRoles(response.roles);
      } else {
        console.error('Failed to load roles', response);
        // Fallback to default roles if backend fails
        setRoles([
          { id: 1, name: 'admin', description: 'Administrator' },
          { id: 2, name: 'user', description: 'Standard User' },
          { id: 3, name: 'manager', description: 'Manager' }
        ]);
      }
    } catch (err) {
      console.error('Failed to load roles', err);
      // Fallback to default roles if backend fails
      setRoles([
        { id: 1, name: 'admin', description: 'Administrator' },
        { id: 2, name: 'user', description: 'Standard User' },
        { id: 3, name: 'manager', description: 'Manager' }
      ]);
    }
  }, [debugLog]);

  useEffect(() => {
    debugLog('UserManagementEnhanced mounted', {
      userEmail: user?.email,
      hasAdminPermission: hasPermission('admin')
    });
    loadRoles();
  }, [debugLog, hasPermission, loadRoles, user?.email]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setPagination(prev => {
      if (prev.skip === 0) {
        return prev;
      }

      return {
        ...prev,
        skip: 0
      };
    });
  }, [filterActive, filterRole, searchTerm]);

  const handleUserAction = async (action: string, userId: number, data?: UpdateUserData) => {
    try {
      setActionLoading(`${action}-${userId}`);
      
      switch (action) {
        case 'activate':
          await apiClient.updateUser(userId, { is_active: true });
          break;
        case 'deactivate':
          await apiClient.updateUser(userId, { is_active: false });
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this user?')) {
            await apiClient.deleteUser(userId);
          } else {
            return;
          }
          break;
        case 'update':
          if (data) {
            await apiClient.updateUser(userId, data);
          }
          break;
        default:
          if (import.meta.env.DEV) {
            console.warn('Unknown action:', action);
          }
      }
      
      await loadUsers();
    } catch (error) {
      console.error(`Action ${action} failed:`, error);
      setError(`Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      setActionLoading('create-user');
      await apiClient.createUser(userData);
      setShowCreateModal(false);
      await loadUsers();
    } catch (error) {
      console.error('Create user failed:', error);
      setError('Failed to create user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.size} users?`)) {
      try {
        setActionLoading('bulk-delete');
        
        await Promise.all(
          Array.from(selectedUsers, userId => apiClient.deleteUser(userId))
        );
        
        setSelectedUsers(new Set());
        await loadUsers();
      } catch (error) {
        console.error('Bulk delete failed:', error);
        setError('Failed to delete some users');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleSelectUser = (userId: number, selected: boolean) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedUsers(new Set(users.map(user => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  if (!hasPermission('user:read') && !user?.is_superuser) {
    debugLog('Access denied - insufficient permissions', {
      user,
      isSuperuser: user?.is_superuser,
      permissions: {
        'user:read': hasPermission('user:read'),
        admin: hasPermission('admin'),
        'user:write': hasPermission('user:write'),
        'user:delete': hasPermission('user:delete')
      }
    });
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        background: '#fef2f2',
        borderRadius: '12px',
        border: '1px solid #fecaca'
      }}>
        <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>
          ⛔ Access Denied
        </h3>
        <p style={{ color: '#7f1d1d' }}>
          You don't have permission to manage users.
        </p>
        <p style={{ color: '#7f1d1d', fontSize: '0.875rem', marginTop: '1rem' }}>
          Required: user:read permission
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{
            margin: '0 0 0.5rem 0',
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Users className="w-6 h-6" />
            User Management
          </h1>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Manage user accounts, roles, and permissions ({users.length} total users)
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Bulk Actions */}
          {selectedUsers.size > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#e0f2fe',
              borderRadius: '8px',
              color: '#0277bd'
            }}>
              <span>{selectedUsers.size} selected</span>
              <button
                onClick={handleBulkDelete}
                disabled={actionLoading === 'bulk-delete'}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Trash2 className="w-3 h-3" />
                {actionLoading === 'bulk-delete' ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setSelectedUsers(new Set())}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                Clear
              </button>
            </div>
          )}
          
          {hasPermission('user:write') && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500'
              }}
            >
              <Plus className="w-4 h-4" />
              Create New User
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: '#f9fafb',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          alignItems: 'end'
        }}>
          <div>
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              color: '#374151',
              fontWeight: '500'
            }}>
              <span>
                <Search className="w-4 h-4 inline mr-2" />
                Search Users
              </span>
              <input
                type="text"
                placeholder="Search by email, username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#111827'
                }}
              />
            </label>
          </div>

          <div>
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              color: '#374151',
              fontWeight: '500'
            }}>
              <span>
                <Filter className="w-4 h-4 inline mr-2" />
                Filter by Role
              </span>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#111827'
                }}
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              color: '#374151',
              fontWeight: '500'
            }}>
              <span>Status</span>
              <select
                value={filterActive === undefined ? '' : filterActive.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterActive(value === '' ? undefined : value === 'true');
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#111827'
                }}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterRole('');
              setFilterActive(undefined);
            }}
            style={{
              padding: '0.75rem 1rem',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}

      {/* Users Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ color: '#6b7280' }}>Loading users...</div>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 style={{ color: '#111827', marginBottom: '0.5rem' }}>No users found</h3>
            <p style={{ color: '#6b7280' }}>
              {searchTerm || filterRole || filterActive !== undefined
                ? 'Try adjusting your filters'
                : 'Get started by creating your first user'
              }
            </p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{
                    background: '#f9fafb',
                    borderBottom: '2px solid #e5e7eb'
                  }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === users.length && users.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      User
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Role</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Created</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user.id}
                      style={{
                        background: index % 2 === 0 ? 'white' : '#f9fafb',
                        borderBottom: '1px solid #e5e7eb'
                      }}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                          />
                          <div>
                            <div style={{ fontWeight: '500', color: '#111827' }}>
                              {user.full_name || user.username || user.email}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          background: user.role.name === 'admin' ? '#e0f2fe' : '#f0f9ff',
                          color: user.role.name === 'admin' ? '#0277bd' : '#0369a1',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}>
                          {user.role.name}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {user.is_active ? (
                            <UserCheck className="w-4 h-4 text-green-600" />
                          ) : (
                            <UserX className="w-4 h-4 text-red-600" />
                          )}
                          <span style={{
                            color: user.is_active ? '#059669' : '#dc2626',
                            fontWeight: '500'
                          }}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            style={{
                              padding: '0.5rem',
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            title="View/Edit User"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          
                          {hasPermission('user:write') && (
                            <>
                              <button
                                onClick={() => handleUserAction(
                                  user.is_active ? 'deactivate' : 'activate',
                                  user.id
                                )}
                                disabled={actionLoading?.includes(user.id.toString())}
                                style={{
                                  padding: '0.5rem',
                                  background: user.is_active ? '#f59e0b' : '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                                title={user.is_active ? 'Deactivate User' : 'Activate User'}
                              >
                                {user.is_active ? (
                                  <UserX className="w-3 h-3" />
                                ) : (
                                  <UserCheck className="w-3 h-3" />
                                )}
                              </button>
                              
                              <button
                                onClick={() => handleUserAction('delete', user.id)}
                                disabled={actionLoading?.includes(user.id.toString())}
                                style={{
                                  padding: '0.5rem',
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                                title="Delete User"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 2rem',
              borderTop: '1px solid #e5e7eb',
              background: '#f9fafb'
            }}>
              <div style={{ color: '#6b7280' }}>
                Showing {pagination.skip + 1} - {Math.min(pagination.skip + pagination.limit, pagination.total)} of {pagination.total}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setPagination(prev => ({
                    ...prev,
                    skip: Math.max(0, prev.skip - prev.limit)
                  }))}
                  disabled={pagination.skip === 0}
                  style={{
                    padding: '0.5rem 1rem',
                    background: pagination.skip === 0 ? '#d1d5db' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: pagination.skip === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({
                    ...prev,
                    skip: prev.skip + prev.limit
                  }))}
                  disabled={!pagination.hasMore}
                  style={{
                    padding: '0.5rem 1rem',
                    background: !pagination.hasMore ? '#d1d5db' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: !pagination.hasMore ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          roles={roles}
          onSave={handleCreateUser}
          onClose={() => setShowCreateModal(false)}
          isLoading={actionLoading === 'create-user'}
        />
      )}

      {/* Edit User Modal */}
      {showUserModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          roles={roles}
          onSave={(data) => {
            handleUserAction('update', selectedUser.id, data);
            setShowUserModal(false);
          }}
          onClose={() => setShowUserModal(false)}
          isLoading={actionLoading?.includes(selectedUser.id.toString()) || false}
        />
      )}
    </div>
  );
};

// Create User Modal Component
const CreateUserModal: React.FC<{
  roles: Role[];
  onSave: (data: CreateUserData) => void;
  onClose: () => void;
  isLoading: boolean;
}> = ({ roles, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    username: '',
    full_name: '',
    role: 'user',
    is_active: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: '#111827' }}>Create New User</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#374151', fontWeight: '500' }}>
              <span>Email *</span>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#111827'
                }}
                required
              />
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#374151', fontWeight: '500' }}>
              <span>Password *</span>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#111827'
                }}
                required
                minLength={8}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#374151', fontWeight: '500' }}>
              <span>Username</span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#111827'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#374151', fontWeight: '500' }}>
              <span>Full Name</span>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#111827'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#374151', fontWeight: '500' }}>
              <span>Role</span>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#111827'
                }}
              >
                {roles.map(role => (
                  <option key={role.id} value={role.name}>
                    {role.name} - {role.description}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#374151',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              />
              Active User
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit User Modal Component
const EditUserModal: React.FC<{
  user: User;
  roles: Role[];
  onSave: (data: UpdateUserData) => void;
  onClose: () => void;
  isLoading: boolean;
}> = ({ user, roles, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState<UpdateUserData>({
    email: user.email,
    username: user.username || '',
    full_name: user.full_name || '',
    role: user.role.name,
    is_active: user.is_active
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: '#111827' }}>Edit User</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#374151', fontWeight: '500' }}>
              <span>Email</span>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#111827'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#374151', fontWeight: '500' }}>
              <span>Username</span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#111827'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#374151', fontWeight: '500' }}>
              <span>Full Name</span>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#111827'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#374151', fontWeight: '500' }}>
              <span>Role</span>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#111827'
                }}
              >
                {roles.map(role => (
                  <option key={role.id} value={role.name}>
                    {role.name} - {role.description}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#374151',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              />
              Active User
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {isLoading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagementEnhanced;
