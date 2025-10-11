import { ClipboardList } from 'lucide-react';
import React from 'react';

const MyWorkflowsPage: React.FC = () => (
  <section style={{ padding: '2rem 1rem' }}>
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div
        style={{
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          borderRadius: '1rem',
          border: '1px solid #e5e7eb',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            margin: '0 auto 1.5rem',
            display: 'flex',
            height: '4rem',
            width: '4rem',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '9999px',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
          }}
        >
          <ClipboardList style={{ height: '2rem', width: '2rem' }} aria-hidden="true" />
        </div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '0.5rem',
          }}
        >
          My Workflows
        </h1>
        <p
          style={{
            color: '#4b5563',
            maxWidth: '48rem',
            margin: '0 auto',
          }}
        >
          Workflow requests and submissions assigned to you will appear here. Once a workflow is
          created, you can track its status, review assigned tasks, and collaborate with team
          members in real time.
        </p>
        <div style={{ marginTop: '2rem' }}>
          <button
            type="button"
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
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
          >
            Explore workflow templates
          </button>
        </div>
      </div>
    </div>
  </section>
);

export default MyWorkflowsPage;
