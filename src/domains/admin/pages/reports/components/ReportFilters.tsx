import type { FC } from 'react';

type ReportType = 'users' | 'activity' | 'security' | 'performance';
type ReportStatus = 'completed' | 'pending' | 'failed';

interface Props {
  selectedType: ReportType | 'all';
  selectedStatus: ReportStatus | 'all';
  onTypeChange: (type: ReportType | 'all') => void;
  onStatusChange: (status: ReportStatus | 'all') => void;
}

const ReportFilters: FC<Props> = ({ selectedType, selectedStatus, onTypeChange, onStatusChange }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value as ReportType | 'all')}
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
            onChange={(e) => onStatusChange(e.target.value as ReportStatus | 'all')}
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
  );
};

export default ReportFilters;
