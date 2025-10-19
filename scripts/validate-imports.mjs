#!/usr/bin/env node
/**
 * Pre-Build Validation Script
 *
 * Detects broken imports, missing files, and dependency issues BEFORE build time.
 * Run this script as part of your CI/CD pipeline or before committing code.
 *
 * Usage:
 *   node scripts/validate-imports.mjs
 *   npm run validate
 */

import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  error: (msg) => console.error(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.warn(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}=== ${msg} ===${colors.reset}\n`),
};

let hasErrors = false;
const errors = [];
const warnings = [];

/**
 * Check 1: TypeScript Type Checking
 */
async function checkTypeScript() {
  log.section('Checking TypeScript');

  try {
    const { stdout, stderr } = await execAsync('npx tsc --noEmit', {
      cwd: rootDir,
    });

    if (stderr) {
      log.warning('TypeScript warnings detected');
      console.log(stderr);
      warnings.push('TypeScript type check has warnings');
    } else {
      log.success('TypeScript type check passed');
    }

    return true;
  } catch (error) {
    log.error('TypeScript type check failed');
    console.error(error.stdout || error.message);
    errors.push('TypeScript type check failed');
    hasErrors = true;
    return false;
  }
}

/**
 * Check 2: ESLint Validation
 */
async function checkESLint() {
  log.section('Checking ESLint');

  try {
    const { stdout } = await execAsync('npx eslint . --ext ts,tsx', {
      cwd: rootDir,
    });

    log.success('ESLint check passed');
    return true;
  } catch (error) {
    log.error('ESLint check failed');
    console.error(error.stdout || error.message);
    errors.push('ESLint check failed');
    hasErrors = true;
    return false;
  }
}

/**
 * Check 3: Verify CSS Imports
 */
async function checkCSSImports() {
  log.section('Checking CSS Imports');

  const cssImportPattern = /@import\s+['"](.*?)['"];/g;
  const cssFile = path.join(rootDir, 'src/styles/index-new.css');

  try {
    const content = await fs.readFile(cssFile, 'utf-8');
    const imports = [...content.matchAll(cssImportPattern)];
    const missingFiles = [];

    for (const match of imports) {
      const importPath = match[1];

      // Skip tailwindcss import (it's a package, not a file)
      if (importPath === 'tailwindcss') continue;

      const fullPath = path.join(path.dirname(cssFile), importPath);

      try {
        await fs.access(fullPath);
      } catch {
        missingFiles.push(importPath);
      }
    }

    if (missingFiles.length > 0) {
      log.error(`Missing CSS files referenced in ${cssFile}:`);
      missingFiles.forEach((file) => console.log(`  - ${file}`));
      errors.push(`Missing ${missingFiles.length} CSS files`);
      hasErrors = true;
      return false;
    }

    log.success(`All CSS imports verified (${imports.length - 1} files)`);
    return true;
  } catch (error) {
    log.error(`Failed to check CSS imports: ${error.message}`);
    errors.push('CSS import check failed');
    hasErrors = true;
    return false;
  }
}

/**
 * Check 4: Verify Path Aliases in TSConfig
 */
async function checkPathAliases() {
  log.section('Checking Path Aliases');

  try {
    const tsconfigPath = path.join(rootDir, 'tsconfig.app.json');
    const content = await fs.readFile(tsconfigPath, 'utf-8');

    // Parse JSONC (JSON with comments) - more robust parsing
    const jsonContent = content
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .trim();

    const tsconfig = JSON.parse(jsonContent);

    const paths = tsconfig.compilerOptions?.paths || {};
    const missingDirs = [];

    for (const [alias, [targetPath]] of Object.entries(paths)) {
      const fullPath = path.join(rootDir, targetPath.replace('/*', ''));

      try {
        const stat = await fs.stat(fullPath);
        if (!stat.isDirectory()) {
          missingDirs.push({ alias, path: targetPath, reason: 'Not a directory' });
        }
      } catch {
        missingDirs.push({ alias, path: targetPath, reason: 'Does not exist' });
      }
    }

    if (missingDirs.length > 0) {
      log.warning('Some path aliases point to non-existent directories:');
      missingDirs.forEach(({ alias, path, reason }) => {
        console.log(`  - ${alias} → ${path} (${reason})`);
      });
      warnings.push(`${missingDirs.length} path aliases point to missing directories`);
    } else {
      log.success(`All path aliases verified (${Object.keys(paths).length} aliases)`);
    }

    return true;
  } catch (error) {
    log.error(`Failed to check path aliases: ${error.message}`);
    errors.push('Path alias check failed');
    hasErrors = true;
    return false;
  }
}

/**
 * Check 5: Verify Package.json Dependencies
 */
async function checkDependencies() {
  log.section('Checking Dependencies');

  try {
    const packageJsonPath = path.join(rootDir, 'package.json');
    const content = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);

    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    // Check for common issues
    const issues = [];

    // Check for dependencies that should be devDependencies
    const shouldBeDevDeps = ['@types/', 'eslint', 'prettier', 'vitest', '@testing-library/'];
    for (const dep of Object.keys(packageJson.dependencies || {})) {
      if (shouldBeDevDeps.some((pattern) => dep.includes(pattern))) {
        issues.push(`${dep} should be in devDependencies`);
      }
    }

    if (issues.length > 0) {
      log.warning('Dependency organization issues found:');
      issues.forEach((issue) => console.log(`  - ${issue}`));
      warnings.push(`${issues.length} dependency organization issues`);
    } else {
      log.success(`Dependencies properly organized (${Object.keys(allDeps).length} packages)`);
    }

    return true;
  } catch (error) {
    log.error(`Failed to check dependencies: ${error.message}`);
    errors.push('Dependency check failed');
    hasErrors = true;
    return false;
  }
}

/**
 * Check 6: Verify Critical Files Exist
 */
async function checkCriticalFiles() {
  log.section('Checking Critical Files');

  const criticalFiles = [
    'src/main.tsx',
    'src/app/App.tsx',
    'src/styles/index-new.css',
    'index.html',
    'vite.config.ts',
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.node.json',
    'package.json',
  ];

  const missingFiles = [];

  for (const file of criticalFiles) {
    const fullPath = path.join(rootDir, file);
    try {
      await fs.access(fullPath);
    } catch {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length > 0) {
    log.error('Missing critical files:');
    missingFiles.forEach((file) => console.log(`  - ${file}`));
    errors.push(`Missing ${missingFiles.length} critical files`);
    hasErrors = true;
    return false;
  }

  log.success(`All critical files exist (${criticalFiles.length} files)`);
  return true;
}

/**
 * Main Validation Runner
 */
async function runValidation() {
  console.log('\n');
  log.info('Starting pre-build validation...');
  console.log('\n');

  const startTime = Date.now();

  // Run all checks
  await checkCriticalFiles();
  await checkTypeScript();
  await checkESLint();
  await checkCSSImports();
  await checkPathAliases();
  await checkDependencies();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Summary
  log.section('Validation Summary');

  if (errors.length > 0) {
    log.error(`Found ${errors.length} error(s):`);
    errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`));
  }

  if (warnings.length > 0) {
    log.warning(`Found ${warnings.length} warning(s):`);
    warnings.forEach((warning, i) => console.log(`  ${i + 1}. ${warning}`));
  }

  console.log('\n');

  if (hasErrors) {
    log.error(`Validation failed in ${duration}s`);
    process.exit(1);
  } else if (warnings.length > 0) {
    log.warning(`Validation completed with warnings in ${duration}s`);
    process.exit(0);
  } else {
    log.success(`All validations passed in ${duration}s 🎉`);
    process.exit(0);
  }
}

// Run the validation
runValidation().catch((error) => {
  log.error(`Validation crashed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
