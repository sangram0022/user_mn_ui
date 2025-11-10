import type { Role } from '../types';

interface Props {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onViewUsers: (role: Role) => void;
}

const getColorClasses = (color: string) => {
  const colors = {
    red: 'bg-red-50 border-red-200 text-red-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    gray: 'bg-gray-50 border-gray-200 text-gray-800'
  } as const;
  const key = color as keyof typeof colors;
  return colors[key] ?? colors.gray;
};

const getLevelBadge = (level: number) => {
  const levels = {
    1: { text: 'Level 1', class: 'bg-red-100 text-red-800' },
    2: { text: 'Level 2', class: 'bg-orange-100 text-orange-800' },
    3: { text: 'Level 3', class: 'bg-yellow-100 text-yellow-800' },
    4: { text: 'Level 4', class: 'bg-green-100 text-green-800' },
    5: { text: 'Level 5', class: 'bg-gray-100 text-gray-800' }
  } as const;
  const lvlKey = level as keyof typeof levels;
  return levels[lvlKey] ?? levels[5];
};

export default function RoleCard({ role, onEdit, onDelete, onViewUsers }: Props) {
  return (
    <div className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${getColorClasses(role.color)}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold">{role.name}</h3>
            {role.isDefault && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Default</span>
            )}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelBadge(role.level).class}`}>
              {getLevelBadge(role.level).text}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{role.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <div className="font-medium text-gray-700">Users</div>
          <div className="text-lg font-semibold">{role.userCount.toLocaleString()}</div>
        </div>
        <div>
          <div className="font-medium text-gray-700">Permissions</div>
          <div className="text-lg font-semibold">{role.permissions.length}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">Permission Categories:</div>
        <div className="flex flex-wrap gap-1">
          {Array.from(new Set(role.permissions.map(p => p.category))).map(category => (
            <span key={category} className="px-2 py-1 text-xs bg-white bg-opacity-50 rounded text-gray-700">{category}</span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white border-opacity-50">
        <div className="text-xs text-gray-500">Updated {role.updatedAt.toLocaleDateString()}</div>
        <div className="flex items-center space-x-2">
          <button onClick={() => onViewUsers(role)} className="text-sm text-gray-600 hover:text-gray-800">View Users</button>
          <button onClick={() => onEdit(role)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Edit</button>
          {!role.isDefault && (
            <button onClick={() => onDelete(role)} className="text-sm text-red-600 hover:text-red-800 font-medium">Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}
