// ========================================
// User Dashboard Page
// ========================================
// Regular user dashboard with user-specific features
// Following SOLID principles:
// - Single Responsibility: User-only features
// - DRY: Reuses shared components from shared/components
// - Performance: Lazy loaded, code-split from admin dashboard
// ========================================

import { useTranslation } from 'react-i18next';
import { use } from 'react';
import { AuthContext } from '../../auth/context/AuthContext';
import { SEO, SEO_CONFIG } from '../../../shared/components/seo';
import { ModernErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';

// ========================================
// User Dashboard Component
// ========================================

export default function UserDashboard() {
  const { t } = useTranslation();
  const { user } = use(AuthContext);

  return (
    <ModernErrorBoundary 
      level="page"
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Dashboard</h1>
            <p className="text-gray-600 mb-6">We're experiencing technical difficulties. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
    >
      <SEO {...SEO_CONFIG.dashboard} />
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user?.email?.split('@')[0] || 'User'}! 👋
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {t('dashboard.user.subtitle', 'Your personal dashboard')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {(user?.roles && Array.isArray(user.roles) && user.roles[0]) || 'User'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Profile Completion"
            value="85%"
            icon="👤"
            trend="+5%"
            trendUp={true}
          />
          <StatCard
            title="Recent Activities"
            value="12"
            icon="📊"
            trend="+3"
            trendUp={true}
          />
          <StatCard
            title="Messages"
            value="5"
            icon="💬"
            trend="New"
            trendUp={true}
          />
          <StatCard
            title="Tasks"
            value="8"
            icon="✅"
            trend="2 pending"
            trendUp={false}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                📋 Recent Activity
              </h2>
              <div className="space-y-4">
                <ActivityItem
                  title="Profile updated"
                  time="2 hours ago"
                  type="update"
                />
                <ActivityItem
                  title="Password changed"
                  time="1 day ago"
                  type="security"
                />
                <ActivityItem
                  title="Login from new device"
                  time="3 days ago"
                  type="login"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                ⚡ Quick Actions
              </h2>
              <div className="space-y-3">
                <QuickActionButton
                  icon="👤"
                  label="Edit Profile"
                  href="/profile"
                />
                <QuickActionButton
                  icon="🔒"
                  label="Change Password"
                  href="/change-password"
                />
                <QuickActionButton
                  icon="📊"
                  label="View Activity"
                  href="/user/activity"
                />
                <QuickActionButton
                  icon="⚙️"
                  label="Settings"
                  href="/user/settings"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Sections */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              🔔 Notifications
            </h2>
            <div className="space-y-3">
              <NotificationItem
                message="Your profile is 85% complete"
                type="info"
              />
              <NotificationItem
                message="5 new messages waiting"
                type="success"
              />
              <NotificationItem
                message="Security: Login from new device detected"
                type="warning"
              />
            </div>
          </div>

          {/* Tips & Help */}
          <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Tips & Help
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p>📌 Complete your profile to unlock more features</p>
              <p>🔐 Enable two-factor authentication for better security</p>
              <p>📧 Update your notification preferences</p>
              <button className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                View All Tips
              </button>
            </div>
          </div>
        </div>
      </main>
      </div>
    </ModernErrorBoundary>
  );
}

// ========================================
// Sub-components (Single Responsibility)
// ========================================

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  trend: string;
  trendUp: boolean;
}

function StatCard({ title, value, icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span
          className={`text-xs font-medium ${
            trendUp ? 'text-green-600' : 'text-orange-600'
          }`}
        >
          {trend}
        </span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

interface ActivityItemProps {
  title: string;
  time: string;
  type: 'update' | 'security' | 'login';
}

function ActivityItem({ title, time, type }: ActivityItemProps) {
  const typeColors = {
    update: 'bg-blue-100 text-blue-800',
    security: 'bg-green-100 text-green-800',
    login: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0">
      <div className={`mt-1 w-2 h-2 rounded-full ${typeColors[type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}

interface QuickActionButtonProps {
  icon: string;
  label: string;
  href: string;
}

function QuickActionButton({ icon, label, href }: QuickActionButtonProps) {
  return (
    <a
      href={href}
      className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-50 transition-colors border border-gray-200"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </a>
  );
}

interface NotificationItemProps {
  message: string;
  type: 'info' | 'success' | 'warning';
}

function NotificationItem({ message, type }: NotificationItemProps) {
  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
  };

  return (
    <div
      className={`p-3 rounded-md border text-sm ${typeStyles[type]}`}
    >
      {message}
    </div>
  );
}
