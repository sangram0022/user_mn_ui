import type { TimePeriod } from '../../../types/admin.types';

interface DashboardHeaderProps {
  readonly autoRefresh: boolean;
  readonly selectedPeriod: TimePeriod;
  readonly onAutoRefreshChange: (enabled: boolean) => void;
  readonly onPeriodChange: (period: TimePeriod) => void;
}

const PERIOD_OPTIONS: ReadonlyArray<{ readonly value: TimePeriod; readonly label: string }> = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' },
];

export default function DashboardHeader({
  autoRefresh,
  selectedPeriod,
  onAutoRefreshChange,
  onPeriodChange,
}: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of system statistics and recent activity
        </p>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => onAutoRefreshChange(e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          Auto-refresh (5 min)
        </label>
        <select
          value={selectedPeriod}
          onChange={(e) => onPeriodChange(e.target.value as TimePeriod)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {PERIOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
