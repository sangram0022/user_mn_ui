import { useState } from 'react';
import Button from '../../../shared/components/ui/Button';
import Badge from '../../../shared/components/ui/Badge';

type ReportType = 'users' | 'activity' | 'security' | 'performance';
type ReportStatus = 'completed' | 'pending' | 'failed';

interface DummyReport {
  id: string;
  name: string;
  type: ReportType;
  status: ReportStatus;
  generated_at: string;
  file_size: string;
  duration: string;
}

const DUMMY_REPORTS: DummyReport[] = [
  {
    id: '1',
    name: 'User Activity Report - Q1 2025',
    type: 'activity',
    status: 'completed',
    generated_at: '2025-01-15T10:30:00Z',
    file_size: '2.4 MB',
    duration: '45s',
  },
  {
    id: '2',
    name: 'Security Audit Report - January',
    type: 'security',
    status: 'completed',
    generated_at: '2025-01-10T14:20:00Z',
    file_size: '1.8 MB',
    duration: '32s',
  },
  {
    id: '3',
    name: 'User Registration Report',
    type: 'users',
    status: 'pending',
    generated_at: '2025-01-20T09:00:00Z',
    file_size: '-',
    duration: '-',
  },
  {
    id: '4',
    name: 'Performance Metrics - December',
    type: 'performance',
    status: 'completed',
    generated_at: '2025-01-05T16:45:00Z',
    file_size: '3.1 MB',
    duration: '58s',
  },
  {
    id: '5',
    name: 'Failed Login Attempts Report',
    type: 'security',
    status: 'failed',
    generated_at: '2025-01-18T11:15:00Z',
    file_size: '-',
    duration: '-',
  },
];

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState<ReportType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'all'>('all');

  // Filter reports
  let filteredReports = DUMMY_REPORTS;
  if (selectedType !== 'all') {
    filteredReports = filteredReports.filter((r) => r.type === selectedType);
  }
  if (selectedStatus !== 'all') {
    filteredReports = filteredReports.filter((r) => r.status === selectedStatus);
  }

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'failed':
        return <Badge variant="danger">Failed</Badge>;
    }
  };

  const getTypeBadge = (type: ReportType) => {
    const colors = {
      users: 'info',
      activity: 'success',
      security: 'danger',
      performance: 'warning',
    } as const;
    return <Badge variant={colors[type]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="mt-1 text-sm text-gray-600">
            Generate and manage system reports ({filteredReports.length} reports)
          </p>
        </div>
        <Button variant="primary" onClick={() => alert('Report generation coming soon!')}>
          + Generate Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{DUMMY_REPORTS.length}</p>
            </div>
            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {DUMMY_REPORTS.filter((r) => r.status === 'completed').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-green-600">✓</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {DUMMY_REPORTS.filter((r) => r.status === 'pending').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-yellow-600">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {DUMMY_REPORTS.filter((r) => r.status === 'failed').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-red-600">⚠️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ReportType | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="users">Users</option>
              <option value="activity">Activity</option>
              <option value="security">Security</option>
              <option value="performance">Performance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ReportStatus | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Generated At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{report.name}</div>
                    <div className="text-xs text-gray-500">ID: {report.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getTypeBadge(report.type)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(report.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(report.generated_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(report.generated_at).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.file_size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {report.status === 'completed' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => alert('Download feature coming soon!')}
                        >
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => alert('View feature coming soon!')}
                        >
                          View
                        </Button>
                      </>
                    )}
                    {report.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert('Cancel feature coming soon!')}
                      >
                        Cancel
                      </Button>
                    )}
                    {report.status === 'failed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert('Retry feature coming soon!')}
                      >
                        Retry
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">📊</div>
            <p className="text-gray-500 text-lg mb-2">No reports found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters or generate a new report</p>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Placeholder Page</h3>
            <p className="text-sm text-blue-700">
              This is a dummy reports page showing example data. Report generation and management
              features will be implemented in future updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
