const fs = require('fs');
const path = require('path');

// Fix unused eslint-disable directives in apiClient.ts
function fixApiClient() {
  const filePath = path.join(process.cwd(), 'src/infrastructure/api/apiClient.ts');

  if (!fs.existsSync(filePath)) {
    console.log('apiClient.ts not found');
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Remove unused eslint-disable comments
  content = content.replace(
    /^\/\/ eslint-disable-next-line @typescript-eslint\/no-unused-vars\s*\n/gm,
    ''
  );
  content = content.replace(
    /^\s*\/\/ eslint-disable @typescript-eslint\/no-unused-vars\s*\n/gm,
    ''
  );

  // Remove the top-level eslint-disable if present
  if (content.startsWith('/* eslint-disable @typescript-eslint/no-unused-vars */')) {
    content = content.replace('/* eslint-disable @typescript-eslint/no-unused-vars */', '').trim();
    content = content + '\n';
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed: src/infrastructure/api/apiClient.ts');
}

// Fix sessionEntries variable to use const instead of let
function fixWebVitalsTracker() {
  const filePath = path.join(process.cwd(), 'src/infrastructure/monitoring/WebVitalsTracker.ts');

  if (!fs.existsSync(filePath)) {
    console.log('WebVitalsTracker.ts not found');
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Find the sessionEntries declaration and change let to const
  content = content.replace(/let sessionEntries\s*=/g, 'const sessionEntries =');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed: src/infrastructure/monitoring/WebVitalsTracker.ts');
}

console.log('Fixing additional lint errors...\n');

fixApiClient();
fixWebVitalsTracker();

console.log('\nDone!');
