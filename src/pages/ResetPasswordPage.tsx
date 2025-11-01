// ========================================
// Reset Password Page
// Set new password with reset token
// ========================================

import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ResetPasswordForm } from '../domains/auth/components';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  
  // Get token from URL params or query string
  const resetToken = token || searchParams.get('token') || '';

  if (!resetToken) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 animate-fade-in">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Invalid Reset Link</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The password reset link is invalid or has expired.
              </p>
              <Link
                to="/auth/forgot-password"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Request New Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-2xl mb-4 shadow-lg shadow-green-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Reset Password</h1>
          <p className="text-gray-600 dark:text-gray-400">Enter your new password below</p>
        </div>

        {/* Reset Password Form Card */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 animate-scale-in">
          <ResetPasswordForm
            token={resetToken}
            onSuccess={() => {
              console.log('Password reset successfully!');
            }}
            onError={(error) => {
              console.error('Failed to reset password:', error);
            }}
            redirectTo="/login"
          />
        </div>

        {/* Back to Login Link */}
        <p className="text-center mt-6 text-gray-600 dark:text-gray-400 animate-slide-up">
          Remember your password?{' '}
          <Link to="/login" className="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 font-semibold transition-colors">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
