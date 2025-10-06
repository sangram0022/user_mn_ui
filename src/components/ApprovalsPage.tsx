import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Clock, CheckCircle, Users } from 'lucide-react';
import Breadcrumb from './Breadcrumb';

const ApprovalsPage: React.FC = () => {
  const { hasPermission } = useAuth();

  if (!hasPermission('admin') && !hasPermission('moderator')) {
    return (
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
          You don't have permission to access approval workflows.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb />
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          margin: '0 0 0.5rem 0',
          color: '#111827',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Clock className="w-6 h-6" />
          Approval Workflows
        </h1>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Handle pending approvals and user requests
        </p>
      </div>

      {/* Coming Soon Message */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '3rem',
        textAlign: 'center'
      }}>
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 style={{ color: '#111827', marginBottom: '1rem' }}>Approval Workflows Coming Soon</h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Advanced approval workflow management tools are being developed.
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <div style={{
            padding: '1.5rem',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <Clock className="w-8 h-8 text-orange-600 mb-2" />
            <h3 style={{ color: '#111827', marginBottom: '0.5rem' }}>Pending Requests</h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
              15 requests awaiting approval
            </p>
          </div>

          <div style={{
            padding: '1.5rem',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
            <h3 style={{ color: '#111827', marginBottom: '0.5rem' }}>Approved Today</h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
              8 requests successfully processed
            </p>
          </div>

          <div style={{
            padding: '1.5rem',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <Users className="w-8 h-8 text-blue-600 mb-2" />
            <h3 style={{ color: '#111827', marginBottom: '0.5rem' }}>User Registrations</h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
              5 new user approvals needed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalsPage;
