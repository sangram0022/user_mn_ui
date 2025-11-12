/**
 * Post-Build Script: Update Sitemap and Robots.txt with Production URLs
 * 
 * This script runs after build to replace placeholder URLs with actual CloudFront/custom domain URLs
 * Usage: node scripts/update-site-urls.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Get site URL from environment variable or use default
const SITE_URL = process.env.VITE_APP_URL || process.env.PUBLIC_URL || 'https://example.com';

console.log(`🔧 Updating sitemap.xml and robots.txt with URL: ${SITE_URL}`);

// Update sitemap.xml
try {
  const sitemapPath = join(process.cwd(), 'dist', 'sitemap.xml');
  let sitemapContent = readFileSync(sitemapPath, 'utf-8');
  
  // Replace all occurrences of SITE_URL placeholder
  sitemapContent = sitemapContent.replaceAll('SITE_URL', SITE_URL);
  
  writeFileSync(sitemapPath, sitemapContent);
  console.log('✅ Updated sitemap.xml successfully');
} catch (error) {
  console.error('❌ Error updating sitemap.xml:', error.message);
}

// Update robots.txt
try {
  const robotsPath = join(process.cwd(), 'dist', 'robots.txt');
  let robotsContent = readFileSync(robotsPath, 'utf-8');
  
  // Replace all occurrences of SITE_URL placeholder
  robotsContent = robotsContent.replaceAll('SITE_URL', SITE_URL);
  
  writeFileSync(robotsPath, robotsContent);
  console.log('✅ Updated robots.txt successfully');
} catch (error) {
  console.error('❌ Error updating robots.txt:', error.message);
}

console.log('✨ Site URL update complete!');
