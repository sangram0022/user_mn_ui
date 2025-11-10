import { useState } from 'react';
import Button from '../../../shared/components/ui/Button';
import ReportStatsCards from './reports/components/ReportStatsCards';
import ReportFilters from './reports/components/ReportFilters';
import ReportsTable, { type Report } from './reports/components/ReportsTable';

type ReportType = 'users' | 'activity' | 'security' | 'performance';
type ReportStatus = 'completed' | 'pending' | 'failed';

const DUMMY_REPORTS: Report[] = [
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

  const handleDownload = (reportId: string) => {
    alert(`Download report ${reportId} - feature coming soon!`);
  };

  const handleView = (reportId: string) => {
    alert(`View report ${reportId} - feature coming soon!`);
  };

  const handleCancel = (reportId: string) => {
    alert(`Cancel report ${reportId} - feature coming soon!`);
  };

  const handleRetry = (reportId: string) => {
    alert(`Retry report ${reportId} - feature coming soon!`);
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
      <ReportStatsCards reports={DUMMY_REPORTS} />

      {/* Filters */}
      <ReportFilters
        selectedType={selectedType}
        selectedStatus={selectedStatus}
        onTypeChange={setSelectedType}
        onStatusChange={setSelectedStatus}
      />

      {/* Reports Table */}
      <ReportsTable
        reports={filteredReports}
        onDownload={handleDownload}
        onView={handleView}
        onCancel={handleCancel}
        onRetry={handleRetry}
      />

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
