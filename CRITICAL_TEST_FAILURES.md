# 🚨 CRITICAL FINDING: StrictMode Tests Now Failing

**Date**: October 18, 2025  
**Status**: Test Infrastructure Fixed, But Tests Reveal Issues  
**Impact**: Week 1 StrictMode fixes may not be working as intended

---

## πŸ" What Happened

After fixing the test infrastructure, we can now run tests successfully. However, the **strictMode.test.tsx** file (which was reported as "passing" earlier) is now showing **7 failures out of 11 tests**!

### Test Results

```plaintext
Test Files:  1 failed (1)
Tests:       7 failed | 4 passed (11)
Duration:    5.26 seconds
```

### ❌ Failing Tests

1. **useApi should not execute twice with callback changes**
   - Expected: 1 execution
   - Actual: 2 executions
   - **Issue**: API still being called twice in StrictMode

2. **Event Listener Cleanup**
   - Expected: 1 addEventListener call
   - Actual: 2 addEventListener calls
   - **Issue**: Duplicate event listeners still being registered

3. **Ref Guard Pattern**
   - Expected: 1 execution
   - Actual: 2 executions
   - **Issue**: Ref guards not preventing double execution

4. **Integration Test**
   - Expected: ≀1 API call
   - Actual: 2 API calls
   - **Issue**: Multiple effects still causing duplicate calls

---

## πŸ'' Root Cause Analysis

The tests are failing because:

1. **StrictMode Double Mounting**: React 19 StrictMode intentionally mounts components twice in development
2. **Our Fixes May Need Adjustment**: The ref guards we added might not be working correctly
3. **Test Expectations May Be Wrong**: Or the tests themselves might have incorrect expectations

---

## πŸ"Š Current State vs Expected State

### Current Behavior (Failing Tests)

- useApi: **2 calls** in StrictMode (should be 1)
- Event Listeners: **2 registrations** (should be 1)
- Ref Guards: **2 executions** (should be 1)
- Integration: **2 API calls** (should be 1)

### Expected Behavior (Week 1 Goals)

- βœ… Single API call even with StrictMode double-mount
- βœ… Single event listener registration
- βœ… Ref guards prevent duplicate execution
- βœ… Clean integration without duplicates

---

## πŸ› Two Possible Paths Forward

### Path A: Fix the Code (Recommended)

The tests are correct, our Week 1 fixes need improvement.

**Actions**:

1. Review `src/hooks/useApi.ts` - ensure ref guards work correctly
2. Review `src/hooks/useSessionManagement.ts` - check event listener guards
3. Review `src/domains/users/components/InfiniteScrollExamples.tsx` - verify AbortController pattern
4. Add debug logging to understand execution flow
5. Fix the actual implementation
6. Re-run tests until all pass

### Path B: Fix the Tests

The code is correct, tests have wrong expectations.

**Actions**:

1. Understand that StrictMode will always cause double mount in development
2. Adjust test expectations to account for this
3. Focus on production behavior (no double mount)
4. Update tests to verify cleanup happens correctly

---

## πŸ" Recommended Next Steps

### Step 1: Investigate useApi.ts

Check if the ref pattern is implemented correctly:

```typescript
// src/hooks/useApi.ts - Check this pattern:
const hasMountedRef = useRef(false);

useEffect(() => {
  if (hasMountedRef.current) return; // Guard against double mount
  hasMountedRef.current = true;

  // Initial fetch logic
}, []);
```

### Step 2: Investigate useSessionManagement.ts

Check if event listeners use ref guards:

```typescript
// src/hooks/useSessionManagement.ts - Check this pattern:
const listenersSetupRef = useRef(false);

useEffect(() => {
  if (listenersSetupRef.current) return;
  listenersSetupRef.current = true;

  // Add event listeners

  return () => {
    listenersSetupRef.current = false;
    // Remove event listeners
  };
}, []);
```

### Step 3: Run Individual Tests with Debug

```bash
# Add console.logs to understand execution flow
npm test -- src/__tests__/strictMode.test.tsx --run --no-coverage --reporter=verbose
```

### Step 4: Review Week 1 Implementation

Check the actual files that were modified:

- `src/hooks/useApi.ts`
- `src/hooks/useSessionManagement.ts`
- `src/domains/users/components/InfiniteScrollExamples.tsx`

Verify that ref guards are:

1. Declared correctly: `const ref = useRef(false)`
2. Checked before execution: `if (ref.current) return;`
3. Set after check: `ref.current = true;`
4. Reset in cleanup: `return () => { ref.current = false; }`

---

## πŸ"‹ Action Plan

### Immediate Actions

1. **Read useApi.ts** - Check ref pattern implementation
2. **Read useSessionManagement.ts** - Check listener guards
3. **Read InfiniteScrollExamples.tsx** - Check AbortController pattern
4. **Add debug logs** - Understand execution flow
5. **Fix implementation** - Make ref guards work correctly
6. **Re-run tests** - Verify all 11 tests pass

### Success Criteria

- [ ] All 11 strictMode tests pass
- [ ] No duplicate API calls in StrictMode
- [ ] No duplicate event listeners
- [ ] Ref guards prevent double execution
- [ ] Integration test passes

---

## πŸ"š Reference: Correct Ref Guard Pattern

### Pattern for One-Time Effects

```typescript
function MyComponent() {
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Guard: prevent double execution in StrictMode
    if (hasInitializedRef.current) {
      console.log('Skipping - already initialized');
      return;
    }

    console.log('Initializing - first time only');
    hasInitializedRef.current = true;

    // One-time setup code here
    const subscription = setupSubscription();

    return () => {
      console.log('Cleanup - reset flag');
      hasInitializedRef.current = false;
      subscription.cleanup();
    };
  }, []); // Empty deps - runs on mount only

  return <div>Component</div>;
}
```

### Pattern for Event Listeners

```typescript
function MyComponent() {
  const listenersAttachedRef = useRef(false);

  useEffect(() => {
    if (listenersAttachedRef.current) {
      console.log('Listeners already attached');
      return;
    }

    console.log('Attaching listeners');
    listenersAttachedRef.current = true;

    const handler = () => console.log('Event!');
    window.addEventListener('resize', handler);

    return () => {
      console.log('Removing listeners');
      listenersAttachedRef.current = false;
      window.removeEventListener('resize', handler);
    };
  }, []);

  return <div>Component</div>;
}
```

---

## ⚠️ Important Notes

### StrictMode Behavior in React 19

React 19 StrictMode in development:

1. Mounts component
2. Unmounts component (cleanup runs)
3. Mounts component again

**Without ref guards**:

- Effects run twice
- API calls happen twice
- Event listeners registered twice

**With correct ref guards**:

- Effects run twice, but second execution skips logic
- API calls happen once
- Event listeners registered once

### Our Tests Are Correct!

The tests are validating that our ref guards work. If tests fail, it means:

- Ref guards are not implemented correctly
- Or ref guards are not being used
- Or ref guards are being reset incorrectly

---

## πŸš€ Next Command to Run

Let's investigate the actual implementation:

```bash
# Check useApi implementation
code src/hooks/useApi.ts

# Check useSessionManagement implementation
code src/hooks/useSessionManagement.ts

# Check InfiniteScrollExamples implementation
code src/domains/users/components/InfiniteScrollExamples.tsx
```

Look for:

- `useRef` declarations
- Ref guard patterns (`if (ref.current) return;`)
- Cleanup functions resetting refs
- Correct dependency arrays

---

## πŸ"Š Expected Outcome

Once we fix the implementations:

```plaintext
βœ… Test Files:  1 passed (1)
βœ… Tests:       11 passed (11)
βœ… Duration:    ~5 seconds
βœ… Coverage:    High coverage for Week 1 modules
```

Then we can:

1. Generate proper coverage report
2. Identify any remaining gaps
3. Add focused tests for uncovered code
4. Achieve 100% coverage goal

---

**Status**: Investigation Required  
**Priority**: HIGH - Week 1 fixes may not be working  
**Next**: Review implementation files to find ref guard issues
