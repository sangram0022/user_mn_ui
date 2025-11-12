#!/usr/bin/env node

/**
 * AWS S3 + CloudFront Deployment Script
 * Optimized for React SPA with efficient cache invalidation
 */

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  s3Bucket: process.env.S3_BUCKET || 'usermn-frontend-assets',
  cloudfrontDistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
  awsProfile: process.env.AWS_PROFILE || 'default',
  buildDir: './dist',
  region: process.env.AWS_REGION || 'us-east-1'
};

/**
 * Execute command with logging
 */
async function executeCommand(command, description) {
  console.log(`🔄 ${description}...`);
  console.log(`   Command: ${command}`);
  
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stdout) console.log(`   Output: ${stdout.trim()}`);
    if (stderr) console.log(`   Warning: ${stderr.trim()}`);
    console.log(`✅ ${description} completed`);
    return { stdout, stderr };
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

/**
 * Check if build directory exists
 */
async function checkBuildDirectory() {
  try {
    await fs.access(CONFIG.buildDir);
    console.log(`✅ Build directory found: ${CONFIG.buildDir}`);
  } catch {
    console.error(`❌ Build directory not found: ${CONFIG.buildDir}`);
    console.log('Run `npm run build` first');
    process.exit(1);
  }
}

/**
 * Sync files to S3 with optimized caching headers
 */
async function syncToS3() {
  const commands = [
    // Sync main files (no cache for HTML)
    {
      cmd: `aws s3 sync ${CONFIG.buildDir} s3://${CONFIG.s3Bucket} --profile ${CONFIG.awsProfile} --delete --exact-timestamps --exclude "*" --include "*.html" --cache-control "no-cache, no-store, must-revalidate"`,
      desc: 'HTML files (no cache)'
    },
    
    // Sync vendor chunks (long cache)
    {
      cmd: `aws s3 sync ${CONFIG.buildDir}/assets s3://${CONFIG.s3Bucket}/assets --profile ${CONFIG.awsProfile} --exclude "*" --include "vendor-*" --cache-control "public, max-age=31536000, immutable"`,
      desc: 'Vendor chunks (1 year cache)'
    },
    
    // Sync shared components (long cache)
    {
      cmd: `aws s3 sync ${CONFIG.buildDir}/assets s3://${CONFIG.s3Bucket}/assets --profile ${CONFIG.awsProfile} --exclude "*" --include "shared-*" --cache-control "public, max-age=31536000, immutable"`,
      desc: 'Shared components (1 year cache)'
    },
    
    // Sync CSS files (long cache)
    {
      cmd: `aws s3 sync ${CONFIG.buildDir}/assets s3://${CONFIG.s3Bucket}/assets --profile ${CONFIG.awsProfile} --exclude "*" --include "*.css" --cache-control "public, max-age=31536000, immutable"`,
      desc: 'CSS files (1 year cache)'
    },
    
    // Sync feature chunks (medium cache)
    {
      cmd: `aws s3 sync ${CONFIG.buildDir}/assets s3://${CONFIG.s3Bucket}/assets --profile ${CONFIG.awsProfile} --exclude "*" --include "feature-*" --cache-control "public, max-age=604800"`,
      desc: 'Feature chunks (1 week cache)'
    },
    
    // Sync main chunks (short cache)
    {
      cmd: `aws s3 sync ${CONFIG.buildDir}/assets s3://${CONFIG.s3Bucket}/assets --profile ${CONFIG.awsProfile} --exclude "*" --include "main-*" --cache-control "public, max-age=3600"`,
      desc: 'Main chunks (1 hour cache)'
    },
    
    // Sync remaining assets (medium cache)
    {
      cmd: `aws s3 sync ${CONFIG.buildDir} s3://${CONFIG.s3Bucket} --profile ${CONFIG.awsProfile} --exclude "*.html" --exclude "assets/vendor-*" --exclude "assets/shared-*" --exclude "assets/*.css" --exclude "assets/feature-*" --exclude "assets/main-*" --cache-control "public, max-age=86400"`,
      desc: 'Other assets (1 day cache)'
    }
  ];
  
  for (const { cmd, desc } of commands) {
    await executeCommand(cmd, desc);
  }
}

/**
 * Create smart CloudFront invalidation
 */
async function invalidateCloudFront() {
  if (!CONFIG.cloudfrontDistributionId) {
    console.log('⚠️ No CloudFront distribution ID provided. Skipping invalidation.');
    return;
  }
  
  // Only invalidate paths that need immediate updates
  const invalidationPaths = [
    '/index.html',
    '/assets/main-*',  // Main application chunks
    '/manifest.json',
    '/robots.txt',
    '/sitemap.xml'
  ];
  
  const pathsString = invalidationPaths.join(' ');
  
  const command = `aws cloudfront create-invalidation --distribution-id ${CONFIG.cloudfrontDistributionId} --profile ${CONFIG.awsProfile} --paths ${pathsString}`;
  
  await executeCommand(command, 'CloudFront invalidation');
}

/**
 * Set S3 bucket website configuration
 */
async function configureS3Website() {
  const websiteConfig = {
    IndexDocument: { Suffix: 'index.html' },
    ErrorDocument: { Key: 'index.html' }
  };
  
  const configFile = 'website-config.json';
  await fs.writeFile(configFile, JSON.stringify(websiteConfig, null, 2));
  
  try {
    const command = `aws s3api put-bucket-website --bucket ${CONFIG.s3Bucket} --profile ${CONFIG.awsProfile} --website-configuration file://${configFile}`;
    await executeCommand(command, 'S3 website configuration');
  } finally {
    // Clean up temporary file
    await fs.unlink(configFile).catch(() => {});
  }
}

/**
 * Display deployment summary
 */
function displaySummary() {
  console.log('\\n🎉 Deployment Summary');
  console.log('─'.repeat(50));
  console.log(`S3 Bucket: ${CONFIG.s3Bucket}`);
  console.log(`CloudFront: ${CONFIG.cloudfrontDistributionId || 'Not configured'}`);
  console.log(`AWS Profile: ${CONFIG.awsProfile}`);
  console.log(`Region: ${CONFIG.region}`);
  
  if (CONFIG.cloudfrontDistributionId) {
    console.log(`\\n🌐 Website URLs:`);
    console.log(`S3 Website: http://${CONFIG.s3Bucket}.s3-website.${CONFIG.region}.amazonaws.com`);
    console.log(`CloudFront: https://[distribution-domain-name]`);
  }
  
  console.log('\\n💡 Cache Strategy Applied:');
  console.log('  🟢 HTML files: No cache (immediate updates)');
  console.log('  🟢 Vendor chunks: 1 year cache (rarely change)');
  console.log('  🟡 Feature chunks: 1 week cache (moderate updates)');
  console.log('  🔴 Main chunks: 1 hour cache (frequent updates)');
  console.log('  📦 Other assets: 1 day cache (images, fonts, etc.)');
}

/**
 * Main deployment function
 */
async function deploy() {
  console.log('🚀 Starting AWS CloudFront Deployment\\n');
  
  try {
    // Validate environment
    if (!CONFIG.s3Bucket) {
      throw new Error('S3_BUCKET environment variable is required');
    }
    
    // Check prerequisites
    await checkBuildDirectory();
    
    // Execute deployment steps
    console.log('\\n📦 Step 1: Configure S3 Website');
    await configureS3Website();
    
    console.log('\\n📤 Step 2: Sync files to S3');
    await syncToS3();
    
    console.log('\\n🔄 Step 3: Invalidate CloudFront cache');
    await invalidateCloudFront();
    
    console.log('\\n✅ Deployment completed successfully!');
    displaySummary();
    
  } catch (error) {
    console.error('\\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Handle CLI arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
AWS CloudFront Deployment Script

Usage:
  npm run deploy              Deploy to AWS with default settings
  npm run deploy:prod         Deploy to production environment

Environment Variables:
  S3_BUCKET                   S3 bucket name (required)
  CLOUDFRONT_DISTRIBUTION_ID  CloudFront distribution ID
  AWS_PROFILE                 AWS profile to use (default: default)
  AWS_REGION                  AWS region (default: us-east-1)

Examples:
  S3_BUCKET=my-bucket npm run deploy
  S3_BUCKET=prod-bucket CLOUDFRONT_DISTRIBUTION_ID=E1234567890 npm run deploy:prod
  `);
  process.exit(0);
}

// Execute deployment
deploy();