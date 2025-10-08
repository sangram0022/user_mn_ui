import React, { useState, useEffect, useCallback } from 'react';

import { useAuth } from '@features/auth';
import { apiClient } from '@services/apiClient';
import { getUserRoleName, userHasRole } from '@utils/user';

// Component interfaces based on backend API responses
interface DashboardUserAnalytics {
  total_users: number;
  active_users: number;
  inactive_users: number;
  new_users_last_30_days: number;
  engagement_distribution: {
    high: number;
    medium: number;
    low: number;
  };
  growth_rate: number;
  retention_rate: number;
}

interface DashboardLifecycleAnalytics {
  users_by_stage: Record<string, number>;
  completion_rates: Record<string, number>;
  average_progression_time: Record<string, number>;
  stuck_users: Array<{ stage: string; count: number }>;
}

interface DashboardPendingWorkflow {
  request_id: string;
  workflow_type: string;
  requester_name: string;
  created_at: string;
  priority: string;
  description: string;
}

const Dashboard: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [userAnalytics, setUserAnalytics] = useState<DashboardUserAnalytics | null>(null);
  const [lifecycleAnalytics, setLifecycleAnalytics] = useState<DashboardLifecycleAnalytics | null>(null);
  const [pendingWorkflows, setPendingWorkflows] = useState<DashboardPendingWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  type DashboardResult =
    | { type: 'analytics'; data: DashboardUserAnalytics }
    | { type: 'lifecycle'; data: DashboardLifecycleAnalytics }
    | { type: 'workflows'; data: DashboardPendingWorkflow[] };

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const promises: Array<Promise<DashboardResult>> = [];

      // Load user analytics if user has permission
      if (hasPermission('ADMIN_ANALYTICS')) {
        promises.push(
          apiClient.getUserAnalytics().then((data): DashboardResult => ({
            type: 'analytics',
            data: {
              total_users: data.total_users ?? 0,
              active_users: data.active_users ?? 0,
              inactive_users: data.inactive_users ?? 0,
              new_users_last_30_days: data.new_users_last_30_days ?? data.new_users_today ?? 0,
              engagement_distribution: data.engagement_distribution ?? { high: 0, medium: 0, low: 0 },
              growth_rate: data.growth_rate ?? 0,
              retention_rate: data.retention_rate ?? 0
            }
          }))
        );
      }

      // Load lifecycle analytics if user has permission
      if (hasPermission('ADMIN_ANALYTICS')) {
        promises.push(
          apiClient
            .getLifecycleAnalytics<{ analytics?: DashboardLifecycleAnalytics } | DashboardLifecycleAnalytics>()
            .then((data): DashboardResult => ({
              type: 'lifecycle',
              data: (data as { analytics?: DashboardLifecycleAnalytics }).analytics ?? (data as DashboardLifecycleAnalytics)
            }))
        );
      }

      // Load pending workflows for current user
      promises.push(
        apiClient.getPendingApprovals().then((data): DashboardResult => ({
          type: 'workflows',
          data: data.map((workflow) => ({
            request_id: workflow.request_id ?? workflow.id,
            workflow_type: workflow.workflow_type ?? workflow.type,
            requester_name: workflow.requester_name ?? workflow.user?.full_name ?? workflow.user?.email ?? 'Unknown',
            created_at: workflow.created_at,
            priority: workflow.priority,
            description: workflow.description ?? ''
          }))
        }))
      );

      const results = await Promise.allSettled(promises);
      
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { type, data } = result.value as { type: string; data: unknown };
          switch (type) {
            case 'analytics':
              setUserAnalytics((data as { analytics?: DashboardUserAnalytics }).analytics || data as DashboardUserAnalytics);
              break;
            case 'lifecycle':
              setLifecycleAnalytics((data as { analytics?: DashboardLifecycleAnalytics }).analytics || data as DashboardLifecycleAnalytics);
              break;
            case 'workflows': {
              const workflows = Array.isArray(data)
                ? (data as DashboardPendingWorkflow[])
                : (data as { workflows?: DashboardPendingWorkflow[] }).workflows || [];
              setPendingWorkflows(workflows);
              break;
            }
          }
        }
      });
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <div style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '2rem',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <div style={{ color: '#dc2626' }}>{error}</div>
        <button
          onClick={loadDashboardData}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Section */}
      <div style={{
        background: 'var(--background-secondary)',
        padding: '2rem',
        borderRadius: '16px',
        marginBottom: '2rem',
        border: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <h1 style={{
          margin: '0 0 0.5rem 0',
          fontSize: '2rem',
          color: 'var(--text-primary)',
          background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Welcome back, {user?.full_name || user?.username || user?.email}! 👋
        </h1>
        <p style={{
          margin: 0,
          color: 'var(--text-secondary)',
          fontSize: '1.1rem'
        }}>
          {userHasRole(user, 'admin') ? 'Admin Dashboard' : 'User Dashboard'} • 
          Role: <strong>{getUserRoleName(user) || 'Member'}</strong> • 
          Stage: <strong>{user?.lifecycle_stage || 'active'}</strong>
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <QuickActionCard
          title="Profile Settings"
          description="Update your profile and preferences"
          icon="👤"
          onClick={() => alert('Navigate to profile settings')}
        />
        
        {hasPermission('user:read') && (
          <QuickActionCard
            title="Manage Users"
            description="View and manage user accounts"
            icon="👥"
            onClick={() => alert('Navigate to user management')}
          />
        )}
        
        {hasPermission('ADMIN_ANALYTICS') && (
          <QuickActionCard
            title="Analytics"
            description="View detailed analytics and reports"
            icon="📊"
            onClick={() => alert('Navigate to analytics')}
          />
        )}
        
        <QuickActionCard
          title="Help & Support"
          description="Get help and contact support"
          icon="❓"
          onClick={() => window.open('http://localhost:8000/docs', '_blank')}
        />
      </div>

      {/* Analytics Section - Admin Only */}
      {hasPermission('ADMIN_ANALYTICS') && userAnalytics && (
        <div style={{
          background: 'var(--background-secondary)',
          padding: '2rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          border: '1px solid var(--border-color)'
        }}>
          <h2 style={{
            margin: '0 0 1.5rem 0',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📊 User Analytics
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <MetricCard title="Total Users" value={userAnalytics.total_users} icon="👥" />
            <MetricCard title="Active Users" value={userAnalytics.active_users} icon="✅" color="#10b981" />
            <MetricCard title="New Users (30d)" value={userAnalytics.new_users_last_30_days} icon="📈" color="#06b6d4" />
            <MetricCard title="Growth Rate" value={`${userAnalytics.growth_rate}%`} icon="📊" color="#8b5cf6" />
          </div>

          {userAnalytics.engagement_distribution && (
            <div>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>
                Engagement Distribution
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem'
              }}>
                <EngagementCard 
                  level="High" 
                  count={userAnalytics.engagement_distribution.high} 
                  color="#10b981" 
                />
                <EngagementCard 
                  level="Medium" 
                  count={userAnalytics.engagement_distribution.medium} 
                  color="#f59e0b" 
                />
                <EngagementCard 
                  level="Low" 
                  count={userAnalytics.engagement_distribution.low} 
                  color="#ef4444" 
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lifecycle Analytics - Admin Only */}
      {hasPermission('ADMIN_ANALYTICS') && lifecycleAnalytics && (
        <div style={{
          background: 'var(--background-secondary)',
          padding: '2rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          border: '1px solid var(--border-color)'
        }}>
          <h2 style={{
            margin: '0 0 1.5rem 0',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🔄 Lifecycle Analytics
          </h2>
          
          {lifecycleAnalytics.users_by_stage && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem'
            }}>
              {Object.entries(lifecycleAnalytics.users_by_stage).map(([stage, count]) => (
                <LifecycleStageCard key={stage} stage={stage} count={count} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pending Workflows */}
      {pendingWorkflows.length > 0 && (
        <div style={{
          background: 'var(--background-secondary)',
          padding: '2rem',
          borderRadius: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <h2 style={{
            margin: '0 0 1.5rem 0',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ⏳ Pending Approvals ({pendingWorkflows.length})
          </h2>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {pendingWorkflows.slice(0, 5).map((workflow) => (
              <WorkflowCard key={workflow.request_id} workflow={workflow} />
            ))}
          </div>
          
          {pendingWorkflows.length > 5 && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button style={{
                padding: '0.5rem 1rem',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                View All Approvals
              </button>
            </div>
          )}
        </div>
      )}

      {/* No Pending Workflows Message */}
      {pendingWorkflows.length === 0 && (
        <div style={{
          background: 'var(--background-secondary)',
          padding: '2rem',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
            All Caught Up!
          </h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            You have no pending approvals at this time.
          </p>
        </div>
      )}
    </div>
  );
};

// Helper Components
const QuickActionCard: React.FC<{
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}> = ({ title, description, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="quick-action-card"
  >
    <span aria-hidden="true" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</span>
    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{title}</h3>
    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
      {description}
    </p>
  </button>
);

const MetricCard: React.FC<{
  title: string;
  value: number | string;
  icon: string;
  color?: string;
}> = ({ title, value, icon, color = 'var(--primary-color)' }) => (
  <div style={{
    background: 'var(--background-primary)',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
    <div style={{ fontSize: '2rem', fontWeight: 'bold', color, marginBottom: '0.25rem' }}>
      {value}
    </div>
    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
      {title}
    </div>
  </div>
);

const EngagementCard: React.FC<{
  level: string;
  count: number;
  color: string;
}> = ({ level, count, color }) => (
  <div style={{
    background: 'var(--background-primary)',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    textAlign: 'center'
  }}>
    <div style={{
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      background: color,
      margin: '0 auto 0.5rem auto'
    }} />
    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
      {count}
    </div>
    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
      {level} Engagement
    </div>
  </div>
);

const LifecycleStageCard: React.FC<{
  stage: string;
  count: number;
}> = ({ stage, count }) => {
  const getStageIcon = (stage: string) => {
    const icons: Record<string, string> = {
      registration: '📝',
      onboarding: '🚀',
      active: '✅',
      retention: '🔄',
      dormant: '💤'
    };
    return icons[stage] || '👤';
  };

  return (
    <div style={{
      background: 'var(--background-primary)',
      padding: '1rem',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
        {getStageIcon(stage)}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
        {count}
      </div>
      <div style={{ 
        color: 'var(--text-secondary)', 
        fontSize: '0.85rem',
        textTransform: 'capitalize'
      }}>
        {stage}
      </div>
    </div>
  );
};

const WorkflowCard: React.FC<{
  workflow: DashboardPendingWorkflow;
}> = ({ workflow }) => (
  <div style={{
    background: 'var(--background-primary)',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }}>
    <div style={{ flex: 1 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.25rem'
      }}>
        <span style={{ fontSize: '1.2rem' }}>⚙️</span>
        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
          {(workflow.workflow_type || 'workflow').replace(/_/g, ' ').toUpperCase()}
        </span>
        <span style={{
          padding: '0.125rem 0.5rem',
          background: 'var(--primary-color)',
          color: 'white',
          borderRadius: '12px',
          fontSize: '0.75rem'
        }}>
          {workflow.priority}
        </span>
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Requested by: {workflow.requester_name} • {new Date(workflow.created_at).toLocaleDateString()}
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
        {workflow.description}
      </div>
    </div>
    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
      <button style={{
        padding: '0.5rem 1rem',
        background: 'var(--accent-color)',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.85rem'
      }}>
        Approve
      </button>
      <button style={{
        padding: '0.5rem 1rem',
        background: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.85rem'
      }}>
        Reject
      </button>
    </div>
  </div>
);

export default Dashboard;
