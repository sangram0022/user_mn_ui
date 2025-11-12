import type { FC } from 'react';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';

type ReportType = 'users' | 'activity' | 'security' | 'performance';
type ReportStatus = 'completed' | 'pending' | 'failed';

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  status: ReportStatus;
  generated_at: string;
  file_size: string;
  duration: string;
}

interface Props {
  reports: Report[];
  onDownload: (reportId: string) => void;
  onView: (reportId: string) => void;
  onCancel: (reportId: string) => void;
  onRetry: (reportId: string) => void;
}

const ReportsTable: FC<Props> = ({ reports, onDownload, onView, onCancel, onRetry }) => {
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
            {reports.map((report) => (
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
                      <Button variant="outline" size="sm" onClick={() => onDownload(report.id)}>
                        Download
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onView(report.id)}>
                        View
                      </Button>
                    </>
                  )}
                  {report.status === 'pending' && (
                    <Button variant="outline" size="sm" onClick={() => onCancel(report.id)}>
                      Cancel
                    </Button>
                  )}
                  {report.status === 'failed' && (
                    <Button variant="outline" size="sm" onClick={() => onRetry(report.id)}>
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
      {reports.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-5xl mb-4">📊</div>
          <p className="text-gray-500 text-lg mb-2">No reports found</p>
          <p className="text-gray-400 text-sm">Try adjusting your filters or generate a new report</p>
        </div>
      )}
    </div>
  );
};

export default ReportsTable;
