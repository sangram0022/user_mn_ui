import type { Role, Permission } from '../types';

interface Props {
  role: Role;
  allPermissions: Permission[];
  onPermissionToggle: (role: Role, permission: Permission, granted: boolean) => void;
}

export default function PermissionMatrix({ role, allPermissions, onPermissionToggle }: Props) {
  const groups: Record<string, Permission[]> = {};
  allPermissions.forEach(permission => {
    if (!groups[permission.category]) groups[permission.category] = [];
    groups[permission.category].push(permission);
  });

  const hasPermission = (permission: Permission) => role.permissions.some(p => p.id === permission.id);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Permissions for {role.name}</h3>

      <div className="space-y-6">
        {Object.entries(groups).map(([category, permissions]) => (
          <div key={category}>
            <h4 className="font-medium text-gray-900 mb-3 capitalize">{category} Permissions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {permissions.map(permission => (
                <label key={permission.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPermission(permission)}
                    onChange={(e) => onPermissionToggle(role, permission, e.target.checked)}
                    className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900">{permission.name}</div>
                    <div className="text-xs text-gray-500">{permission.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
