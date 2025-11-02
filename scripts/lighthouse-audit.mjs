/**
 * Simple Lighthouse Audit Script
 * Checks key metrics for accessibility, performance, SEO
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';

async function runLighthouse() {
  console.log('🚀 Starting Lighthouse audit...\n');

  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox'],
  });

  const options = {
    logLevel: 'info',
    output: ['html', 'json'],
    onlyCategories: ['accessibility', 'performance', 'best-practices', 'seo'],
    port: chrome.port,
    settings: {
      maxWaitForLoad: 45000,
      skipAudits: ['uses-http2'],
    },
  };

  const runnerResult = await lighthouse('http://localhost:4174', options);

  // Extract scores
  const { lhr } = runnerResult;
  const scores = {
    accessibility: Math.round((lhr.categories.accessibility?.score ?? 0) * 100),
    performance: Math.round((lhr.categories.performance?.score ?? 0) * 100),
    bestPractices: Math.round((lhr.categories['best-practices']?.score ?? 0) * 100),
    seo: Math.round((lhr.categories.seo?.score ?? 0) * 100),
  };

  // Print results
  console.log('\n📊 LIGHTHOUSE SCORES\n' + '='.repeat(50));
  console.log(`\n  ♿ Accessibility:  ${scores.accessibility}/100 ${scores.accessibility >= 90 ? '✅' : '❌'}`);
  console.log(`  ⚡ Performance:    ${scores.performance}/100 ${scores.performance >= 90 ? '✅' : '❌'}`);
  console.log(`  ✨ Best Practices: ${scores.bestPractices}/100 ${scores.bestPractices >= 90 ? '✅' : '❌'}`);
  console.log(`  🔍 SEO:            ${scores.seo}/100 ${scores.seo >= 90 ? '✅' : '❌'}\n`);

  // Save reports
  const reportPath = './reports/lighthouse-report.html';
  const jsonPath = './reports/lighthouse-report.json';
  fs.mkdirSync('./reports', { recursive: true });
  fs.writeFileSync(reportPath, runnerResult.report[0]);
  fs.writeFileSync(jsonPath, runnerResult.report[1]);
  console.log(`📄 Full report saved: ${reportPath}`);
  console.log(`📄 JSON report saved: ${jsonPath}\n`);

  await chrome.kill();

  // Exit with code based on scores
  const allPassed = Object.values(scores).every(score => score >= 90);
  process.exit(allPassed ? 0 : 1);
}

runLighthouse().catch(console.error);
