import Badge from '../../../../../shared/components/ui/Badge';

export interface RoleData {
  readonly name: string;
  readonly users: number;
}

interface TopRolesCardProps {
  readonly roleData: ReadonlyArray<RoleData>;
}

export default function TopRolesCard({ roleData }: TopRolesCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Roles by User Count</h2>
      {roleData.length > 0 ? (
        <div className="space-y-3">
          {roleData.map((role, index) => (
            <div key={role.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{role.name}</span>
              </div>
              <Badge variant="info">{role.users} users</Badge>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No role data available</p>
      )}
    </div>
  );
}
