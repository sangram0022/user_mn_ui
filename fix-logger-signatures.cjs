/**
 * Script to fix all logger call signatures across the codebase
 * Fixes: Argument of type 'unknown' is not assignable to parameter of type 'Error | undefined'
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/domains/status/pages/SystemStatusPage.tsx',
  'src/domains/users/pages/UserManagementPage.tsx',
  'src/shared/hooks/useAdvancedHooks.ts',
  'src/shared/hooks/useStorage.ts',
  'src/shared/performance/optimizationUtils.tsx',
  'src/shared/security/securityManager.ts',
  'src/shared/utils/cache.ts',
  'src/shared/utils/performance.ts',
];

function fixLoggerSignatures(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let changes = 0;

  // Fix 1: logger calls with boolean as second parameter
  // Before: logger.info('message', !!something)
  // After: logger.info('message', { value: !!something })
  content = content.replace(
    /logger\.(info|warn|error|debug)\('([^']+)',\s*!!(.*?)\);/g,
    (match, level, message, expr) => {
      changes++;
      return `logger.${level}('${message}', { value: !!${expr} });`;
    }
  );

  // Fix 2: logger calls with multiple arguments
  // Before: logger.info('message', value1, 'label', value2)
  // After: logger.info('message', { value1, label: value2 })
  const multiArgPattern = /logger\.(info|warn|error|debug)\((['"][^'"]+['"])\s*,\s*([^,]+)\s*,\s*(['"][^'"]+['"])\s*,\s*([^)]+)\);/g;
  content = content.replace(multiArgPattern, (match, level, message, arg1, label, arg2) => {
    changes++;
    const labelKey = label.replace(/['"]/g, '').replace(/[^a-zA-Z0-9]/g, '_');
    return `logger.${level}(${message}, { value: ${arg1}, ${labelKey}: ${arg2} });`;
  });

  // Fix 3: logger error calls with unknown error type - cast to Error
  // Before: logger.error('message', error)
  // After: logger.error('message', error instanceof Error ? error : new Error(String(error)))
  const errorCatchPattern = /catch\s*\(([^)]+)\)\s*\{([^]*?)logger\.(error|warn)\(([^,]+),\s*\1\s*\);/g;
  content = content.replace(errorCatchPattern, (match, errorVar, body, level, message) => {
    changes++;
    return `catch (${errorVar}) {${body}logger.${level}(${message}, ${errorVar} instanceof Error ? ${errorVar} : new Error(String(${errorVar})));`;
  });

  // Fix 4: logger calls with non-LogContext objects - wrap in proper structure
  // Before: logger.warn('message', someObject)
  // After: logger.warn('message', { data: someObject })
  const objPattern = /logger\.(warn|info|error|debug)\(([^,]+),\s*(\{[^}]+\})\s*\);/g;
  content = content.replace(objPattern, (match, level, message, obj) => {
    // Check if object already has proper structure (avoid double wrapping)
    if (obj.includes(':') && !obj.includes('error:') && !obj.includes('data:')) {
      changes++;
      return `logger.${level}(${message}, ${obj});`;
    }
    return match; // Keep as is if already structured
  });

  if (changes > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed ${changes} logger calls in ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed in ${filePath}`);
  }
}

function main() {
  console.log('🔧 Fixing logger call signatures...\n');
  
  filesToFix.forEach(filePath => {
    try {
      fixLoggerSignatures(filePath);
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  });

  console.log('\n✨ Logger signature fixes complete!');
}

main();
