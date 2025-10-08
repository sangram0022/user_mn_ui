import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => (
  <section className="min-h-[60vh] flex items-center justify-center px-4 py-12">
    <div className="text-center space-y-6">
      <p className="text-sm font-semibold tracking-wide text-blue-600 uppercase">Error 404</p>
      <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">Page not found</h1>
      <p className="text-base text-gray-600 max-w-xl mx-auto">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
          Go home
        </Link>
        <Link
          to="/help"
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Visit help center
        </Link>
      </div>
    </div>
  </section>
);

export default NotFoundPage;
