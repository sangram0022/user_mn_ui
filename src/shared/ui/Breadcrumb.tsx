import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem { label: string;
  path: string; }

const Breadcrumb: React.FC = () => { const location = useLocation();

  const routeNames: Record<string, string> = {
    dashboard: 'Dashboard',
    users: 'User Management',
    security: 'Security Center',
    analytics: 'Analytics',
    settings: 'Settings',
    profile: 'Profile',
    account: 'Account',
    approvals: 'Approvals',
    workflows: 'Workflows',
    moderation: 'Moderation',
    reports: 'Reports',
    activity: 'Activity',
    help: 'Help & Support',
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => { const pathSegments = location.pathname.split('/').filter((segment) => segment !== '');

    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', path: '/' }];

    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = routeNames[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (location.pathname === '/' || location.pathname === '/login') { return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm mb-6 px-1" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isFirst = index === 0;

          return (
            <li key={crumb.path} className="flex items-center">
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />}

              {isLast ? (
                <span className="text-gray-900 font-medium" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {isFirst && <Home className="w-4 h-4 mr-1" />}
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
