/**
 * Find and fix ALL absolute imports starting with "src/"
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function findFilesWithAbsoluteImports() {
  try {
    // Use PowerShell to search for files
    const cmd = `Get-ChildItem -Path src -Include *.ts,*.tsx -Recurse -File | Select-String -Pattern "from ['\\\"]src/" | Select-Object -ExpandProperty Path | Get-Unique`;
    const output = execSync(`powershell -Command "${cmd}"`, { encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean).map(f => f.trim());
  } catch (e) {
    console.log('Fallback: searching manually...');
    return [];
  }
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  // Pattern 1: import('src/...')
  const dynamicImportBefore = (content.match(/import\(['"]src\//g) || []).length;
  content = content.replace(/import\(['"]src\/domains\//g, "import('../domains/");
  content = content.replace(/import\(['"]src\/contexts\//g, "import('../contexts/");
  content = content.replace(/import\(['"]src\/shared\//g, "import('../shared/");
  content = content.replace(/import\(['"]src\/routing\//g, "import('../routing/");
  content = content.replace(/import\(['"]src\/lib\//g, "import('../lib/");
  content = content.replace(/import\(['"]src\/app\//g, "import('../app/");
  const dynamicImportAfter = (content.match(/import\(['"]src\//g) || []).length;
  changes += (dynamicImportBefore - dynamicImportAfter);

  // Pattern 2: from 'src/...'  
  const staticImportBefore = (content.match(/from ['"]src\//g) || []).length;
  content = content.replace(/from ['"]src\/domains\//g, "from '../domains/");
  content = content.replace(/from ['"]src\/contexts\//g, "from '../contexts/");
  content = content.replace(/from ['"]src\/shared\//g, "from '../shared/");
  content = content.replace(/from ['"]src\/routing\//g, "from '../routing/");
  content = content.replace(/from ['"]src\/lib\//g, "from '../lib/");
  content = content.replace(/from ['"]src\/app\//g, "from '../app/");
  const staticImportAfter = (content.match(/from ['"]src\//g) || []).length;
  changes += (staticImportBefore - staticImportAfter);

  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${changes} imports in ${path.relative(process.cwd(), filePath)}`);
  }

  return changes;
}

// Method 1: Use found files
console.log('🔍 Searching for files with absolute imports...\n');
const files = findFilesWithAbsoluteImports();

if (files.length > 0) {
  console.log(`Found ${files.length} files to fix:\n`);
  let totalChanges = 0;
  files.forEach(file => {
    const changes = fixFile(file);
    totalChanges += changes;
  });
  console.log(`\n✨ Total: ${totalChanges} imports fixed`);
} else {
  // Method 2: Manual scan of key directories
  console.log('Scanning key directories manually...\n');
  const dirsToScan = [
    'src/domains',
    'src/routing',
    'src/app',
    'src/shared',
    'src/contexts'
  ];

  let totalChanges = 0;
  dirsToScan.forEach(dir => {
    const fullDir = path.join(process.cwd(), dir);
    if (fs.existsSync(fullDir)) {
      scanDirectory(fullDir);
    }
  });

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.match(/\.(ts|tsx)$/)) {
        const changes = fixFile(fullPath);
        totalChanges += changes;
      }
    });
  }

  console.log(`\n✨ Total: ${totalChanges} imports fixed`);
}
