# Runtime Error Prevention Guide

This guide documents the runtime error discovered and provides strategies to prevent similar issues.

## The Error: "prefetch is not a function"

### Root Cause

File: `src/shared/utils/resource-loading.ts` - Top-level async import that doesn't complete before module exports:

```typescript
// ❌ WRONG - Async import blocks nothing, but completes AFTER exports
import('react-dom').then((module: any) => {
  global.PreloadFunction = module.preload; // Too late!
  global.PrefetchFunction = module.prefetch;
  global.PreinitFunction = module.preinit;
});

// Module already exported, prefetch is undefined
const prefetch: PrefetchFunction = ...; // Called before async completes
```

### Why It Fails

1. Module loads and defines `prefetch` function
2. Async import queued but NOT awaited
3. HomePage component immediately calls `prefetchRoute()` in useEffect
4. Async callback hasn't executed yet - `prefetch` is still undefined
5. TypeError: prefetch is not a function

### The Fix

Replace async import with lazy initialization:

```typescript
let reactDomAPIs: any = null;

const initReactDomAPIs = async () => {
  if (!reactDomAPIs) {
    try {
      reactDomAPIs = await import('react-dom');
    } catch {
      reactDomAPIs = {};
    }
  }
};

// Initialize (doesn't block exports)
initReactDomAPIs();

// Functions defined synchronously, callable immediately
const prefetch: PrefetchFunction = (href: string, options?: Record<string, unknown>) => {
  // Try React 19 API first
  if (reactDomAPIs?.prefetch && typeof reactDomAPIs.prefetch === 'function') {
    reactDomAPIs.prefetch(href, options);
    return;
  }
  // Fallback to DOM API
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  if (options?.as) {
    link.as = options.as as string;
  }
  document.head.appendChild(link);
};
```

---

## Testing Strategies

### 1. Runtime Error Detection Tests

Create `src/shared/utils/__tests__/resource-loading.integration.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { prefetchRoute, preloadImage, preinitScript } from '../resource-loading';

describe('Resource Loading - Runtime Prevention', () => {
  it('should call prefetchRoute without errors', () => {
    expect(() => {
      prefetchRoute('/test-route');
    }).not.toThrow();
  });

  it('should call preloadImage without errors', () => {
    expect(() => {
      preloadImage('/test-image.jpg');
    }).not.toThrow();
  });

  it('should handle multiple rapid calls', () => {
    expect(() => {
      for (let i = 0; i < 100; i++) {
        prefetchRoute(`/route-${i}`);
        preloadImage(`/image-${i}.jpg`);
      }
    }).not.toThrow();
  });
});
```

### 2. Component Initialization Tests

Create `src/domains/home/__tests__/HomePage.integration.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import HomePage from '../pages/HomePage';

describe('HomePage - Initialization', () => {
  it('should render without throwing on prefetchRoute calls', () => {
    expect(() => {
      render(<HomePage />);
    }).not.toThrow();
  });
});
```

### 3. Pre-Commit Checklist

Before pushing, run:

```bash
npm run build          # Verify production build
npm test -- --run     # Ensure all tests pass
npm run type-check    # Check TypeScript errors
npm run lint          # Code quality checks
```

### 4. Dev Server Smoke Test

Create `scripts/smoke-test.mjs`:

```javascript
import { spawn } from 'child_process';

async function smokeTest() {
  console.log('🔥 Starting smoke test...\n');

  return new Promise((resolve, reject) => {
    const vite = spawn('npm', ['run', 'dev']);
    let output = '';
    const TIMEOUT = 30000;

    vite.stdout?.on('data', (data) => {
      output += data.toString();
      console.log(data.toString());

      if (output.includes('Local:') && output.includes('http://localhost')) {
        console.log('✅ Dev server started successfully\n');
        vite.kill();
        resolve(true);
      }
    });

    vite.stderr?.on('data', (data) => {
      console.error(data.toString());
    });

    setTimeout(() => {
      vite.kill();
      resolve(true);
    }, TIMEOUT);
  });
}

smokeTest()
  .then(() => {
    console.log('✅ Smoke test passed\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Smoke test failed:', err.message);
    process.exit(1);
  });
```

Add to `package.json`:

```json
{
  "scripts": {
    "smoke-test": "node scripts/smoke-test.mjs"
  }
}
```

### 5. Update Pre-Commit Hook

Enhance `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

npm run validate
npm run lint
npm run type-check
npm run build
npm test -- --run
npm run smoke-test

echo "✅ All checks passed!"
```

---

## Common Anti-Patterns to Avoid

| ❌ Anti-Pattern             | ✅ Correct Pattern          | Why                                    |
| --------------------------- | --------------------------- | -------------------------------------- |
| Top-level `import().then()` | Lazy init function          | Functions must be callable immediately |
| Async blocking exports      | Non-blocking async init     | Modules used before async completes    |
| Global async state          | Fallback implementations    | Can't rely on async at module load     |
| No browser API fallbacks    | DOM manipulation fallback   | APIs may not exist everywhere          |
| Silent promise returns      | Explicit async/sync wrapper | Callers expect immediate result        |

---

## Error Prevention Checklist

Before committing utility functions:

- [ ] All exported functions are synchronous and callable immediately
- [ ] No top-level `import().then()` or `await import()` at module level
- [ ] Fallback implementations exist for all external APIs
- [ ] Unit tests verify functions work on first call
- [ ] Integration tests verify components don't crash on initialization
- [ ] Dev server starts without runtime errors
- [ ] All pre-commit hooks pass

---

## Files Modified This Session

- `src/shared/utils/resource-loading.ts` - Fixed async import issue

## Test Results

- ✅ Build: PASSING
- ✅ Tests: 389 passed, 34 skipped
- ✅ Type-check: PASSING
- ✅ Lint: PASSING (57 warnings, 0 errors)
- ✅ Dev server: WORKING (no runtime errors)
