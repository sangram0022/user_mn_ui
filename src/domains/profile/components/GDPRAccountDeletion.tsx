/**
 * GDPR Account Deletion Component
 *
 * Allows users to permanently delete their account in compliance with GDPR
 * Includes confirmation flow with safety measures
 *
 * Backend API: POST /profile/gdpr/delete
 */

import { useState } from 'react';
import { useNavigate } from '../../../hooks/useNavigate';

interface GDPRAccountDeletionProps {
  onDeleteSuccess?: () => void;
}

export function GDPRAccountDeletion({ onDeleteSuccess }: GDPRAccountDeletionProps) {
  const navigate = useNavigate();
  const [confirmationText, setConfirmationText] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const REQUIRED_TEXT = 'DELETE MY ACCOUNT';
  const isConfirmationValid = confirmationText === REQUIRED_TEXT && understood;

  const handleDelete = async () => {
    if (!isConfirmationValid) {
      setError('Please confirm account deletion by typing the required text and checking the box.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Integrate with actual API client
      // const response = await apiClient.deleteAccount({ confirmation: confirmationText });

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Success - logout and redirect
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        // Default: logout and redirect to home
        navigate('/');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Account deletion failed. Please contact support.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-surface-primary)] dark:bg-[var(--color-surface-primary)] rounded-lg shadow p-6">
      <div className="border-l-4 border-[var(--color-error)] pl-4 mb-6">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-2">
          Delete Your Account
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
      </div>

      {!showConfirmation ? (
        <div className="space-y-6">
          {/* Warning Box */}
          <div className="bg-[var(--color-error-light)] dark:bg-[var(--color-error)]/20 border border-[var(--color-error)] dark:border-[var(--color-error)] rounded-md p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-[var(--color-error)] dark:text-[var(--color-error)] mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-[var(--color-error)] dark:text-[var(--color-error)]">
                <p className="font-medium mb-1">Warning: This action is permanent</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Your account will be permanently deleted</li>
                  <li>All your personal data will be erased</li>
                  <li>Your activity history will be removed</li>
                  <li>You will lose access to all resources</li>
                  <li>This action cannot be undone or reversed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* What Gets Deleted */}
          <div>
            <h3 className="text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-3">
              What will be deleted:
            </h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-[var(--color-error)] mr-2 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Profile information (name, email, preferences)</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-[var(--color-error)] mr-2 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Activity logs and audit trails</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-[var(--color-error)] mr-2 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>All authentication tokens and sessions</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-[var(--color-error)] mr-2 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Access to all associated resources</span>
              </li>
            </ul>
          </div>

          {/* Alternative Options */}
          <div className="bg-[var(--color-primary-light)] dark:bg-[var(--color-primary)]/20 border border-[var(--color-primary)] dark:border-[var(--color-primary)] rounded-md p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-[var(--color-primary)] dark:text-[var(--color-primary)] mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-[var(--color-primary)] dark:text-[var(--color-primary)]">
                <p className="font-medium mb-1">Consider these alternatives:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Export your data before deleting (GDPR Data Export)</li>
                  <li>Deactivate your account temporarily instead</li>
                  <li>Update your privacy settings</li>
                  <li>Contact support if you have concerns</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Proceed Button */}
          <div className="pt-4 border-t border-[var(--color-border)] dark:border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setShowConfirmation(true)}
              className="w-full sm:w-auto px-6 py-3 bg-[var(--color-error)] text-[var(--color-text-primary)] font-medium rounded-md hover:bg-[var(--color-error)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-error)]"
            >
              I Understand, Proceed to Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Confirmation Form */}
          <div>
            <label
              htmlFor="confirmation-text"
              className="block text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-2"
            >
              Type <span className="font-bold text-[var(--color-error)]">DELETE MY ACCOUNT</span> to
              confirm:
            </label>
            <input
              id="confirmation-text"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              className="w-full px-3 py-2 border border-[var(--color-border)] dark:border-[var(--color-border)] rounded-md shadow-sm focus:ring-[var(--color-error)] focus:border-[var(--color-error)] dark:bg-[var(--color-surface-primary)] dark:text-[var(--color-text-primary)]"
              disabled={loading}
            />
            {confirmationText && confirmationText !== REQUIRED_TEXT && (
              <p className="mt-1 text-sm text-[var(--color-error)] dark:text-[var(--color-error)]">
                Please type exactly: {REQUIRED_TEXT}
              </p>
            )}
          </div>

          {/* Final Confirmation Checkbox */}
          <div>
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
                className="mt-1 mr-2 text-[var(--color-error)] focus:ring-[var(--color-error)] rounded"
                disabled={loading}
              />
              <span className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                I understand that this action is permanent and cannot be undone. All my data will be
                permanently deleted.
              </span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-[var(--color-error-light)] dark:bg-[var(--color-error)]/20 border border-[var(--color-error)] dark:border-[var(--color-error)] rounded-md p-3">
              <p className="text-sm text-[var(--color-error)] dark:text-[var(--color-error)]">
                {error}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-[var(--color-border)] dark:border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => {
                setShowConfirmation(false);
                setConfirmationText('');
                setUnderstood(false);
                setError(null);
              }}
              className="flex-1 px-6 py-3 bg-[var(--color-border)] dark:bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] font-medium rounded-md hover:bg-[var(--color-border)] dark:hover:bg-[var(--color-surface-primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-border)]"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!isConfirmationValid || loading}
              className="flex-1 px-6 py-3 bg-[var(--color-error)] text-[var(--color-text-primary)] font-medium rounded-md hover:bg-[var(--color-error)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-error)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Deleting Account...' : 'Delete My Account Permanently'}
            </button>
          </div>

          {/* GDPR Notice */}
          <div className="bg-[var(--color-surface-secondary)] dark:bg-[var(--color-surface-primary)]/50 border border-[var(--color-border)] dark:border-[var(--color-border)] rounded-md p-3">
            <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
              <strong>GDPR Article 17 (Right to Erasure):</strong> You have the right to request
              deletion of your personal data. Upon deletion, we will erase all your personal
              information from our systems within 30 days, except where retention is required by
              law.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
