/**
 * Schema.org Structured Data Component
 * Provides JSON-LD structured data for improved SEO and search engine indexing
 * 
 * Supports:
 * - Organization schema
 * - WebSite schema with search action
 * - BreadcrumbList schema for navigation
 * 
 * @see https://schema.org/
 * @see https://developers.google.com/search/docs/advanced/structured-data/intro-structured-data
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { BreadcrumbItem } from '@/shared/hooks/useBreadcrumbs';

interface StructuredDataProps {
  /** Page title (overrides default) */
  title?: string;
  
  /** Page description (overrides default) */
  description?: string;
  
  /** Breadcrumb navigation items */
  breadcrumbs?: BreadcrumbItem[];
  
  /** Additional structured data */
  additionalData?: Record<string, unknown>[];
}

/**
 * Organization structured data
 */
const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'User Management System',
  url: window.location.origin,
  logo: `${window.location.origin}/logo.png`,
  description: 'Enterprise-grade user management platform with role-based access control',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'support@usermgmt.com',
  },
  sameAs: [
    // Add social media URLs here
    'https://twitter.com/yourbrand',
    'https://linkedin.com/company/yourbrand',
  ],
});

/**
 * WebSite structured data with search action
 */
const getWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'User Management System',
  url: window.location.origin,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${window.location.origin}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});

/**
 * BreadcrumbList structured data
 */
const getBreadcrumbSchema = (breadcrumbs: BreadcrumbItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: `${window.location.origin}${crumb.url}`,
  })),
});

/**
 * WebPage structured data
 */
const getWebPageSchema = (title: string, description: string, url: string) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description,
  url,
  inLanguage: 'en-US',
  isPartOf: {
    '@type': 'WebSite',
    name: 'User Management System',
    url: window.location.origin,
  },
});

/**
 * Structured Data Component
 * Add to layout or specific pages for SEO optimization
 */
export function StructuredData({
  title = 'User Management System',
  description = 'Enterprise-grade user management platform with role-based access control',
  breadcrumbs,
  additionalData = [],
}: StructuredDataProps) {
  const location = useLocation();
  const currentUrl = `${window.location.origin}${location.pathname}`;

  useEffect(() => {
    // Build all structured data
    const structuredData = [
      getOrganizationSchema(),
      getWebSiteSchema(),
      getWebPageSchema(title, description, currentUrl),
      ...(breadcrumbs && breadcrumbs.length > 0 ? [getBreadcrumbSchema(breadcrumbs)] : []),
      ...additionalData,
    ];

    // Add or update structured data scripts
    structuredData.forEach((data, index) => {
      const scriptId = `structured-data-${index}`;
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      
      script.textContent = JSON.stringify(data);
    });

    // Cleanup: remove scripts on unmount
    return () => {
      for (let i = 0; i < 10; i++) { // Clean up to 10 scripts
        const script = document.getElementById(`structured-data-${i}`);
        if (script) {
          script.remove();
        }
      }
    };
  }, [title, description, currentUrl, breadcrumbs, additionalData]);

  return null; // No UI rendering needed
}

/**
 * Example Usage in Layout or Page:
 * 
 * ```tsx
 * import { StructuredData, useBreadcrumbs } from '@/shared/components/seo/StructuredData';
 * 
 * function MyPage() {
 *   const breadcrumbs = useBreadcrumbs();
 *   
 *   return (
 *     <>
 *       <StructuredData
 *         title="User Management Dashboard"
 *         description="Manage users, roles, and permissions"
 *         breadcrumbs={breadcrumbs}
 *       />
 *       <div>Page content...</div>
 *     </>
 *   );
 * }
 * ```
 */
