import Button from '@/shared/components/ui/Button';

interface Props {
  onApprove: () => void;
  onReject: () => void;
  approving?: boolean;
  rejecting?: boolean;
  isApproved?: boolean;
}

export default function UserActions({ onApprove, onReject, approving, rejecting, isApproved }: Props) {
  if (isApproved) return null;

  return (
    <div className="bg-white shadow-sm rounded-lg border">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900">User Actions</h2>
      </div>
      <div className="p-6 flex space-x-4">
        <Button variant="primary" onClick={onApprove} disabled={approving} loading={approving}>Approve User</Button>
        <Button variant="danger" onClick={onReject} disabled={rejecting} loading={rejecting}>Reject User</Button>
      </div>
    </div>
  );
}
