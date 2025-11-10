import Button from '@/shared/components/ui/Button';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  isDeleting: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  isDeleting,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
      <span className="text-blue-800 font-medium">
        {selectedCount} user(s) selected
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onClearSelection}>
          Clear Selection
        </Button>
        <Button 
          variant="danger" 
          size="sm" 
          onClick={onBulkDelete}
          disabled={isDeleting}
        >
          Delete Selected
        </Button>
      </div>
    </div>
  );
}
