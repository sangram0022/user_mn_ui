/**
 * SEO Configuration
 * 
 * Global SEO settings for the application
 */

import type { SEOConfig } from './types';

export const seoConfig: SEOConfig = {
  siteName: 'User Management System',
  siteUrl: import.meta.env.VITE_APP_URL || 'https://example.com',
  defaultDescription: 'Modern, secure, and scalable user management system built with React 19, TypeScript, and AWS infrastructure.',
  defaultOgImage: '/og-image.png', // Place 1200x630px image in public/
  twitterHandle: 'yourtwitterhandle', // Replace with actual Twitter handle
  defaultLang: 'en',
  titleSeparator: '|',
  organization: {
    name: 'User Management System',
    url: import.meta.env.VITE_APP_URL || 'https://example.com',
    logo: '/logo.png', // Place logo in public/
    sameAs: [
      // Add social media profile URLs
      // 'https://twitter.com/yourcompany',
      // 'https://www.linkedin.com/company/yourcompany',
      // 'https://github.com/yourcompany'
    ],
  },
};

/**
 * Generate full page title with site name
 */
export function generateTitle(title: string, noSuffix = false): string {
  if (noSuffix) return title;
  return `${title} ${seoConfig.titleSeparator} ${seoConfig.siteName}`;
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string): string {
  // Remove trailing slash from siteUrl, leading slash from path if present
  const baseUrl = seoConfig.siteUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Generate absolute URL for assets (OG images, etc.)
 */
export function generateAssetUrl(assetPath: string): string {
  if (assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
    return assetPath; // Already absolute
  }
  
  const baseUrl = seoConfig.siteUrl.replace(/\/$/, '');
  const cleanPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${baseUrl}${cleanPath}`;
}
