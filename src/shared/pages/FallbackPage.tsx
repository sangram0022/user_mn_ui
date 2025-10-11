import React from 'react';
import { Link } from 'react-router-dom';

interface FallbackPageProps {
  error?: Error;
  resetError?: () => void;
}

export const FallbackPage: React.FC<FallbackPageProps> = ({ error, resetError }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Something went wrong</h2>
          <p className="mt-2 text-sm text-gray-600">
            {error?.message || 'An unexpected error occurred while loading this page.'}
          </p>
        </div>

        <div className="space-y-4">
          {resetError && (
            <button
              onClick={resetError}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try again
            </button>
          )}

          <Link
            to="/"
            className="block w-full py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FallbackPage;
