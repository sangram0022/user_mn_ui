/**
 * SEO Meta Tags Component
 * 
 * Comprehensive SEO component with:
 * - Dynamic meta tags per page
 * - Open Graph tags for social sharing (Facebook, LinkedIn)
 * - Twitter Card tags
 * - Structured data (JSON-LD) for rich snippets
 * - Canonical URLs
 * - Article metadata
 * - Optimized for S3+CloudFront deployment
 */

import { useEffect } from 'react';
import { config } from '@/core/config';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  canonical?: string;
  noindex?: boolean;
  /** Twitter Card type (default: 'summary_large_image') */
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  /** Article published time (ISO 8601 format) */
  publishedTime?: string;
  /** Article modified time (ISO 8601 format) */
  modifiedTime?: string;
  /** Article author */
  author?: string;
  /** Article section/category */
  section?: string;
  /** Article tags */
  tags?: string[];
  /** Structured data (JSON-LD) */
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
  /** Disable default site name appending */
  noSuffix?: boolean;
}

export default function SEO({
  title,
  description,
  keywords = [],
  ogImage = '/og-image.png',
  ogType = 'website',
  canonical,
  noindex = false,
  twitterCard = 'summary_large_image',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  structuredData,
  noSuffix = false,
}: SEOProps) {
  const siteUrl = config.app.url;
  const siteName = 'User Management System';
  const fullTitle = noSuffix ? title : `${title} | ${siteName}`;
  const canonicalUrl = canonical || window.location.href;
  
  // Generate absolute URLs for OG images
  const absoluteOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

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
    setMetaTag('og:image', absoluteOgImage, true);
    setMetaTag('og:image:width', '1200', true);
    setMetaTag('og:image:height', '630', true);
    setMetaTag('og:url', canonicalUrl, true);
    setMetaTag('og:site_name', siteName, true);
    setMetaTag('og:locale', 'en_US', true);
    
    // Open Graph Article tags (if article type)
    if (ogType === 'article') {
      if (publishedTime) setMetaTag('article:published_time', publishedTime, true);
      if (modifiedTime) setMetaTag('article:modified_time', modifiedTime, true);
      if (author) setMetaTag('article:author', author, true);
      if (section) setMetaTag('article:section', section, true);
      
      // Clear previous tags
      document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
      
      // Add new tags
      if (tags.length > 0) {
        tags.forEach(tag => {
          const tagElement = document.createElement('meta');
          tagElement.setAttribute('property', 'article:tag');
          tagElement.setAttribute('content', tag);
          document.head.appendChild(tagElement);
        });
      }
    }

    // Set Twitter Card tags
    setMetaTag('twitter:card', twitterCard);
    setMetaTag('twitter:title', fullTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', absoluteOgImage);
    
    // Structured Data (JSON-LD)
    if (structuredData) {
      const scriptId = 'structured-data-json-ld';
      let scriptElement = document.getElementById(scriptId) as HTMLScriptElement;
      
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = scriptId;
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      
      // Ensure structured data is an array
      const dataArray = Array.isArray(structuredData) ? structuredData : [structuredData];
      
      // Add @context if not present
      const enrichedData = dataArray.map(data => ({
        '@context': 'https://schema.org',
        ...data,
      }));
      
      scriptElement.textContent = JSON.stringify(enrichedData.length === 1 ? enrichedData[0] : enrichedData);
    }
    
    // Add WebSite structured data for homepage
    if (window.location.pathname === '/') {
      const websiteSchemaId = 'website-schema-json-ld';
      let websiteSchemaElement = document.getElementById(websiteSchemaId) as HTMLScriptElement;
      
      if (!websiteSchemaElement) {
        websiteSchemaElement = document.createElement('script');
        websiteSchemaElement.id = websiteSchemaId;
        websiteSchemaElement.type = 'application/ld+json';
        document.head.appendChild(websiteSchemaElement);
      }
      
      const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        url: siteUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      };
      
      websiteSchemaElement.textContent = JSON.stringify(websiteSchema);
    }

    // Cleanup function
    return () => {
      document.title = siteName;
    };
  }, [
    title,
    description,
    keywords,
    ogImage,
    ogType,
    canonical,
    noindex,
    fullTitle,
    canonicalUrl,
    siteUrl,
    siteName,
    absoluteOgImage,
    twitterCard,
    publishedTime,
    modifiedTime,
    author,
    section,
    tags,
    structuredData,
  ]);

  return null;
}
