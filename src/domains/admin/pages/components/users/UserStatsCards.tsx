interface User {
  is_active: boolean;
  is_approved: boolean;
}

interface UserStatsCardsProps {
  totalCount: number;
  users: User[];
}

export function UserStatsCards({ totalCount, users }: UserStatsCardsProps) {
  const activeCount = users.filter(u => u.is_active).length;
  const inactiveCount = users.filter(u => !u.is_active).length;
  const pendingApprovalCount = users.filter(u => !u.is_approved).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 mb-1">Total Users</div>
        <div className="text-3xl font-bold text-gray-900">{totalCount}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 mb-1">Active</div>
        <div className="text-3xl font-bold text-green-600">{activeCount}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 mb-1">Inactive</div>
        <div className="text-3xl font-bold text-gray-600">{inactiveCount}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm text-gray-600 mb-1">Pending Approval</div>
        <div className="text-3xl font-bold text-yellow-600">{pendingApprovalCount}</div>
      </div>
    </div>
  );
}
