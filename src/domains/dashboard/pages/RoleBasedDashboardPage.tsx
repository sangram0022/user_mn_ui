import type { FC, MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logger } from './../../../shared/utils/logger';

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
import { useAuth } from '../../auth/context/AuthContext';

const RoleBasedDashboard: FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleFeatureClick = (href: string, event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    logger.info(`🧭 Dashboard navigation clicked: ${href}`);
    logger.info('🔧 Using navigate() to route to:', { href });
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: roleInfo.color.includes('yellow')
                ? '#fef3c7'
                : roleInfo.color.includes('blue')
                  ? '#dbeafe'
                  : '#dcfce7',
              color: roleInfo.color.includes('yellow')
                ? '#92400e'
                : roleInfo.color.includes('blue')
                  ? '#1e40af'
                  : '#166534',
            }}
          >
            <RoleIcon style={{ width: '1.5rem', height: '1.5rem' }} />
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{roleInfo.title}</h1>
              <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>{roleInfo.description}</p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div
            style={{
              marginBottom: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#dbeafe',
                    borderRadius: '0.5rem',
                  }}
                >
                  <Users style={{ width: '1.5rem', height: '1.5rem', color: '#2563eb' }} />
                </div>
                <div style={{ marginLeft: '1rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                    1,234
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Users</div>
                </div>
              </div>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#dcfce7',
                    borderRadius: '0.5rem',
                  }}
                >
                  <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#16a34a' }} />
                </div>
                <div style={{ marginLeft: '1rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                    99.9%
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>System Uptime</div>
                </div>
              </div>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#fed7aa',
                    borderRadius: '0.5rem',
                  }}
                >
                  <Clock style={{ width: '1.5rem', height: '1.5rem', color: '#ea580c' }} />
                </div>
                <div style={{ marginLeft: '1rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>23</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pending Approvals</div>
                </div>
              </div>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#fecaca',
                    borderRadius: '0.5rem',
                  }}
                >
                  <AlertTriangle style={{ width: '1.5rem', height: '1.5rem', color: '#dc2626' }} />
                </div>
                <div style={{ marginLeft: '1rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>5</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Security Alerts</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Breadcrumb />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                to={feature.href}
                onClick={(event) => handleFeatureClick(feature.href, event)}
                style={{
                  display: 'block',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  border: '2px solid #e5e7eb',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                  color: 'inherit',
                  backgroundColor: 'white',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow =
                    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.borderColor =
                    feature.color === 'blue'
                      ? '#3b82f6'
                      : feature.color === 'green'
                        ? '#10b981'
                        : feature.color === 'purple'
                          ? '#8b5cf6'
                          : '#6b7280';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow =
                    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flexShrink: 0 }}>
                    <Icon
                      style={{
                        width: '2rem',
                        height: '2rem',
                        color:
                          feature.color === 'blue'
                            ? '#3b82f6'
                            : feature.color === 'green'
                              ? '#10b981'
                              : feature.color === 'purple'
                                ? '#8b5cf6'
                                : '#6b7280',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      {feature.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.75rem' }}>
                      {feature.description}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', fontWeight: '500', opacity: 0.6 }}>
                        {feature.stats}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>→</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div
          style={{
            marginTop: '2rem',
            background: 'linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%)',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            border: '1px solid #bfdbfe',
          }}
        >
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '1rem',
            }}
          >
            {isAdmin ? 'Admin Tips' : isModerator ? 'Moderator Tips' : 'Getting Started'}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              fontSize: '0.875rem',
              color: '#374151',
            }}
          >
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
