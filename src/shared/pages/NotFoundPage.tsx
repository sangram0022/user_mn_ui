import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => (
  <section
    style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
    }}
  >
    <div
      style={{
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      <p
        style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          letterSpacing: '0.05em',
          color: '#2563eb',
          textTransform: 'uppercase',
        }}
      >
        Error 404
      </p>
      <h1
        style={{
          fontSize: '2.25rem',
          fontWeight: 'bold',
          color: '#111827',
        }}
      >
        Page not found
      </h1>
      <p
        style={{
          fontSize: '1rem',
          color: '#4b5563',
          maxWidth: '36rem',
          margin: '0 auto',
        }}
      >
        The page you are looking for might have been removed, had its name changed, or is
        temporarily unavailable.
      </p>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0.5rem',
            backgroundColor: '#2563eb',
            padding: '0.625rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#ffffff',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            transition: 'background-color 0.2s ease',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
        >
          <ArrowLeft
            style={{ height: '1rem', width: '1rem', marginRight: '0.5rem' }}
            aria-hidden="true"
          />
          Go home
        </Link>
        <Link
          to="/help"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            padding: '0.625rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            transition: 'background-color 0.2s ease',
            textDecoration: 'none',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          Visit help center
        </Link>
      </div>
    </div>
  </section>
);

export default NotFoundPage;
