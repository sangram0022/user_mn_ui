import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { useAuth } from '@contexts/AuthContext';
import { apiClient } from '@services/apiClientLegacy';
import Breadcrumb from '@shared/ui/Breadcrumb';

interface UserAnalytics {
  total_users: number;
  active_users: number;
  inactive_users: number;
  verified_users: number;
  unverified_users: number;
  users_by_role: Array<{
    role_name: string;
    count: number;
  }>;
  users_by_lifecycle_stage: Array<{
    lifecycle_stage: string;
    count: number;
  }>;
  top_users_by_activity: Array<{
    user_id: number;
    email: string;
    activity_score: number;
  }>;
  recent_registrations: Array<{
    date: string;
    count: number;
  }>;
  lifecycle_transitions: Array<{
    from_stage: string;
    to_stage: string;
    count: number;
  }>;
}

interface UserSegmentation {
  segments: Array<{
    name: string;
    description: string;
    user_count: number;
    criteria: Record<string, unknown>;
  }>;
}

interface MetricCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const Analytics: FC = () => {
  const { hasPermission } = useAuth();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [segmentation, setSegmentation] = useState<UserSegmentation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'lifecycle' | 'engagement' | 'cohorts' | 'segmentation'>('overview');

  useEffect(() => {
    loadAnalytics();
    loadSegmentation();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📊 Analytics: Starting to load analytics data...');
      
      const response = await apiClient.getUserAnalytics();
      
      console.log('📊 Analytics API Response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Analytics loaded from backend:', response.data);
        setAnalytics(response.data as UserAnalytics);
      } else {
        console.warn('⚠️ Analytics API failed, using fallback data');
        throw new Error('Analytics API returned no data');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Analytics API error:', err);
      
      // Only use fallback data if backend is not available
      console.log('📊 Using fallback analytics data due to API error');
      setAnalytics({
        total_users: 0,
        active_users: 0,
        inactive_users: 0,
        verified_users: 0,
        unverified_users: 0,
        users_by_role: [],
        users_by_lifecycle_stage: [],
        top_users_by_activity: [],
        recent_registrations: [],
        lifecycle_transitions: []
      });
      setError(`Analytics temporarily unavailable: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSegmentation = async () => {
    try {
      console.log('🎯 Analytics: Loading user segmentation...');
      
      // Mock data since backend method doesn't exist yet
      console.warn('⚠️ getUserSegmentation API not implemented, using mock data');
      setSegmentation({
        segments: []
      });
    } catch (err: unknown) {
      console.error('❌ Segmentation error:', err);
      setSegmentation({
        segments: []
      });
    }
  };

  if (!hasPermission('analytics:read')) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        background: 'var(--background-secondary)',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
          ⛔ Access Denied
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          You don't have permission to view analytics.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
        <div style={{ color: 'var(--text-secondary)' }}>Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '2rem',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        color: '#dc2626'
      }}>
        {error}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📈</div>
        <div style={{ color: 'var(--text-secondary)' }}>No analytics data available</div>
      </div>
    );
  }

  const overviewMetrics: MetricCard[] = [
    {
      title: 'Total Users',
      value: analytics.total_users,
      icon: '👥',
      color: 'var(--primary-color)'
    },
    {
      title: 'Active Users',
      value: analytics.active_users,
      icon: '✅',
      color: '#10b981',
      change: `${Math.round((analytics.active_users / analytics.total_users) * 100)}%`
    },
    {
      title: 'Verified Users',
      value: analytics.verified_users,
      icon: '🔐',
      color: '#3b82f6',
      change: `${Math.round((analytics.verified_users / analytics.total_users) * 100)}%`
    },
    {
      title: 'Inactive Users',
      value: analytics.inactive_users,
      icon: '⏸️',
      color: '#ef4444',
      change: `${Math.round((analytics.inactive_users / analytics.total_users) * 100)}%`
    }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb />
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          margin: '0 0 0.5rem 0',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📊 User Analytics
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Comprehensive insights into user behavior and platform performance
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '2px solid var(--border-color)'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: '📈' },
          { id: 'lifecycle', label: 'Lifecycle', icon: '🔄' },
          { id: 'segmentation', label: 'Segmentation', icon: '🎯' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'lifecycle' | 'engagement' | 'cohorts' | 'segmentation')}
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary-color)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--primary-color)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '600' : '400',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab metrics={overviewMetrics} analytics={analytics} />
      )}

      {activeTab === 'lifecycle' && (
        <LifecycleTab analytics={analytics} />
      )}

      {activeTab === 'segmentation' && (
        <SegmentationTab segmentation={segmentation} onRefresh={loadSegmentation} />
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab: FC<{
  metrics: MetricCard[];
  analytics: UserAnalytics;
}> = ({ metrics, analytics }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        {metrics.map((metric, index) => (
          <MetricCardComponent key={index} metric={metric} />
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        {/* Users by Role */}
        <ChartCard
          title="Users by Role"
          icon="👔"
          data={analytics.users_by_role}
          type="pie"
        />

        {/* Recent Registrations */}
        <ChartCard
          title="Recent Registrations"
          icon="📅"
          data={analytics.recent_registrations}
          type="line"
        />

        {/* Top Active Users */}
        <div style={{
          background: 'var(--background-secondary)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          gridColumn: 'span 1'
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🏆 Top Active Users
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analytics.top_users_by_activity.slice(0, 5).map((user, index) => (
              <div
                key={user.user_id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: 'var(--background-primary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : 'var(--primary-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                      {user.email}
                    </div>
                  </div>
                </div>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  background: 'var(--primary-color)',
                  color: 'white',
                  borderRadius: '16px',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}>
                  {user.activity_score}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Lifecycle Tab Component
const LifecycleTab: FC<{
  analytics: UserAnalytics;
}> = ({ analytics }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Lifecycle Stage Distribution */}
      <div style={{
        background: 'var(--background-secondary)',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <h3 style={{
          margin: '0 0 1.5rem 0',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🎯 Lifecycle Stage Distribution
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {analytics.users_by_lifecycle_stage.map((stage) => (
            <div
              key={stage.lifecycle_stage}
              style={{
                padding: '1rem',
                background: 'var(--background-primary)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
              }}
            >
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'var(--primary-color)',
                marginBottom: '0.5rem'
              }}>
                {stage.count}
              </div>
              <div style={{
                color: 'var(--text-primary)',
                fontWeight: '500',
                textTransform: 'capitalize'
              }}>
                {stage.lifecycle_stage}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lifecycle Transitions */}
      <div style={{
        background: 'var(--background-secondary)',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <h3 style={{
          margin: '0 0 1.5rem 0',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🔄 Lifecycle Transitions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {analytics.lifecycle_transitions.map((transition, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'var(--background-primary)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{
                  padding: '0.5rem 1rem',
                  background: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '16px',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  textTransform: 'capitalize'
                }}>
                  {transition.from_stage}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>→</span>
                <span style={{
                  padding: '0.5rem 1rem',
                  background: '#dcfce7',
                  color: '#166534',
                  borderRadius: '16px',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  textTransform: 'capitalize'
                }}>
                  {transition.to_stage}
                </span>
              </div>
              <div style={{
                padding: '0.5rem 1rem',
                background: 'var(--primary-color)',
                color: 'white',
                borderRadius: '16px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                {transition.count} users
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Segmentation Tab Component
const SegmentationTab: FC<{
  segmentation: UserSegmentation | null;
  onRefresh: () => void;
}> = ({ segmentation, onRefresh }) => {
  if (!segmentation) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎯</div>
        <div style={{ color: 'var(--text-secondary)' }}>No segmentation data available</div>
        <button
          onClick={onRefresh}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Refresh Data
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
          User Segments
        </h3>
        <button
          onClick={onRefresh}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {segmentation.segments.map((segment, index) => (
          <div
            key={index}
            style={{
              background: 'var(--background-secondary)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{
                margin: '0 0 0.5rem 0',
                color: 'var(--text-primary)',
                fontSize: '1.1rem'
              }}>
                {segment.name}
              </h4>
              <p style={{
                margin: '0 0 1rem 0',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem'
              }}>
                {segment.description}
              </p>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '1rem',
              background: 'var(--background-primary)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: 'var(--primary-color)',
                  marginBottom: '0.25rem'
                }}>
                  {segment.user_count}
                </div>
                <div style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem'
                }}>
                  Users
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCardComponent: FC<{ metric: MetricCard }> = ({ metric }) => {
  return (
    <div style={{
      background: 'var(--background-secondary)',
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid var(--border-color)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <div>
          <h3 style={{
            margin: '0 0 0.5rem 0',
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            {metric.title}
          </h3>
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'var(--text-primary)'
          }}>
            {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
          </div>
        </div>
        <div style={{
          fontSize: '2rem',
          opacity: 0.7
        }}>
          {metric.icon}
        </div>
      </div>
      
      {metric.change && (
        <div style={{
          padding: '0.25rem 0.75rem',
          background: metric.color + '20',
          color: metric.color,
          borderRadius: '16px',
          fontSize: '0.85rem',
          fontWeight: '500',
          display: 'inline-block'
        }}>
          {metric.change}
        </div>
      )}
    </div>
  );
};

// Chart Card Component
const ChartCard: FC<{
  title: string;
  icon: string;
  data: Array<Record<string, unknown>>;
  type: 'pie' | 'line' | 'bar';
}> = ({ title, icon, data }) => {
  return (
    <div style={{
      background: 'var(--background-secondary)',
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid var(--border-color)'
    }}>
      <h3 style={{
        margin: '0 0 1rem 0',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        {icon} {title}
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {data.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: 'var(--background-primary)',
              borderRadius: '6px',
              border: '1px solid var(--border-color)'
            }}
          >
            <span style={{
              color: 'var(--text-primary)',
              textTransform: 'capitalize'
            }}>
              {String((item as { role_name?: string; lifecycle_stage?: string; date?: string }).role_name || 
                     (item as { role_name?: string; lifecycle_stage?: string; date?: string }).lifecycle_stage || 
                     (item as { role_name?: string; lifecycle_stage?: string; date?: string }).date || 
                     Object.keys(item)[0] || 'Unknown')}
            </span>
            <span style={{
              fontWeight: '600',
              color: 'var(--primary-color)'
            }}>
              {String((item as { count?: number }).count || Object.values(item)[1] || 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
