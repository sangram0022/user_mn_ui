/**
 * Dashboard Feature - Main Dashboard Component
 * Expert-level React patterns with modern UX
 */

import React, { Suspense } from 'react';
import { useAdvancedApi, useEnhancedAuth } from '../../shared/hooks/useAdvancedHooks';
import { LoadingSpinner, CardSkeleton, ProgressBar } from '../../shared/loading/LoadingComponents';
import { Card, Grid, Stack, Button } from '../../shared/design';
import { PageErrorBoundary } from '../../shared/errors/ErrorBoundary';

interface DashboardStats { totalUsers: number;
  activeUsers: number;
  revenue: number;
  conversionRate: number;
  growth: {
    users: number;
    revenue: number;
  };
}

interface RecentActivity { id: string;
  user: string;
  action: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error'; }

// Simulated API calls
const fetchDashboardStats = async (): Promise<DashboardStats> => { await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    totalUsers: 12543,
    activeUsers: 8432,
    revenue: 157890,
    conversionRate: 3.2,
    growth: {
      users: 12.5,
      revenue: 8.3
    }
  };
};

const fetchRecentActivity = async (): Promise<RecentActivity[]> => { await new Promise(resolve => setTimeout(resolve, 800));
  return [
    {
      id: '1',
      user: 'John Doe',
      action: 'Completed purchase',
      timestamp: '2 minutes ago',
      status: 'success'
    },
    { id: '2',
      user: 'Sarah Smith',
      action: 'Updated profile',
      timestamp: '5 minutes ago',
      status: 'success'
    },
    { id: '3',
      user: 'Mike Johnson',
      action: 'Failed payment',
      timestamp: '8 minutes ago',
      status: 'error'
    },
    { id: '4',
      user: 'Emily Brown',
      action: 'Logged in',
      timestamp: '12 minutes ago',
      status: 'success'
    }
  ];
};

// Stats Card Component
interface StatsCardProps { title: string;
  value: string | number;
  subtitle?: string;
  growth?: number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange'; }

const StatsCard: React.FC<StatsCardProps> = ({ title,
  value,
  subtitle,
  growth,
  icon,
  color = 'blue' }) => { const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  };

  const growthColor = growth && growth > 0 ? 'text-green-600' : 'text-red-600';
  const growthIcon = growth && growth > 0 ? '↗' : '↘';

  return (
    <Card className={`p-6 border-l-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {growth !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${growthColor}`}>
              <span className="mr-1">{growthIcon}</span>
              <span>{Math.abs(growth)}%</span>
              <span className="ml-1 text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-3xl opacity-80">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

// Activity Item Component
const ActivityItem: React.FC<{ activity: RecentActivity }> = ({ activity }) => { const statusColors = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  const statusIcons = { success: '✓',
    warning: '⚠',
    error: '✗'
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
        ${statusColors[activity.status]}
      `}>
        {statusIcons[activity.status]}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {activity.user}
        </p>
        <p className="text-sm text-gray-500">
          {activity.action}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {activity.timestamp}
        </p>
      </div>
    </div>
  );
};

// Main Dashboard Component
export const DashboardComponent: React.FC = () => { const { user, hasRequiredRoles } = useEnhancedAuth({ requireAuth: true,
    requireRoles: ['user']
  });

  const { data: stats,
    loading: statsLoading,
    error: statsError
  } = useAdvancedApi(fetchDashboardStats, { cacheKey: 'dashboard-stats',
    enabled: true
  });

  const { data: activities,
    loading: activitiesLoading,
    error: activitiesError
  } = useAdvancedApi(fetchRecentActivity, { cacheKey: 'recent-activities',
    enabled: true
  });

  if (!hasRequiredRoles) { return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to view this dashboard.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <PageErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {String(user?.name || user?.email || 'User')}!
                </h1>
                <p className="text-sm text-gray-600">
                  Here's what's happening with your business today.
                </p>
              </div>
              
              <Button variant="primary" size="md">
                View Reports
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Stack spacing={8}>
            {/* Stats Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Key Metrics
              </h2>
              
              {statsLoading ? (
                <Grid cols={4} gap={4}>
                  {Array.from({ length: 4 }, (_, i) => (
                    <CardSkeleton key={i} textLines={2} />
                  ))}
                </Grid>
              ) : statsError ? (
                <Card className="p-6 border-red-200 bg-red-50">
                  <p className="text-red-800">Failed to load statistics</p>
                </Card>
              ) : stats ? (
                <Grid cols={4} gap={4}>
                  <StatsCard
                    title="Total Users"
                    value={stats.totalUsers.toLocaleString()}
                    growth={stats.growth.users}
                    icon="👥"
                    color="blue"
                  />
                  
                  <StatsCard
                    title="Active Users"
                    value={stats.activeUsers.toLocaleString()}
                    subtitle="Last 30 days"
                    icon="🔥"
                    color="green"
                  />
                  
                  <StatsCard
                    title="Revenue"
                    value={`$${stats.revenue.toLocaleString()}`}
                    growth={stats.growth.revenue}
                    icon="💰"
                    color="purple"
                  />
                  
                  <StatsCard
                    title="Conversion Rate"
                    value={`${stats.conversionRate}%`}
                    subtitle="This month"
                    icon="📈"
                    color="orange"
                  />
                </Grid>
              ) : null}
            </div>

            {/* Content Grid */}
            <Grid cols={3} gap={8}>
              {/* Recent Activity */}
              <div className="col-span-2">
                <Card className="h-full">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Activity
                    </h3>
                    <p className="text-sm text-gray-600">
                      Latest user actions and system events
                    </p>
                  </div>
                  
                  <div className="p-6">
                    {activitiesLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 4 }, (_, i) => (
                          <div key={i} className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                            <div className="flex-1 space-y-1">
                              <div className="h-4 bg-gray-200 rounded animate-pulse" />
                              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : activitiesError ? (
                      <p className="text-red-600">Failed to load activities</p>
                    ) : activities && activities.length > 0 ? (
                      <div className="space-y-1">
                        {activities.map(activity => (
                          <ActivityItem key={activity.id} activity={activity} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No recent activity</p>
                    )}
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <div>
                <Card className="h-full">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Quick Actions
                    </h3>
                  </div>
                  
                  <div className="p-6">
                    <Stack spacing={4}>
                      <Button variant="outline" size="md" fullWidth>
                        📊 Generate Report
                      </Button>
                      
                      <Button variant="outline" size="md" fullWidth>
                        👤 Manage Users
                      </Button>
                      
                      <Button variant="outline" size="md" fullWidth>
                        ⚙️ Settings
                      </Button>
                      
                      <Button variant="outline" size="md" fullWidth>
                        📧 Send Newsletter
                      </Button>
                      
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          System Health
                        </h4>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Server Load</span>
                              <span>67%</span>
                            </div>
                            <ProgressBar progress={67} showPercentage={false} size="sm" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Memory Usage</span>
                              <span>43%</span>
                            </div>
                            <ProgressBar progress={43} showPercentage={false} size="sm" color="success" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Storage</span>
                              <span>89%</span>
                            </div>
                            <ProgressBar progress={89} showPercentage={false} size="sm" color="warning" />
                          </div>
                        </div>
                      </div>
                    </Stack>
                  </div>
                </Card>
              </div>
            </Grid>
          </Stack>
        </div>
      </div>
    </PageErrorBoundary>
  );
};

// Dashboard with Suspense boundary
const Dashboard: React.FC = () => { return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    }>
      <DashboardComponent />
    </Suspense>
  );
};

export default Dashboard;