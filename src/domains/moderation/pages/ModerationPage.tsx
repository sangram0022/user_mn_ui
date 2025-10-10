import type { FC } from 'react';
import { Eye, UserCheck, AlertTriangle, FileText } from 'lucide-react';

import { useAuth } from '../../auth/context/AuthContext';
import Breadcrumb from '@shared/ui/Breadcrumb';

const ModerationPage: FC = () => { const { hasPermission } = useAuth();

  if (!hasPermission('admin') && !hasPermission('moderator')) { return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        background: '#fef2f2',
        borderRadius: '12px',
        border: '1px solid #fecaca'
      }}>
        <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>
          ⛔ Access Denied
        </h3>
        <p style={{ color: '#7f1d1d' }}>
          You don't have permission to access moderation features.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb />
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0',
          color: '#111827',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Eye className="w-6 h-6" />
          Moderation Center
        </h1>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Review and moderate user activities and content
        </p>
      </div>

      {/* Coming Soon Message */}
      <div style={{ background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '3rem',
        textAlign: 'center'
      }}>
        <Eye className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 style={{ color: '#111827', marginBottom: '1rem' }}>Moderation Features Coming Soon</h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Advanced moderation tools are being developed and will be available soon.
        </p>
        
        <div style={{ display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <div style={{ padding: '1.5rem',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <UserCheck className="w-8 h-8 text-blue-600 mb-2" />
            <h3 style={{ color: '#111827', marginBottom: '0.5rem' }}>User Reviews</h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
              Review user profiles and activities
            </p>
          </div>

          <div style={{ padding: '1.5rem',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <AlertTriangle className="w-8 h-8 text-orange-600 mb-2" />
            <h3 style={{ color: '#111827', marginBottom: '0.5rem' }}>Content Moderation</h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
              Review flagged content and take action
            </p>
          </div>

          <div style={{ padding: '1.5rem',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <FileText className="w-8 h-8 text-green-600 mb-2" />
            <h3 style={{ color: '#111827', marginBottom: '0.5rem' }}>Activity Logs</h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
              Monitor user activities and behaviors
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModerationPage;
