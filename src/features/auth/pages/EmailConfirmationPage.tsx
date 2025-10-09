import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Mail, RefreshCw } from 'lucide-react';

import { apiClient } from '@lib/api';

const EmailConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(30);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as { email?: string } | null;
    const urlParams = new URLSearchParams(location.search);
    const emailFromUrl = urlParams.get('email');

    const userEmail = state?.email || emailFromUrl || '';
    setEmail(userEmail);

    const timer = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/login', {
            state: {
              message: 'Please check your email and verify your account before logging in.'
            }
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [location, navigate]);

  const handleResendEmail = async () => {
    if (!email || isResending) {
      return;
    }

    setIsResending(true);
    setResendMessage(null);

    try {
      const response = await apiClient.resendVerification({ email });
      setResendMessage(
        response.message ?? 'Verification email has been resent successfully!'
      );
    } catch (error) {
      console.error('Resend verification error:', error);
      setResendMessage('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white shadow-xl sm:rounded-2xl border border-gray-100 p-8 sm:p-10">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Check your email</h2>

            <p className="text-gray-600 mb-6">
              We've sent a verification link to{' '}
              <span className="font-medium text-gray-900">{email || 'your email address'}</span>
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">What happens next?</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Click the verification link in your email</li>
                    <li>• Your account will be activated automatically</li>
                    <li>• You can then sign in with your credentials</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-amber-900 mb-1">Didn't receive the email?</h3>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Check your spam or junk folder</li>
                    <li>• The link expires in 24 hours</li>
                    <li>• Make sure to check all email aliases</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {resendMessage && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    resendMessage.includes('successfully')
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {resendMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleResendEmail}
                disabled={isResending || !email}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? 'Resending...' : 'Resend verification email'}
              </button>

              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Auto-redirecting to login in {countdown} seconds...
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <Link to="/help" className="font-medium text-blue-600 hover:text-blue-500">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationPage;
