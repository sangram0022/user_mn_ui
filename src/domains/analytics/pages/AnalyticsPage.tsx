import { logger } from './../../../shared/utils/logger';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from 'src/domains/auth';
import { apiClient } from '@lib/api';
import type { UserAnalytics as AnalyticsSummary } from '@shared/types';
import Breadcrumb from '@shared/ui/Breadcrumb';

type TopUser = { user_id: string | number;
  email: string;
  activity_score: number; };

type LifecycleTransition = { from_stage: string;
  to_stage: string;
  count: number; };

type AnalyticsData = AnalyticsSummary & { engagement_distribution: Record<string, number>;
  inactive_users: number;
  new_users_last_30_days: number;
  growth_rate: number;
  top_users_by_activity: TopUser[];
  lifecycle_transitions: LifecycleTransition[]; };

type ChartDataItem = { label: string;
  value: number;
  detail?: string; };

interface UserSegmentation { segments: Array<{
    name: string;
    description: string;
    user_count: number;
    criteria: Record<string, unknown>;
  }>;
}

interface MetricCard { title: string;
  value: string | number;
  icon: string;
  color: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral'; }

const toChartData = (record: Record<string, number>): ChartDataItem[] =>
  Object.entries(record)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

const createFallbackAnalytics = (): AnalyticsData => ({
  total_users: 0,
  active_users: 0,
  new_users_today: 0,
  retention_rate: 0,
  engagement_score: 0,
  lifecycle_distribution: {},
  activity_trends: [],
  engagement_distribution: { high: 0, medium: 0, low: 0 },
  inactive_users: 0,
  new_users_last_30_days: 0,
  growth_rate: 0,
  top_users_by_activity: [],
  lifecycle_transitions: []
});

const normalizeAnalytics = (payload: AnalyticsSummary): AnalyticsData => {
  const fallback = createFallbackAnalytics();
  const extended = payload as Partial<AnalyticsData>;

  const totalUsers = Number(payload.total_users ?? 0);
  const activeUsers = Number(payload.active_users ?? 0);
  const inactiveUsers = Number.isFinite(payload.inactive_users)
    ? Number(payload.inactive_users)
    : Math.max(totalUsers - activeUsers, 0);

  return {
    ...fallback,
    ...payload,
    inactive_users: inactiveUsers,
    new_users_last_30_days: payload.new_users_last_30_days ?? fallback.new_users_last_30_days,
    growth_rate: payload.growth_rate ?? fallback.growth_rate,
    engagement_distribution: {
      ...fallback.engagement_distribution,
      ...(payload.engagement_distribution ?? {})
    },
    activity_trends: payload.activity_trends ?? fallback.activity_trends,
    top_users_by_activity: extended.top_users_by_activity ?? fallback.top_users_by_activity,
    lifecycle_transitions: extended.lifecycle_transitions ?? fallback.lifecycle_transitions
  };
};

const formatPercentage = (value?: number): string => { if (typeof value !== 'number' || Number.isNaN(value)) {
    return '0%';
  }

  const normalized = value >= 0 && value <= 1 ? value * 100 : value;
  return `${normalized.toFixed(1)}%`;
};

const formatScore = (value: number | undefined): string =>
  Number.isFinite(value) ? (value as number).toFixed(1) : '0.0';

const Analytics: FC = () => { const { hasPermission } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [segmentation, setSegmentation] = useState<UserSegmentation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'lifecycle' | 'segmentation'>('overview');

  const loadAnalytics = useCallback(async (): Promise<void> => { try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.getUserAnalytics();
      setAnalytics(normalizeAnalytics(response));
    } catch (err: unknown) { logger.error('❌ Analytics API error:', undefined, { err  });
      setAnalytics(createFallbackAnalytics());
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Analytics temporarily unavailable: ${errorMessage}`);
    } finally { setIsLoading(false);
    }
  }, []);

  const loadSegmentation = useCallback(async (): Promise<void> => { try {
      logger.warn('⚠️ getUserSegmentation API not implemented, using mock data');
      setSegmentation({ segments: [] });
    } catch (err: unknown) { logger.error('❌ Segmentation error:', undefined, { err  });
      setSegmentation({ segments: [] });
    }
  }, []);

  useEffect(() => { void loadAnalytics();
    void loadSegmentation();
  }, [loadAnalytics, loadSegmentation]);

  const overviewMetrics = useMemo<MetricCard[]>(() => { if (!analytics) {
      return [];
    }

    const totalUsers = analytics.total_users ?? 0;
    const activeUsers = analytics.active_users ?? 0;
    const inactiveUsers = analytics.inactive_users ?? Math.max(totalUsers - activeUsers, 0);
    const newUsersToday = analytics.new_users_today ?? 0;
    const newUsersLast30Days = analytics.new_users_last_30_days ?? 0;

    return [
      { title: 'Total Users',
        value: totalUsers,
        icon: '👥',
        color: 'var(--primary-color)'
      },
      {
        title: 'Active Users',
        value: activeUsers,
        icon: '✅',
        color: '#10b981',
        change: totalUsers ? `${Math.round((activeUsers / totalUsers) * 100)}% of total` : undefined
      },
      { title: 'Inactive Users',
        value: inactiveUsers,
        icon: '⏸️',
        color: '#ef4444'
      },
      {
        title: 'New Users (30 days)',
        value: newUsersLast30Days,
        icon: '🆕',
        color: '#6366f1',
        change: totalUsers ? `${Math.round((newUsersLast30Days / Math.max(totalUsers, 1)) * 100)}% of total` : undefined
      },
      { title: 'Retention Rate',
        value: formatPercentage(analytics.retention_rate),
        icon: '📈',
        color: '#f97316'
      },
      { title: 'Engagement Score',
        value: formatScore(analytics.engagement_score),
        icon: '⚡',
        color: '#22d3ee'
      },
      { title: 'Growth Rate',
        value: formatPercentage(analytics.growth_rate),
        icon: '🌱',
        color: '#84cc16'
      },
      { title: 'New Users Today',
        value: newUsersToday,
        icon: '📅',
        color: '#a855f7'
      }
    ];
  }, [analytics]);

  const { engagementDistribution, lifecycleDistribution, activityTrendItems, topUsers, lifecycleTransitions } = useMemo(() => { if (!analytics) {
      return {
        engagementDistribution: [],
        lifecycleDistribution: [],
        activityTrendItems: [],
        topUsers: [],
        lifecycleTransitions: []
      };
    }

    const totalUsers = analytics.total_users ?? 0;
    const engagementDistributionRaw = toChartData(analytics.engagement_distribution ?? {});
    const engagementDistribution = engagementDistributionRaw.map((item) => ({
      ...item,
      detail: totalUsers
        ? `${Math.round((item.value / Math.max(totalUsers, 1)) * 100)}%`
        : item.value.toLocaleString()
    }));

    return {
      engagementDistribution,
      lifecycleDistribution: toChartData(analytics.lifecycle_distribution ?? {}),
      activityTrendItems: (analytics.activity_trends ?? []).map(({ date, active_users }) => ({ label: date,
        value: active_users
      })),
      topUsers: analytics.top_users_by_activity ?? [],
      lifecycleTransitions: analytics.lifecycle_transitions ?? []
    };
  }, [analytics]);

  if (!hasPermission('analytics:read')) { return (
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

  if (isLoading) { return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
        <div style={{ color: 'var(--text-secondary)' }}>Loading analytics...</div>
      </div>
    );
  }

  if (error) { return (
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

  if (!analytics) { return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📈</div>
        <div style={{ color: 'var(--text-secondary)' }}>No analytics data available</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb />

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0',
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
      <div style={{ display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '2px solid var(--border-color)'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: '📈' },
          { id: 'lifecycle', label: 'Lifecycle', icon: '🔄' },
          { id: 'segmentation', label: 'Segmentation', icon: '🎯' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'lifecycle' | 'segmentation')}
            style={{ padding: '1rem 1.5rem',
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
        <OverviewTab
          metrics={overviewMetrics}
          engagementDistribution={engagementDistribution}
          activityTrends={activityTrendItems}
          topUsers={topUsers}
        />
      )}

      {activeTab === 'lifecycle' && (
        <LifecycleTab
          lifecycleDistribution={lifecycleDistribution}
          transitions={lifecycleTransitions}
        />
      )}

      {activeTab === 'segmentation' && (
        <SegmentationTab segmentation={segmentation} onRefresh={() => void loadSegmentation()} />
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab: FC<{ metrics: MetricCard[];
  engagementDistribution: ChartDataItem[];
  activityTrends: ChartDataItem[];
  topUsers: TopUser[]; }> = ({ metrics, engagementDistribution, activityTrends, topUsers }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    {/* Metrics Cards */}
    <div style={{ display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem'
    }}>
      {metrics.map((metric, index) => (
        <MetricCardComponent key={`${metric.title}-${index}`} metric={metric} />
      ))}
    </div>

    {/* Charts Grid */}
    <div style={{ display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem'
    }}>
      <ChartCard
        title="Engagement Distribution"
        icon="⚖️"
        data={engagementDistribution}
        emptyLabel="No engagement data available"
      />

      <ChartCard
        title="Active Users Trend"
        icon="📅"
        data={activityTrends}
        emptyLabel="No activity trend data available"
      />

      <TopUsersCard users={topUsers} />
    </div>
  </div>
);

// Lifecycle Tab Component
const LifecycleTab: FC<{ lifecycleDistribution: ChartDataItem[];
  transitions: LifecycleTransition[]; }> = ({ lifecycleDistribution, transitions }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    {/* Lifecycle Stage Distribution */}
    <div style={{ background: 'var(--background-secondary)',
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid var(--border-color)'
    }}>
      <h3 style={{ margin: '0 0 1.5rem 0',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        🎯 Lifecycle Stage Distribution
      </h3>
      {lifecycleDistribution.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)' }}>
          No lifecycle distribution data available.
        </div>
      ) : (
        <div style={{ display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {lifecycleDistribution.map((stage) => (
            <div
              key={stage.label}
              style={{ padding: '1rem',
                background: 'var(--background-primary)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '2rem',
                fontWeight: 'bold',
                color: 'var(--primary-color)',
                marginBottom: '0.5rem'
              }}>
                {stage.value.toLocaleString()}
              </div>
              <div style={{ color: 'var(--text-primary)',
                fontWeight: '500',
                textTransform: 'capitalize'
              }}>
                {stage.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Lifecycle Transitions */}
    <div style={{ background: 'var(--background-secondary)',
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid var(--border-color)'
    }}>
      <h3 style={{ margin: '0 0 1.5rem 0',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        🔄 Lifecycle Transitions
      </h3>
      {transitions.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)' }}>
          No lifecycle transition data available yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {transitions.map((transition) => (
            <div
              key={`${transition.from_stage}-${transition.to_stage}`}
              style={{ display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'var(--background-primary)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ padding: '0.5rem 1rem',
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
                <span style={{ padding: '0.5rem 1rem',
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
              <div style={{ padding: '0.5rem 1rem',
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
      )}
    </div>
  </div>
);

// Segmentation Tab Component
const SegmentationTab: FC<{ segmentation: UserSegmentation | null;
  onRefresh: () => void; }> = ({ segmentation, onRefresh }) => { if (!segmentation) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎯</div>
        <div style={{ color: 'var(--text-secondary)' }}>No segmentation data available</div>
        <button
          onClick={onRefresh}
          style={{ marginTop: '1rem',
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
      <div style={{ display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
          User Segments
        </h3>
        <button
          onClick={onRefresh}
          style={{ padding: '0.5rem 1rem',
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

      <div style={{ display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {segmentation.segments.map((segment, index) => (
          <div
            key={`${segment.name}-${index}`}
            style={{ background: 'var(--background-secondary)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0',
                color: 'var(--text-primary)',
                fontSize: '1.1rem'
              }}>
                {segment.name}
              </h4>
              <p style={{ margin: '0 0 1rem 0',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem'
              }}>
                {segment.description}
              </p>
            </div>

            <div style={{ display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '1rem',
              background: 'var(--background-primary)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: 'var(--primary-color)',
                  marginBottom: '0.25rem'
                }}>
                  {segment.user_count}
                </div>
                <div style={{ color: 'var(--text-secondary)',
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
const MetricCardComponent: FC<{ metric: MetricCard }> = ({ metric }) => (
  <div style={{ background: 'var(--background-secondary)',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color)'
  }}>
    <div style={{ display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    }}>
      <div>
        <h3 style={{ margin: '0 0 0.5rem 0',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          fontWeight: '500'
        }}>
          {metric.title}
        </h3>
        <div style={{ fontSize: '2rem',
          fontWeight: 'bold',
          color: 'var(--text-primary)'
        }}>
          {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
        </div>
      </div>
      <div style={{ fontSize: '2rem',
        opacity: 0.7
      }}>
        {metric.icon}
      </div>
    </div>

    {metric.change && (
      <div style={{
        padding: '0.25rem 0.75rem',
        background: `${metric.color}20`,
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

// Chart Card Component
const ChartCard: FC<{ title: string;
  icon: string;
  data: ChartDataItem[];
  emptyLabel: string; }> = ({ title, icon, data, emptyLabel }) => (
  <div style={{ background: 'var(--background-secondary)',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color)'
  }}>
    <h3 style={{ margin: '0 0 1rem 0',
      color: 'var(--text-primary)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      {icon} {title}
    </h3>

    {data.length === 0 ? (
      <div style={{ color: 'var(--text-secondary)' }}>{emptyLabel}</div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {data.map((item) => (
          <div
            key={item.label}
            style={{ display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: 'var(--background-primary)',
              borderRadius: '6px',
              border: '1px solid var(--border-color)'
            }}
          >
            <span style={{ color: 'var(--text-primary)',
              textTransform: 'capitalize'
            }}>
              {item.label}
            </span>
            <span style={{ fontWeight: '600',
              color: 'var(--primary-color)'
            }}>
              {item.detail ?? item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Top Users Card Component
const TopUsersCard: FC<{ users: TopUser[] }> = ({ users }) => (
  <div style={{ background: 'var(--background-secondary)',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid var(--border-color)'
  }}>
    <h3 style={{ margin: '0 0 1rem 0',
      color: 'var(--text-primary)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      🏆 Top Active Users
    </h3>
    {users.length === 0 ? (
      <div style={{ color: 'var(--text-secondary)' }}>
        No active user ranking available yet.
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {users.slice(0, 5).map((user, index) => (
          <div
            key={user.user_id}
            style={{ display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: 'var(--background-primary)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '2rem',
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
            <div style={{ padding: '0.25rem 0.75rem',
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
    )}
  </div>
);

export default Analytics;
