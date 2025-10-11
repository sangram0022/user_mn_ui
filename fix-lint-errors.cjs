const fs = require('fs');
const path = require('path');

// Files with unused 'error' variables that need to be prefixed with underscore
const filesToFix = [
  'src/domains/authentication/pages/ForgotPasswordPage.tsx',
  'src/domains/authentication/pages/ResetPasswordPage.tsx',
  'src/infrastructure/api/utils/transformers.ts',
  'src/infrastructure/monitoring/AnalyticsTracker.ts',
  'src/infrastructure/monitoring/GlobalErrorHandler.ts',
  'src/infrastructure/monitoring/PerformanceMonitor.ts',
  'src/infrastructure/monitoring/WebVitalsTracker.ts',
  'src/infrastructure/monitoring/logger.ts',
  'src/infrastructure/security/AuthManager.ts',
  'src/services/bulk.service.ts',
];

function fixFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} - file not found`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace "} catch (error)" with "} catch (_error)"
  // This handles both error logging and unused error variables
  content = content.replace(/catch\s*\(\s*error\s*\)/g, 'catch (_error)');

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Fixed: ${filePath}`);
}

console.log('Fixing unused error variables...\n');

filesToFix.forEach(fixFile);

console.log('\nDone!');
