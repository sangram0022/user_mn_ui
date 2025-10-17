#!/usr/bin/env node
/**
 * Inject Version Script
 *
 * Generates health.json with current build information during the build process.
 * Run this as a prebuild step to ensure health check has accurate version data.
 *
 * Usage: node scripts/inject-version.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGitInfo() {
  try {
    const version = execSync('git describe --tags --always', { encoding: 'utf-8' }).trim();
    const commit = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();

    return { version, commit, branch };
  } catch (error) {
    console.warn('Git info not available, using defaults');
    return {
      version: 'v1.0.0-dev',
      commit: 'unknown',
      branch: 'unknown',
    };
  }
}

function generateHealthJson() {
  const gitInfo = getGitInfo();
  const timestamp = new Date().toISOString();
  const environment = process.env.NODE_ENV || 'development';

  const healthData = {
    status: 'ok',
    service: 'user-management-ui',
    version: gitInfo.version,
    timestamp,
    build: {
      commit: gitInfo.commit,
      branch: gitInfo.branch,
      date: timestamp,
    },
    environment,
  };

  const publicDir = path.join(__dirname, '..', 'public');
  const healthPath = path.join(publicDir, 'health.json');

  fs.writeFileSync(healthPath, JSON.stringify(healthData, null, 2), 'utf-8');

  console.log('✅ Health check file generated:');
  console.log(`   Version: ${gitInfo.version}`);
  console.log(`   Commit:  ${gitInfo.commit.substring(0, 7)}`);
  console.log(`   Branch:  ${gitInfo.branch}`);
  console.log(`   File:    ${healthPath}`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateHealthJson();
}

export { generateHealthJson };
