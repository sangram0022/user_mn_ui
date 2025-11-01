import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Users,
  Shield,
  Settings,
  FileText,
  Activity,
  LayoutDashboard,
} from 'lucide-react';
import { ROUTE_PATHS } from '../../../core/routing/routes';
import { useAuth } from '../../../hooks/useAuth';
import { ROLES } from '../../../core/auth/roles';

export default function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    {
      path: ROUTE_PATHS.HOME,
      icon: Home,
      label: t('nav.home'),
      roles: [],
    },
    {
      path: ROUTE_PATHS.ADMIN_DASHBOARD,
      icon: LayoutDashboard,
      label: t('nav.admin'),
      roles: [ROLES.ADMIN],
    },
    {
      path: ROUTE_PATHS.USERS_LIST,
      icon: Users,
      label: t('nav.users'),
      roles: [ROLES.ADMIN, ROLES.MODERATOR],
    },
    {
      path: ROUTE_PATHS.ROLES_LIST,
      icon: Shield,
      label: t('nav.roles'),
      roles: [ROLES.ADMIN],
    },
    {
      path: ROUTE_PATHS.AUDIT_LOGS,
      icon: FileText,
      label: t('nav.audit'),
      roles: [ROLES.ADMIN],
    },
    {
      path: ROUTE_PATHS.MONITORING_HEALTH,
      icon: Activity,
      label: t('nav.monitoring'),
      roles: [ROLES.ADMIN],
    },
    {
      path: ROUTE_PATHS.PROFILE,
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
