interface DashboardStatsCardsProps {
  readonly totalUsers: number;
  readonly activeUsers: number;
  readonly todayRegistrations: number;
  readonly pendingApprovals: number;
}

export default function DashboardStatsCards({
  totalUsers,
  activeUsers,
  todayRegistrations,
  pendingApprovals,
}: DashboardStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalUsers}</p>
          </div>
          <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl text-primary-600">👥</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{activeUsers}</p>
          </div>
          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl text-green-600">✓</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Today's Registrations</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{todayRegistrations}</p>
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl text-blue-600">📝</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{pendingApprovals}</p>
          </div>
          <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl text-yellow-600">⏳</span>
          </div>
        </div>
      </div>
    </div>
  );
}
