import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, Mail, XCircle } from 'lucide-react';

import { apiClient } from '@services/apiClient';
import { useErrorHandler } from '@hooks/errors/useErrorHandler';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your email...');
  const [countdown, setCountdown] = useState<number>(5);
  const { handleError } = useErrorHandler();

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided. Please check your email for the correct link.');
        return;
      }

      try {
        const response = await apiClient.verifyEmail(token);

        setStatus('success');
        setMessage(
          response.message ??
            'Your email has been successfully verified! You can now sign in to your account.'
        );
      } catch (error: unknown) {
        handleError(error);
        setStatus('error');
        setMessage('Email verification failed. Please try again or request a new verification email.');
      }
    };

    void verifyEmail();
  }, [token, handleError]);

  useEffect(() => {
    if (status !== 'success') {
      return;
    }

    if (countdown > 0) {
      const timer = window.setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => window.clearTimeout(timer);
    }

    navigate('/login', {
      state: {
        message: 'Email verified successfully! Please sign in with your credentials.'
      }
    });
  }, [status, countdown, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white shadow-xl sm:rounded-2xl border border-gray-100 p-8 sm:p-10">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              {getStatusIcon()}
            </div>

            <h2 className={`text-3xl font-bold tracking-tight mb-2 ${getStatusColor()}`}>
              {status === 'loading' && 'Verifying Email'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </h2>

            <p className="text-gray-600 mb-6">{message}</p>

            {status === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  Redirecting to login in {countdown} second{countdown === 1 ? '' : 's'}...
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="space-y-3">
                  <p className="text-sm text-red-800">
                    <strong>What you can do:</strong>
                  </p>
                  <ul className="text-sm text-red-700 space-y-1 ml-4">
                    <li>• Check if the link is correct and not expired</li>
                    <li>• Request a new verification email</li>
                    <li>• Contact support if the problem persists</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {status === 'success' ? (
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Go to Login
                </Link>
              ) : status === 'error' ? (
                <>
                  <Link
                    to="/email-confirmation"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Mail className="h-4 w-4" />
                    Request New Verification Email
                  </Link>
                  <Link
                    to="/login"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Back to Login
                  </Link>
                </>
              ) : (
                <div className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </div>
              )}
            </div>
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

export default EmailVerificationPage;
