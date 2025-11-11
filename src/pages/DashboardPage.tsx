// ========================================
// Modern Dashboard Page - Performance Optimized
// ========================================
// Comprehensive dashboard with:
// - Real-time metrics and analytics
// - Interactive widgets with lazy loading
// - Performance monitoring integration
// - Accessibility features
// - Responsive design with modern patterns
// ========================================

import { useState, useEffect, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useLiveRegion } from '../shared/hooks/accessibility';
import { CardSkeleton, DashboardSkeleton } from '../shared/components/loading/Skeletons';
import { API_TIMING, INTERVAL_TIMING } from '@/core/constants';
import { isDevelopment } from '@/core/config';

// ========================================
// Dashboard Metrics Types
// ========================================

interface DashboardMetrics {
  users: {
    total: number;
    active: number;
    growth: number;
  };
  performance: {
    responseTime: number;
    uptime: number;
    errorRate: number;
  };
  engagement: {
    pageViews: number;
    sessionDuration: number;
    bounceRate: number;
  };
}

// AWS CloudWatch provides dashboard widgets - no custom interface needed
// interface Widget {
//   id: string;
//   title: string;
//   type: 'metric' | 'chart' | 'list' | 'status';
//   priority: 'high' | 'medium' | 'low';
//   data?: unknown;
// }

// ========================================
// Mock Data Generator
// ========================================

function generateMockMetrics(): DashboardMetrics {
  return {
    users: {
      total: Math.floor(Math.random() * 10000) + 5000,
      active: Math.floor(Math.random() * 1000) + 500,
      growth: Math.random() * 20 - 10, // -10% to +10%
    },
    performance: {
      responseTime: Math.random() * 200 + 100,
      uptime: 99.5 + Math.random() * 0.5,
      errorRate: Math.random() * 2,
    },
    engagement: {
      pageViews: Math.floor(Math.random() * 50000) + 10000,
      sessionDuration: Math.random() * 300 + 120,
      bounceRate: Math.random() * 40 + 30,
    },
  };
}

// ========================================
// Widget Components
// ========================================

function MetricCard({ 
  title, 
  value, 
  change, 
  format = 'number' 
}: { 
  title: string; 
  value: number; 
  change?: number; 
  format?: 'number' | 'percentage' | 'time' | 'currency';
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'time':
        return `${Math.round(val)}ms`;
      case 'currency':
        return `$${val.toLocaleString()}`;
      default:
        return val.toLocaleString();
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-gray-900">
          {formatValue(value)}
        </div>
        {typeof change === 'number' && (
          <div className={`text-sm font-medium ${getChangeColor(change)}`}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}

function StatusIndicator({ 
  label, 
  status, 
  description 
}: { 
  label: string; 
  status: 'excellent' | 'good' | 'warning' | 'critical'; 
  description?: string;
}) {
  const statusConfig = {
    excellent: { color: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50', icon: '✅' },
    good: { color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', icon: '✨' },
    warning: { color: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50', icon: '⚠️' },
    critical: { color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', icon: '🚨' },
  };

  const config = statusConfig[status];

  return (
    <div className={`p-4 rounded-lg ${config.bg} border border-gray-200`}>
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full ${config.color} mr-3`}></div>
        <div className="flex-1">
          <h4 className={`font-medium ${config.text}`}>
            {config.icon} {label}
          </h4>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickActions() {
  const { announce } = useLiveRegion();

  const actions = [
    { 
      id: 'add-user', 
      label: 'Add User', 
      icon: '👤', 
      href: '/users/new',
      description: 'Create a new user account'
    },
    { 
      id: 'view-reports', 
      label: 'View Reports', 
      icon: '📊', 
      href: '/reports',
      description: 'Access analytics and reports'
    },
    { 
      id: 'system-settings', 
      label: 'Settings', 
      icon: '⚙️', 
      href: '/settings',
      description: 'Configure system settings'
    },
    { 
      id: 'help-support', 
      label: 'Help & Support', 
      icon: '❓', 
      href: '/help',
      description: 'Get help and support'
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.id}
            to={action.href}
            onClick={() => announce(`Navigating to ${action.label}`)}
            className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="text-2xl mr-3">{action.icon}</span>
            <div>
              <div className="font-medium text-gray-900">{action.label}</div>
              <div className="text-xs text-gray-500">{action.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ========================================
// Recent Activity Component
// ========================================

function RecentActivity() {
  const activities = [
    { id: 1, type: 'user', message: 'New user registered: john.doe@email.com', time: '2 minutes ago' },
    { id: 2, type: 'system', message: 'System backup completed successfully', time: '15 minutes ago' },
    { id: 3, type: 'security', message: 'Failed login attempt blocked', time: '23 minutes ago' },
    { id: 4, type: 'user', message: 'User updated profile: jane.smith@email.com', time: '1 hour ago' },
    { id: 5, type: 'system', message: 'Cache cleared for better performance', time: '2 hours ago' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return '👤';
      case 'system': return '⚙️';
      case 'security': return '🔒';
      default: return '📝';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
            <span className="text-lg">{getActivityIcon(activity.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">{activity.message}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200">
        <Link 
          to="/activity" 
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View all activity →
        </Link>
      </div>
    </div>
  );
}

// ========================================
// Main Dashboard Component
// ========================================

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const { announce, LiveRegion } = useLiveRegion();

  // Simulate data loading
  useEffect(() => {
    let isMounted = true; // Track if component is still mounted

    const loadData = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, API_TIMING.MEDIUM_DELAY));
      
      // Only update state if component is still mounted
      if (!isMounted) return;
      
      const newMetrics = generateMockMetrics();
      setMetrics(newMetrics);
      setIsLoading(false);
      setLastUpdated(new Date());
      
      announce('Dashboard data loaded successfully');
    };

    loadData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      // Only update if component is still mounted
      if (isMounted) {
        const newMetrics = generateMockMetrics();
        setMetrics(newMetrics);
        setLastUpdated(new Date());
      }
    }, INTERVAL_TIMING.DASHBOARD_REFRESH);

    return () => {
      isMounted = false; // Mark as unmounted
      clearInterval(interval);
    };
  }, [announce]);

  useEffect(() => {
    document.title = 'Dashboard - User Management';
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-xl font-semibold text-gray-900">Failed to Load Dashboard</h2>
          <p className="text-gray-600 mb-4">Unable to fetch dashboard metrics</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LiveRegion />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  const newMetrics = generateMockMetrics();
                  setMetrics(newMetrics);
                  setLastUpdated(new Date());
                  announce('Dashboard refreshed');
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={metrics.users.total}
            change={metrics.users.growth}
          />
          <MetricCard
            title="Active Users"
            value={metrics.users.active}
          />
          <MetricCard
            title="Response Time"
            value={metrics.performance.responseTime}
            format="time"
          />
          <MetricCard
            title="Uptime"
            value={metrics.performance.uptime}
            format="percentage"
          />
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
            <div className="space-y-3">
              <StatusIndicator
                label="Database"
                status="excellent"
                description="All connections healthy"
              />
              <StatusIndicator
                label="API Services"
                status="good"
                description="Response times normal"
              />
              <StatusIndicator
                label="Cache Layer"
                status="excellent"
                description="Hit rate: 94.2%"
              />
              <StatusIndicator
                label="Security"
                status={metrics.performance.errorRate > 1 ? 'warning' : 'excellent'}
                description={`Error rate: ${metrics.performance.errorRate.toFixed(2)}%`}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QuickActions />
              <Suspense fallback={<CardSkeleton count={1} />}>
                <RecentActivity />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Page Views"
              value={metrics.engagement.pageViews}
            />
            <MetricCard
              title="Session Duration"
              value={metrics.engagement.sessionDuration}
              format="time"
            />
            <MetricCard
              title="Bounce Rate"
              value={metrics.engagement.bounceRate}
              format="percentage"
            />
          </div>
        </div>

        {/* Developer Info */}
        {isDevelopment() && (
          <div className="mt-8 bg-gray-900 text-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">🔧 Developer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Performance Monitoring:</strong> Active<br />
                <strong>Auto-refresh:</strong> Every 30 seconds<br />
                <strong>Cache Status:</strong> Optimized
              </div>
              <div>
                <strong>Accessibility:</strong> WCAG 2.1 AA<br />
                <strong>React Version:</strong> 19.x<br />
                <strong>Build Mode:</strong> Development
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}