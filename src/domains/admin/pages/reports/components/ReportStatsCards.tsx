import type { FC } from 'react';

interface Report {
  status: 'completed' | 'pending' | 'failed';
}

interface Props {
  reports: Report[];
}

const ReportStatsCards: FC<Props> = ({ reports }) => {
  const totalReports = reports.length;
  const completedCount = reports.filter((r) => r.status === 'completed').length;
  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const failedCount = reports.filter((r) => r.status === 'failed').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Reports</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalReports}</p>
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
            <p className="text-3xl font-bold text-green-600 mt-2">{completedCount}</p>
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
            <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
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
            <p className="text-3xl font-bold text-red-600 mt-2">{failedCount}</p>
          </div>
          <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl text-red-600">⚠️</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportStatsCards;
