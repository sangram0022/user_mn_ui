import React, { useState, useEffect, useContext } from 'react';
import { auditLogger, type AuditEvent, type AuditSummary } from '../security/auditLogger';
import { rbacPerformanceMonitor } from '../analytics/performanceMonitor';
import { RbacContext } from '../context/RbacContext';
import { RbacTestInterface } from '../testing/RbacTestInterface';
import './AdminDashboard.css';

// ============================================================================
// ADMIN DASHBOARD TYPES
// ============================================================================

interface UserManagement {
  id: string;
  email: string;
  role: string;
  lastActive: number;
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
}

interface RoleManagement {
  name: string;
  permissions: string[];
  userCount: number;
  description: string;
  canModify: boolean;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  securityAlerts: number;
  performanceScore: number;
  lastChecked: number;
}

// ============================================================================
// ADMIN DASHBOARD COMPONENT
// ============================================================================

export function AdminDashboard(): React.JSX.Element {
  const rbacContext = useContext(RbacContext);
  const userRole = rbacContext.userRoles[0] || 'user'; // Get first role
  const hasPermission = rbacContext.hasPermission;
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'roles' | 'audit' | 'security' | 'testing'>('overview');
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<AuditEvent[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);

  // Check admin permissions
  const isAdmin = userRole === 'admin' || hasPermission('admin_dashboard');

  useEffect(() => {
    if (!isAdmin) return;

    // Load audit summary
    const summary = auditLogger.getSummary(24);
    setAuditSummary(summary);

    // Load security alerts
    const alerts = auditLogger.getSecurityAlerts(24);
    setSecurityAlerts(alerts);

    // Generate system health
    const health: SystemHealth = {
      status: alerts.length > 10 ? 'critical' : alerts.length > 5 ? 'warning' : 'healthy',
      uptime: Date.now() - (7 * 24 * 60 * 60 * 1000), // Mock 7 days uptime
      totalUsers: 150, // Mock data
      activeUsers: 42,
      totalRoles: 5,
      securityAlerts: alerts.length,
      performanceScore: 95,
      lastChecked: Date.now()
    };
    setSystemHealth(health);

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      const newSummary = auditLogger.getSummary(24);
      setAuditSummary(newSummary);
      
      const newAlerts = auditLogger.getSecurityAlerts(24);
      setSecurityAlerts(newAlerts);
    }, 30000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <h2>Access Denied</h2>
        <p>You do not have permission to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>RBAC Admin Dashboard</h1>
        <div className="admin-nav">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={activeTab === 'roles' ? 'active' : ''}
            onClick={() => setActiveTab('roles')}
          >
            Roles
          </button>
          <button 
            className={activeTab === 'audit' ? 'active' : ''}
            onClick={() => setActiveTab('audit')}
          >
            Audit Log
          </button>
          <button 
            className={activeTab === 'security' ? 'active' : ''}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button 
            className={activeTab === 'testing' ? 'active' : ''}
            onClick={() => setActiveTab('testing')}
          >
            Testing
          </button>
        </div>
      </header>

      <main className="admin-content">
        {activeTab === 'overview' && (
          <OverviewTab 
            auditSummary={auditSummary}
            systemHealth={systemHealth}
            securityAlerts={securityAlerts}
          />
        )}
        {activeTab === 'users' && <UserManagementTab />}
        {activeTab === 'roles' && <RoleManagementTab />}
        {activeTab === 'audit' && <AuditLogTab />}
        {activeTab === 'security' && <SecurityTab securityAlerts={securityAlerts} />}
        {activeTab === 'testing' && <TestingTab />}
      </main>
    </div>
  );
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================

function OverviewTab({ 
  auditSummary, 
  systemHealth, 
  securityAlerts 
}: {
  auditSummary: AuditSummary | null;
  systemHealth: SystemHealth | null;
  securityAlerts: AuditEvent[];
}): React.JSX.Element {
  return (
    <div className="overview-tab">
      <div className="metrics-grid">
        {/* System Health Card */}
        <div className="metric-card system-health">
          <h3>System Health</h3>
          {systemHealth && (
            <div className={`health-status ${systemHealth.status}`}>
              <div className="status-indicator"></div>
              <span>{systemHealth.status.toUpperCase()}</span>
            </div>
          )}
          <div className="health-metrics">
            <div>Active Users: {systemHealth?.activeUsers || 0}</div>
            <div>Performance: {systemHealth?.performanceScore || 0}%</div>
            <div>Uptime: {systemHealth ? Math.floor((Date.now() - systemHealth.uptime) / (24 * 60 * 60 * 1000)) : 0} days</div>
          </div>
        </div>

        {/* Audit Summary Card */}
        <div className="metric-card audit-summary">
          <h3>24h Activity Summary</h3>
          {auditSummary && (
            <div className="audit-metrics">
              <div className="metric">
                <span className="value">{auditSummary.totalEvents}</span>
                <span className="label">Total Events</span>
              </div>
              <div className="metric">
                <span className="value">{auditSummary.uniqueUsers}</span>
                <span className="label">Active Users</span>
              </div>
              <div className="metric">
                <span className="value">{auditSummary.criticalEvents}</span>
                <span className="label">Critical Events</span>
              </div>
            </div>
          )}
        </div>

        {/* Security Alerts Card */}
        <div className="metric-card security-alerts">
          <h3>Security Alerts</h3>
          <div className="alerts-count">
            <span className="count">{securityAlerts.length}</span>
            <span className="label">Active Alerts</span>
          </div>
          <div className="recent-alerts">
            {securityAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="alert-item">
                <span className={`severity ${alert.securityLevel}`}>
                  {alert.securityLevel}
                </span>
                <span className="action">{alert.action}</span>
                <span className="time">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics Card */}
        <div className="metric-card performance">
          <h3>Performance Metrics</h3>
          <PerformanceMetricsWidget />
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <RecentActivityTimeline />
      </div>
    </div>
  );
}

// ============================================================================
// USER MANAGEMENT TAB
// ============================================================================

function UserManagementTab(): React.JSX.Element {
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserManagement | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    // Mock user data - in real app, fetch from API
    const mockUsers: UserManagement[] = [
      {
        id: '1',
        email: 'admin@example.com',
        role: 'admin',
        lastActive: Date.now() - 30000,
        permissions: ['admin_dashboard', 'user_management', 'role_management'],
        status: 'active'
      },
      {
        id: '2',
        email: 'user@example.com',
        role: 'user',
        lastActive: Date.now() - 300000,
        permissions: ['read_profile', 'update_profile'],
        status: 'active'
      },
      {
        id: '3',
        email: 'editor@example.com',
        role: 'editor',
        lastActive: Date.now() - 600000,
        permissions: ['read_content', 'write_content', 'edit_content'],
        status: 'active'
      }
    ];
    setUsers(mockUsers);
  }, []);

  const handleEditUser = (user: UserManagement) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleSuspendUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'suspended' ? 'active' : 'suspended' as const }
        : user
    ));
  };

  return (
    <div className="user-management-tab">
      <div className="tab-header">
        <h2>User Management</h2>
        <button className="primary-button" onClick={() => setShowUserModal(true)}>
          Add New User
        </button>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Active</th>
              <th>Permissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    {user.status}
                  </span>
                </td>
                <td>{new Date(user.lastActive).toLocaleString()}</td>
                <td>
                  <div className="permissions-list">
                    {user.permissions.slice(0, 2).map(perm => (
                      <span key={perm} className="permission-tag">{perm}</span>
                    ))}
                    {user.permissions.length > 2 && (
                      <span className="more-permissions">
                        +{user.permissions.length - 2} more
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="edit-button"
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </button>
                    <button 
                      className={user.status === 'suspended' ? 'activate-button' : 'suspend-button'}
                      onClick={() => handleSuspendUser(user.id)}
                    >
                      {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showUserModal && (
        <UserEditModal 
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          onSave={(updatedUser) => {
            if (selectedUser) {
              setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
            } else {
              setUsers(prev => [...prev, { ...updatedUser, id: Date.now().toString() }]);
            }
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// ROLE MANAGEMENT TAB
// ============================================================================

function RoleManagementTab(): React.JSX.Element {
  const [roles, setRoles] = useState<RoleManagement[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleManagement | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    // Mock role data
    const mockRoles: RoleManagement[] = [
      {
        name: 'admin',
        permissions: ['admin_dashboard', 'user_management', 'role_management', 'system_config'],
        userCount: 2,
        description: 'Full system administrator access',
        canModify: false
      },
      {
        name: 'editor',
        permissions: ['read_content', 'write_content', 'edit_content', 'publish_content'],
        userCount: 5,
        description: 'Content creation and editing',
        canModify: true
      },
      {
        name: 'user',
        permissions: ['read_profile', 'update_profile', 'read_content'],
        userCount: 143,
        description: 'Standard user access',
        canModify: true
      }
    ];
    setRoles(mockRoles);
  }, []);

  return (
    <div className="role-management-tab">
      <div className="tab-header">
        <h2>Role Management</h2>
        <button className="primary-button" onClick={() => setShowRoleModal(true)}>
          Create New Role
        </button>
      </div>

      <div className="roles-grid">
        {roles.map(role => (
          <div key={role.name} className="role-card">
            <div className="role-header">
              <h3>{role.name}</h3>
              <span className="user-count">{role.userCount} users</span>
            </div>
            <p className="role-description">{role.description}</p>
            <div className="role-permissions">
              <h4>Permissions:</h4>
              <div className="permission-tags">
                {role.permissions.map(permission => (
                  <span key={permission} className="permission-tag">
                    {permission}
                  </span>
                ))}
              </div>
            </div>
            <div className="role-actions">
              <button 
                className="edit-button"
                onClick={() => {
                  setSelectedRole(role);
                  setShowRoleModal(true);
                }}
                disabled={!role.canModify}
              >
                Edit
              </button>
              {role.canModify && (
                <button className="delete-button">
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showRoleModal && (
        <RoleEditModal 
          role={selectedRole}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedRole(null);
          }}
          onSave={(updatedRole) => {
            if (selectedRole) {
              setRoles(prev => prev.map(r => r.name === updatedRole.name ? updatedRole : r));
            } else {
              setRoles(prev => [...prev, updatedRole]);
            }
            setShowRoleModal(false);
            setSelectedRole(null);
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// AUDIT LOG TAB
// ============================================================================

function AuditLogTab(): React.JSX.Element {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [filters, setFilters] = useState({
    userId: '',
    role: '',
    action: '',
    result: '' as '' | 'success' | 'failure' | 'blocked',
    securityLevel: '' as '' | 'low' | 'medium' | 'high' | 'critical'
  });

  useEffect(() => {
    const events = auditLogger.query({
      limit: 100,
      ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''))
    });
    setAuditEvents(events);
  }, [filters]);

  const exportAuditLog = (format: 'json' | 'csv') => {
    const data = auditLogger.exportLog(format, {
      ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''))
    });
    
    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="audit-log-tab">
      <div className="tab-header">
        <h2>Audit Log</h2>
        <div className="export-buttons">
          <button onClick={() => exportAuditLog('json')}>Export JSON</button>
          <button onClick={() => exportAuditLog('csv')}>Export CSV</button>
        </div>
      </div>

      <div className="audit-filters">
        <input
          type="text"
          placeholder="User ID"
          value={filters.userId}
          onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Role"
          value={filters.role}
          onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
        />
        <input
          type="text"
          placeholder="Action"
          value={filters.action}
          onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
        />
        <select
          value={filters.result}
          onChange={(e) => setFilters(prev => ({ ...prev, result: e.target.value as '' | 'success' | 'failure' | 'blocked' }))}
        >
          <option value="">All Results</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
          <option value="blocked">Blocked</option>
        </select>
        <select
          value={filters.securityLevel}
          onChange={(e) => setFilters(prev => ({ ...prev, securityLevel: e.target.value as '' | 'low' | 'medium' | 'high' | 'critical' }))}
        >
          <option value="">All Levels</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="audit-table">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Role</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Result</th>
              <th>Security Level</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {auditEvents.map(event => (
              <tr key={event.id}>
                <td>{new Date(event.timestamp).toLocaleString()}</td>
                <td>{event.userId}</td>
                <td>
                  <span className={`role-badge ${event.role}`}>
                    {event.role}
                  </span>
                </td>
                <td>{event.action}</td>
                <td>{event.resource}</td>
                <td>
                  <span className={`result-badge ${event.result}`}>
                    {event.result}
                  </span>
                </td>
                <td>
                  <span className={`security-badge ${event.securityLevel}`}>
                    {event.securityLevel}
                  </span>
                </td>
                <td>
                  <details>
                    <summary>View</summary>
                    <pre>{JSON.stringify(event.details, null, 2)}</pre>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// SECURITY TAB
// ============================================================================

function SecurityTab({ securityAlerts }: { securityAlerts: AuditEvent[] }): React.JSX.Element {
  const [alertFilter, setAlertFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');

  const filteredAlerts = securityAlerts.filter(alert => {
    if (alertFilter === 'all') return true;
    return alert.securityLevel === alertFilter;
  });

  return (
    <div className="security-tab">
      <div className="tab-header">
        <h2>Security Dashboard</h2>
        <div className="security-filters">
          <select 
            value={alertFilter} 
            onChange={(e) => setAlertFilter(e.target.value as 'all' | 'critical' | 'high' | 'medium')}
          >
            <option value="all">All Alerts</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as '1h' | '6h' | '24h' | '7d')}
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>
      </div>

      <div className="security-overview">
        <div className="security-metrics">
          <div className="metric-card critical">
            <h3>Critical Alerts</h3>
            <span className="count">{securityAlerts.filter(a => a.securityLevel === 'critical').length}</span>
          </div>
          <div className="metric-card high">
            <h3>High Priority</h3>
            <span className="count">{securityAlerts.filter(a => a.securityLevel === 'high').length}</span>
          </div>
          <div className="metric-card blocked">
            <h3>Blocked Actions</h3>
            <span className="count">{securityAlerts.filter(a => a.result === 'blocked').length}</span>
          </div>
          <div className="metric-card failed">
            <h3>Failed Attempts</h3>
            <span className="count">{securityAlerts.filter(a => a.result === 'failure').length}</span>
          </div>
        </div>
      </div>

      <div className="security-alerts-list">
        <h3>Security Alerts</h3>
        {filteredAlerts.length === 0 ? (
          <div className="no-alerts">
            <p>No security alerts found for the selected filters.</p>
          </div>
        ) : (
          <div className="alerts-table">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Severity</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Result</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map(alert => (
                  <tr key={alert.id} className={`alert-row ${alert.securityLevel}`}>
                    <td>{new Date(alert.timestamp).toLocaleString()}</td>
                    <td>
                      <span className={`severity-badge ${alert.securityLevel}`}>
                        {alert.securityLevel.toUpperCase()}
                      </span>
                    </td>
                    <td>{alert.userId}</td>
                    <td>{alert.action}</td>
                    <td>
                      <span className={`result-badge ${alert.result}`}>
                        {alert.result}
                      </span>
                    </td>
                    <td>
                      <details>
                        <summary>View Details</summary>
                        <div className="alert-details">
                          <p><strong>Resource:</strong> {alert.resource}</p>
                          <p><strong>Role:</strong> {alert.role}</p>
                          {alert.ipAddress && <p><strong>IP:</strong> {alert.ipAddress}</p>}
                          {alert.sessionId && <p><strong>Session:</strong> {alert.sessionId}</p>}
                          <pre>{JSON.stringify(alert.details, null, 2)}</pre>
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function PerformanceMetricsWidget(): React.JSX.Element {
  const [metrics, setMetrics] = useState({
    averageResponseTime: 0,
    operationsPerSecond: 0,
    errorRate: 0,
    cacheHitRate: 0
  });

  useEffect(() => {
    const updateMetrics = () => {
      // Mock performance metrics since getStats doesn't exist yet
      const slowestOps = rbacPerformanceMonitor.getSlowestOperations(10);
      const avgResponseTime = slowestOps.length > 0 
        ? slowestOps.reduce((sum: number, op) => sum + op.duration, 0) / slowestOps.length 
        : 0;
      
      setMetrics({
        averageResponseTime: avgResponseTime,
        operationsPerSecond: Math.floor(Math.random() * 50) + 10, // Mock data
        errorRate: Math.random() * 5, // Mock error rate 0-5%
        cacheHitRate: 95 // Mock cache hit rate
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="performance-metrics">
      <div className="metric">
        <span className="value">{metrics.averageResponseTime.toFixed(2)}ms</span>
        <span className="label">Avg Response Time</span>
      </div>
      <div className="metric">
        <span className="value">{metrics.operationsPerSecond}</span>
        <span className="label">Ops/sec</span>
      </div>
      <div className="metric">
        <span className="value">{metrics.errorRate.toFixed(1)}%</span>
        <span className="label">Error Rate</span>
      </div>
      <div className="metric">
        <span className="value">{metrics.cacheHitRate}%</span>
        <span className="label">Cache Hit Rate</span>
      </div>
    </div>
  );
}

function RecentActivityTimeline(): React.JSX.Element {
  const [recentEvents, setRecentEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    const events = auditLogger.query({ limit: 10 });
    setRecentEvents(events);
  }, []);

  return (
    <div className="activity-timeline">
      {recentEvents.map(event => (
        <div key={event.id} className="timeline-item">
          <div className="timeline-marker"></div>
          <div className="timeline-content">
            <div className="timeline-header">
              <span className="user">{event.userId}</span>
              <span className="action">{event.action}</span>
              <span className="time">{new Date(event.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="timeline-details">
              {event.resource} - {event.result}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// TESTING TAB
// ============================================================================

function TestingTab(): React.JSX.Element {
  return (
    <div className="testing-tab">
      <div className="tab-header">
        <h2>RBAC System Testing</h2>
        <p>Comprehensive testing interface for validating RBAC functionality, performance, and security.</p>
      </div>
      
      <div className="testing-interface-container">
        <RbacTestInterface />
      </div>
    </div>
  );
}

// Mock modal components (would be implemented separately)
function UserEditModal({ 
  user, 
  onClose, 
  onSave 
}: { 
  user: UserManagement | null; 
  onClose: () => void; 
  onSave: (user: UserManagement) => void; 
}): React.JSX.Element {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{user ? 'Edit User' : 'Add New User'}</h2>
        <p>User edit modal would be implemented here</p>
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={() => onSave(user!)}>Save</button>
        </div>
      </div>
    </div>
  );
}

function RoleEditModal({ 
  role, 
  onClose, 
  onSave 
}: { 
  role: RoleManagement | null; 
  onClose: () => void; 
  onSave: (role: RoleManagement) => void; 
}): React.JSX.Element {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{role ? 'Edit Role' : 'Create New Role'}</h2>
        <p>Role edit modal would be implemented here</p>
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={() => onSave(role!)}>Save</button>
        </div>
      </div>
    </div>
  );
}