import type { FC } from 'react';

import Breadcrumb from '@shared/ui/Breadcrumb';

const SettingsPage: FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
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
              Settings
            </h1>
          </div>

          <div style={{ padding: '1rem 1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    color: '#111827',
                  }}
                >
                  Account Settings
                </h3>
                <p
                  style={{
                    marginTop: '0.25rem',
                    fontSize: '0.875rem',
                    color: '#6b7280',
                  }}
                >
                  Manage your account preferences and security settings.
                </p>
              </div>

              <div
                style={{
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '1.5rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    color: '#111827',
                  }}
                >
                  Notifications
                </h3>
                <p
                  style={{
                    marginTop: '0.25rem',
                    fontSize: '0.875rem',
                    color: '#6b7280',
                  }}
                >
                  Configure your notification preferences.
                </p>
              </div>

              <div
                style={{
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '1.5rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    color: '#111827',
                  }}
                >
                  Privacy
                </h3>
                <p
                  style={{
                    marginTop: '0.25rem',
                    fontSize: '0.875rem',
                    color: '#6b7280',
                  }}
                >
                  Control your privacy settings and data preferences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
