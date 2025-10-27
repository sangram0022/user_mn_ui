/**
 * Breadcrumb Component
 *
 * Provides navigation breadcrumb trail based on current route.
 * Automatically generates breadcrumbs from route path.
 *
 * @author Senior React Developer
 * @created October 12, 2025
 */

import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path: string;
}

/**
 * Converts route path to human-readable label
 */
const pathToLabel = (path: string): string =>
  path
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/**
 * Route path to display name mapping
 */
const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'User Management',
  profile: 'Profile',
  settings: 'Settings',
  analytics: 'Analytics',
  reports: 'Reports',
  approvals: 'Approvals',
  activity: 'Activity',
  security: 'Security',
  moderation: 'Moderation',
  help: 'Help Center',
  account: 'Account Settings',
  status: 'System Status',
};

/**
 * Breadcrumb navigation component
 *
 * @example
 * ```tsx
 * <Breadcrumb />
 * ```
 */
const Breadcrumb = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Don't show breadcrumb on home/login/register pages
  if (
    pathSegments.length === 0 ||
    ['login', 'register', 'forgot-password', 'reset-password'].includes(pathSegments[0])
  ) {
    return null;
  }

  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', path: '/' }];

  // Build breadcrumb trail
  let currentPath = '';
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = ROUTE_LABELS[segment] || pathToLabel(segment);
    breadcrumbs.push({ label, path: currentPath });
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isFirst = index === 0;

          return (
            <li key={crumb.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight
                  className="icon-sm mx-2 text-[color:var(--color-text-tertiary)]"
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span
                  className="font-medium text-[color:var(--color-text-primary)]"
                  aria-current="page"
                >
                  {isFirst && <Home className="icon-sm inline mr-1" aria-hidden="true" />}
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-primary)] transition-colors flex items-center"
                >
                  {isFirst && <Home className="icon-sm inline mr-1" aria-hidden="true" />}
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
