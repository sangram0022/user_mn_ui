/**
 * UserApprovalModal Component
 * Modal for approving users (individual or bulk)
 */

import Button from '@/shared/components/ui/Button';
import type { ApprovalFormData } from '../hooks/useUserApprovalManagement';

const TRIAL_DAYS_OPTIONS = [7, 14, 30, 60, 90];
const TRIAL_BENEFITS_OPTIONS = [
  { value: 'premium_features', label: 'Premium Features' },
  { value: 'priority_support', label: 'Priority Support' },
  { value: 'advanced_analytics', label: 'Advanced Analytics' },
  { value: 'api_access', label: 'API Access' },
];

interface UserApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => Promise<void>;
  formData: ApprovalFormData;
  setFormData: React.Dispatch<React.SetStateAction<ApprovalFormData>>;
  isBulk: boolean;
  userCount: number;
  isSubmitting?: boolean;
}

export default function UserApprovalModal({
  isOpen,
  onClose,
  onApprove,
  formData,
  setFormData,
  isBulk,
  userCount,
  isSubmitting = false,
}: UserApprovalModalProps) {
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onApprove();
    } catch {
      // Error handled by parent
    }
  };

  const toggleBenefit = (benefit: string) => {
    setFormData((prev) => ({
      ...prev,
      trialBenefits: prev.trialBenefits.includes(benefit)
        ? prev.trialBenefits.filter((b) => b !== benefit)
        : [...prev.trialBenefits, benefit],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-2xl font-bold">
          {isBulk ? `Approve ${userCount} Users` : 'Approve User'}
        </h2>
        <form onSubmit={handleSubmit}>
          {/* Welcome Message */}
          <div className="mb-4">
            <label htmlFor="welcome-message" className="mb-1 block font-medium">
              Welcome Message (Optional)
            </label>
            <textarea
              id="welcome-message"
              value={formData.welcomeMessage}
              onChange={(e) => setFormData((prev) => ({ ...prev, welcomeMessage: e.target.value }))}
              className="w-full rounded border border-gray-300 px-3 py-2"
              rows={3}
              placeholder="Add a personal welcome message..."
            />
          </div>

          {/* Trial Days */}
          <div className="mb-4">
            <label htmlFor="trial-days" className="mb-1 block font-medium">
              Trial Period (Days)
            </label>
            <select
              id="trial-days"
              value={formData.trialDays}
              onChange={(e) => setFormData((prev) => ({ ...prev, trialDays: Number(e.target.value) }))}
              className="w-full rounded border border-gray-300 px-3 py-2"
            >
              {TRIAL_DAYS_OPTIONS.map((days) => (
                <option key={days} value={days}>
                  {days} days
                </option>
              ))}
            </select>
          </div>

          {/* Trial Benefits */}
          <div className="mb-4">
            <label className="mb-2 block font-medium">Trial Benefits</label>
            <div className="grid grid-cols-2 gap-2">
              {TRIAL_BENEFITS_OPTIONS.map((benefit) => (
                <label key={benefit.value} className="flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={formData.trialBenefits.includes(benefit.value)}
                    onChange={() => toggleBenefit(benefit.value)}
                    className="mr-2 h-4 w-4"
                  />
                  <span className="text-sm">{benefit.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Send Welcome Email */}
          <div className="mb-6">
            <label className="flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={formData.sendWelcomeEmail}
                onChange={(e) => setFormData((prev) => ({ ...prev, sendWelcomeEmail: e.target.checked }))}
                className="mr-2 h-4 w-4"
              />
              <span className="text-sm font-medium">Send welcome email</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" onClick={onClose} variant="secondary" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="success" disabled={isSubmitting}>
              {isSubmitting ? 'Approving...' : 'Approve'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
