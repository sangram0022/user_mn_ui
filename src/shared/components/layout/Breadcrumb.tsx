// ========================================
// Breadcrumb Component
// ========================================
// Displays navigation hierarchy for better UX
// Following accessibility best practices (WCAG 2.4.8)
// ========================================

import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { ROUTES } from '../../../core/routing/config';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

/**
 * Generates breadcrumb items based on current route
 */
function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation();
  const params = useParams();

  // Route-to-breadcrumb mapping
  const routeMap: Record<string, BreadcrumbItem[]> = {
    [ROUTES.ADMIN]: [
      { label: 'Admin', path: ROUTES.ADMIN },
      { label: 'Dashboard' },
    ],
    [ROUTES.ADMIN_DASHBOARD]: [
      { label: 'Admin', path: ROUTES.ADMIN },
      { label: 'Dashboard' },
    ],
    [ROUTES.ADMIN_USERS]: [
      { label: 'Admin', path: ROUTES.ADMIN },
      { label: 'Users' },
    ],
    [ROUTES.ADMIN_USER_APPROVALS]: [
      { label: 'Admin', path: ROUTES.ADMIN },
      { label: 'Users', path: ROUTES.ADMIN_USERS },
      { label: 'Approvals' },
    ],
    [ROUTES.ADMIN_ROLES]: [
      { label: 'Admin', path: ROUTES.ADMIN },
      { label: 'Roles' },
    ],
    [ROUTES.ADMIN_AUDIT_LOGS]: [
      { label: 'Admin', path: ROUTES.ADMIN },
      { label: 'Audit Logs' },
    ],
  };

  // Handle dynamic routes with parameters
  const pathname = location.pathname;

  // User detail: /admin/users/:id
  if (pathname.startsWith('/admin/users/') && params.id) {
    return [
      { label: 'Admin', path: ROUTES.ADMIN },
      { label: 'Users', path: ROUTES.ADMIN_USERS },
      { label: `User ${params.id}` },
    ];
  }

  // Role detail: /admin/roles/:name
  if (pathname.startsWith('/admin/roles/') && params.name) {
    return [
      { label: 'Admin', path: ROUTES.ADMIN },
      { label: 'Roles', path: ROUTES.ADMIN_ROLES },
      { label: params.name },
    ];
  }

  // Return mapped breadcrumbs or default
  return routeMap[pathname] || [{ label: 'Home', path: ROUTES.HOME }];
}

/**
 * Breadcrumb Component
 * Shows current location in navigation hierarchy
 */
export default function Breadcrumb() {
  const breadcrumbs = useBreadcrumbs();

  // Don't show breadcrumbs if there's only one item (home)
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm">
        {/* Home icon always first */}
        <li>
          <Link
            to={ROUTES.HOME}
            className="text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Home"
          >
            <Home size={16} />
          </Link>
        </li>

        {/* Breadcrumb items */}
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={index} className="flex items-center space-x-2">
              <ChevronRight size={16} className="text-gray-400" aria-hidden="true" />
              
              {item.path && !isLast ? (
                <Link
                  to={item.path}
                  className="text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? 'text-gray-900 font-medium' : 'text-gray-600'}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
