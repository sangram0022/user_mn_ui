// ========================================
// Register Page
// User registration page with RegisterForm
// ========================================

import { Link } from 'react-router-dom';
import { RegisterForm } from '../domains/auth/components';
import { SEO, SEO_CONFIG } from '../shared/components/seo';

export default function RegisterPage() {

  return (
    <>
      <SEO {...SEO_CONFIG.register} />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Join thousands of users managing teams efficiently</p>
        </div>

        {/* Register Form Card */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 animate-scale-in">
          <RegisterForm
            onSuccess={() => {
              console.log('Registration successful!');
            }}
            onError={(error) => {
              console.error('Registration failed:', error);
            }}
            redirectTo="/auth/verify"
          />
        </div>

        {/* Sign In Link */}
        <p className="text-center mt-6 text-gray-600 dark:text-gray-400 animate-slide-up">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
    </>
  );
}
