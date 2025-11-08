/**
 * User Status Breakdown Chart
 * Displays pie chart of user status distribution
 */

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AdminStats } from '../types';

const STATUS_COLORS = {
  active: '#10b981',
  inactive: '#6b7280',
  pending: '#f59e0b',
  suspended: '#ef4444',
  deleted: '#991b1b',
};

interface Props {
  stats: AdminStats | undefined;
}

export function UserStatusChart({ stats }: Props) {
  // Prepare pie chart data for user status breakdown
  const statusData = stats?.users?.by_status
    ? [
        { name: 'Active', value: stats.users.by_status.active || 0, color: STATUS_COLORS.active },
        { name: 'Inactive', value: stats.users.by_status.inactive || 0, color: STATUS_COLORS.inactive },
        { name: 'Pending', value: stats.users.by_status.pending_approval || 0, color: STATUS_COLORS.pending },
        { name: 'Suspended', value: stats.users.by_status.suspended || 0, color: STATUS_COLORS.suspended },
      ].filter((item) => item.value > 0)
    : [];

  if (statusData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={statusData}
          cx="50%"
          cy="50%"
          labelLine
          label
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {statusData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default UserStatusChart;
