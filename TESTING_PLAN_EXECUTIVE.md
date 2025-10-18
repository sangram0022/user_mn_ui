# COMPREHENSIVE UNIT & INTEGRATION TESTING PLAN

**Goal**: 100% Test Coverage for Week 1 StrictMode Fixes  
**Role**: 25-Year React Development Expert  
**Date**: October 18, 2025

---

## Executive Summary

All Week 1 StrictMode fixes are **implemented in the codebase**. Testing infrastructure needs:

1. ✅ **Fix Test Setup** - Disable MSW temporarily (not installed)
2. ✅ **Existing Tests** - `strictMode.test.tsx` exists (11 tests) but can't run due to setup issues
3. 🔄 **Coverage Gaps** - Need unit tests for individual modules
4. 🔄 **Integration Tests** - Need end-to-end workflow tests

---

## Current State Analysis

### ✅ Code Implementation Status

- useSessionManagement.ts - ✅ All fixes implemented
- useApi.ts - ✅ All fixes implemented
- InfiniteScrollExamples.tsx - ✅ All fixes implemented
- AuthProvider - ✅ Uses updated test utils

### ⚠️ Test Infrastructure Issues

1. **MSW Not Installed** - `setupServer` import fails
2. **Test Setup Breaks** - All tests fail at setup phase
3. **No Coverage Reports** - Can't run due to setup errors

### ✅ Existing Test Files (Can't Run Yet)

- `src/__tests__/strictMode.test.tsx` (467 lines, 11 tests)
- `src/hooks/__tests__/hooks.test.ts`
- `src/hooks/__tests__/useErrorHandler.test.ts`
- `src/domains/auth/__tests__/auth.integration.test.tsx`
- Multiple util tests

---

## 🎯 Action Plan

### Phase 1: Fix Test Infrastructure ✅ DONE

- [x] Remove MSW dependency from setup.ts
- [x] Make tests runnable without MSW
- [x] Verify vitest.config.ts is correct

### Phase 2: Verify Existing Tests (NEXT)

- [ ] Run `strictMode.test.tsx` to see if it passes
- [ ] Identify any failing tests
- [ ] Fix test implementation if needed

### Phase 3: Add Missing Unit Tests

- [ ] Create `useSessionManagement.test.ts` (if coverage gaps)
- [ ] Create `useApi.test.ts` (if coverage gaps)
- [ ] Create `InfiniteScrollExamples.test.tsx` (if coverage gaps)

### Phase 4: Generate Coverage Report

- [ ] Run tests with coverage
- [ ] Identify coverage gaps
- [ ] Add tests for uncovered code

### Phase 5: Integration Tests

- [ ] Create end-to-end workflow tests
- [ ] Test multi-component interactions
- [ ] Verify no regressions

---

## Test Coverage Strategy

### Module 1: useSessionManagement (180 lines)

**What to Test**:

1. Event Listener Setup
   - Registers 6 activity listeners on mount
   - Uses passive listeners
   - Removes all listeners on unmount
   - **StrictMode**: No duplicate listeners (ref guard)

2. Timer Management
   - Creates single interval timer
   - Clears timer on unmount
   - **StrictMode**: No duplicate timers (ref guard)

3. Session Initialization
   - Uses startTransition (not setTimeout)
   - Restores from sessionStorage
   - Handles expired sessions
   - **StrictMode**: Only initializes once (ref guard)

4. Memory Leaks
   - No leaks after multiple mount/unmount
   - All resources cleaned up properly

**Test Count Estimate**: 15-20 tests

### Module 2: useApi (90 lines)

**What to Test**:

1. Ref-based Callbacks
   - Stores callbacks in refs
   - Execute function has stable (empty) deps
   - Callback changes don't trigger re-execution

2. AbortController
   - Creates controller for each request
   - Aborts previous request on new call
   - Aborts on unmount
   - Ignores AbortError

3. Auto-fetch & States
   - Auto-fetches when enabled
   - Manages loading/error/data states
   - No state updates after unmount

**Test Count Estimate**: 12-15 tests

### Module 3: InfiniteScrollExamples (450 lines, 5 components)

**What to Test (Per Component)**:

1. AbortController Usage
   - Creates controller for each fetch
   - Aborts request on unmount
   - **StrictMode**: No duplicate fetch (ref guard)

2. Fetch Handling
   - Handles successful response
   - Handles errors (non-abort)
   - Ignores AbortError
   - Updates state correctly

**Test Count Estimate**: 24-30 tests (6 per component × 5 components)

### Module 4: Integration Tests

**Workflows to Test**:

1. Auth → Session Management
2. API Hook → Infinite Scroll
3. Multiple Components Together
4. Full App StrictMode Scenarios

**Test Count Estimate**: 8-12 tests

---

## Total Test Estimate

| Module                 | Unit Tests                   | Integration Tests | Total     |
| ---------------------- | ---------------------------- | ----------------- | --------- |
| useSessionManagement   | 15-20                        | -                 | 15-20     |
| useApi                 | 12-15                        | -                 | 12-15     |
| InfiniteScrollExamples | 24-30                        | -                 | 24-30     |
| Integration            | -                            | 8-12              | 8-12      |
| **Existing**           | **11** (strictMode.test.tsx) | -                 | **11**    |
| **TOTAL**              | **62-76**                    | **8-12**          | **70-88** |

---

## Quick Win Strategy

Since the existing `strictMode.test.tsx` already has 11 tests, let's:

1. **First**: Try to run existing tests
2. **Then**: Generate coverage report
3. **Finally**: Only write tests for gaps

This prevents duplicate work!

---

## Commands to Execute

### 1. Try Running Existing Tests

```bash
cd d:\code\reactjs\user_mn_ui
npm test -- src/__tests__/strictMode.test.tsx --run --no-coverage
```

### 2. Generate Coverage Report

```bash
npm test -- --coverage --run --reporter=verbose
```

### 3. View HTML Coverage Report

```bash
npx vite preview --outDir coverage
# Open browser to see detailed coverage
```

### 4. Check Specific Files

```bash
npm test -- --coverage --run | Select-String "useSessionManagement|useApi|InfiniteScroll"
```

---

## Coverage Targets

| Metric     | Target | Acceptable | Minimum |
| ---------- | ------ | ---------- | ------- |
| Lines      | 100%   | 95%        | 90%     |
| Statements | 100%   | 95%        | 90%     |
| Functions  | 100%   | 95%        | 90%     |
| Branches   | 100%   | 95%        | 85%     |

**Goal**: 100% for all Week 1 fixes

---

## Test File Naming Convention

```
src/
├── hooks/
│   ├── __tests__/
│   │   ├── useSessionManagement.test.ts ← Unit tests
│   │   └── useApi.test.ts ← Unit tests
│
├── domains/users/components/
│   ├── __tests__/
│   │   └── InfiniteScrollExamples.test.tsx ← Component tests
│
└── __tests__/
    ├── strictMode.test.tsx ← ✅ Exists (11 tests)
    └── strictMode.integration.test.tsx ← Integration tests
```

---

## Next Immediate Steps

1. ✅ Test setup fixed (MSW removed)
2. **NEXT**: Run existing tests to see what passes
3. **THEN**: Generate coverage to find gaps
4. **FINALLY**: Write only the missing tests

**Let's be smart, not wasteful - use what exists first!**

---

## Success Metrics

- [ ] All existing tests pass
- [ ] Coverage report generated successfully
- [ ] Week 1 modules have 100% coverage
- [ ] No StrictMode-related failures
- [ ] Tests run in < 10 seconds
- [ ] CI/CD ready

**Current Status**: Phase 1 Complete (Setup Fixed) ✅  
**Next**: Phase 2 (Run Existing Tests)

---

**Prepared By**: AI Development Assistant  
**Based On**: 25 Years React Development Experience  
**Status**: Ready to Execute Phase 2
