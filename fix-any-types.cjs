const fs = require('fs');
const path = require('path');

// Define type replacements for specific patterns
const typeReplacements = [
  // Catch blocks - err: any -> err: unknown
  {
    pattern: /catch\s*\(\s*(\w+):\s*any\s*\)/g,
    replacement: 'catch ($1: unknown)',
  },
  // Function parameters - (param: any) -> (param: unknown)
  {
    pattern: /\(\s*(\w+):\s*any\s*\)/g,
    replacement: '($1: unknown)',
  },
  // Return types - Promise<any> -> Promise<unknown>
  {
    pattern: /Promise<any>/g,
    replacement: 'Promise<unknown>',
  },
  // Record types - Record<string, any> -> Record<string, unknown>
  {
    pattern: /Record<([^,]+),\s*any>/g,
    replacement: 'Record<$1, unknown>',
  },
  // Array types - any[] -> unknown[]
  {
    pattern: /:\s*any\[\]/g,
    replacement: ': unknown[]',
  },
  // Variable declarations - : any; -> : unknown;
  {
    pattern: /:\s*any;/g,
    replacement: ': unknown;',
  },
  // Variable declarations - : any, -> : unknown,
  {
    pattern: /:\s*any,/g,
    replacement: ': unknown,',
  },
  // Variable declarations - : any\) -> : unknown\)
  {
    pattern: /:\s*any\)/g,
    replacement: ': unknown)',
  },
  // Variable declarations - : any = -> : unknown =
  {
    pattern: /:\s*any\s*=/g,
    replacement: ': unknown =',
  },
];

const filesToFix = [
  'src/contexts/AuthContext.tsx',
  'src/domains/authentication/domain-module.ts',
  'src/domains/authentication/services/TokenService.ts',
  'src/hooks/useAuth.ts',
  'src/hooks/useUsers.ts',
  'src/infrastructure/api/services/analyticsApiService.ts',
  'src/infrastructure/api/services/authApiService.ts',
  'src/infrastructure/api/services/workflowsApiService.ts',
  'src/infrastructure/api/utils/errorHandling.ts',
  'src/infrastructure/api/utils/transformers.ts',
  'src/infrastructure/monitoring/AnalyticsTracker.ts',
  'src/infrastructure/monitoring/ErrorTracker.ts',
  'src/infrastructure/monitoring/GlobalErrorHandler.ts',
  'src/infrastructure/monitoring/PerformanceMonitor.ts',
  'src/infrastructure/monitoring/WebVitalsTracker.ts',
  'src/infrastructure/monitoring/hooks/useMonitoring.ts',
  'src/infrastructure/monitoring/logger.ts',
  'src/infrastructure/security/PermissionManager.ts',
  'src/services/api.service.ts',
  'src/services/auth.service.ts',
  'src/services/bulk.service.ts',
  'src/shared/types/micro-frontend.types.ts',
  'src/types/api.types.ts',
  'src/types/index.ts',
  'src/utils/errorHandler.ts',
  'src/utils/validators.ts',
];

function fixFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} - file not found`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;

  // Apply all replacements
  typeReplacements.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, replacement);
  });

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`No changes needed: ${filePath}`);
  }
}

console.log('Replacing any types with unknown...\n');

filesToFix.forEach(fixFile);

console.log('\nDone!');
