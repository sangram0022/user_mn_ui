import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => (
  <section className="flex min-h-[60vh] items-center justify-center px-4 py-12">
    <div className="flex flex-col gap-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Error 404</p>
      <h1 className="text-4xl font-bold text-gray-900">Page not found</h1>
      <p className="mx-auto max-w-2xl text-base text-gray-600">
        The page you are looking for might have been removed, had its name changed, or is
        temporarily unavailable.
      </p>
      <div className="flex flex-col items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 no-underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Go home
        </Link>
        <Link
          to="/help"
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-transparent px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 no-underline"
        >
          Visit help center
        </Link>
      </div>
    </div>
  </section>
);

export default NotFoundPage;
