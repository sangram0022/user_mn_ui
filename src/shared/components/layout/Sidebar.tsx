import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Users,
  Shield,
  Settings,
  FileText,
  LayoutDashboard,
  UserCheck,
  BarChart3,
} from 'lucide-react';
import { ROUTES } from '@/core/routing/config';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/domains/rbac/types/rbac.types';
import { ComponentErrorBoundary } from '@/shared/components/error/ModernErrorBoundary';

// Role constants for menu access control
const ROLES: Record<string, UserRole> = {
  ADMIN: 'admin',
  USER: 'user',
  AUDITOR: 'auditor',
  SUPER_ADMIN: 'super_admin',
};

function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    {
      path: ROUTES.HOME,
      icon: Home,
      label: t('nav.home'),
      roles: [],
    },
    {
      path: ROUTES.ADMIN_DASHBOARD,
      icon: LayoutDashboard,
      label: t('nav.adminDashboard'),
      roles: [ROLES.ADMIN],
    },
    {
      path: ROUTES.ADMIN_USERS,
      icon: Users,
      label: t('nav.users'),
      roles: [ROLES.ADMIN],
    },
    {
      path: ROUTES.ADMIN_USER_APPROVALS,
      icon: UserCheck,
      label: t('nav.userApprovals'),
      roles: [ROLES.ADMIN],
    },
    {
      path: ROUTES.ADMIN_ROLES,
      icon: Shield,
      label: t('nav.roles'),
      roles: [ROLES.ADMIN],
    },
    {
      path: ROUTES.ADMIN_AUDIT_LOGS,
      icon: FileText,
      label: t('nav.auditLogs') || 'Audit Logs',
      roles: [ROLES.ADMIN],
    },
    {
      path: ROUTES.ADMIN_REPORTS,
      icon: BarChart3,
      label: t('nav.reports') || 'Reports',
      roles: [ROLES.ADMIN],
    },
    {
      path: '/profile',
      icon: Settings,
      label: t('nav.profile'),
      roles: [],
    },
  ];

  const hasAccess = (roles: string[]) => {
    if (roles.length === 0) return true;
    return user?.roles.some((role) => roles.includes(role));
  };

  return (
    <aside 
      className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full"
      role="navigation"
      aria-label="Sidebar navigation"
    >
      <nav className="p-4 space-y-1" aria-label="Main navigation menu">
        {menuItems
          .filter((item) => hasAccess(item.roles))
          .map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                aria-current={active ? 'page' : undefined}
                aria-label={`Navigate to ${item.label}`}
              >
                <Icon size={20} aria-hidden="true" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}

function SidebarWithErrorBoundary() {
  return (
    <ComponentErrorBoundary>
      <Sidebar />
    </ComponentErrorBoundary>
  );
}

export default SidebarWithErrorBoundary;
