/**
 * Registration Trends Chart
 * Displays line chart of registration trends over time
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { GrowthAnalytics } from '../types';

interface Props {
  growth: GrowthAnalytics | undefined;
}

export function RegistrationTrendsChart({ growth }: Props) {
  // Prepare line chart data for registration trends
  const trendData =
    growth?.time_series?.map((trend) => ({
      date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      registrations: trend.new_users,
      activations: 0, // Not in API response
    })) || [];

  if (trendData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={trendData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="registrations"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Registrations"
        />
        <Line
          type="monotone"
          dataKey="activations"
          stroke="#10b981"
          strokeWidth={2}
          name="Activations"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default RegistrationTrendsChart;
