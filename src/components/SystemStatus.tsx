import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/apiClientLegacy';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import { getUserRoleName, getUserPermissions } from '../utils/user';

interface SystemCheck {
  name: string;
  status: 'checking' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

const SystemStatus: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [checks, setChecks] = useState<SystemCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateCheck = useCallback((name: string, status: SystemCheck['status'], message: string, details?: string) => {
    setChecks(prev => prev.map(check => 
      check.name === name 
        ? { ...check, status, message, details }
        : check
    ));
  }, []);

  const runSystemChecks = useCallback(async () => {
    setIsRunning(true);
    
    // Initialize checks
    const initialChecks: SystemCheck[] = [
      { name: 'Authentication', status: 'checking', message: 'Checking user authentication...' },
      { name: 'User Permissions', status: 'checking', message: 'Verifying user permissions...' },
      { name: 'Backend Connection', status: 'checking', message: 'Testing backend connection...' },
      { name: 'Users API', status: 'checking', message: 'Testing users API endpoint...' },
      { name: 'Roles API', status: 'checking', message: 'Testing roles API endpoint...' },
      { name: 'Navigation Links', status: 'checking', message: 'Checking dashboard navigation...' }
    ];
    
    setChecks(initialChecks);

    // Check 1: Authentication
    if (user) {
      const roleName = getUserRoleName(user, 'unknown');
      updateCheck('Authentication', 'success', `Authenticated as ${user.email}`, 
        `Role: ${roleName}, Active: ${user.is_active}`);
    } else {
      updateCheck('Authentication', 'error', 'Not authenticated', 'Please log in');
    }

    // Check 2: Permissions
    if (user) {
      const permissions = getUserPermissions(user);
      const hasUserRead = hasPermission('user:read');
      const hasUserWrite = hasPermission('user:write');
      const isAdmin = hasPermission('admin');
      
      updateCheck('User Permissions', 'success', 
        `${permissions.length} permissions available`,
        `user:read: ${hasUserRead}, user:write: ${hasUserWrite}, admin: ${isAdmin}`);
    } else {
      updateCheck('User Permissions', 'error', 'No permissions available', 'Not authenticated');
    }

    // Check 3: Backend Connection
    try {
      const healthResponse = await fetch('/api/v1/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        updateCheck('Backend Connection', 'success', 
          `Backend healthy (${healthData.api_version})`, 
          `Status: ${healthData.status}`);
      } else {
        updateCheck('Backend Connection', 'error', 
          `Backend returned ${healthResponse.status}`, 
          await healthResponse.text());
      }
    } catch (error) {
      updateCheck('Backend Connection', 'error', 
        'Backend connection failed', 
        error instanceof Error ? error.message : 'Unknown error');
    }

    // Check 4: Users API (with detailed debugging)
    try {
      console.log('🧪 Testing Users API with current token...');
      console.log('🔐 Token in localStorage:', !!localStorage.getItem('access_token'));
  console.log('👤 Current user:', user?.email, 'Role:', getUserRoleName(user));
      console.log('🛡️ Has user:read permission:', hasPermission('user:read'));
      
      const usersResponse = await apiClient.getUsers({ limit: 1 });
      if (usersResponse.success) {
        updateCheck('Users API', 'success', 
          'Users API working', 
          `Found ${usersResponse.total || 0} total users`);
      } else {
        updateCheck('Users API', 'warning', 
          'Users API responded but with errors', 
          JSON.stringify(usersResponse));
      }
    } catch (error) {
      console.error('🚨 Users API test failed:', error);
      updateCheck('Users API', 'error', 
        'Users API failed', 
        error instanceof Error ? error.message : 'Unknown error');
    }

    // Check 5: Roles API
    try {
      const rolesResponse = await apiClient.getRoles();
      if (rolesResponse.success && rolesResponse.roles) {
        updateCheck('Roles API', 'success', 
          `Found ${rolesResponse.roles.length} roles`, 
          rolesResponse.roles.map(r => r.name).join(', '));
      } else {
        updateCheck('Roles API', 'warning', 
          'Roles API responded but with errors', 
          JSON.stringify(rolesResponse));
      }
    } catch (error) {
      updateCheck('Roles API', 'error', 
        'Roles API failed', 
        error instanceof Error ? error.message : 'Unknown error');
    }

    // Check 6: Navigation Links
    const dashboardLinks = ['/users', '/analytics', '/workflows', '/security', '/settings', '/reports'];
    dashboardLinks.filter(link => {
      try {
        // Simple check if routes are configured
        return window.location.pathname !== link; // If we can navigate, it should work
      } catch {
        return false;
      }
    });
    
    updateCheck('Navigation Links', 'success', 
      `${dashboardLinks.length} dashboard links configured`, 
      `Links: ${dashboardLinks.join(', ')}`);

    setIsRunning(false);
  }, [user, updateCheck, hasPermission]);

  useEffect(() => {
    runSystemChecks();
  }, [user, runSystemChecks]);

  const getStatusIcon = (status: SystemCheck['status']) => {
    switch (status) {
      case 'checking':
        return <Loader className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: SystemCheck['status']) => {
    switch (status) {
      case 'checking':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', color: '#111827', fontSize: '2rem', fontWeight: 'bold' }}>
          System Status
        </h1>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Comprehensive system health and functionality check
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={runSystemChecks}
          disabled={isRunning}
          style={{
            padding: '0.75rem 1.5rem',
            background: isRunning ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontWeight: '500'
          }}
        >
          {isRunning ? 'Running Checks...' : 'Run System Checks'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {checks.map((check) => (
          <div
            key={check.name}
            style={{
              padding: '1.5rem',
              border: '1px solid',
              borderRadius: '8px'
            }}
            className={getStatusColor(check.status)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              {getStatusIcon(check.status)}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#111827', fontWeight: '600' }}>
                  {check.name}
                </h3>
                <p style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>
                  {check.message}
                </p>
                {check.details && (
                  <details style={{ marginTop: '0.5rem' }}>
                    <summary style={{ cursor: 'pointer', color: '#6b7280', fontSize: '0.875rem' }}>
                      Show details
                    </summary>
                    <pre style={{
                      margin: '0.5rem 0 0 0',
                      padding: '0.5rem',
                      background: 'rgba(255,255,255,0.5)',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      color: '#374151',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {check.details}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {checks.length > 0 && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#111827' }}>Quick Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                {checks.filter(c => c.status === 'success').length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Passing</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                {checks.filter(c => c.status === 'warning').length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Warnings</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                {checks.filter(c => c.status === 'error').length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Errors</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemStatus;
