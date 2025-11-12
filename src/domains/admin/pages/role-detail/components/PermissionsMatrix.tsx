import type { FC } from 'react';
import Button from '@/shared/components/ui/Button';

interface Props {
  resources: ReadonlyArray<string>;
  actions: ReadonlyArray<string>;
  resourceActions: Record<string, ReadonlyArray<string>>;
  isEditing: boolean;
  isSystemRole: boolean;
  hasPermission: (resource: string, action: string) => boolean;
  isActionFullySelected: (action: string) => boolean;
  isResourceFullySelected: (resource: string) => boolean;
  togglePermission: (resource: string, action: string) => void;
  selectAllForResource: (resource: string) => void;
  deselectAllForResource: (resource: string) => void;
  selectAllForAction: (action: string) => void;
  deselectAllForAction: (action: string) => void;
}

const PermissionsMatrix: FC<Props> = ({
  resources,
  actions,
  resourceActions,
  isEditing,
  isSystemRole,
  hasPermission,
  isActionFullySelected,
  isResourceFullySelected,
  togglePermission,
  selectAllForResource,
  deselectAllForResource,
  selectAllForAction,
  deselectAllForAction,
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Permissions Matrix</h2>
        {isEditing && !isSystemRole && (
          <div className="text-sm text-gray-500">
            Click checkboxes to toggle permissions. Click resource/action headers to select all.
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Resource</th>
              {actions.map((action) => {
                const isFullySelected = isActionFullySelected(action);
                return (
                  <th
                    key={action}
                    className={`px-4 py-3 text-center text-sm font-medium text-gray-900 capitalize ${
                      isEditing && !isSystemRole ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                    onClick={() => {
                      if (isEditing && !isSystemRole) {
                        if (isFullySelected) {
                          deselectAllForAction(action);
                        } else {
                          selectAllForAction(action);
                        }
                      }
                    }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {isEditing && !isSystemRole && (
                        <input
                          type="checkbox"
                          checked={isFullySelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (isFullySelected) {
                              deselectAllForAction(action);
                            } else {
                              selectAllForAction(action);
                            }
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      )}
                      <span>{action}</span>
                    </div>
                  </th>
                );
              })}
              {isEditing && !isSystemRole && (
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {resources.map((resource) => {
              const availableActions = resourceActions[resource] || [];
              const isFullySelected = isResourceFullySelected(resource);

              return (
                <tr key={resource} className="hover:bg-gray-50">
                  <td
                    className={`px-4 py-3 text-sm font-medium text-gray-900 capitalize ${
                      isEditing && !isSystemRole ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => {
                      if (isEditing && !isSystemRole) {
                        if (isFullySelected) {
                          deselectAllForResource(resource);
                        } else {
                          selectAllForResource(resource);
                        }
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {isEditing && !isSystemRole && (
                        <input
                          type="checkbox"
                          checked={isFullySelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (isFullySelected) {
                              deselectAllForResource(resource);
                            } else {
                              selectAllForResource(resource);
                            }
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      )}
                      <span>{resource.replace('_', ' ')}</span>
                    </div>
                  </td>
                  {actions.map((action) => {
                    const isAvailable = availableActions.includes(action);
                    const isChecked = hasPermission(resource, action);

                    return (
                      <td
                        key={`${resource}-${action}`}
                        className={`px-4 py-3 text-center ${
                          isAvailable && isEditing && !isSystemRole ? 'cursor-pointer hover:bg-primary-50' : ''
                        }`}
                        onClick={() => {
                          if (isAvailable) {
                            togglePermission(resource, action);
                          }
                        }}
                      >
                        {isAvailable ? (
                          <div className="flex justify-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(resource, action)}
                              disabled={isSystemRole || !isEditing}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                            />
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                  {isEditing && !isSystemRole && (
                    <td className="px-4 py-3 text-center">
                      <Button
                        onClick={() =>
                          isFullySelected ? deselectAllForResource(resource) : selectAllForResource(resource)
                        }
                        variant="ghost"
                        size="sm"
                      >
                        {isFullySelected ? 'None' : 'All'}
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionsMatrix;
