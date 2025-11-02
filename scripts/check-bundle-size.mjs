#!/usr/bin/env node

/**
 * Bundle Size Checker
 * Validates that built assets meet performance budgets
 * Exits with code 1 if any budget is exceeded
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

// Budget limits (in bytes) - aligned with lighthouse-budget.json
const BUDGET = {
  js: 307200,      // 300KB
  css: 51200,      // 50KB
  image: 204800,   // 200KB
  font: 102400,    // 100KB
  total: 819200,   // 800KB
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

/**
 * Recursively get total size of files with specific extensions
 */
function getDirectorySize(dir, extensions) {
  let totalSize = 0;
  const fileList = [];
  
  function traverse(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions.includes(ext)) {
          const stats = fs.statSync(fullPath);
          totalSize += stats.size;
          fileList.push({
            path: path.relative(distDir, fullPath),
            size: stats.size,
          });
        }
      }
    }
  }
  
  traverse(dir);
  
  return { totalSize, files: fileList };
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Print file list with sizes
 */
function printFileList(label, files, budget) {
  console.log(`\n${colors.cyan}${colors.bold}${label} Files:${colors.reset}`);
  
  const sortedFiles = files.sort((a, b) => b.size - a.size);
  const topFiles = sortedFiles.slice(0, 10); // Show top 10
  
  topFiles.forEach((file, index) => {
    const percentage = ((file.size / budget) * 100).toFixed(1);
    const sizeStr = formatBytes(file.size).padEnd(10);
    const percentStr = `${percentage}%`.padStart(7);
    console.log(`  ${index + 1}. ${sizeStr} (${percentStr}) ${file.path}`);
  });
  
  if (sortedFiles.length > 10) {
    console.log(`  ... and ${sortedFiles.length - 10} more files`);
  }
}

/**
 * Main bundle size check function
 */
function checkBundleSize() {
  console.log(`\n${colors.bold}${colors.cyan}📊 Bundle Size Analysis${colors.reset}\n`);
  console.log(`Directory: ${distDir}\n`);
  
  // Collect sizes by type
  const jsResult = getDirectorySize(distDir, ['.js']);
  const cssResult = getDirectorySize(distDir, ['.css']);
  const imageResult = getDirectorySize(distDir, ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif']);
  const fontResult = getDirectorySize(distDir, ['.woff', '.woff2', '.ttf', '.eot']);
  
  const sizes = {
    js: jsResult.totalSize,
    css: cssResult.totalSize,
    image: imageResult.totalSize,
    font: fontResult.totalSize,
  };
  
  sizes.total = sizes.js + sizes.css + sizes.image + sizes.font;
  
  let failed = false;
  const results = [];
  
  // Check each category
  Object.entries(sizes).forEach(([type, size]) => {
    const budget = BUDGET[type];
    const percentage = ((size / budget) * 100).toFixed(1);
    const withinBudget = size <= budget;
    const status = withinBudget ? '✅' : '❌';
    const color = withinBudget ? colors.green : colors.red;
    const overBy = size > budget ? ` (${colors.red}over by ${formatBytes(size - budget)}${colors.reset})` : '';
    
    const result = `${status} ${colors.bold}${type.toUpperCase().padEnd(8)}${colors.reset} ${color}${formatBytes(size).padEnd(12)}${colors.reset} / ${formatBytes(budget).padEnd(12)} (${percentage}%)${overBy}`;
    
    console.log(result);
    
    results.push({
      type,
      size,
      budget,
      percentage: parseFloat(percentage),
      withinBudget,
    });
    
    if (!withinBudget) {
      failed = true;
    }
  });
  
  // Print detailed file lists for failed categories
  if (jsResult.files.length > 0 && sizes.js > BUDGET.js) {
    printFileList('JavaScript', jsResult.files, BUDGET.js);
  }
  
  if (cssResult.files.length > 0 && sizes.css > BUDGET.css) {
    printFileList('CSS', cssResult.files, BUDGET.css);
  }
  
  if (imageResult.files.length > 0 && sizes.image > BUDGET.image) {
    printFileList('Image', imageResult.files, BUDGET.image);
  }
  
  // Print summary
  console.log(`\n${colors.bold}${colors.cyan}Summary:${colors.reset}`);
  console.log(`Total bundle size: ${formatBytes(sizes.total)} / ${formatBytes(BUDGET.total)}`);
  console.log(`Budget utilization: ${((sizes.total / BUDGET.total) * 100).toFixed(1)}%\n`);
  
  // Print recommendations if over budget
  if (failed) {
    console.log(`${colors.yellow}${colors.bold}⚠️  Optimization Recommendations:${colors.reset}\n`);
    
    if (sizes.js > BUDGET.js) {
      console.log(`${colors.yellow}JavaScript (${formatBytes(sizes.js)} / ${formatBytes(BUDGET.js)}):${colors.reset}`);
      console.log(`  • Enable code splitting for routes`);
      console.log(`  • Use lazy loading for heavy components`);
      console.log(`  • Check for duplicate dependencies`);
      console.log(`  • Use modular imports (e.g., lodash-es)`);
      console.log(`  • Review and remove unused dependencies\n`);
    }
    
    if (sizes.css > BUDGET.css) {
      console.log(`${colors.yellow}CSS (${formatBytes(sizes.css)} / ${formatBytes(BUDGET.css)}):${colors.reset}`);
      console.log(`  • Enable Tailwind CSS purging`);
      console.log(`  • Remove unused CSS classes`);
      console.log(`  • Use CSS modules for component styles`);
      console.log(`  • Minify CSS with cssnano\n`);
    }
    
    if (sizes.image > BUDGET.image) {
      console.log(`${colors.yellow}Images (${formatBytes(sizes.image)} / ${formatBytes(BUDGET.image)}):${colors.reset}`);
      console.log(`  • Convert images to WebP format`);
      console.log(`  • Use image optimization tools`);
      console.log(`  • Implement lazy loading for images`);
      console.log(`  • Use SVG for icons instead of PNG\n`);
    }
    
    console.log(`\n${colors.red}${colors.bold}❌ Bundle size check FAILED!${colors.reset}`);
    console.log(`${colors.yellow}Review the recommendations above and optimize your bundle.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bold}✅ All bundle sizes within budget!${colors.reset}\n`);
    process.exit(0);
  }
}

/**
 * Generate JSON report for CI/CD
 */
function generateJSONReport() {
  const jsResult = getDirectorySize(distDir, ['.js']);
  const cssResult = getDirectorySize(distDir, ['.css']);
  const imageResult = getDirectorySize(distDir, ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif']);
  const fontResult = getDirectorySize(distDir, ['.woff', '.woff2', '.ttf', '.eot']);
  
  const report = {
    timestamp: new Date().toISOString(),
    scores: {
      css: cssResult.totalSize <= BUDGET.css ? 100 : 0,
      js: jsResult.totalSize <= BUDGET.js ? 100 : 0,
      total: (jsResult.totalSize + cssResult.totalSize) <= BUDGET.total ? 100 : 0,
    },
    bundles: {
      css: {
        size: cssResult.totalSize,
        budget: BUDGET.css,
        count: cssResult.files.length,
      },
      js: {
        size: jsResult.totalSize,
        budget: BUDGET.js,
        count: jsResult.files.length,
      },
      image: {
        size: imageResult.totalSize,
        budget: BUDGET.image,
        count: imageResult.files.length,
      },
      font: {
        size: fontResult.totalSize,
        budget: BUDGET.font,
        count: fontResult.files.length,
      },
      total: {
        size: jsResult.totalSize + cssResult.totalSize + imageResult.totalSize + fontResult.totalSize,
        budget: BUDGET.total,
      },
    },
  };
  
  const reportPath = path.join(__dirname, '..', 'reports', 'bundle-size-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n${colors.cyan}JSON report saved to: ${reportPath}${colors.reset}\n`);
}

// Main execution
if (!fs.existsSync(distDir)) {
  console.error(`${colors.red}Error: dist directory not found at ${distDir}${colors.reset}`);
  console.error(`${colors.yellow}Please run 'npm run build' first.${colors.reset}\n`);
  process.exit(1);
}

checkBundleSize();
generateJSONReport();
