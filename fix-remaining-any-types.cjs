const fs = require('fs');
const path = require('path');

// Fix PerformanceMonitor.ts
const perfMonitorPath = path.join(
  process.cwd(),
  'src/infrastructure/monitoring/PerformanceMonitor.ts'
);
let content = fs.readFileSync(perfMonitorPath, 'utf8');

// Replace (window as any) patterns
content = content.replace(
  /const\s+perf\s*=\s*window\.performance\s+as\s+any;/g,
  'const perf = window.performance as Performance & { memory?: { usedJSHeapSize?: number; jsHeapSizeLimit?: number } };'
);

// Fix navigation timing types
content = content.replace(
  /const\s+timing\s*=\s*performance\.timing\s+as\s+any;/g,
  'const timing = performance.timing as PerformanceTiming;'
);

fs.writeFileSync(perfMonitorPath, content, 'utf8');
console.log('Fixed: PerformanceMonitor.ts');

// Fix WebVitalsTracker.ts
const webVitalsPath = path.join(process.cwd(), 'src/infrastructure/monitoring/WebVitalsTracker.ts');
content = fs.readFileSync(webVitalsPath, 'utf8');

// Replace observer patterns
content = content.replace(
  /const\s+observer\s*=\s*new\s+PerformanceObserver\(\(\s*list\s*:\s*any\s*\)\s*=>/g,
  'const observer = new PerformanceObserver((list: PerformanceObserverEntryList) =>'
);

// Replace entry types
content = content.replace(
  /entries\.forEach\(\(\s*entry\s*:\s*any\s*\)\s*=>/g,
  'entries.forEach((entry: PerformanceEntry) =>'
);

fs.writeFileSync(webVitalsPath, content, 'utf8');
console.log('Fixed: WebVitalsTracker.ts');

// Fix types/api.types.ts
const apiTypesPath = path.join(process.cwd(), 'src/types/api.types.ts');
content = fs.readFileSync(apiTypesPath, 'utf8');

// Replace FormData: any with proper type
content = content.replace(/data:\s*any;/g, 'data: FormData | Record<string, unknown>;');

fs.writeFileSync(apiTypesPath, content, 'utf8');
console.log('Fixed: types/api.types.ts');

// Fix types/index.ts
const indexTypesPath = path.join(process.cwd(), 'src/types/index.ts');
content = fs.readFileSync(indexTypesPath, 'utf8');

// Replace metadata: any patterns
content = content.replace(/metadata\?:\s*any;/g, 'metadata?: Record<string, unknown>;');

// Replace data: any patterns
content = content.replace(/data\?:\s*any;/g, 'data?: Record<string, unknown>;');

fs.writeFileSync(indexTypesPath, content, 'utf8');
console.log('Fixed: types/index.ts');

console.log('\nAll files fixed!');
