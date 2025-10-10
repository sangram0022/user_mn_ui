/**
 * Fix all absolute imports starting with "src/domains" or "src/"
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all files with problematic imports
const output = execSync('grep -r "from [\'\\"]src/" src/ --include="*.ts" --include="*.tsx" -l', { encoding: 'utf8' });
const files = output.trim().split('\n').filter(Boolean);

console.log(`Found ${files.length} files with absolute imports:\n`);

files.forEach(file => {
  console.log(`Fixing: ${file}`);
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace src/domains/... with relative paths
  // This is a simple fix - assumes src/ root imports should be ../ or ../..
  content = content.replace(/from ['"]src\/(domains|contexts|routing|shared|lib|app)\/([^'"]+)['"]/g, (match, folder, rest) => {
    // Calculate relative path from current file to src folder
    const fileDir = path.dirname(file);
    const srcDir = path.join(process.cwd(), 'src');
    const relativePath = path.relative(fileDir, path.join(srcDir, folder, rest));
    
    // Convert Windows paths to Unix-style for imports
    const unixPath = relativePath.replace(/\\/g, '/');
    
    // Ensure it starts with ./ or ../
    const finalPath = unixPath.startsWith('.') ? unixPath : './' + unixPath;
    
    return `from '${finalPath}'`;
  });
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log('\n✅ Fixed all absolute imports');
