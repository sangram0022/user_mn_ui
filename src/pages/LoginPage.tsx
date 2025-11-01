// ========================================
// Login Page
// User authentication page with LoginForm
// ========================================

import { Link } from 'react-router-dom';
import { LoginForm, OAuthButtons } from '../domains/auth/components';

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to your account to continue</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 space-y-6 animate-scale-in">
          <LoginForm
            onSuccess={() => {
              console.log('Login successful!');
            }}
            onError={(error) => {
              console.error('Login failed:', error);
            }}
            redirectTo="/dashboard"
          />

          {/* OAuth Buttons */}
          <OAuthButtons />
        </div>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-gray-600 dark:text-gray-400 animate-slide-up">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
