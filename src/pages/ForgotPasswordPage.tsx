// ========================================
// Forgot Password Page
// Password reset request page
// ========================================

import { Link } from 'react-router-dom';
import { ForgotPasswordForm } from '../domains/auth/components';
import { SEO, SEO_CONFIG } from '../shared/components/seo';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
import { logger } from '@/core/logging';
import { useToast } from '@/hooks/useToast';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const handleError = useStandardErrorHandler();

  return (
    <>
      <SEO {...SEO_CONFIG.forgotPassword} />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Forgot Password?</h1>
          <p className="text-gray-600 dark:text-gray-400">No worries, we'll send you reset instructions</p>
        </div>

        {/* Forgot Password Form Card */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 animate-scale-in">
          <ForgotPasswordForm
            onSuccess={() => {
              logger().info('Password reset email sent');
              toast.success('Reset email sent! Check your inbox.');
            }}
            onError={(error) => {
              // Use standard error handler for consistent error UX
              handleError(error, {
                context: { operation: 'forgotPassword', page: 'ForgotPasswordPage' },
                customMessage: 'Failed to send reset email. Please try again.',
              });
            }}
          />
        </div>

        {/* Back to Login Link */}
        <p className="text-center mt-6 text-gray-600 dark:text-gray-400 animate-slide-up">
          Remember your password?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold transition-colors">
            Back to login
          </Link>
        </p>
      </div>
    </div>
    </>
  );
}
