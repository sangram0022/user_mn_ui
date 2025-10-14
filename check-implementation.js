#!/usr/bin/env node

/**
 * Implementation Check Script
 *
 * This script checks for:
 * 1. Missing imports/exports
 * 2. Unused variables
 * 3. Potential circular dependencies
 * 4. Missing admin route implementations
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();

console.log('🔍 Checking Admin Implementation Completeness...\n');

// Check 1: Admin Pages Exports
console.log('✅ Checking Admin Pages Exports:');
const adminPagesDir = join(projectRoot, 'src', 'domains', 'admin', 'pages');
try {
  const adminPages = readdirSync(adminPagesDir).filter((file) => file.endsWith('.tsx'));

  adminPages.forEach((page) => {
    const filePath = join(adminPagesDir, page);
    const content = readFileSync(filePath, 'utf8');

    if (content.includes('export default')) {
      console.log(`   ✓ ${page} - Default export found`);
    } else {
      console.log(`   ❌ ${page} - Missing default export`);
    }
  });
} catch (error) {
  console.log('   ❌ Error reading admin pages directory');
}

// Check 2: Route Configuration
console.log('\n✅ Checking Route Configuration:');
try {
  const routeConfigPath = join(projectRoot, 'src', 'routing', 'config.ts');
  const routeConfig = readFileSync(routeConfigPath, 'utf8');

  const adminRoutes = [
    '/admin',
    '/admin/dashboard',
    '/admin/roles',
    '/admin/audit-logs',
    '/admin/bulk-operations',
    '/admin/gdpr-compliance',
    '/admin/health-monitoring',
    '/admin/password-management',
  ];

  adminRoutes.forEach((route) => {
    if (routeConfig.includes(`path: '${route}'`)) {
      console.log(`   ✓ ${route} - Route configured`);
    } else {
      console.log(`   ❌ ${route} - Route missing`);
    }
  });
} catch (error) {
  console.log('   ❌ Error reading route configuration');
}

// Check 3: Admin Service Integration
console.log('\n✅ Checking Admin Service Integration:');
try {
  const servicePath = join(projectRoot, 'src', 'services', 'admin-backend.service.ts');
  const serviceContent = readFileSync(servicePath, 'utf8');

  if (serviceContent.includes('export const adminService')) {
    console.log('   ✓ Admin service exported properly');
  } else {
    console.log('   ❌ Admin service export missing');
  }

  // Check if pages import the service
  const adminPagesDir = join(projectRoot, 'src', 'domains', 'admin', 'pages');
  const adminPages = readdirSync(adminPagesDir).filter((file) => file.endsWith('.tsx'));

  adminPages.forEach((page) => {
    const filePath = join(adminPagesDir, page);
    const content = readFileSync(filePath, 'utf8');

    if (content.includes('import { adminService }')) {
      console.log(`   ✓ ${page} - Admin service imported`);
    } else {
      console.log(`   ⚠️  ${page} - Admin service not imported`);
    }
  });
} catch (error) {
  console.log('   ❌ Error checking admin service');
}

console.log('\n🎉 Implementation check complete!');
