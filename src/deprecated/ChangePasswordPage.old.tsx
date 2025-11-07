// ========================================
// Change Password Page
// Authenticated users can change their password
// ========================================

import { Link } from 'react-router-dom';
import { ChangePasswordForm } from '../domains/auth/components';

export default function ChangePasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Change Password</h1>
          <p className="text-gray-600 dark:text-gray-400">Update your account password</p>
        </div>

        {/* Change Password Form Card */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 animate-scale-in">
          <ChangePasswordForm
            onSuccess={() => {
              console.log('Password changed successfully!');
            }}
            onError={(error) => {
              console.error('Failed to change password:', error);
            }}
          />
        </div>

        {/* Back to Profile Link */}
        <p className="text-center mt-6 text-gray-600 dark:text-gray-400 animate-slide-up">
          <Link to="/profile" className="text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 font-semibold transition-colors">
            ← Back to profile
          </Link>
        </p>
      </div>
    </div>
  );
}
