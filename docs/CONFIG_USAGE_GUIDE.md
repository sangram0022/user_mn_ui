# Centralized Config Usage Guide

**Date:** November 11, 2025  
**Status:** ✅ Phase 1 Complete

---

## 📖 Overview

This guide documents the centralized configuration system implemented in Phase 1. All environment variables and application configuration are now managed through a single source of truth: `src/core/config/index.ts`.

### Benefits

- ✅ **Type Safety** - IDE autocomplete for all config values
- ✅ **Single Source of Truth** - No scattered `import.meta.env` calls
- ✅ **Testability** - Easy to mock in tests
- ✅ **Validation** - Config validated on startup
- ✅ **Consistency** - Same patterns everywhere

---

## 🎯 Quick Reference

### Import the Config

```typescript
// Always import from centralized config
import { config, isDevelopment, isProduction, isFeatureEnabled } from '@/core/config';

// ❌ NEVER do this anymore
import.meta.env.VITE_API_BASE_URL
import.meta.env.MODE === 'development'
```

### Helper Functions

```typescript
// Environment checks
isDevelopment()  // Returns true in dev mode
isProduction()   // Returns true in production
isStaging()      // Returns true in staging

// Feature flags
isFeatureEnabled('enableErrorReporting')
isFeatureEnabled('enablePerformanceTracking')
isFeatureEnabled('enableDebugLogs')
```

---

## 📚 Config Structure

### Available Config Sections

```typescript
config.app         // Application metadata
config.api         // API configuration
config.auth        // Authentication settings
config.features    // Feature flags
config.errorReporting  // Error tracking config
config.logging     // Logging configuration
```

### Complete Type Definitions

```typescript
interface Config {
  app: {
    name: string;
    version: string;
    url: string;
    environment: Environment;
    isProduction: boolean;
    isDevelopment: boolean;
    isStaging: boolean;
    isTest: boolean;
  };
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  auth: {
    tokenStorageKey: string;
    refreshTokenStorageKey: string;
    sessionTimeout: number;
  };
  features: {
    enableErrorReporting: boolean;
    enablePerformanceTracking: boolean;
    enableDebugLogs: boolean;
  };
  errorReporting: {
    enabled: boolean;
    service: ErrorReportingService;
    sentryDsn?: string;
    customEndpoint?: string;
    sampleRate: number;
  };
  logging: {
    level: LogLevel;
    console: boolean;
    persistence: boolean;
    maxLogs: number;
    performanceTracking: boolean;
    structured: boolean;
  };
}
```

---

## 🔧 Common Usage Patterns

### 1. Development Mode Checks

**Before (❌):**

```typescript
if (import.meta.env.MODE === 'development') {
  console.log('Debug info');
}

if (import.meta.env.DEV) {
  showDebugPanel();
}
```

**After (✅):**

```typescript
import { isDevelopment } from '@/core/config';

if (isDevelopment()) {
  logger().debug('Debug info');
}

if (isDevelopment()) {
  showDebugPanel();
}
```

---

### 2. Production Mode Checks

**Before (❌):**

```typescript
if (import.meta.env.MODE === 'production') {
  enableAnalytics();
}

if (import.meta.env.PROD) {
  reportToSentry();
}
```

**After (✅):**

```typescript
import { isProduction } from '@/core/config';

if (isProduction()) {
  enableAnalytics();
}

if (isProduction()) {
  reportToSentry();
}
```

---

### 3. API Configuration

**Before (❌):**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10);

axios.create({
  baseURL: API_BASE_URL,
  timeout: timeout,
});
```

**After (✅):**

```typescript
import { config } from '@/core/config';

axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
});
```

---

### 4. App Metadata

**Before (❌):**

```typescript
const appName = import.meta.env.VITE_APP_NAME || 'UserMN';
const version = import.meta.env.VITE_APP_VERSION || '1.0.0';
const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
```

**After (✅):**

```typescript
import { config } from '@/core/config';

const appName = config.app.name;
const version = config.app.version;
const appUrl = config.app.url;
```

---

### 5. Feature Flags

**Before (❌):**

```typescript
const enableReporting = import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true';
const enableTracking = import.meta.env.VITE_ENABLE_PERFORMANCE_TRACKING === 'true';
```

**After (✅):**

```typescript
import { config, isFeatureEnabled } from '@/core/config';

// Option 1: Direct access
if (config.features.enableErrorReporting) {
  // ...
}

// Option 2: Helper function
if (isFeatureEnabled('enableErrorReporting')) {
  // ...
}
```

---

### 6. Conditional Rendering

**Before (❌):**

```typescript
{import.meta.env.DEV && (
  <DevToolsPanel />
)}

{import.meta.env.MODE === 'development' && (
  <DebugInfo />
)}
```

**After (✅):**

```typescript
import { isDevelopment } from '@/core/config';

{isDevelopment() && (
  <DevToolsPanel />
)}

{isDevelopment() && (
  <DebugInfo />
)}
```

---

### 7. Error Reporting Configuration

**Before (❌):**

```typescript
const errorConfig = {
  enabled: import.meta.env.PROD,
  service: import.meta.env.VITE_ERROR_REPORTING_SERVICE,
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
};
```

**After (✅):**

```typescript
import { config } from '@/core/config';

const errorConfig = {
  enabled: config.errorReporting.enabled,
  service: config.errorReporting.service,
  sentryDsn: config.errorReporting.sentryDsn,
  environment: config.app.environment,
};
```

---

### 8. Logging Configuration

**Before (❌):**

```typescript
const logConfig = {
  level: import.meta.env.VITE_LOG_LEVEL || 'info',
  enableConsole: import.meta.env.MODE === 'development',
  enablePersistence: import.meta.env.PROD,
};
```

**After (✅):**

```typescript
import { config } from '@/core/config';

const logConfig = {
  level: config.logging.level,
  enableConsole: config.logging.console,
  enablePersistence: config.logging.persistence,
};
```

---

## 🧪 Testing with Config

### Mocking Config in Tests

```typescript
import { vi } from 'vitest';

// Mock the entire config
vi.mock('@/core/config', () => ({
  config: {
    app: {
      name: 'TestApp',
      version: '1.0.0-test',
      environment: 'test',
    },
    api: {
      baseUrl: 'http://test-api.local',
      timeout: 5000,
    },
    // ... other config sections
  },
  isDevelopment: () => false,
  isProduction: () => false,
  isFeatureEnabled: () => true,
}));

// Or mock specific functions
vi.mock('@/core/config', async () => {
  const actual = await vi.importActual('@/core/config');
  return {
    ...actual,
    isDevelopment: () => true, // Force dev mode for test
  };
});
```

### Testing Environment-Specific Behavior

```typescript
describe('MyComponent', () => {
  it('should show debug panel in development', () => {
    // Mock isDevelopment to return true
    vi.mocked(isDevelopment).mockReturnValue(true);
    
    const { getByText } = render(<MyComponent />);
    expect(getByText('Debug Panel')).toBeInTheDocument();
  });

  it('should hide debug panel in production', () => {
    // Mock isDevelopment to return false
    vi.mocked(isDevelopment).mockReturnValue(false);
    
    const { queryByText } = render(<MyComponent />);
    expect(queryByText('Debug Panel')).not.toBeInTheDocument();
  });
});
```

---

## 📝 Environment Variables

### Required Variables

Create a `.env` file in the project root:

```env
# App Configuration
VITE_APP_NAME=UserMN
VITE_APP_VERSION=1.0.0
VITE_APP_URL=http://localhost:5173

# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3
VITE_API_RETRY_DELAY=1000

# Auth Configuration
VITE_TOKEN_STORAGE_KEY=access_token
VITE_REFRESH_TOKEN_STORAGE_KEY=refresh_token
VITE_SESSION_TIMEOUT=1800000

# Feature Flags
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_PERFORMANCE_TRACKING=true
VITE_ENABLE_DEBUG_LOGS=false

# Error Reporting
VITE_ERROR_REPORTING_SERVICE=sentry
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_ERROR_SAMPLE_RATE=0.1

# Logging
VITE_LOG_LEVEL=info
VITE_LOG_CONSOLE=true
VITE_LOG_PERSISTENCE=false
VITE_LOG_MAX_LOGS=1000
```

### Environment-Specific Files

- `.env.development` - Development overrides
- `.env.production` - Production values
- `.env.staging` - Staging environment
- `.env.test` - Test environment

---

## 🚫 What NOT to Do

### ❌ Don't Access import.meta.env Directly

```typescript
// ❌ WRONG - Bypasses type safety and SSOT
const apiUrl = import.meta.env.VITE_API_BASE_URL;

// ✅ CORRECT
import { config } from '@/core/config';
const apiUrl = config.api.baseUrl;
```

### ❌ Don't Create Local Config Objects

```typescript
// ❌ WRONG - Duplicates config logic
const myConfig = {
  isDev: import.meta.env.MODE === 'development',
  apiUrl: import.meta.env.VITE_API_BASE_URL,
};

// ✅ CORRECT - Use centralized config
import { config, isDevelopment } from '@/core/config';
```

### ❌ Don't Hard-Code Environment Checks

```typescript
// ❌ WRONG - Not maintainable
if (process.env.NODE_ENV === 'development') {
  // ...
}

// ✅ CORRECT
if (isDevelopment()) {
  // ...
}
```

### ❌ Don't Mix Patterns

```typescript
// ❌ WRONG - Inconsistent
if (import.meta.env.DEV) {
  // ...
} else if (isDevelopment()) {
  // ...
}

// ✅ CORRECT - Always use helpers
if (isDevelopment()) {
  // ...
}
```

---

## 🎓 Best Practices

### 1. Always Use Helper Functions

```typescript
// ✅ Preferred
if (isDevelopment()) { }
if (isProduction()) { }
if (isFeatureEnabled('enableDebugLogs')) { }

// ⚠️ Acceptable but verbose
if (config.app.isDevelopment) { }
if (config.app.isProduction) { }
if (config.features.enableDebugLogs) { }
```

### 2. Import Only What You Need

```typescript
// ✅ Good - Specific imports
import { config, isDevelopment } from '@/core/config';

// ⚠️ Less optimal - Importing everything
import * as Config from '@/core/config';
```

### 3. Document Environment Variables

When adding new config, update:

1. `src/core/config/index.ts` - Add to config object
2. `.env.example` - Add with description
3. This guide - Document usage pattern

### 4. Validate Config on Startup

```typescript
// Already implemented in config module
if (config.app.isProduction && !config.errorReporting.sentryDsn) {
  throw new Error('Sentry DSN required in production');
}
```

---

## 📊 Migration Statistics

### Phase 1 Completion (100%)

- **Files Migrated:** 30 of 30
- **Lines Changed:** ~150 import additions + ~150 usage updates
- **Git Commits:** 8 documented commits
- **Type Errors:** 0
- **Lint Errors:** 0

### Files Migrated by Category

**API Layer (6 files):**

- apiClient.ts
- common.ts
- mockApi.ts
- useHealthCheck.ts
- useApiError.ts
- queryKeys.ts

**Core App & SEO (6 files):**

- App.tsx
- config.ts (SEO)
- SEO.tsx
- tokenService.ts
- OAuthButtons.tsx
- config/index.ts

**Core Infrastructure (2 files):**

- logging/config.ts
- error/errorReporting.ts

**Component Dev Panels (5 files):**

- Header.tsx
- ModernErrorBoundary.tsx
- DashboardPage.tsx
- EnhancedContactForm.tsx
- ModernContactForm.tsx

**Admin Pages (4 files):**

- UsersManagementPage.tsx
- SettingsPage.tsx
- RolesManagementPage.tsx
- AdminErrorBoundary.tsx

**Auth Pages & Providers (6 files):**

- authDebugger.ts
- LoginPage.tsx
- RegisterPage.tsx
- ModernLoginPage.tsx
- ModernLoginForm.tsx
- providers.tsx

**Core Utilities (3 files):**

- i18n/config.ts
- error/globalErrorHandlers.ts
- error/errorHandler.ts

---

## 🔍 Code Examples by Domain

### Authentication

```typescript
import { config, isDevelopment } from '@/core/config';

// Token storage
localStorage.setItem(config.auth.tokenStorageKey, token);

// Debug logging
if (isDevelopment()) {
  logger().debug('Auth state', { user, token });
}

// Session timeout
setTimeout(logout, config.auth.sessionTimeout);
```

### API Calls

```typescript
import { config } from '@/core/config';

const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
});

// Retry configuration
const retryConfig = {
  retries: config.api.retryAttempts,
  retryDelay: config.api.retryDelay,
};
```

### Error Reporting

```typescript
import { config, isProduction } from '@/core/config';

if (isProduction() && config.errorReporting.enabled) {
  Sentry.init({
    dsn: config.errorReporting.sentryDsn,
    environment: config.app.environment,
    release: config.app.version,
    sampleRate: config.errorReporting.sampleRate,
  });
}
```

### Logging

```typescript
import { config, isDevelopment } from '@/core/config';

const logger = createLogger({
  level: config.logging.level,
  console: config.logging.console,
  persistence: config.logging.persistence,
  structured: config.logging.structured,
});

// Performance tracking
if (config.logging.performanceTracking && isDevelopment()) {
  performance.mark('operation-start');
  // ... operation
  performance.mark('operation-end');
  performance.measure('operation', 'operation-start', 'operation-end');
}
```

---

## 🚀 Next Steps

### For Developers

1. ✅ **Read this guide** - Understand patterns
2. ✅ **Review existing code** - See implementations
3. ✅ **Follow patterns** - Use in new code
4. ✅ **Test changes** - Mock config in tests

### For Code Reviews

Check for:

- ❌ Direct `import.meta.env` usage
- ❌ Hard-coded environment checks
- ❌ Scattered config objects
- ✅ Centralized config imports
- ✅ Helper function usage
- ✅ Type-safe access

---

## 📚 Related Documentation

- **PHASE_0_AUDIT_REPORT.md** - Initial audit findings
- **PHASE_1_PROGRESS.md** - Detailed migration progress
- **IMPLEMENTATION_ACTION_PLAN.md** - Overall project plan
- **API_PATTERNS.md** - API layer documentation
- **ERROR_HANDLING.md** - Error handling guide

---

## ❓ FAQ

### Q: Can I still use import.meta.env?

**A:** Only in `src/core/config/index.ts` for initialization. Everywhere else, use the centralized config.

### Q: How do I add a new config value?

**A:**

1. Add to `.env` file
2. Update config object in `src/core/config/index.ts`
3. Update TypeScript interface
4. Document in this guide

### Q: What if I need environment-specific behavior?

**A:** Use helper functions:

```typescript
if (isDevelopment()) { /* dev only */ }
if (isProduction()) { /* prod only */ }
if (isStaging()) { /* staging only */ }
```

### Q: How do I test environment-specific code?

**A:** Mock the config module in tests (see Testing section above).

### Q: Is the config validated?

**A:** Yes, validation happens on startup. Missing required values will throw errors.

---

## ✨ Summary

**Phase 1 achieved 100% centralization of configuration:**

- ✅ Single source of truth for all env vars
- ✅ Type-safe config access
- ✅ Consistent patterns everywhere
- ✅ Easy to test and mock
- ✅ Zero import.meta.env in app code

**Use this guide as the authoritative reference for all configuration access in the application.**

---

**Last Updated:** November 11, 2025  
**Phase 1 Status:** ✅ Complete  
**Next Phase:** Phase 2 - Services & Hooks Refactoring
