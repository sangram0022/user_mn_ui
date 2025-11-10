/**
 * AccessibleBreadcrumbs Component
 * Navigation breadcrumbs with proper ARIA labels
 */

import { useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
  current?: boolean;
}

interface AccessibleBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function AccessibleBreadcrumbs({ items, className = '' }: AccessibleBreadcrumbsProps) {
  const navigate = useNavigate();

  return (
    <nav aria-label="Breadcrumb" className={`mb-4 ${className}`}>
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => (
          <li key={item.path || `breadcrumb-${item.label}-${index}`} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400 mx-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            
            {item.current || !item.path ? (
              <span
                aria-current={item.current ? 'page' : undefined}
                className={item.current ? 'font-medium text-gray-900' : 'text-gray-500'}
              >
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => navigate(item.path!)}
                className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              >
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export type { BreadcrumbItem, AccessibleBreadcrumbsProps };
