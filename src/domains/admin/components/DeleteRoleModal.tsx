/**
 * DeleteRoleModal Component
 * Confirmation modal for role deletion
 */

const SYSTEM_ROLES = ['admin', 'user'];

interface DeleteRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  roleName: string | null;
  isDeleting?: boolean;
}

export default function DeleteRoleModal({
  isOpen,
  onClose,
  onConfirm,
  roleName,
  isDeleting = false,
}: DeleteRoleModalProps) {
  if (!isOpen || !roleName) return null;

  const isSystemRole = SYSTEM_ROLES.includes(roleName);

  const handleConfirm = async () => {
    if (isSystemRole) return;
    try {
      await onConfirm();
    } catch {
      // Error handled by parent
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-2xl font-bold">Delete Role</h2>
        <p className="mb-6">
          Are you sure you want to delete the role <strong>{roleName}</strong>?
        </p>
        {isSystemRole && (
          <div className="mb-4 rounded bg-red-50 p-3 text-red-700">
            ⚠️ System role - cannot be deleted
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSystemRole || isDeleting}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
