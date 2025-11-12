#!/usr/bin/env node
/**
 * API Migration Script
 * Helps identify files that need migration from direct apiClient to useApiModern
 * 
 * Usage:
 *   npm run migrate-api -- --check       # Check files needing migration
 *   npm run migrate-api -- --report      # Generate detailed report
 */

import * as fs from 'fs';
import { glob } from 'glob';

interface MigrationIssue {
  file: string;
  line: number;
  pattern: string;
  suggestion: string;
}

const patterns = [
  {
    regex: /apiClient\.(get|post|put|patch|delete)/g,
    type: 'Direct apiClient usage',
    suggestion: 'Use useApiQuery/useApiMutation from @/shared/hooks/useApiModern'
  },
  {
    regex: /console\.(log|warn|info|debug)/g,
    type: 'Console usage',
    suggestion: 'Use logger() from @/core/logging'
  },
  {
    regex: /catch\s*\([^)]*\)\s*{\s*(?!.*handleError)/s,
    type: 'Manual error handling',
    suggestion: 'Use handleError() from @/core/error'
  }
];

async function scanFile(filePath: string): Promise<MigrationIssue[]> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues: MigrationIssue[] = [];

  patterns.forEach(({ regex, type, suggestion }) => {
    const matches = content.matchAll(regex);
    for (const match of matches) {
      const index = match.index || 0;
      const lineNumber = content.substring(0, index).split('\n').length;
      
      issues.push({
        file: filePath,
        line: lineNumber,
        pattern: type,
        suggestion
      });
    }
  });

  return issues;
}

async function main() {
  const args = process.argv.slice(2);
  const isReport = args.includes('--report');

  console.warn('🔍 Scanning codebase for migration opportunities...\n');

  const files = await glob('src/**/*.{ts,tsx}', {
    ignore: ['**/*.test.ts', '**/*.test.tsx', '**/node_modules/**']
  });

  const allIssues: MigrationIssue[] = [];

  for (const file of files) {
    const issues = await scanFile(file);
    allIssues.push(...issues);
  }

  // Group by pattern
  const byPattern = allIssues.reduce((acc, issue) => {
    if (!acc[issue.pattern]) {
      acc[issue.pattern] = [];
    }
    acc[issue.pattern].push(issue);
    return acc;
  }, {} as Record<string, MigrationIssue[]>);

  // Report
  console.warn('📊 Migration Status:\n');
  
  Object.entries(byPattern).forEach(([pattern, issues]) => {
    console.warn(`\n${pattern}: ${issues.length} occurrences`);
    
    if (isReport) {
      const byFile = issues.reduce((acc, issue) => {
        if (!acc[issue.file]) {
          acc[issue.file] = [];
        }
        acc[issue.file].push(issue);
        return acc;
      }, {} as Record<string, MigrationIssue[]>);

      Object.entries(byFile).forEach(([file, fileIssues]) => {
        console.warn(`  ${file.replace('src/', '')}`);
        fileIssues.forEach(issue => {
          console.warn(`    Line ${issue.line}: ${issue.suggestion}`);
        });
      });
    }
  });

  console.warn(`\n\n✅ Total files scanned: ${files.length}`);
  console.warn(`⚠️  Total issues found: ${allIssues.length}\n`);

  if (!isReport && allIssues.length > 0) {
    console.warn('💡 Run with --report flag for detailed file-by-file breakdown\n');
  }
}

main().catch(console.error);
