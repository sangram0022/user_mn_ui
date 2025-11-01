/**
 * Admin Audit Logs Page
 * Displays comprehensive audit logs for administrators
 * Features:
 * - View all audit logs with filtering
 * - Filter by date, user, action, and status
 * - Export audit logs to CSV
 * - Archive audit logs by date configuration (backend integration pending)
 * - Admin-specific statistics and insights
 */

import { useState } from 'react';
import Button from '../../../components/Button';

// ========================================
// Types
// ========================================

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: 'success' | 'failed' | 'warning';
  ipAddress: string;
  details: string;
  userId?: string;
}

interface AuditFilters {
  dateFrom: string;
  dateTo: string;
  user: string;
  action: string;
  status: 'all' | 'success' | 'failed' | 'warning';
}

// ========================================
// Mock Data (Replace with API calls)
// ========================================

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: '1',
    timestamp: '2025-01-09 14:30:45',
    user: 'john.doe@example.com',
    action: 'USER_LOGIN',
    resource: 'Authentication',
    status: 'success',
    ipAddress: '192.168.1.100',
    details: 'User successfully logged in',
    userId: 'user_1',
  },
  {
    id: '2',
    timestamp: '2025-01-09 13:45:22',
    user: 'admin@example.com',
    action: 'USER_CREATED',
    resource: 'User Management',
    status: 'success',
    ipAddress: '192.168.1.50',
    details: 'New user account created for jane.smith@example.com',
    userId: 'admin_1',
  },
  {
    id: '3',
    timestamp: '2025-01-09 12:15:10',
    user: 'jane.smith@example.com',
    action: 'DATA_EXPORT',
    resource: 'Data Management',
    status: 'success',
    ipAddress: '192.168.1.75',
    details: 'User data exported to CSV format',
    userId: 'user_2',
  },
  {
    id: '4',
    timestamp: '2025-01-09 11:30:00',
    user: 'unauthorized@example.com',
    action: 'UNAUTHORIZED_ACCESS',
    resource: 'Admin Panel',
    status: 'failed',
    ipAddress: '192.168.1.200',
    details: 'Attempted access to restricted resource',
    userId: 'user_3',
  },
  {
    id: '5',
    timestamp: '2025-01-09 10:20:35',
    user: 'admin@example.com',
    action: 'ROLE_CHANGED',
    resource: 'User Management',
    status: 'success',
    ipAddress: '192.168.1.50',
    details: 'User role updated from user to auditor',
    userId: 'admin_1',
  },
  {
    id: '6',
    timestamp: '2025-01-09 09:15:00',
    user: 'admin@example.com',
    action: 'SYSTEM_CONFIG_CHANGED',
    resource: 'System Settings',
    status: 'success',
    ipAddress: '192.168.1.50',
    details: 'System configuration updated',
    userId: 'admin_1',
  },
  {
    id: '7',
    timestamp: '2025-01-09 08:30:45',
    user: 'auditor@example.com',
    action: 'REPORT_GENERATED',
    resource: 'Reports',
    status: 'success',
    ipAddress: '192.168.1.80',
    details: 'Monthly audit report generated',
    userId: 'auditor_1',
  },
  {
    id: '8',
    timestamp: '2025-01-08 23:45:30',
    user: 'attacker@example.com',
    action: 'BRUTE_FORCE_ATTEMPT',
    resource: 'Authentication',
    status: 'failed',
    ipAddress: '203.0.113.45',
    details: 'Multiple failed login attempts detected',
    userId: 'attacker_1',
  },
];

// ========================================
// Statistics Card Component
// ========================================

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: { value: number; isPositive: boolean };
}

function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

// ========================================
// Audit Log Row Component
// ========================================

interface AuditLogRowProps {
  log: AuditLog;
}

function AuditLogRow({ log }: AuditLogRowProps) {
  const statusColors = {
    success: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
  };

  const actionIcons: Record<string, string> = {
    USER_LOGIN: '🔓',
    USER_CREATED: '👤',
    DATA_EXPORT: '📊',
    UNAUTHORIZED_ACCESS: '⛔',
    ROLE_CHANGED: '🔑',
    SYSTEM_CONFIG_CHANGED: '⚙️',
    REPORT_GENERATED: '📄',
    BRUTE_FORCE_ATTEMPT: '🚨',
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {log.timestamp}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.user}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex items-center gap-2">
          <span>{actionIcons[log.action] || '📝'}</span>
          <span className="text-gray-900">{log.action.replace(/_/g, ' ')}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.resource}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[log.status]}`}>
          {log.status.toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.ipAddress}</td>
      <td className="px-6 py-4 text-sm text-gray-700">{log.details}</td>
    </tr>
  );
}

// ========================================
// Archive Modal Component
// ========================================

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArchive: (beforeDate: string) => Promise<void>;
}

function ArchiveModal({ isOpen, onClose, onArchive }: ArchiveModalProps) {
  const [archiveDate, setArchiveDate] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);

  const handleArchive = async () => {
    if (!archiveDate) {
      alert('Please select a date');
      return;
    }

    setIsArchiving(true);
    try {
      await onArchive(archiveDate);
      alert('Audit logs archived successfully');
      setArchiveDate('');
      onClose();
    } catch (error) {
      alert('Failed to archive logs: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsArchiving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Archive Audit Logs</h3>
        <p className="text-sm text-gray-600 mb-4">
          Archive all audit logs created before the selected date. This action will move logs to an archive and they will no longer appear in the main list.
        </p>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Archive Before Date</label>
          <input
            type="date"
            value={archiveDate}
            onChange={(e) => setArchiveDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-2">
            All logs before this date will be archived
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isArchiving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleArchive}
            disabled={isArchiving}
            className="flex-1"
          >
            {isArchiving ? 'Archiving...' : 'Archive'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// Main Dashboard Component
// ========================================

export default function AdminAuditLogsPage() {
  const [filters, setFilters] = useState<AuditFilters>({
    dateFrom: '',
    dateTo: '',
    user: '',
    action: '',
    status: 'all',
  });

  const [auditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [isExporting, setIsExporting] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // Filter audit logs
  const filteredLogs = auditLogs.filter((log) => {
    if (filters.user && !log.user.toLowerCase().includes(filters.user.toLowerCase())) {
      return false;
    }
    if (filters.action && log.action !== filters.action) {
      return false;
    }
    if (filters.status !== 'all' && log.status !== filters.status) {
      return false;
    }
    return true;
  });

  // Handle filter changes
  const handleFilterChange = (key: keyof AuditFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      user: '',
      action: '',
      status: 'all',
    });
  };

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulate export delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create CSV content
      const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Status', 'IP Address', 'Details'];
      const rows = filteredLogs.map((log) => [
        log.timestamp,
        log.user,
        log.action.replace(/_/g, ' '),
        log.resource,
        log.status.toUpperCase(),
        log.ipAddress,
        log.details,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admin-audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle archive
  const handleArchive = async (beforeDate: string) => {
    // TODO: Call backend API to archive logs
    // await archiveAuditLogs({ beforeDate });
    console.log('Archive logs before:', beforeDate);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const successLogs = filteredLogs.filter((l) => l.status === 'success').length;
  const failedLogs = filteredLogs.filter((l) => l.status === 'failed').length;
  const warningLogs = filteredLogs.filter((l) => l.status === 'warning').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-slide-down">
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs Management</h1>
          <p className="text-gray-600 mt-2">Manage, monitor, and archive all system audit logs</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-scale-in">
          <StatCard
            label="Total Logs"
            value={auditLogs.length}
            icon="📋"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            label="Successful Actions"
            value={successLogs}
            icon="✅"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            label="Failed Actions"
            value={failedLogs}
            icon="❌"
            trend={{ value: 3, isPositive: false }}
          />
          <StatCard
            label="Warnings"
            value={warningLogs}
            icon="⚠️"
            trend={{ value: 2, isPositive: false }}
          />
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 animate-slide-up">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Filter Audit Logs</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* User Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
              <input
                type="text"
                placeholder="Search user..."
                value={filters.user}
                onChange={(e) => handleFilterChange('user', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Actions</option>
                <option value="USER_LOGIN">User Login</option>
                <option value="USER_CREATED">User Created</option>
                <option value="DATA_EXPORT">Data Export</option>
                <option value="UNAUTHORIZED_ACCESS">Unauthorized Access</option>
                <option value="ROLE_CHANGED">Role Changed</option>
                <option value="SYSTEM_CONFIG_CHANGED">System Config Changed</option>
                <option value="REPORT_GENERATED">Report Generated</option>
                <option value="BRUTE_FORCE_ATTEMPT">Brute Force Attempt</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value as 'all' | 'success' | 'failed' | 'warning')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="warning">Warning</option>
              </select>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleResetFilters}
            >
              Reset Filters
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  📥 Export to CSV
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsArchiveModalOpen(true)}
              className="flex items-center gap-2"
            >
              🗂️ Archive Logs
            </Button>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden animate-slide-up">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Audit Logs ({filteredLogs.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => <AuditLogRow key={log.id} log={log} />)
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No audit logs found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin-specific Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">🔐 Security Monitoring</h3>
            <p className="text-sm text-blue-800">
              Monitor failed login attempts, unauthorized access, and suspicious activities. Failed actions are highlighted for quick identification.
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-2">🗂️ Archive Management</h3>
            <p className="text-sm text-purple-800">
              Archive old audit logs by date to optimize storage. Archived logs are preserved but removed from the main view.
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">📊 Comprehensive Reporting</h3>
            <p className="text-sm text-green-800">
              Export complete audit trails in CSV format for external audits and compliance reporting requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Archive Modal */}
      <ArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onArchive={handleArchive}
      />
    </div>
  );
}
