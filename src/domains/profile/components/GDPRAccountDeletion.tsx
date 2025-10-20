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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="border-l-4 border-red-500 pl-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Delete Your Account
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
      </div>

      {!showConfirmation ? (
        <div className="space-y-6">
          {/* Warning Box */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-red-800 dark:text-red-300">
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
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              What will be deleted:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <svg
                  className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
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
                  className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
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
                  className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
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
                  className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
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
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-blue-800 dark:text-blue-300">
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
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowConfirmation(true)}
              className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Type <span className="font-bold text-red-600">DELETE MY ACCOUNT</span> to confirm:
            </label>
            <input
              id="confirmation-text"
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              disabled={loading}
            />
            {confirmationText && confirmationText !== REQUIRED_TEXT && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
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
                className="mt-1 mr-2 text-red-600 focus:ring-red-500 rounded"
                disabled={loading}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                I understand that this action is permanent and cannot be undone. All my data will be
                permanently deleted.
              </span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                setShowConfirmation(false);
                setConfirmationText('');
                setUnderstood(false);
                setError(null);
              }}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!isConfirmationValid || loading}
              className="flex-1 px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Deleting Account...' : 'Delete My Account Permanently'}
            </button>
          </div>

          {/* GDPR Notice */}
          <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-md p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
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
