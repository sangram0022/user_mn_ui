/**
 * Fix all src/domains imports in routing/config.ts
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/routing/config.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all src/domains/... imports with relative paths ../domains/...
content = content.replace(/import\(['"]src\/domains\//g, "import('../domains/");

// Count changes
const matches = content.match(/import\(['"]\.\.\/domains\//g);
const count = matches ? matches.length : 0;

fs.writeFileSync(filePath, content, 'utf8');
console.log(`✅ Fixed ${count} absolute imports in routing/config.ts`);
