import type { FC, MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@features/auth';
import Breadcrumb from '@shared/ui/Breadcrumb';
import {
  Users,
  Shield,
  BarChart3,
  Workflow,
  UserCheck,
  Settings,
  Crown,
  Eye,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { getUserRoleName } from '@utils/user';

const RoleBasedDashboard: FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleFeatureClick = (href: string, event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    console.log(`🧭 Dashboard navigation clicked: ${href}`);
    console.log('🔧 Using navigate() to route to:', href);
    navigate(href);
  };

  const roleName = getUserRoleName(user);
  const isAdmin = roleName === 'admin' || user.is_superuser;
  const isModerator = roleName === 'moderator';
  const isUser = roleName === 'user';

  const adminFeatures = [
    {
      title: 'User Management',
      description: 'Complete control over user accounts, roles, and permissions',
      icon: Users,
      href: '/users',
      color: 'blue',
      stats: '1,234 Users',
    },
    {
      title: 'System Analytics',
      description: 'Comprehensive system insights and performance metrics',
      icon: BarChart3,
      href: '/analytics',
      color: 'purple',
      stats: '99.9% Uptime',
    },
    {
      title: 'Workflow Management',
      description: 'Manage approval workflows and business processes',
      icon: Workflow,
      href: '/workflows',
      color: 'green',
      stats: '23 Pending',
    },
    {
      title: 'Security Center',
      description: 'Security monitoring, audit logs, and compliance',
      icon: Shield,
      href: '/security',
      color: 'red',
      stats: '5 Alerts',
    },
    {
      title: 'System Settings',
      description: 'Global system configuration and preferences',
      icon: Settings,
      href: '/settings',
      color: 'gray',
      stats: 'Updated 2h ago',
    },
    {
      title: 'Reports & Export',
      description: 'Generate reports and export system data',
      icon: FileText,
      href: '/reports',
      color: 'indigo',
      stats: '12 Reports',
    },
    {
      title: 'System Status',
      description: 'Check system health and component status',
      icon: CheckCircle,
      href: '/status',
      color: 'emerald',
      stats: 'All Systems',
    },
  ];

  const moderatorFeatures = [
    {
      title: 'User Moderation',
      description: 'Review and moderate user activities and content',
      icon: Eye,
      href: '/moderation',
      color: 'blue',
      stats: '8 Reviews',
    },
    {
      title: 'Approval Workflows',
      description: 'Handle pending approvals and user requests',
      icon: UserCheck,
      href: '/approvals',
      color: 'orange',
      stats: '15 Pending',
    },
    {
      title: 'Activity Analytics',
      description: 'Monitor user engagement and platform activity',
      icon: BarChart3,
      href: '/analytics',
      color: 'purple',
      stats: 'Last 7 days',
    },
    {
      title: 'Content Reports',
      description: 'Review reported content and take action',
      icon: AlertTriangle,
      href: '/reports',
      color: 'red',
      stats: '3 New Reports',
    },
  ];

  const userFeatures = [
    {
      title: 'My Profile',
      description: 'View and update your profile information',
      icon: Users,
      href: '/profile',
      color: 'blue',
      stats: 'Complete',
    },
    {
      title: 'Activity Dashboard',
      description: 'Track your activity and engagement metrics',
      icon: TrendingUp,
      href: '/activity',
      color: 'green',
      stats: '85% Active',
    },
    {
      title: 'My Workflows',
      description: 'View your submitted requests and their status',
      icon: Clock,
      href: '/my-workflows',
      color: 'orange',
      stats: '2 In Progress',
    },
    {
      title: 'Account Settings',
      description: 'Manage your account preferences and security',
      icon: Settings,
      href: '/account',
      color: 'gray',
      stats: 'Secure',
    },
  ];

  const getFeatures = () => {
    if (isAdmin) return adminFeatures;
    if (isModerator) return moderatorFeatures;
    return userFeatures;
  };

  const getRoleInfo = () => {
    if (isAdmin)
      return {
        title: 'Administrator Dashboard',
        description: 'You have full administrative access to the system',
        icon: Crown,
        color: 'text-yellow-600 bg-yellow-100',
      } as const;
    if (isModerator)
      return {
        title: 'Moderator Dashboard',
        description: 'You can moderate users and manage content',
        icon: Shield,
        color: 'text-blue-600 bg-blue-100',
      } as const;
    return {
      title: 'My Dashboard',
      description: 'Access your personalized features and tools',
      icon: Users,
      color: 'text-green-600 bg-green-100',
    } as const;
  };

  const features = getFeatures();
  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      red: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
      orange: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
      gray: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100',
      emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
    } as const;
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className={`inline-flex items-center space-x-3 px-4 py-3 rounded-lg ${roleInfo.color}`}>
            <RoleIcon className="w-6 h-6" />
            <div>
              <h1 className="text-2xl font-bold">{roleInfo.title}</h1>
              <p className="text-sm opacity-80">{roleInfo.description}</p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">1,234</div>
                  <div className="text-sm text-gray-500">Total Users</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">99.9%</div>
                  <div className="text-sm text-gray-500">System Uptime</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">23</div>
                  <div className="text-sm text-gray-500">Pending Approvals</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">5</div>
                  <div className="text-sm text-gray-500">Security Alerts</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Breadcrumb />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(feature => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                to={feature.href}
                onClick={event => handleFeatureClick(feature.href, event)}
                className={`block p-6 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 hover:shadow-lg ${getColorClasses(feature.color)}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm opacity-80 mb-3">{feature.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium opacity-60">{feature.stats}</span>
                      <span className="text-xs font-medium">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isAdmin ? 'Admin Tips' : isModerator ? 'Moderator Tips' : 'Getting Started'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            {isAdmin && (
              <>
                <div>• Use the Security Center to monitor system threats</div>
                <div>• Review user analytics for platform insights</div>
                <div>• Set up automated workflows for efficiency</div>
                <div>• Regular backup and security audits are recommended</div>
              </>
            )}
            {isModerator && (
              <>
                <div>• Check pending approvals daily</div>
                <div>• Monitor user activity for unusual patterns</div>
                <div>• Review reported content promptly</div>
                <div>• Use analytics to identify trends</div>
              </>
            )}
            {isUser && (
              <>
                <div>• Complete your profile for better experience</div>
                <div>• Check your activity dashboard regularly</div>
                <div>• Submit workflow requests when needed</div>
                <div>• Keep your account settings up to date</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedDashboard;
