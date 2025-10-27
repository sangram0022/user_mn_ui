import { ArrowLeft } from 'lucide-react';
import type React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => (
  <div className="page-wrapper">
    <div className="container-narrow">
      <section className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <div className="flex flex-col gap-6 text-center">
          <p
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: 'var(--color-primary)' }}
          >
            Error 404
          </p>
          <h1 className="text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Page not found
          </h1>
          <p
            className="mx-auto max-w-2xl text-base"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            The page you are looking for might have been removed, had its name changed, or is
            temporarily unavailable.
          </p>
          <div className="stack-sm">
            <Link to="/" className="btn btn-primary">
              <ArrowLeft className="mr-2 icon-sm" aria-hidden="true" />
              Go Back Home
            </Link>
            <Link to="/help" className="btn btn-secondary">
              Visit help center
            </Link>
          </div>
        </div>
      </section>
    </div>
  </div>
);

export default NotFoundPage;
