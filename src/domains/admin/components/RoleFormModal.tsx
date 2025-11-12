/**
 * RoleFormModal Component
 * Reusable modal for creating and editing roles
 */

import type { RoleFormData } from '../hooks/useRoleManagement';

const SYSTEM_ROLES = ['admin', 'user'];

const PERMISSIONS_BY_RESOURCE: Record<string, string[]> = {
  users: ['create', 'read', 'update', 'delete', 'approve'],
  roles: ['create', 'read', 'update', 'delete'],
  analytics: ['read', 'export'],
  audit_logs: ['read', 'export'],
  settings: ['read', 'update', 'configure'],
  reports: ['create', 'read', 'export'],
  notifications: ['create', 'read', 'update', 'delete'],
};

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  formData: RoleFormData;
  setFormData: React.Dispatch<React.SetStateAction<RoleFormData>>;
  mode: 'create' | 'edit';
  isSubmitting?: boolean;
}

export default function RoleFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  mode,
  isSubmitting = false,
}: RoleFormModalProps) {
  if (!isOpen) return null;

  const isSystemRole = SYSTEM_ROLES.includes(formData.role_name);
  const title = mode === 'create' ? 'Create Role' : 'Edit Role';
  const submitLabel = mode === 'create' ? 'Create' : 'Update';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit();
    } catch {
      // Error handled by parent
    }
  };

  const handlePermissionChange = (resource: string, action: string) => {
    const permKey = `${resource}:${action}`;
    const isChecked = formData.permissions.includes(permKey);

    setFormData((prev) => ({
      ...prev,
      permissions: isChecked
        ? prev.permissions.filter((p) => p !== permKey)
        : [...prev.permissions, permKey],
    }));
  };

  const isResourceFullySelected = (resource: string) => {
    const actions = PERMISSIONS_BY_RESOURCE[resource];
    return actions.every((action) => formData.permissions.includes(`${resource}:${action}`));
  };

  const toggleResourcePermissions = (resource: string) => {
    const actions = PERMISSIONS_BY_RESOURCE[resource];
    const allSelected = isResourceFullySelected(resource);

    setFormData((prev) => {
      let newPermissions = [...prev.permissions];

      if (allSelected) {
        // Remove all permissions for this resource
        newPermissions = newPermissions.filter(
          (p) => !actions.some((action) => p === `${resource}:${action}`)
        );
      } else {
        // Add all permissions for this resource
        actions.forEach((action) => {
          const permKey = `${resource}:${action}`;
          if (!newPermissions.includes(permKey)) {
            newPermissions.push(permKey);
          }
        });
      }

      return { ...prev, permissions: newPermissions };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-2xl font-bold">{title}</h2>
        <form onSubmit={handleSubmit}>
          {/* Role Name */}
          <div className="mb-4">
            <label htmlFor="role-name" className="mb-1 block font-medium">
              Role Name *
            </label>
            <input
              id="role-name"
              type="text"
              value={formData.role_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, role_name: e.target.value }))
              }
              disabled={mode === 'edit'}
              className="w-full rounded border border-gray-300 px-3 py-2 disabled:bg-gray-100"
              required
            />
            {mode === 'edit' && isSystemRole && (
              <p className="mt-1 text-sm text-red-600">
                System role - name cannot be changed
              </p>
            )}
          </div>

          {/* Display Name */}
          <div className="mb-4">
            <label htmlFor="display-name" className="mb-1 block font-medium">
              Display Name *
            </label>
            <input
              id="display-name"
              type="text"
              value={formData.display_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, display_name: e.target.value }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="mb-1 block font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2"
              rows={3}
            />
          </div>

          {/* Level */}
          <div className="mb-4">
            <label htmlFor="level" className="mb-1 block font-medium">
              Level (0-100)
            </label>
            <input
              id="level"
              type="number"
              min="0"
              max="100"
              value={formData.level}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, level: Number(e.target.value) }))
              }
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          {/* Permissions */}
          <div className="mb-6">
            <label className="mb-2 block font-medium">Permissions</label>
            <div className="max-h-96 overflow-y-auto rounded border border-gray-300 p-4">
              {Object.entries(PERMISSIONS_BY_RESOURCE).map(([resource, actions]) => (
                <div key={resource} className="mb-4 border-b pb-4 last:border-b-0">
                  <div className="mb-2 flex items-center">
                    <input
                      type="checkbox"
                      id={`resource-${resource}`}
                      checked={isResourceFullySelected(resource)}
                      onChange={() => toggleResourcePermissions(resource)}
                      className="mr-2 h-4 w-4"
                    />
                    <label
                      htmlFor={`resource-${resource}`}
                      className="cursor-pointer font-semibold capitalize"
                    >
                      {resource.replace(/_/g, ' ')}
                    </label>
                  </div>
                  <div className="ml-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {actions.map((action) => {
                      const permKey = `${resource}:${action}`;
                      return (
                        <label
                          key={permKey}
                          className="flex cursor-pointer items-center"
                        >
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permKey)}
                            onChange={() => handlePermissionChange(resource, action)}
                            className="mr-2 h-4 w-4"
                          />
                          <span className="text-sm">{action}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
