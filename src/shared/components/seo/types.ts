/**
 * SEO Component Types
 * 
 * Type definitions for SEO metadata management
 */

export interface SEOProps {
  /** Page title (will be appended with site name) */
  title: string;
  
  /** Meta description (150-160 characters recommended) */
  description: string;
  
  /** Keywords for meta keywords tag (optional, less important for modern SEO) */
  keywords?: string[];
  
  /** Canonical URL (absolute URL) */
  canonicalUrl?: string;
  
  /** Open Graph image URL (absolute URL, 1200x630px recommended) */
  ogImage?: string;
  
  /** Open Graph type (default: 'website') */
  ogType?: 'website' | 'article' | 'profile';
  
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
  
  /** Robots meta tag (default: 'index,follow') */
  robots?: string;
  
  /** Language code (default: 'en') */
  lang?: string;
  
  /** Disable default site name appending */
  noSuffix?: boolean;
  
  /** Structured data (JSON-LD) */
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

export interface SEOConfig {
  /** Default site name */
  siteName: string;
  
  /** Default site URL (no trailing slash) */
  siteUrl: string;
  
  /** Default description */
  defaultDescription: string;
  
  /** Default OG image URL */
  defaultOgImage: string;
  
  /** Twitter handle (without @) */
  twitterHandle?: string;
  
  /** Default language */
  defaultLang: string;
  
  /** Title separator (default: '|') */
  titleSeparator: string;
  
  /** Organization structured data */
  organization?: {
    name: string;
    url: string;
    logo: string;
    sameAs?: string[]; // Social media profiles
  };
}
