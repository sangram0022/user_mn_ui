import React from 'react';
import Button from '../../../../shared/components/ui/Button';

interface Props {
  visible: boolean;
  reason: string;
  onChange: (val: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function RejectionModal({ visible, reason, onChange, onCancel, onConfirm, loading }: Props) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Reject User</h3>
        <p className="text-gray-600 mb-4">Please provide a reason for rejecting this user.</p>
        <textarea value={reason} onChange={(e) => onChange(e.target.value)} placeholder="Reason for rejection..." className="w-full p-3 border border-gray-300 rounded-md mb-4" rows={3} required />
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} disabled={!reason.trim()} loading={loading}>Reject</Button>
        </div>
      </div>
    </div>
  );
}
