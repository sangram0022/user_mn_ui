const fs = require('fs');
const path = require('path');

const globalErrorHandlerPath = path.join(
  process.cwd(),
  'src/infrastructure/monitoring/GlobalErrorHandler.ts'
);

let content = fs.readFileSync(globalErrorHandlerPath, 'utf8');

// Fix the catch block that references 'error' but should be empty
content = content.replace(
  /}\s*catch\s*\{\s*console\.warn\('Failed to store debug error:', error\);/g,
  `} catch {\n      console.warn('Failed to store debug error');`
);

// Fix notifyExternalService parameter type
content = content.replace(
  /private notifyExternalService\(report: unknown\): void/g,
  'private notifyExternalService(report: ErrorReport): void'
);

// Fix React component error handler signature
content = content.replace(
  /handleReactError = \(error: Error, errorInfo: unknown\): void =>/g,
  'handleReactError = (error: Error, errorInfo: { componentStack?: string; errorBoundary?: string }): void =>'
);

// Fix getErrorStats return type
content = content.replace(
  /getErrorStats\(\): any \{/g,
  'getErrorStats(): Record<string, unknown> {'
);

fs.writeFileSync(globalErrorHandlerPath, content, 'utf8');
console.log('Fixed GlobalErrorHandler.ts');
