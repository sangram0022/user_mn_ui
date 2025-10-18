import { ArrowLeft } from 'lucide-react';
import type React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => (
  <section className="flex min-h-[60vh] items-center justify-center px-4 py-12">
    <div className="flex flex-col gap-6 text-center">
      <p
        className="text-sm font-semibold uppercase tracking-wide"
        style={{ color: 'var(--theme-primary)' }}
      >
        Error 404
      </p>
      <h1 className="text-4xl font-bold" style={{ color: 'var(--theme-text)' }}>
        Page not found
      </h1>
      <p className="mx-auto max-w-2xl text-base" style={{ color: 'var(--theme-textSecondary)' }}>
        The page you are looking for might have been removed, had its name changed, or is
        temporarily unavailable.
      </p>
      <div className="flex flex-col items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium shadow-sm transition-colors duration-200 no-underline"
          style={{ background: 'var(--theme-primary)', color: 'var(--theme-onPrimary)' }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Go home
        </Link>
        <Link
          to="/help"
          className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors duration-200 no-underline hover:opacity-80"
          style={{ border: '1px solid var(--theme-border)', color: 'var(--theme-text)' }}
        >
          Visit help center
        </Link>
      </div>
    </div>
  </section>
);

export default NotFoundPage;
