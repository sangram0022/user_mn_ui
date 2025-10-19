import type { FC, MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logger } from './../../../shared/utils/logger';

import { useToast } from '@hooks/useToast';
import Breadcrumb from '@shared/ui/Breadcrumb';
import { getUserRoleName } from '@shared/utils/user';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Crown,
  Eye,
  FileText,
  Settings,
  Shield,
  TrendingUp,
  UserCheck,
  Users,
  Workflow,
} from 'lucide-react';
import { useEffect } from 'react';
import { PageMetadata } from '../../../shared/components/PageMetadata';
import { prefetchRoute } from '../../../shared/utils/resource-loading';
import { useAuth } from '../../auth';

const RoleBasedDashboard: FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Prefetch likely routes based on user role - must be before early return
  useEffect(() => {
    if (!user) return;

    // Prefetch common routes for all users
    prefetchRoute('/profile');
    prefetchRoute('/settings');

    // Admin-specific prefetching - user.role can be string or UserRoleInfo
    const roleValue = typeof user.role === 'string' ? user.role : user.role?.name;
    if (user.is_superuser || roleValue === 'admin') {
      prefetchRoute('/users');
      prefetchRoute('/analytics');
      prefetchRoute('/workflows');
    }
  }, [user]);

  if (!user) return null;

  const handleFeatureClick = (href: string, event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    logger.info(` Dashboard navigation clicked: ${href}`);
    logger.info(' Using navigate() to route to:', { href });
    try {
      navigate(href);
    } catch (error) {
      logger.error('Navigation error:', error as Error);
      toast.error('Failed to navigate to the requested page');
    }
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

  return (
    <>
      <PageMetadata
        title={roleInfo.title}
        description={roleInfo.description}
        keywords="dashboard, user management, analytics, settings"
        ogTitle={`${roleInfo.title} - User Management System`}
        ogDescription={roleInfo.description}
      />
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-8">
            <div
              className={`inline-flex items-center gap-3 rounded-lg p-4 ${
                roleInfo.color.includes('yellow')
                  ? 'bg-amber-100 text-amber-800'
                  : roleInfo.color.includes('blue')
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
              }`}
              role="status"
              aria-label={`${roleInfo.title}: ${roleInfo.description}`}
            >
              <RoleIcon className="h-6 w-6" aria-hidden="true" />
              <div>
                <h1 className="text-2xl font-bold">{roleInfo.title}</h1>
                <p className="text-sm opacity-80">{roleInfo.description}</p>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div
              className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
              role="region"
              aria-label="System statistics"
            >
              <div
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                role="status"
                aria-label="1,234 total users"
              >
                <div className="flex items-center">
                  <div className="rounded-lg bg-blue-100 p-3">
                    <Users className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">1,234</div>
                    <div className="text-sm text-gray-500">Total Users</div>
                  </div>
                </div>
              </div>
              <div
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                role="status"
                aria-label="99.9% system uptime"
              >
                <div className="flex items-center">
                  <div className="rounded-lg bg-green-100 p-3">
                    <CheckCircle className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">99.9%</div>
                    <div className="text-sm text-gray-500">System Uptime</div>
                  </div>
                </div>
              </div>
              <div
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                role="status"
                aria-label="23 pending approvals"
              >
                <div className="flex items-center">
                  <div className="rounded-lg bg-orange-100 p-3">
                    <Clock className="h-6 w-6 text-orange-600" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">23</div>
                    <div className="text-sm text-gray-500">Pending Approvals</div>
                  </div>
                </div>
              </div>
              <div
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                role="status"
                aria-label="5 security alerts"
              >
                <div className="flex items-center">
                  <div className="rounded-lg bg-red-100 p-3">
                    <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
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

          <div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            role="region"
            aria-label="Available features and tools"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.href}
                  to={feature.href}
                  onClick={(event) => handleFeatureClick(feature.href, event)}
                  className={`group block rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-lg no-underline text-inherit hover:border-${
                    feature.color === 'blue'
                      ? 'blue-500'
                      : feature.color === 'green'
                        ? 'green-500'
                        : feature.color === 'purple'
                          ? 'purple-500'
                          : 'gray-400'
                  }`}
                  aria-label={`${feature.title}: ${feature.description}. ${feature.stats}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Icon
                        className={`h-8 w-8 ${
                          feature.color === 'blue'
                            ? 'text-blue-500'
                            : feature.color === 'green'
                              ? 'text-green-500'
                              : feature.color === 'purple'
                                ? 'text-purple-500'
                                : 'text-gray-500'
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                      <p className="mb-3 text-sm opacity-80">{feature.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium opacity-60">{feature.stats}</span>
                        <span className="text-xs font-medium" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div
            className="mt-8 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6"
            role="region"
            aria-label={
              isAdmin ? 'Admin tips' : isModerator ? 'Moderator tips' : 'Getting started tips'
            }
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              {isAdmin ? 'Admin Tips' : isModerator ? 'Moderator Tips' : 'Getting Started'}
            </h3>
            <div
              className="grid grid-cols-1 gap-4 text-sm text-gray-700 md:grid-cols-2"
              role="list"
            >
              {isAdmin && (
                <>
                  <div role="listitem"> Use the Security Center to monitor system threats</div>
                  <div role="listitem"> Review user analytics for platform insights</div>
                  <div role="listitem"> Set up automated workflows for efficiency</div>
                  <div role="listitem"> Regular backup and security audits are recommended</div>
                </>
              )}
              {isModerator && (
                <>
                  <div role="listitem"> Check pending approvals daily</div>
                  <div role="listitem"> Monitor user activity for unusual patterns</div>
                  <div role="listitem"> Review reported content promptly</div>
                  <div role="listitem"> Use analytics to identify trends</div>
                </>
              )}
              {isUser && (
                <>
                  <div role="listitem"> Complete your profile for better experience</div>
                  <div role="listitem"> Check your activity dashboard regularly</div>
                  <div role="listitem"> Submit workflow requests when needed</div>
                  <div role="listitem"> Keep your account settings up to date</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoleBasedDashboard;
