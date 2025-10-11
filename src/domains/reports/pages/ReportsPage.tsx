import type { FC } from 'react';

import Breadcrumb from '@shared/ui/Breadcrumb';

const ReportsPage: FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem 0' }}>
      <div style={{ maxWidth: '1536px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Breadcrumb Navigation */}
        <Breadcrumb />

        <div
          style={{
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            borderRadius: '0.5rem',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#111827',
              }}
            >
              Reports
            </h1>
          </div>

          <div style={{ padding: '1rem 1.5rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
              }}
            >
              <div
                style={{
                  backgroundColor: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    color: '#111827',
                    marginBottom: '0.5rem',
                  }}
                >
                  User Activity Report
                </h3>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#4b5563',
                    marginBottom: '1rem',
                  }}
                >
                  View detailed user activity and engagement metrics.
                </p>
                <button
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
                >
                  Generate Report
                </button>
              </div>

              <div
                style={{
                  backgroundColor: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    color: '#111827',
                    marginBottom: '0.5rem',
                  }}
                >
                  System Usage Report
                </h3>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#4b5563',
                    marginBottom: '1rem',
                  }}
                >
                  Monitor system usage and performance metrics.
                </p>
                <button
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
                >
                  Generate Report
                </button>
              </div>

              <div
                style={{
                  backgroundColor: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    color: '#111827',
                    marginBottom: '0.5rem',
                  }}
                >
                  Security Report
                </h3>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#4b5563',
                    marginBottom: '1rem',
                  }}
                >
                  Review security events and access patterns.
                </p>
                <button
                  style={{
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
