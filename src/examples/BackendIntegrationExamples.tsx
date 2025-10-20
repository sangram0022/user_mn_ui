/**
 * Backend Integration Examples
 *
 * This file demonstrates how to use all the newly created backend integration components.
 * Use these examples as reference when integrating into your actual pages.
 *
 * Components demonstrated:
 * 1. Error Mapper Utility
 * 2. User List Filters
 * 3. Audit Log Filters
 * 4. GDPR Data Export
 * 5. GDPR Account Deletion
 * 6. Health Monitoring Dashboard
 */

import { useState } from 'react';
import type { AdminUserListResponse, AuditLogEntry } from '../shared/types/api-backend.types';

// ============================================================================
// Example 1: Using Error Mapper in API Calls
// ============================================================================

import { useToast } from '../hooks/useToast';
import type { ApiErrorResponse } from '../shared/types/api-backend.types';
import { useErrorMapper } from '../shared/utils/errorMapper';

export function ErrorMapperExample() {
  const { showToast } = useToast();
  const { mapApiError, formatErrors, getDisplayMessage } = useErrorMapper();

  const handleLogin = async (_email: string, _password: string) => {
    try {
      // Simulate API call
      throw {
        error_code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
        status_code: 401,
        timestamp: new Date().toISOString(),
        request_id: 'req-123',
      };
    } catch (error) {
      const apiError = error as ApiErrorResponse;

      // Option 1: Simple error message
      const message = mapApiError(apiError);
      showToast(message, 'error');

      // Option 2: With validation errors
      const { message: mainMessage, fieldErrors } = formatErrors(apiError);
      // Log for debugging - remove in production
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('Main message:', mainMessage);
        // eslint-disable-next-line no-console
        console.log('Field errors:', fieldErrors);
      }

      // Option 3: Display message (for toasts)
      const displayMessage = getDisplayMessage(apiError);
      showToast(displayMessage, 'error');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Error Mapper Example</h2>
      <button
        type="button"
        onClick={() => handleLogin('test@example.com', 'wrong')}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Test Error Handling
      </button>
    </div>
  );
}

// ============================================================================
// Example 2: User List with Filters
// ============================================================================

import type { UserFilters } from '../domains/admin/components/UserListFilters';
import { UserListFilters } from '../domains/admin/components/UserListFilters';
import { downloadUsersAsCSV, useUserListFilters } from '../domains/admin/hooks/useUserListFilters';

export function UserListWithFiltersExample() {
  // Mock data - replace with actual API call
  const [users] = useState<AdminUserListResponse[]>([
    {
      user_id: '1',
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'user',
      is_active: true,
      is_verified: true,
      is_approved: true,
      approved_by: 'admin-1',
      approved_at: '2025-01-01T00:00:00Z',
      created_at: '2025-01-01T00:00:00Z',
      last_login_at: '2025-10-20T10:00:00Z',
    },
    {
      user_id: '2',
      email: 'jane@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'admin',
      is_active: true,
      is_verified: true,
      is_approved: true,
      approved_by: 'admin-1',
      approved_at: '2025-01-05T00:00:00Z',
      created_at: '2025-01-05T00:00:00Z',
      last_login_at: '2025-10-20T09:00:00Z',
    },
  ]);

  const [filters, setFilters] = useState<UserFilters>({
    searchText: '',
    role: 'all',
    status: 'all',
    verified: 'all',
    approved: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const { filteredUsers, filteredCount, totalCount } = useUserListFilters({
    users,
    filters,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">User List with Filters Example</h2>

      <UserListFilters
        onFilterChange={setFilters}
        totalCount={totalCount}
        filteredCount={filteredCount}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => downloadUsersAsCSV(filteredUsers)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Export to CSV
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user.user_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {user.first_name} {user.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {user.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      user.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
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
// Example 3: Audit Log with Filters
// ============================================================================

import type { AuditLogFilters as AuditFilters } from '../domains/admin/components/AuditLogFilters';
import { AuditLogFilters } from '../domains/admin/components/AuditLogFilters';
import {
  downloadAuditLogsAsCSV,
  getAuditLogStats,
  useAuditLogFilters,
} from '../domains/admin/hooks/useAuditLogFilters';

export function AuditLogWithFiltersExample() {
  // Mock data - replace with actual API call
  const [logs] = useState<AuditLogEntry[]>([
    {
      audit_id: '1',
      user_id: 'user-1',
      action: 'USER_LOGIN',
      resource_type: 'session',
      resource_id: 'session-1',
      severity: 'info',
      timestamp: '2025-10-20T10:00:00Z',
      metadata: { ip: '192.168.1.1' },
      outcome: 'success',
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0',
    },
    {
      audit_id: '2',
      user_id: 'user-2',
      action: 'USER_LOGIN',
      resource_type: 'session',
      resource_id: 'session-2',
      severity: 'warning',
      timestamp: '2025-10-20T09:30:00Z',
      metadata: { ip: '192.168.1.2' },
      outcome: 'failure',
      ip_address: '192.168.1.2',
      user_agent: 'Mozilla/5.0',
    },
  ]);

  const [filters, setFilters] = useState<AuditFilters>({
    dateFrom: '',
    dateTo: '',
    action: 'all',
    resourceType: 'all',
    severity: 'all',
    outcome: 'all',
    userId: '',
    sortOrder: 'desc',
  });

  const { filteredLogs, filteredCount, totalCount } = useAuditLogFilters({
    logs,
    filters,
  });

  const stats = getAuditLogStats(filteredLogs);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Audit Log with Filters Example</h2>

      <AuditLogFilters
        onFilterChange={setFilters}
        totalCount={totalCount}
        filteredCount={filteredCount}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Logs</span>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
            <p className="text-2xl font-bold text-green-600">{stats.successRate}%</p>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Failures</span>
            <p className="text-2xl font-bold text-red-600">{stats.failureCount}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => downloadAuditLogsAsCSV(filteredLogs, 'audit-logs.csv')}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Export to CSV
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Outcome
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLogs.map((log) => (
              <tr key={log.audit_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {log.action}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      log.severity === 'critical'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : log.severity === 'error'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                          : log.severity === 'warning'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}
                  >
                    {log.severity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      log.outcome === 'success'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}
                  >
                    {log.outcome}
                  </span>
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
// Example 4: GDPR Components
// ============================================================================

import { GDPRAccountDeletion } from '../domains/profile/components/GDPRAccountDeletion';
import { GDPRDataExport } from '../domains/profile/components/GDPRDataExport';

export function GDPRComponentsExample() {
  const handleDeleteSuccess = () => {
    // Account deleted successfully - redirect to home or logout
    window.location.href = '/';
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold">GDPR Components Example</h2>

      <section>
        <h3 className="text-lg font-semibold mb-4">Data Export</h3>
        <GDPRDataExport />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Account Deletion</h3>
        <GDPRAccountDeletion onDeleteSuccess={handleDeleteSuccess} />
      </section>
    </div>
  );
}

// ============================================================================
// Example 5: Health Monitoring Dashboard
// ============================================================================

import { HealthMonitoringDashboard } from '../domains/admin/components/HealthMonitoringDashboard';

export function HealthMonitoringExample() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Health Monitoring Dashboard Example</h2>
      <HealthMonitoringDashboard />
    </div>
  );
}

// ============================================================================
// Complete Integration Example - Full Admin Page
// ============================================================================

export function CompleteAdminPageExample() {
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'health'>('users');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Users
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'audit'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Audit Logs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('health')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'health'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              System Health
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && <UserListWithFiltersExample />}
        {activeTab === 'audit' && <AuditLogWithFiltersExample />}
        {activeTab === 'health' && <HealthMonitoringExample />}
      </div>
    </div>
  );
}

// ============================================================================
// Export All Examples
// ============================================================================

export default function BackendIntegrationExamples() {
  const [activeExample, setActiveExample] = useState<
    'error' | 'users' | 'audit' | 'gdpr' | 'health' | 'complete'
  >('complete');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Backend Integration Examples
        </h1>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveExample('complete')}
            className={`px-4 py-2 rounded ${
              activeExample === 'complete'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Complete Example
          </button>
          <button
            type="button"
            onClick={() => setActiveExample('error')}
            className={`px-4 py-2 rounded ${
              activeExample === 'error'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Error Mapper
          </button>
          <button
            type="button"
            onClick={() => setActiveExample('users')}
            className={`px-4 py-2 rounded ${
              activeExample === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            User Filters
          </button>
          <button
            type="button"
            onClick={() => setActiveExample('audit')}
            className={`px-4 py-2 rounded ${
              activeExample === 'audit'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Audit Filters
          </button>
          <button
            type="button"
            onClick={() => setActiveExample('gdpr')}
            className={`px-4 py-2 rounded ${
              activeExample === 'gdpr'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            GDPR
          </button>
          <button
            type="button"
            onClick={() => setActiveExample('health')}
            className={`px-4 py-2 rounded ${
              activeExample === 'health'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Health Dashboard
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {activeExample === 'complete' && <CompleteAdminPageExample />}
          {activeExample === 'error' && <ErrorMapperExample />}
          {activeExample === 'users' && <UserListWithFiltersExample />}
          {activeExample === 'audit' && <AuditLogWithFiltersExample />}
          {activeExample === 'gdpr' && <GDPRComponentsExample />}
          {activeExample === 'health' && <HealthMonitoringExample />}
        </div>
      </div>
    </div>
  );
}
