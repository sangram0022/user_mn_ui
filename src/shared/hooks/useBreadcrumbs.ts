/**
 * Hook to generate breadcrumbs from current route
 */

import { useLocation } from 'react-router-dom';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) {
    return [{ name: 'Home', url: '/' }];
  }

  const breadcrumbs: BreadcrumbItem[] = [{ name: 'Home', url: '/' }];
  let currentPath = '';

  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const name = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    breadcrumbs.push({ name, url: currentPath });
  });

  return breadcrumbs;
}
