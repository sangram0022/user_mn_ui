interface BulkActionsBarProps {
  readonly selectedCount: number;
  readonly onBulkEdit: () => void;
  readonly onBulkDelete: () => void;
  readonly onClear: () => void;
}

export default function BulkActionsBar({
  selectedCount,
  onBulkEdit,
  onBulkDelete,
  onClear,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="text-blue-800">
          {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onBulkEdit}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Bulk Edit
          </button>
          <button
            onClick={onBulkDelete}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
          >
            Bulk Delete
          </button>
          <button
            onClick={onClear}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
