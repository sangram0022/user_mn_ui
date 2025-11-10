/**
 * UserRejectionModal Component
 * Modal for rejecting users (individual or bulk)
 */

import Button from '@/shared/components/ui/Button';
import type { RejectionFormData } from '../hooks/useUserApprovalManagement';

interface UserRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: () => Promise<void>;
  formData: RejectionFormData;
  setFormData: React.Dispatch<React.SetStateAction<RejectionFormData>>;
  isBulk: boolean;
  userCount: number;
  isSubmitting?: boolean;
}

export default function UserRejectionModal({
  isOpen,
  onClose,
  onReject,
  formData,
  setFormData,
  isBulk,
  userCount,
  isSubmitting = false,
}: UserRejectionModalProps) {
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.rejectionReason.trim().length < 10) {
      return;
    }

    try {
      await onReject();
    } catch {
      // Error handled by parent
    }
  };

  const isValid = formData.rejectionReason.trim().length >= 10;
  const charCount = formData.rejectionReason.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-2xl font-bold text-red-600">
          {isBulk ? `Reject ${userCount} Users` : 'Reject User'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* Rejection Reason */}
          <div className="mb-4">
            <label htmlFor="rejection-reason" className="mb-1 block font-medium">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="rejection-reason"
              value={formData.rejectionReason}
              onChange={(e) => setFormData((prev) => ({ ...prev, rejectionReason: e.target.value }))}
              className={`w-full rounded border px-3 py-2 ${
                charCount > 0 && !isValid ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              rows={4}
              placeholder="Provide a clear reason for rejection (minimum 10 characters)..."
              required
            />
            <div className="mt-1 flex justify-between text-sm">
              <span className={charCount > 0 && !isValid ? 'text-red-500' : 'text-gray-500'}>
                {isValid ? '✓ Valid' : 'Minimum 10 characters required'}
              </span>
              <span className="text-gray-400">{charCount} characters</span>
            </div>
          </div>

          {/* Block Email */}
          <div className="mb-4">
            <label className="flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={formData.blockEmail}
                onChange={(e) => setFormData((prev) => ({ ...prev, blockEmail: e.target.checked }))}
                className="mr-2 h-4 w-4"
              />
              <span className="text-sm font-medium">Block email from future registrations</span>
            </label>
          </div>

          {/* Reapplication Wait Days */}
          <div className="mb-6">
            <label htmlFor="wait-days" className="mb-1 block font-medium">
              Reapplication Wait Period (Days)
            </label>
            <select
              id="wait-days"
              value={formData.reapplicationWaitDays}
              onChange={(e) => setFormData((prev) => ({ ...prev, reapplicationWaitDays: Number(e.target.value) }))}
              className="w-full rounded border border-gray-300 px-3 py-2"
            >
              <option value={0}>No waiting period</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={180}>180 days</option>
            </select>
          </div>

          {/* Warning */}
          {isBulk && (
            <div className="mb-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
              ⚠️ You are about to reject {userCount} users. This action will notify all users.
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" onClick={onClose} variant="secondary" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={!isValid || isSubmitting}>
              {isSubmitting ? 'Rejecting...' : 'Reject'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
