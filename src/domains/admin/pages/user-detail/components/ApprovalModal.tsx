import Button from '@/shared/components/ui/Button';

interface Props {
  visible: boolean;
  message: string;
  onChange: (val: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function ApprovalModal({ visible, message, onChange, onCancel, onConfirm, loading }: Props) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Approve User</h3>
        <p className="text-gray-600 mb-4">Are you sure you want to approve this user? You can optionally add a message.</p>
        <textarea value={message} onChange={(e) => onChange(e.target.value)} placeholder="Optional approval message..." className="w-full p-3 border border-gray-300 rounded-md mb-4" rows={3} />
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm} loading={loading}>Approve</Button>
        </div>
      </div>
    </div>
  );
}
