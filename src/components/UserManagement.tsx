import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/apiClientLegacy';
import { Plus, Trash2, Users } from 'lucide-react';

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

interface UpdateUserData {
  email?: string;
  username?: string;
  full_name?: string;
  role?: string;
  is_active?: boolean;
}

const UserManagement: React.FC = () => {
  const { hasPermission } = useAuth();
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Bulk operations state
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadUsers();
    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterRole, filterActive, pagination.skip]);

  const loadUsers = useCallback(async () => {
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

      const response = await apiClient.getUsers(params);
      
      if (response.success) {
        setUsers(response.users || []);
        setPagination(prev => ({
          ...prev,
          total: response.total || 0,
          hasMore: response.page_info?.has_more || false
        }));
      } else {
        throw new Error('Failed to load users');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to load users: ${errorMessage}`);
      console.error('Load users error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.skip, pagination.limit, searchTerm, filterRole, filterActive]);

  const loadRoles = async () => {
    try {
      // This would call /roles endpoint if it exists in your backend
      // For now, we'll use mock data based on common roles
      setRoles([
        { id: 1, name: 'admin', description: 'Administrator' },
        { id: 2, name: 'user', description: 'Standard User' },
        { id: 3, name: 'manager', description: 'Manager' }
      ]);
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
  };

  const handleUserAction = async (action: string, userId: number, data?: UpdateUserData) => {
    try {
      setActionLoading(`${action}-${userId}`);
      
      switch (action) {
        case 'activate':
        case 'deactivate':
          await apiClient.updateUser(userId, { 
            is_active: action === 'activate' 
          });
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
        
        case 'initiate-lifecycle':
          await apiClient.initiateUserLifecycle({ 
            user_ids: [userId],
            trigger_event: 'manual'
          });
          break;
      }
      
      await loadUsers(); // Refresh the list
      setShowUserModal(false);
      setSelectedUser(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to ${action} user: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    setPagination(prev => ({
      ...prev,
      skip: direction === 'next' 
        ? prev.skip + prev.limit 
        : Math.max(0, prev.skip - prev.limit)
    }));
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedUsers.size} selected users?`)) {
      return;
    }

    try {
      // Bulk delete logic would go here
      console.log('Deleting users:', Array.from(selectedUsers));
      
      // For now, just clear the selection
      setSelectedUsers(new Set());
      
      // Reload users
      // Note: loadUsers function would need to be defined
    } catch (error) {
      console.error('Error deleting users:', error);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterRole('');
    setFilterActive(undefined);
    setPagination(prev => ({ ...prev, skip: 0 }));
  };

  if (!hasPermission('user:read')) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        background: 'var(--background-secondary)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
          ⛔ Access Denied
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          You don't have permission to manage users.
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
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Users className="w-6 h-6" />
            User Management
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
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
                onClick={() => handleBulkDelete()}
                style={{
                  padding: '0.25rem 0.5rem',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                <Trash2 className="w-3 h-3" />
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
              onClick={() => {
                setSelectedUser(null);
                setShowUserModal(true);
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--primary-color)',
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
        background: 'var(--background-secondary)',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              color: 'var(--text-primary)',
              fontWeight: '500'
            }}>
              <span>Search Users</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by email or name..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  background: 'var(--background-primary)',
                  color: 'var(--text-primary)'
                }}
              />
            </label>
          </div>

          <div>
            <label style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              color: 'var(--text-primary)',
              fontWeight: '500'
            }}>
              <span>Filter by Role</span>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  background: 'var(--background-primary)',
                  color: 'var(--text-primary)'
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
              color: 'var(--text-primary)',
              fontWeight: '500'
            }}>
              <span>Filter by Status</span>
              <select
                value={filterActive === undefined ? '' : filterActive.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterActive(value === '' ? undefined : value === 'true');
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  background: 'var(--background-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={loadUsers}
              style={{
                padding: '0.75rem 1rem',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🔍 Search
            </button>
            <button
              onClick={resetFilters}
              style={{
                padding: '0.75rem 1rem',
                background: 'var(--text-light)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          color: '#dc2626'
        }}>
          {error}
        </div>
      )}

      {/* Users Table */}
      <div style={{
        background: 'var(--background-secondary)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <div style={{ color: 'var(--text-secondary)' }}>Loading users...</div>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
              No Users Found
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              {searchTerm || filterRole || filterActive !== undefined
                ? 'Try adjusting your filters'
                : 'No users have been created yet'
              }
            </p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{
                    background: 'var(--background-primary)',
                    borderBottom: '2px solid var(--border-color)'
                  }}>
                    <th style={tableHeaderStyle}>User</th>
                    <th style={tableHeaderStyle}>Role</th>
                    <th style={tableHeaderStyle}>Status</th>
                    <th style={tableHeaderStyle}>Lifecycle</th>
                    <th style={tableHeaderStyle}>Activity</th>
                    <th style={tableHeaderStyle}>Created</th>
                    <th style={tableHeaderStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      index={index}
                      onAction={handleUserAction}
                      hasWritePermission={hasPermission('user:write')}
                      actionLoading={actionLoading}
                      onEdit={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                    />
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
              borderTop: '1px solid var(--border-color)',
              background: 'var(--background-primary)'
            }}>
              <div style={{ color: 'var(--text-secondary)' }}>
                Showing {pagination.skip + 1} - {Math.min(pagination.skip + pagination.limit, pagination.total)} of {pagination.total}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handlePageChange('prev')}
                  disabled={pagination.skip === 0}
                  style={{
                    padding: '0.5rem 1rem',
                    background: pagination.skip === 0 ? 'var(--text-light)' : 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: pagination.skip === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange('next')}
                  disabled={!pagination.hasMore}
                  style={{
                    padding: '0.5rem 1rem',
                    background: !pagination.hasMore ? 'var(--text-light)' : 'var(--primary-color)',
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

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={selectedUser}
          roles={roles}
          onSave={(userData) => {
            if (selectedUser) {
              handleUserAction('update', selectedUser.id, userData);
            } else {
              // Handle create user
              alert('Create user functionality would be implemented here');
            }
          }}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

// Styles
const tableHeaderStyle: React.CSSProperties = {
  padding: '1rem',
  textAlign: 'left',
  fontWeight: '600',
  color: 'var(--text-primary)',
  fontSize: '0.9rem'
};

// User Row Component
const UserRow: React.FC<{
  user: User;
  index: number;
  onAction: (action: string, userId: number) => void;
  hasWritePermission: boolean;
  actionLoading: string | null;
  onEdit: () => void;
}> = ({ user, index, onAction, hasWritePermission, actionLoading, onEdit }) => {
  const isLoading = (action: string) => actionLoading === `${action}-${user.id}`;

  return (
    <tr style={{
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: index % 2 === 0 ? 'var(--background-secondary)' : 'var(--background-primary)'
    }}>
      <td style={{ padding: '1rem' }}>
        <div>
          <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
            {user.full_name || user.username || 'No name'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {user.email}
          </div>
        </div>
      </td>
      
      <td style={{ padding: '1rem' }}>
        <span style={{
          padding: '0.25rem 0.75rem',
          background: user.role.name === 'admin' ? '#fef3c7' : '#dbeafe',
          color: user.role.name === 'admin' ? '#92400e' : '#1e40af',
          borderRadius: '16px',
          fontSize: '0.85rem',
          fontWeight: '500',
          textTransform: 'capitalize'
        }}>
          {user.role.name}
        </span>
      </td>
      
      <td style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: user.is_active ? '#10b981' : '#ef4444'
          }} />
          <span style={{ 
            color: user.is_active ? '#10b981' : '#ef4444',
            fontSize: '0.85rem',
            fontWeight: '500'
          }}>
            {user.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </td>
      
      <td style={{ padding: '1rem' }}>
        <span style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          textTransform: 'capitalize'
        }}>
          {user.lifecycle_stage || 'active'}
        </span>
      </td>
      
      <td style={{ padding: '1rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {user.activity_score || 0}
        </span>
      </td>
      
      <td style={{ padding: '1rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {new Date(user.created_at).toLocaleDateString()}
        </span>
      </td>
      
      <td style={{ padding: '1rem' }}>
        {hasWritePermission && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onEdit}
              disabled={isLoading('update')}
              style={{
                padding: '0.25rem 0.5rem',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              Edit
            </button>
            
            <button
              onClick={() => onAction(user.is_active ? 'deactivate' : 'activate', user.id)}
              disabled={isLoading('activate') || isLoading('deactivate')}
              style={{
                padding: '0.25rem 0.5rem',
                background: user.is_active ? '#ef4444' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              {user.is_active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

// User Modal Component
const UserModal: React.FC<{
  user: User | null;
  roles: Role[];
  onSave: (data: UpdateUserData) => void;
  onClose: () => void;
}> = ({ user, roles, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    email: user?.email || '',
    role_id: user?.role?.id || roles[0]?.id || 1,
    is_active: user?.is_active ?? true
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
        background: 'var(--background-secondary)',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{
          margin: '0 0 1.5rem 0',
          color: 'var(--text-primary)'
        }}>
          {user ? 'Edit User' : 'Add User'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              color: 'var(--text-primary)',
              fontWeight: '500'
            }}>
              <span>Full Name</span>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  background: 'var(--background-primary)',
                  color: 'var(--text-primary)'
                }}
                required
              />
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              color: 'var(--text-primary)',
              fontWeight: '500'
            }}>
              <span>Username</span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  background: 'var(--background-primary)',
                  color: 'var(--text-primary)'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              color: 'var(--text-primary)',
              fontWeight: '500'
            }}>
              <span>Email</span>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  background: 'var(--background-primary)',
                  color: 'var(--text-primary)'
                }}
                required
              />
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              color: 'var(--text-primary)',
              fontWeight: '500'
            }}>
              <span>Role</span>
              <select
                value={formData.role_id}
                onChange={(e) => setFormData(prev => ({ ...prev, role_id: parseInt(e.target.value) }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  background: 'var(--background-primary)',
                  color: 'var(--text-primary)'
                }}
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
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
              color: 'var(--text-primary)',
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

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--text-light)',
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
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {user ? 'Update' : 'Create'} User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;
