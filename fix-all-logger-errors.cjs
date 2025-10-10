/**
 * Comprehensive logger error fix script
 * Handles all error type casting issues
 */

const fs = require('fs');
const path = require('path');

const fixes = [
  {
    file: 'src/shared/hooks/useAdvancedHooks.ts',
    replacements: [
      {
        old: /logger\.error\(`Error reading localStorage key "\$\{key\}":`, error\);/g,
        new: 'logger.error(`Error reading localStorage key "${key}":`, error instanceof Error ? error : new Error(String(error)));'
      },
      {
        old: /logger\.error\(`Error setting localStorage key "\$\{key\}":`, error\);/g,
        new: 'logger.error(`Error setting localStorage key "${key}":`, error instanceof Error ? error : new Error(String(error)));'
      },
      {
        old: /logger\.error\(`Error removing localStorage key "\$\{key\}":`, error\);/g,
        new: 'logger.error(`Error removing localStorage key "${key}":`, error instanceof Error ? error : new Error(String(error)));'
      },
    ]
  },
  {
    file: 'src/shared/hooks/useStorage.ts',
    replacements: [
      {
        old: /logger\.warn\(`Error reading localStorage key "\$\{key\}":`, error\);/g,
        new: 'logger.warn(`Error reading localStorage key "${key}":`, { error: String(error) });'
      },
      {
        old: /logger\.warn\(`Error setting localStorage key "\$\{key\}":`, error\);/g,
        new: 'logger.warn(`Error setting localStorage key "${key}":`, { error: String(error) });'
      },
      {
        old: /logger\.warn\(`Error removing localStorage key "\$\{key\}":`, error\);/g,
        new: 'logger.warn(`Error removing localStorage key "${key}":`, { error: String(error) });'
      },
      {
        old: /logger\.warn\(`Error parsing localStorage value for key "\$\{key\}":`, error\);/g,
        new: 'logger.warn(`Error parsing localStorage value for key "${key}":`, { error: String(error) });'
      },
      {
        old: /logger\.warn\(`Error reading sessionStorage key "\$\{key\}":`, error\);/g,
        new: 'logger.warn(`Error reading sessionStorage key "${key}":`, { error: String(error) });'
      },
      {
        old: /logger\.warn\(`Error setting sessionStorage key "\$\{key\}":`, error\);/g,
        new: 'logger.warn(`Error setting sessionStorage key "${key}":`, { error: String(error) });'
      },
      {
        old: /logger\.warn\(`Error removing sessionStorage key "\$\{key\}":`, error\);/g,
        new: 'logger.warn(`Error removing sessionStorage key "${key}":`, { error: String(error) });'
      },
    ]
  },
  {
    file: 'src/shared/performance/optimizationUtils.tsx',
    replacements: [
      {
        old: /logger\.error\(`Failed to load module \(attempt \$\{attempts \+ 1\}\):`, error\);/g,
        new: 'logger.error(`Failed to load module (attempt ${attempts + 1}):`, error instanceof Error ? error : new Error(String(error)));'
      },
      {
        old: /logger\.debug\(`Executing callback: \$\{debugName\}`, args\);/g,
        new: 'logger.debug(`Executing callback: ${debugName}`, { args: args.map(String).join(", ") });'
      },
    ]
  },
  {
    file: 'src/shared/security/securityManager.ts',
    replacements: [
      {
        old: /logger\.warn\(`🚨 Security violation: \$\{type\}`, violation\);/g,
        new: 'logger.warn(`🚨 Security violation: ${type}`, { violation: JSON.stringify(violation) });'
      },
    ]
  },
  {
    file: 'src/shared/utils/cache.ts',
    replacements: [
      {
        old: /logger\.warn\(`Prefetch failed for key \$\{key\}:`, error\);/g,
        new: 'logger.warn(`Prefetch failed for key ${key}:`, { error: String(error) });'
      },
    ]
  },
  {
    file: 'src/shared/utils/performance.ts',
    replacements: [
      {
        old: /logger\.warn\(`Failed to create \$\{type\} observer:`, error\);/g,
        new: 'logger.warn(`Failed to create ${type} observer:`, { error: String(error) });'
      },
      {
        old: /logger\.warn\(`Failed to measure \$\{name\}:`, error\);/g,
        new: 'logger.warn(`Failed to measure ${name}:`, { error: String(error) });'
      },
    ]
  },
];

function applyFixes() {
  console.log('🔧 Applying logger error fixes...\n');
  let totalChanges = 0;

  fixes.forEach(({ file, replacements }) => {
    const fullPath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${file}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let fileChanges = 0;

    replacements.forEach(({ old, new: newStr }) => {
      const matches = content.match(old);
      if (matches) {
        content = content.replace(old, newStr);
        fileChanges += matches.length;
      }
    });

    if (fileChanges > 0) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed ${fileChanges} issues in ${file}`);
      totalChanges += fileChanges;
    } else {
      console.log(`ℹ️  No changes needed in ${file}`);
    }
  });

  console.log(`\n✨ Total fixes applied: ${totalChanges}`);
}

applyFixes();
