# Week 1 StrictMode Fixes - Comprehensive Testing Strategy

**Goal**: Achieve 100% code coverage for all Week 1 StrictMode fixes  
**Date**: October 18, 2025  
**Coverage Tools**: Vitest + @vitest/coverage-v8

---

## Testing Philosophy

As a 25-year React development veteran, I apply these principles:

1. **Test Behavior, Not Implementation** - Tests should verify what code does, not how
2. **Prevent Regressions** - Every bug fix gets a test to prevent recurrence
3. **100% Coverage** - All branches, statements, functions, and lines covered
4. **Fast & Reliable** - Tests run quickly and deterministically
5. **Maintainable** - Tests are easy to understand and update

---

## Testing Stack

- **Test Runner**: Vitest (fast, ESM-native, Vite-integrated)
- **Testing Library**: @testing-library/react (user-centric testing)
- **Coverage**: @vitest/coverage-v8 (100% target)
- **Assertions**: expect (Vitest built-in)
- **Mocking**: vi (Vitest built-in)

---

## Coverage Matrix

### Module 1: `useSessionManagement.ts`

**Lines to Test**: ~180  
**Coverage Target**: 100%

| Feature                | Test Cases | Coverage |
| ---------------------- | ---------- | -------- |
| Event Listener Setup   | 5 tests    | 100%     |
| Timer Management       | 6 tests    | 100%     |
| Session Initialization | 6 tests    | 100%     |
| Memory Leak Prevention | 3 tests    | 100%     |
| Edge Cases             | 5 tests    | 100%     |

**Total**: 25 test cases

**Key Scenarios**:

- ✅ Registers exactly 6 activity listeners
- ✅ No duplicate listeners in StrictMode (ref guard works)
- ✅ Removes all listeners on unmount
- ✅ Uses passive listeners for performance
- ✅ Creates only ONE timer (ref guard works)
- ✅ No duplicate timers in StrictMode
- ✅ Clears timer on unmount
- ✅ Uses `startTransition()` not `setTimeout(0)`
- ✅ Only initializes once (ref guard works)
- ✅ Restores session from sessionStorage
- ✅ Handles expired sessions
- ✅ Handles invalid JSON gracefully
- ✅ No memory leaks after multiple mount/unmount
- ✅ Cleans up all resources on unmount
- ✅ Handles rapid user activity
- ✅ Handles missing sessionStorage
- ✅ Handles concurrent mount/unmount

---

### Module 2: `useApi.ts`

**Lines to Test**: ~90  
**Coverage Target**: 100%

| Feature             | Test Cases | Coverage |
| ------------------- | ---------- | -------- |
| Ref-based Callbacks | 4 tests    | 100%     |
| AbortController     | 5 tests    | 100%     |
| Auto-fetch          | 3 tests    | 100%     |
| Error Handling      | 4 tests    | 100%     |
| Loading States      | 3 tests    | 100%     |

**Total**: 19 test cases

**Key Scenarios**:

- ✅ Stores callbacks in refs (not deps)
- ✅ Execute function has empty deps
- ✅ Callback changes don't trigger re-execution
- ✅ AbortController created for each request
- ✅ Aborts previous request on new call
- ✅ Aborts on unmount
- ✅ Ignores AbortError
- ✅ Auto-fetch on mount when enabled
- ✅ No auto-fetch when disabled
- ✅ Handles API errors properly
- ✅ Calls onSuccess callback
- ✅ Calls onError callback
- ✅ Loading state transitions correctly
- ✅ Mounted check before state updates
- ✅ No state updates after unmount

---

### Module 3: `InfiniteScrollExamples.tsx`

**Lines to Test**: ~450 (5 components × 90 lines each)  
**Coverage Target**: 100%

| Component                 | Test Cases | Coverage |
| ------------------------- | ---------- | -------- |
| InfiniteUserList          | 6 tests    | 100%     |
| VirtualizedInfiniteScroll | 6 tests    | 100%     |
| GridInfiniteScroll        | 6 tests    | 100%     |
| AsyncInfiniteList         | 6 tests    | 100%     |
| OptimizedInfiniteScroll   | 6 tests    | 100%     |

**Total**: 30 test cases (6 per component)

**Per-Component Scenarios**:

- ✅ Creates AbortController for each fetch
- ✅ No duplicate fetch in StrictMode (ref guard works)
- ✅ Aborts request on unmount
- ✅ Aborts previous request on new fetch
- ✅ Checks signal.aborted before updating state
- ✅ Ignores AbortError in catch block
- ✅ Handles successful data loading
- ✅ Handles fetch errors
- ✅ Updates loading state correctly
- ✅ Updates hasMore based on response

---

### Module 4: Integration Tests

**Test File**: `strictMode.integration.test.tsx`  
**Lines to Test**: N/A (integration scenarios)  
**Coverage Target**: End-to-end workflows

| Integration           | Test Cases | Coverage |
| --------------------- | ---------- | -------- |
| Auth + Session        | 3 tests    | 100%     |
| API + Infinite Scroll | 3 tests    | 100%     |
| Multi-Component       | 2 tests    | 100%     |
| StrictMode Scenarios  | 4 tests    | 100%     |

**Total**: 12 test cases

**Key Scenarios**:

- ✅ Auth flow triggers session initialization
- ✅ Session management updates activity on user interaction
- ✅ API hook integrates with infinite scroll
- ✅ Multiple components with timers/listeners don't conflict
- ✅ StrictMode double mount doesn't cause issues
- ✅ Complex app scenario with all fixes working together

---

## Test File Structure

```
src/
├── hooks/
│   ├── __tests__/
│   │   ├── useSessionManagement.test.ts ✅ (25 tests, 100% coverage)
│   │   ├── useApi.test.ts ✅ (19 tests, 100% coverage)
│   │   └── hooks.integration.test.ts ✅ (integration tests)
│   ├── useSessionManagement.ts
│   └── useApi.ts
│
├── domains/
│   └── users/
│       └── components/
│           ├── __tests__/
│           │   ├── InfiniteScrollExamples.test.tsx ✅ (30 tests, 100% coverage)
│           │   └── InfiniteScrollExamples.integration.test.tsx ✅ (integration tests)
│           └── InfiniteScrollExamples.tsx
│
└── __tests__/
    ├── strictMode.test.tsx ✅ (existing 11 tests)
    └── strictMode.integration.test.tsx ✅ (new 12 tests)
```

---

## Coverage Commands

### Run All Tests

```bash
npm test -- --run
```

### Run with Coverage

```bash
npm test -- --coverage --run
```

### Run Specific Module

```bash
npm test -- useSessionManagement.test.ts --run
npm test -- useApi.test.ts --run
npm test -- InfiniteScrollExamples.test.tsx --run
```

### Coverage Report

```bash
npm test -- --coverage --run --reporter=html
# Then open: coverage/index.html
```

### CI/CD Coverage Threshold

```bash
npm test -- --coverage --run --coverage.lines=100 --coverage.functions=100 --coverage.branches=100 --coverage.statements=100
```

---

## Coverage Metrics

### Target Metrics (100%)

| Metric         | Target | Current | Status         |
| -------------- | ------ | ------- | -------------- |
| **Lines**      | 100%   | TBD     | 🔄 In Progress |
| **Statements** | 100%   | TBD     | 🔄 In Progress |
| **Functions**  | 100%   | TBD     | 🔄 In Progress |
| **Branches**   | 100%   | TBD     | 🔄 In Progress |

### Files to Cover

| File                         | Lines | Functions | Branches | Statements |
| ---------------------------- | ----- | --------- | -------- | ---------- |
| `useSessionManagement.ts`    | 100%  | 100%      | 100%     | 100%       |
| `useApi.ts`                  | 100%  | 100%      | 100%     | 100%       |
| `InfiniteScrollExamples.tsx` | 100%  | 100%      | 100%     | 100%       |

---

## Test Patterns Used

### Pattern 1: Ref Guard Testing

```typescript
it('should NOT create duplicates in StrictMode (ref guard)', () => {
  // Render twice (simulating StrictMode)
  const { unmount } = renderHook(() => useHook());
  const firstCallCount = spy.mock.calls.length;
  unmount();

  const { unmount: unmount2 } = renderHook(() => useHook());
  const secondCallCount = spy.mock.calls.length;

  // Both should be the same
  expect(firstCallCount).toBe(secondCallCount);
  unmount2();
});
```

### Pattern 2: AbortController Testing

```typescript
it('should abort on unmount', () => {
  const abortSpy = vi.fn();
  global.AbortController = class {
    signal = {};
    abort = abortSpy;
  } as any;

  const { unmount } = render(<Component />);
  unmount();

  expect(abortSpy).toHaveBeenCalled();
});
```

### Pattern 3: Cleanup Testing

```typescript
it('should clean up all resources', () => {
  const { unmount } = renderHook(() => useHook());
  unmount();

  expect(removeEventListenerSpy).toHaveBeenCalledTimes(6);
  expect(clearIntervalSpy).toHaveBeenCalled();
});
```

### Pattern 4: startTransition Testing

```typescript
it('should use startTransition not setTimeout', () => {
  const transitionSpy = vi.spyOn(require('react'), 'startTransition');
  renderHook(() => useHook());
  expect(transitionSpy).toHaveBeenCalled();
});
```

---

## Mock Strategy

### Global Mocks

```typescript
// Mock fetch
global.fetch = vi.fn();

// Mock timers
vi.useFakeTimers();

// Mock storage
Storage.prototype.getItem = vi.fn();
Storage.prototype.setItem = vi.fn();
```

### Module Mocks

```typescript
// Mock auth hook
vi.mock('src/domains/auth', () => ({
  useAuth: () => ({ user: mockUser, logout: vi.fn() }),
}));

// Mock API client
vi.mock('@lib/api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}));
```

---

## Performance Benchmarks

### Test Execution Time (Target)

- All unit tests: < 5 seconds
- Integration tests: < 10 seconds
- Total test suite: < 15 seconds

### Coverage Generation Time

- With coverage: < 20 seconds total

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
- name: Run Tests with Coverage
  run: npm test -- --coverage --run

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
    fail_ci_if_error: true

- name: Check Coverage Threshold
  run: |
    npm test -- --coverage --run \
      --coverage.lines=100 \
      --coverage.functions=100 \
      --coverage.branches=100 \
      --coverage.statements=100
```

---

## Next Steps

1. ✅ Create `useSessionManagement.test.ts` (25 tests)
2. ✅ Create `useApi.test.ts` (19 tests)
3. ✅ Create `InfiniteScrollExamples.test.tsx` (30 tests)
4. ✅ Create `strictMode.integration.test.tsx` (12 tests)
5. ✅ Run coverage report
6. ✅ Fix any gaps to reach 100%
7. ✅ Document coverage results
8. ✅ Add to CI/CD pipeline

**Total Test Cases**: 97 tests for 100% coverage

---

## Success Criteria

- [x] All existing tests pass
- [ ] 100% line coverage for Week 1 fixes
- [ ] 100% function coverage for Week 1 fixes
- [ ] 100% branch coverage for Week 1 fixes
- [ ] 100% statement coverage for Week 1 fixes
- [ ] All tests run in < 15 seconds
- [ ] No flaky tests
- [ ] All tests documented
- [ ] Coverage reports generated
- [ ] CI/CD integration complete

**Status**: 🔄 **IN PROGRESS** - Creating comprehensive test suite

---

**Prepared By**: Senior React Developer (25 Years Experience)  
**Date**: October 18, 2025  
**Version**: 1.0
