/**
 * Accessibility Quick Check Script
 * Validates WCAG 2.1 AA compliance for key pages
 */

import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import path from 'path';

const PAGES_TO_TEST = [
  { url: 'http://localhost:4173/', name: 'Home' },
  { url: 'http://localhost:4173/login', name: 'Login' },
  { url: 'http://localhost:4173/register', name: 'Register' },
];

const TARGET_SCORES = {
  accessibility: 95, // Target 95+ (aim for 100)
  performance: 90,
  bestPractices: 90,
  seo: 90,
};

async function runAudit(url, name) {
  console.log(`\n🔍 Testing ${name}: ${url}`);
  
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
  });

  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['accessibility', 'performance', 'best-practices', 'seo'],
    port: chrome.port,
  };

  try {
    const runnerResult = await lighthouse(url, options);
    const { lhr } = runnerResult;

    // Extract scores
    const scores = {
      accessibility: Math.round((lhr.categories.accessibility?.score ?? 0) * 100),
      performance: Math.round((lhr.categories.performance?.score ?? 0) * 100),
      bestPractices: Math.round((lhr.categories['best-practices']?.score ?? 0) * 100),
      seo: Math.round((lhr.categories.seo?.score ?? 0) * 100),
    };

    // Check accessibility audits
    const accessibilityAudits = Object.values(lhr.audits)
      .filter((audit) => 
        audit.scoreDisplayMode === 'binary' && 
        audit.score !== null && 
        audit.score < 1
      )
      .map((audit) => ({
        id: audit.id,
        title: audit.title,
        description: audit.description,
      }));

    return {
      name,
      url,
      scores,
      accessibilityIssues: accessibilityAudits,
      passed: scores.accessibility >= TARGET_SCORES.accessibility,
    };
  } finally {
    await chrome.kill();
  }
}

async function main() {
  console.log('🚀 Running Accessibility Quick Check...\n');
  console.log(`Target Scores: Accessibility ${TARGET_SCORES.accessibility}+, Performance ${TARGET_SCORES.performance}+\n`);

  const results = [];

  for (const page of PAGES_TO_TEST) {
    try {
      const result = await runAudit(page.url, page.name);
      results.push(result);
    } catch (error) {
      console.error(`❌ Error testing ${page.name}:`, error.message);
      results.push({
        name: page.name,
        url: page.url,
        scores: { accessibility: 0, performance: 0, bestPractices: 0, seo: 0 },
        accessibilityIssues: [],
        passed: false,
        error: error.message,
      });
    }
  }

  // Print results
  console.log('\n📊 RESULTS\n' + '='.repeat(80) + '\n');

  for (const result of results) {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
    console.log(`   Accessibility: ${result.scores.accessibility}/100`);
    console.log(`   Performance:   ${result.scores.performance}/100`);
    console.log(`   Best Practices: ${result.scores.bestPractices}/100`);
    console.log(`   SEO:           ${result.scores.seo}/100`);

    if (result.accessibilityIssues.length > 0) {
      console.log(`\n   ⚠️  Accessibility Issues:`);
      result.accessibilityIssues.forEach((issue, i) => {
        console.log(`      ${i + 1}. ${issue.title}`);
      });
    }
    console.log();
  }

  // Summary
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const overallPass = passedCount === totalCount;

  console.log('='.repeat(80));
  console.log(`\n${overallPass ? '✅' : '❌'} Overall: ${passedCount}/${totalCount} pages passed\n`);

  // Save report
  const reportDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportPath = path.join(reportDir, `accessibility-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Full report saved: ${reportPath}\n`);

  process.exit(overallPass ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
