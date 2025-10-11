# Test File Organization Guide

## Current Test Structure

### ✅ Test Files ARE Co-located with Source Files

Your project follows the **co-located test pattern**, which is a best practice for React/TypeScript projects.

```
src/
├── shared/
│   └── utils/
│       ├── logger.ts                    ← Source file
│       ├── error.ts                     ← Source file
│       ├── validation.ts                ← Source file
│       └── __tests__/                   ← Tests folder (co-located)
│           ├── logger.test.ts           ← Test for logger.ts
│           ├── error.test.ts            ← Test for error.ts
│           └── validation.test.ts       ← Test for validation.ts
├── hooks/
│   ├── useAuth.ts                       ← Source file
│   └── __tests__/                       ← Tests folder (co-located)
│       └── hooks.test.ts                ← Test for hooks
```

## Why Co-location?

### ✅ Advantages:

1. **Easy to find tests** - Test is always in `__tests__` folder next to source
2. **Clear relationship** - One-to-one mapping between source and test
3. **Better imports** - Shorter relative import paths
4. **Modular structure** - Tests move with their modules
5. **IDE support** - Better autocomplete and navigation

### Pattern Used:

```
source-folder/
├── file1.ts
├── file2.ts
└── __tests__/
    ├── file1.test.ts
    └── file2.test.ts
```

## Alternative Patterns (NOT Used in Your Project)

### ❌ Separate Test Directory (Not Used)

```
src/
├── components/
│   └── Button.tsx
tests/                          ← Separate folder
└── components/
    └── Button.test.tsx
```

### ❌ Side-by-Side (Not Used)

```
src/
├── Button.tsx
└── Button.test.tsx            ← Test next to source
```

## Your Project's Test Locations

Current test files found:

- `src/hooks/__tests__/hooks.test.ts`
- `src/hooks/__tests__/useErrorHandler.test.ts`
- `src/shared/utils/__tests__/error.test.ts`
- `src/shared/utils/__tests__/logger.test.ts` ✅ **71 tests, comprehensive coverage**
- `src/shared/utils/__tests__/performance-optimizations.test.ts`
- `src/shared/utils/__tests__/utilities.test.ts`
- `src/shared/utils/__tests__/validation.test.ts`

## Test Naming Convention

```typescript
// Source file: logger.ts
// Test file:    logger.test.ts

// Pattern: {filename}.test.ts
// Or:      {filename}.spec.ts (alternative, not used in your project)
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run specific test file

```bash
npm test -- logger.test.ts
```

### Run tests with coverage

```bash
npm test -- --coverage
```

### Run specific test with coverage

```bash
npm test -- logger.test.ts --coverage
```

## Coverage Report Location

After running tests with `--coverage`:

```
coverage/
├── index.html           ← Main coverage report (open in browser)
├── test-report.html     ← Vitest UI report
└── lcov-report/         ← Detailed line-by-line coverage
    └── index.html
```

## Viewing Coverage

### Option 1: Direct File Open

```bash
# Windows
start coverage/index.html

# Or open in browser manually
# File: d:\code\reactjs\user_mn_ui\coverage\index.html
```

### Option 2: Preview Server (Your Current Issue)

```bash
npx vite preview --outDir coverage --port 9999
```

**Note**: If `http://localhost:9999` shows empty, try:

- Open `file:///D:/code/reactjs/user_mn_ui/coverage/index.html` directly in browser
- Or navigate to `http://localhost:9999/test-report.html`
- Or run: `npm test -- --coverage --coverage.reporter=html` then check coverage/index.html

## Coverage Configuration

From `vitest.config.ts`:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'html', 'lcov', 'json', 'json-summary'],

  // Thresholds
  statements: 80,
  branches: 75,
  functions: 80,
  lines: 80,

  // Exclusions
  exclude: [
    'src/**/*.test.{ts,tsx}',    // Don't measure test files
    'src/**/*.spec.{ts,tsx}',    // Don't measure spec files
    'src/**/*.stories.tsx',       // Don't measure Storybook stories
    'src/test/**',                // Don't measure test utilities
    '**/*.config.{ts,js}',        // Don't measure config files
  ]
}
```

## Best Practices for Your Project

### ✅ DO:

1. Keep tests in `__tests__` folder next to source
2. Name tests: `{sourceFile}.test.ts`
3. One test file per source file
4. Use descriptive test names
5. Group related tests with `describe()`
6. Test all code paths and edge cases

### ❌ DON'T:

1. Mix test files with source files (without `__tests__` folder)
2. Use inconsistent naming conventions
3. Put all tests in a separate `/tests` folder far from source
4. Skip testing edge cases
5. Write tests that depend on each other

## Example Test File Structure

```typescript
// src/shared/utils/__tests__/logger.test.ts

import { logger } from '../logger'; // Short relative import ✅

describe('Logger Utility', () => {
  describe('debug()', () => {
    it('should log debug messages', () => {
      // Test implementation
    });
  });

  describe('info()', () => {
    it('should log info messages', () => {
      // Test implementation
    });
  });
});
```

## Summary

✅ **Your project uses co-located tests with `__tests__` folders**

This is the **recommended pattern** and you should continue using it for all new test files.

---

**Last Updated**: October 11, 2025
