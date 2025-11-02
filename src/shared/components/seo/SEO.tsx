/**
 * SEO Meta Tags Component
 * Task 20: SEO Optimization
 * Uses native document APIs for meta tag management
 */

import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonical?: string;
  noindex?: boolean;
}

export default function SEO({
  title,
  description,
  keywords = [],
  ogImage = '/og-image.png',
  ogType = 'website',
  canonical,
  noindex = false,
}: SEOProps) {
  const siteUrl = import.meta.env.VITE_APP_URL || 'https://example.com';
  const fullTitle = `${title} | User Management System`;
  const canonicalUrl = canonical || window.location.href;

  useEffect(() => {
    // Set title
    document.title = fullTitle;

    // Helper function to set or update meta tag
    const setMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Set basic meta tags
    setMetaTag('description', description);
    
    if (keywords.length > 0) {
      setMetaTag('keywords', keywords.join(', '));
    }
    
    if (noindex) {
      setMetaTag('robots', 'noindex,nofollow');
    }

    // Set canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Set Open Graph tags
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:title', fullTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', `${siteUrl}${ogImage}`, true);
    setMetaTag('og:url', canonicalUrl, true);
    setMetaTag('og:site_name', 'User Management System', true);

    // Set Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', `${siteUrl}${ogImage}`);

    // Cleanup function
    return () => {
      document.title = 'User Management System';
    };
  }, [title, description, keywords, ogImage, ogType, canonical, noindex, fullTitle, canonicalUrl, siteUrl]);

  return null;
}
