import Button from '../../../../../shared/components/ui/Button';
import Badge from '../../../../../shared/components/ui/Badge';

interface AuditLog {
  readonly audit_id: string;
  readonly action: string;
  readonly user_id: string;
  readonly ip_address: string | null;
  readonly resource_type: string;
  readonly severity: string;
  readonly outcome: string | null;
  readonly timestamp: string;
}

interface RecentActivityTableProps {
  readonly logs: ReadonlyArray<AuditLog>;
  readonly onViewAll: () => void;
}

const getSeverityBadge = (severity: string): 'danger' | 'warning' | 'info' | 'success' => {
  switch (severity) {
    case 'critical':
      return 'danger';
    case 'high':
      return 'warning';
    case 'medium':
      return 'info';
    default:
      return 'success';
  }
};

export default function RecentActivityTable({ logs, onViewAll }: RecentActivityTableProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <Button variant="outline" size="sm" onClick={onViewAll}>
          View All Logs
        </Button>
      </div>
      {logs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.audit_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{log.action}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{log.user_id}</div>
                    <div className="text-xs text-gray-500">{log.ip_address || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{log.resource_type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getSeverityBadge(log.severity)}>
                      {log.severity}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={log.outcome === null ? 'secondary' : 'primary'}>
                      {log.outcome || 'N/A'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
      )}
    </div>
  );
}
