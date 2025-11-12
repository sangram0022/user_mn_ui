import Button from '@/shared/components/ui/Button';

interface Props {
  availableRoles: string[];
  selectedRoles: string[];
  onToggle: (role: string) => void;
  onSave: () => void;
  saving?: boolean;
}

export default function RolesSection({ availableRoles, selectedRoles, onToggle, onSave, saving }: Props) {
  return (
    <div className="bg-white shadow-sm rounded-lg border">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">User Roles</h2>
        <Button variant="primary" size="sm" onClick={onSave} disabled={saving} loading={saving}>Save Roles</Button>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {availableRoles.map((role) => (
            <label key={role} className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={selectedRoles.includes(role)} onChange={() => onToggle(role)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <span className="text-sm text-gray-700 capitalize">{role}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
