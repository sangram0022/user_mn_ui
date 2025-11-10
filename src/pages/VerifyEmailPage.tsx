// ========================================
// Verify Email Page
// Email verification handler
// ========================================

import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useVerifyEmail } from '../domains/auth/hooks/useVerifyEmail';

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  
  // Get token from URL params or query string
  const verificationToken = token || searchParams.get('token') || '';

  const verifyMutation = useVerifyEmail({
    onSuccess: () => {
      setStatus('success');
    },
    onError: () => {
      setStatus('error');
    },
  });

  useEffect(() => {
    if (verificationToken) {
      // Auto-verify on mount
      verifyMutation.mutate({ token: verificationToken });
    } else {
      setStatus('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationToken]);

  // Verifying state
  if (status === 'verifying') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 animate-fade-in">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Verifying Email</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we verify your email address...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-linear-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 animate-fade-in">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 animate-scale-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Email Verified!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Continue to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-linear-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 animate-scale-in">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Verification Failed</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {verifyMutation.error?.message || 'The verification link is invalid or has expired.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                to="/login"
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                Back to Login
              </Link>
              <Link
                to="/auth/resend-verification"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Resend Email
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
