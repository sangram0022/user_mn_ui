# Codebase Cleanup Plan

## Executive Summary

Comprehensive cleanup to remove redundant code, extract common utilities, consolidate CSS, and create production-ready code.

## Issues Identified

### 1. Duplicate Constant Files (CRITICAL)

- ❌ `src/shared/constants/app.ts` - 220 lines
- ❌ `src/shared/constants/appConstants.ts` - duplicate
- ✅ `src/shared/config/constants.ts` - 507 lines (KEEP - most comprehensive)
- ❌ `src/lib/api/constants.ts` - duplicate API config
- ❌ `src/config/api.config.ts` - duplicate API config

**Action**: Consolidate all into `src/shared/config/constants.ts` and delete others

### 2. CSS Files (56+ files)

- Multiple token files with similar content
- Duplicate utility classes
- Scattered design system tokens

**Action**: Audit and consolidate into organized structure

### 3. Dead Code

- Console.log statements: 20+ occurrences
- TODO/FIXME comments: 20+ occurrences
- Unused imports and functions

**Action**: Remove all debug code, implement TODOs or remove them

### 4. Lint Errors

- 5 errors in `src/config/monitoring.ts`
  - Unused 'hint' parameters
  - `any` types

**Action**: Fix all lint errors

## Implementation Steps

### Phase 1: Fix Lint Errors ✅

1. Fix monitoring.ts lint errors

### Phase 2: Consolidate Constants ✅

1. Keep `src/shared/config/constants.ts` as single source of truth
2. Update all imports to use consolidated file
3. Delete duplicate files

### Phase 3: Clean Dead Code ✅

1. Remove console.log statements
2. Remove or implement TODOs
3. Remove commented code

### Phase 4: Consolidate CSS ✅

1. Audit all CSS files
2. Extract common patterns
3. Remove duplicates

### Phase 5: Extract Common Utilities ✅

1. Identify duplicate utility functions
2. Consolidate into shared utils
3. Update all references

### Phase 6: Final Validation ✅

1. Run lint
2. Run type-check
3. Run tests
4. Run build

## Expected Outcomes

- ✅ Zero lint errors
- ✅ Zero console.log in production code
- ✅ Single source of truth for constants
- ✅ Consolidated CSS architecture
- ✅ Clean, maintainable, production-ready code
- ✅ Reduced bundle size
- ✅ Improved performance
