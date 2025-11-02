/**
 * Auditor Dashboard Page
 * Role-specific dashboard for auditors - REFACTORED for DRY
 * Features:
 * - View audit logs with comprehensive filtering
 * - Filter by date, user, action, and status
 * - Export audit logs to CSV
 * - Audit statistics and metrics
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/Button';
import { AuditStatCard } from '@/shared/components/audit-logs/AuditStatCard';
import { AuditLogRow } from '@/shared/components/audit-logs/AuditLogRow';
import type { AuditLog, AuditFilters } from '@/domains/audit-logs/types/auditLog.types';
import {
  filterAuditLogs,
  getUniqueUsers,
  getUniqueActions,
  sortByTimestamp,
} from '@/shared/utils/audit-logs/auditLogFilters';
import {
  calculateAuditStatistics,
} from '@/shared/utils/audit-logs/auditLogCalculations';
import { exportAuditLogsToCSV, getTimestampForFilename } from '@/shared/utils/csv/csvExporter';
import { ACTION_NAMES } from '@/shared/constants/auditLogConstants';

// Mock Data (Replace with API calls)
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
  },
  {
    id: '2',
    timestamp: '2025-01-09 13:45:22',
    user: 'admin@example.com',
    action: 'USER_CREATED',
    resource: 'User Management',
    status: 'success',
    ipAddress: '192.168.1.50',
    details: 'New user account created',
  },
  {
    id: '3',
    timestamp: '2025-01-09 12:15:10',
    user: 'jane.smith@example.com',
    action: 'DATA_EXPORT',
    resource: 'Data Management',
    status: 'success',
    ipAddress: '192.168.1.75',
    details: 'User data exported to CSV',
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
  },
];

export default function AuditorDashboardPage() {
  useTranslation(); // i18n hook for future localization

  const [filters, setFilters] = useState<AuditFilters>({
    dateFrom: '',
    dateTo: '',
    user: '',
    action: '',
    status: 'all',
  });

  const [auditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [isExporting, setIsExporting] = useState(false);

  // Filter and sort audit logs
  const filteredLogs = sortByTimestamp(filterAuditLogs(auditLogs, filters));
  const stats = calculateAuditStatistics(filteredLogs);

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
      await new Promise((resolve) => setTimeout(resolve, 500));
      const filename = `audit-logs-auditor-${getTimestampForFilename()}.csv`;
      exportAuditLogsToCSV(filteredLogs, filename, filters.dateFrom, filters.dateTo);
    } finally {
      setIsExporting(false);
    }
  };

  const uniqueUsers = getUniqueUsers(auditLogs);
  const uniqueActions = getUniqueActions(auditLogs);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-slide-down">
          <h1 className="text-3xl font-bold text-gray-900">Auditor Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor and review all system activities</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-scale-in">
          <AuditStatCard label="Total Logs" value={stats.totalLogs} color="#08f" icon="📋" />
          <AuditStatCard
            label="Successful"
            value={stats.successCount}
            color="#4a9eff"
            icon="✅"
          />
          <AuditStatCard label="Failed" value={stats.failedCount} color="#ff6b6b" icon="❌" />
          <AuditStatCard label="Warnings" value={stats.warningCount} color="#ffa500" icon="⚠️" />
        </div>

        {/* Filters Section */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            padding: '24px',
            border: '1px solid #e0e0e0',
          }}
          className="animate-slide-up"
        >
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
            Filter Audit Logs
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            {/* Date From */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d0d0d0',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              />
            </div>

            {/* Date To */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d0d0d0',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              />
            </div>

            {/* User Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                User
              </label>
              <select
                value={filters.user}
                onChange={(e) => handleFilterChange('user', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d0d0d0',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              >
                <option value="">All Users</option>
                {uniqueUsers.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                Action
              </label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d0d0d0',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              >
                <option value="">All Actions</option>
                {uniqueActions.map((action) => (
                  <option key={action} value={action}>
                    {ACTION_NAMES[action] || action}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  handleFilterChange('status', e.target.value as 'all' | 'success' | 'failed' | 'warning')
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d0d0d0',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="warning">Warning</option>
              </select>
            </div>
          </div>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button type="button" variant="outline" size="md" onClick={handleResetFilters}>
              Reset Filters
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : '📥 Export to CSV'}
            </Button>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
          }}
          className="animate-slide-up"
        >
          <div style={{ padding: '24px', borderBottom: '1px solid #e0e0e0' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600' }}>
              Audit Logs ({filteredLogs.length})
            </h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>
                    Timestamp
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>
                    User
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>
                    Action
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>
                    Resource
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>
                    IP Address
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600' }}>
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => <AuditLogRow key={log.id} log={log} />)
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#999' }}>
                      No audit logs found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
