import type { FC } from 'react';
import type { UpdateRoleRequest } from '../../types';

interface Props {
  formData: UpdateRoleRequest;
  setFormData: (updater: (prev: UpdateRoleRequest) => UpdateRoleRequest) => void;
  isSystemRole: boolean;
  isEditing: boolean;
}

const RoleOverview: FC<Props> = ({ formData, setFormData, isSystemRole, isEditing }) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
        <input
          type="text"
          value={formData.display_name}
          onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
          disabled={isSystemRole || !isEditing}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            isSystemRole || !isEditing ? 'bg-gray-100 text-gray-500' : ''
          }`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          rows={3}
          disabled={isSystemRole || !isEditing}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            isSystemRole || !isEditing ? 'bg-gray-100 text-gray-500' : ''
          }`}
          placeholder="Brief description of this role..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role Level (1-99)</label>
        <input
          type="number"
          value={formData.level}
          onChange={(e) => setFormData((prev) => ({ ...prev, level: Number(e.target.value) }))}
          min="1"
          max="99"
          disabled={isSystemRole || !isEditing}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            isSystemRole || !isEditing ? 'bg-gray-100 text-gray-500' : ''
          }`}
        />
        <p className="text-xs text-gray-500 mt-1">
          Higher level = more authority. System roles (90+), Admins (70-89), Managers (40-69), Users (1-39)
        </p>
      </div>
    </div>
  );
};

export default RoleOverview;
