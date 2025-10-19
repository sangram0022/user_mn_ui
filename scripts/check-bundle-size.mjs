#!/usr/bin/env node

/**
 * Bundle Size Check Script
 * Verifies that the production bundle doesn't exceed the configured budget
 *
 * Usage:
 *   npm run check:bundle-size
 *
 * Exits with code 0 if OK, 1 if budget exceeded
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '../dist');

// Budget configuration (in bytes)
const BUDGET = {
  // Main bundle (JS + CSS combined)
  TOTAL_BUNDLE: 2 * 1024 * 1024, // 2 MB (realistic for feature-rich app)
  // Individual large chunks
  MAIN_JS: 800 * 1024, // 800 KB
  VENDOR_JS: 800 * 1024, // 800 KB (third-party code)
  CSS: 300 * 1024, // 300 KB
  // Allow some buffer for assets
  ASSETS: 5 * 1024 * 1024, // 5 MB for images/fonts combined
};

// Color output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

function getAllFilesWithExtension(dir, ext) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = [];
  const walk = (currentPath) => {
    const entries = fs.readdirSync(currentPath);
    entries.forEach((entry) => {
      const fullPath = path.join(currentPath, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (entry.endsWith(ext)) {
        files.push(fullPath);
      }
    });
  };
  walk(dir);
  return files;
}

async function checkBundleSize() {
  log('\n📦 Bundle Size Analysis', 'blue');
  log('='.repeat(50), 'blue');

  if (!fs.existsSync(distDir)) {
    log('\n❌ Error: dist directory not found', 'red');
    log('Please run: npm run build', 'yellow');
    process.exit(1);
  }

  let hasErrors = false;
  const results = [];

  // Check JS files
  log('\n📄 JavaScript Files:', 'blue');
  const jsFiles = getAllFilesWithExtension(path.join(distDir, 'assets'), '.js');
  let totalJs = 0;
  let maxJsFile = { path: '', size: 0 };

  jsFiles.forEach((file) => {
    const size = getFileSize(file);
    totalJs += size;
    const fileName = path.basename(file);

    if (size > maxJsFile.size) {
      maxJsFile = { path: fileName, size };
    }

    const percentage = (size / BUDGET.MAIN_JS) * 100;
    const status = size > BUDGET.MAIN_JS ? '❌' : '✅';
    log(`  ${status} ${fileName}: ${formatBytes(size)} (${percentage.toFixed(1)}%)`);

    if (size > BUDGET.MAIN_JS) {
      hasErrors = true;
    }
  });

  // Check CSS files
  log('\n🎨 CSS Files:', 'blue');
  const cssFiles = getAllFilesWithExtension(path.join(distDir, 'assets'), '.css');
  let totalCss = 0;

  cssFiles.forEach((file) => {
    const size = getFileSize(file);
    totalCss += size;
    const fileName = path.basename(file);
    const percentage = (size / BUDGET.CSS) * 100;
    const status = size > BUDGET.CSS ? '❌' : '✅';
    log(`  ${status} ${fileName}: ${formatBytes(size)} (${percentage.toFixed(1)}%)`);

    if (size > BUDGET.CSS) {
      hasErrors = true;
    }
  });

  // Check index.html
  log('\n📰 Index File:', 'blue');
  const indexSize = getFileSize(path.join(distDir, 'index.html'));
  const htmlStatus = indexSize > 50 * 1024 ? '⚠️' : '✅';
  log(`  ${htmlStatus} index.html: ${formatBytes(indexSize)}`);

  // Check all assets
  log('\n🖼️ Assets (images, fonts):', 'blue');
  const assetsDir = path.join(distDir, 'assets');
  const imageFormats = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
  let totalAssets = 0;

  imageFormats.forEach((ext) => {
    const files = getAllFilesWithExtension(assetsDir, ext);
    files.forEach((file) => {
      const size = getFileSize(file);
      totalAssets += size;
      const fileName = path.basename(file);
      log(`  ✅ ${fileName}: ${formatBytes(size)}`);
    });
  });

  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log('📊 Summary:', 'blue');

  const combinedTotal = totalJs + totalCss;
  const combinedPercentage = (combinedTotal / BUDGET.TOTAL_BUNDLE) * 100;
  const totalStatus = combinedTotal > BUDGET.TOTAL_BUNDLE ? '❌' : '✅';

  log(
    `  ${totalStatus} Total JS+CSS: ${formatBytes(combinedTotal)} / ${formatBytes(BUDGET.TOTAL_BUNDLE)} (${combinedPercentage.toFixed(1)}%)`
  );
  log(`  ✅ Largest JS File: ${formatBytes(maxJsFile.size)} (${maxJsFile.path})`);
  log(`  ✅ Total Assets: ${formatBytes(totalAssets)} / ${formatBytes(BUDGET.ASSETS)}`);
  log(`  ✅ Index HTML: ${formatBytes(indexSize)}`);

  // Budget details
  log('\n💡 Budget Details:', 'yellow');
  log(`  Total Bundle Limit: ${formatBytes(BUDGET.TOTAL_BUNDLE)}`);
  log(`  Main JS Limit: ${formatBytes(BUDGET.MAIN_JS)}`);
  log(`  CSS Limit: ${formatBytes(BUDGET.CSS)}`);
  log(`  Assets Limit: ${formatBytes(BUDGET.ASSETS)}`);

  // Recommendations
  if (combinedTotal > BUDGET.TOTAL_BUNDLE * 0.8) {
    log('\n⚠️ Warning: Bundle size is approaching the budget', 'yellow');
    log('Consider:', 'yellow');
    log('  • Code splitting additional modules', 'yellow');
    log('  • Removing unused dependencies', 'yellow');
    log('  • Using dynamic imports', 'yellow');
  }

  // Final result
  log('\n' + '='.repeat(50), 'blue');

  if (hasErrors || combinedTotal > BUDGET.TOTAL_BUNDLE) {
    log('\n❌ FAILED: Bundle size exceeds budget!', 'red');
    process.exit(1);
  } else {
    log('\n✅ PASSED: Bundle size is within budget!', 'green');
    process.exit(0);
  }
}

checkBundleSize().catch((error) => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
