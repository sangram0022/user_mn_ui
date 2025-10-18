# πŸ" ROOT CAUSE FOUND: Ref Guards Reset in Cleanup

**Date**: October 18, 2025  
**Status**: CRITICAL BUG IDENTIFIED  
**Impact**: Ref guards are being reset in cleanup, allowing duplicate execution

---

## 🎯 The Problem

In `src/hooks/useSessionManagement.ts` lines 150-154:

```typescript
return () => {
  activityListenersSetupRef.current = false; // ❌ WRONG!
  activities.forEach((activity) => {
    document.removeEventListener(activity, handleActivity, { capture: true });
  });
};
```

### Why This is Wrong

**StrictMode Flow**:

1. **First Mount**: `ref.current = false` β†' check passes β†' `ref.current = true` β†' adds listeners βœ…
2. **Cleanup (StrictMode unmount)**: `ref.current = false` ❌ β†' removes listeners
3. **Second Mount**: `ref.current = false` β†' check passes β†' `ref.current = true` β†' adds listeners AGAIN! ❌

**Result**: Duplicate listeners registered!

### Correct Pattern

The ref should **persist across mounts** to prevent duplicate setup:

```typescript
return () => {
  // DON'T reset the ref - it should persist!
  // activityListenersSetupRef.current = false; // ❌ Remove this line

  activities.forEach((activity) => {
    document.removeEventListener(activity, handleActivity, { capture: true });
  });
};
```

---

## πŸ› Fixes Required

### Fix 1: useSessionManagement.ts

**File**: `src/hooks/useSessionManagement.ts`  
**Lines**: 134-155

**Current Code** (WRONG):

```typescript
useEffect(() => {
  // Prevent duplicate setup in StrictMode
  if (activityListenersSetupRef.current) return;
  activityListenersSetupRef.current = true;

  const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

  const handleActivity = () => {
    updateActivity();
  };

  activities.forEach((activity) => {
    document.addEventListener(activity, handleActivity, { passive: true, capture: true });
  });

  return () => {
    activityListenersSetupRef.current = false; // ❌ REMOVE THIS LINE
    activities.forEach((activity) => {
      document.removeEventListener(activity, handleActivity, { capture: true });
    });
  };
}, []);
```

**Fixed Code**:

```typescript
useEffect(() => {
  // Prevent duplicate setup in StrictMode
  if (activityListenersSetupRef.current) return;
  activityListenersSetupRef.current = true;

  const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

  const handleActivity = () => {
    updateActivity();
  };

  activities.forEach((activity) => {
    document.addEventListener(activity, handleActivity, { passive: true, capture: true });
  });

  return () => {
    // βœ… Don't reset ref - keep it true to prevent re-setup in StrictMode
    // Only remove the listeners for real unmount
    activities.forEach((activity) => {
      document.removeEventListener(activity, handleActivity, { capture: true });
    });
  };
}, []);
```

---

### Fix 2: useApi.ts Auto-Fetch

**File**: `src/hooks/useApi.ts`  
**Lines**: 107-111

**Current Code** (MISSING REF GUARD):

```typescript
useEffect(() => {
  if (autoFetch) {
    execute();
  }
}, [autoFetch, execute, ...(deps || [])]);
```

**Fixed Code**:

```typescript
// Add ref guard for auto-fetch
const autoFetchExecutedRef = useRef(false);

useEffect(() => {
  if (autoFetch && !autoFetchExecutedRef.current) {
    autoFetchExecutedRef.current = true;
    execute();
  }
}, [autoFetch, execute, ...(deps || [])]);
```

---

### Fix 3: Check InfiniteScrollExamples

Need to verify that AbortController pattern doesn't reset refs in cleanup.

---

## βœ… Correct Ref Guard Patterns

### Pattern 1: One-Time Setup (Persist Across Mounts)

```typescript
const hasSetupRef = useRef(false);

useEffect(() => {
  if (hasSetupRef.current) return; // Skip if already setup
  hasSetupRef.current = true; // Mark as setup

  // Setup code (runs once, even in StrictMode)
  setupSomething();

  return () => {
    // DON'T reset ref - let it stay true
    // Cleanup code (runs on every cleanup)
    cleanupSomething();
  };
}, []);
```

### Pattern 2: Allow Re-Setup After Full Unmount

```typescript
const hasSetupRef = useRef(false);

useEffect(() => {
  if (hasSetupRef.current) return;
  hasSetupRef.current = true;

  setupSomething();

  return () => {
    // Reset ref to allow re-setup after real unmount
    // This works because in production (no StrictMode), cleanup only runs once
    hasSetupRef.current = false;
    cleanupSomething();
  };
}, []);
```

**Problem with Pattern 2**: In StrictMode development, cleanup runs twice, so ref gets reset!

**Solution**: Use Pattern 1 for StrictMode safety.

---

## πŸ"‹ Implementation Checklist

- [ ] Fix `useSessionManagement.ts` - remove ref reset in cleanup (line 150)
- [ ] Fix `useApi.ts` - add ref guard for auto-fetch
- [ ] Check `InfiniteScrollExamples.tsx` - verify no ref resets
- [ ] Run tests: `npm test -- src/__tests__/strictMode.test.tsx --run`
- [ ] Verify all 11 tests pass
- [ ] Generate coverage report
- [ ] Check coverage percentages

---

## πŸš€ Expected Result After Fixes

```plaintext
βœ… Test Files:  1 passed (1)
βœ… Tests:       11 passed (11)
βœ… Duration:    ~5 seconds

StrictMode Tests:
  βœ… should not execute API twice with callback changes
  βœ… should not register duplicate listeners in StrictMode
  βœ… should use ref guards to prevent double execution
  βœ… should handle all StrictMode scenarios correctly
  βœ… (all other tests passing)
```

---

## πŸ"š Key Learnings

### StrictMode Ref Pattern Rules

1. **Use refs to track "has setup" state** - `const hasSetupRef = useRef(false)`
2. **Check ref before setup** - `if (hasSetupRef.current) return;`
3. **Set ref to true after check** - `hasSetupRef.current = true;`
4. **DO NOT reset ref in cleanup** - Let it stay `true` to prevent re-setup
5. **Still do cleanup work** - Remove listeners, clear timers, abort requests

### Why Not Reset?

In development with StrictMode:

- Cleanup runs during "fake unmount"
- If we reset ref β†' `false`
- Second mount sees `false` β†' runs setup again β†' duplicates!

In production (no StrictMode):

- Cleanup runs once on real unmount
- Component never remounts
- Doesn't matter if ref stays `true`

**Solution**: Never reset the ref in cleanup. Once setup, always setup.

---

**Next Step**: Apply these fixes to the code!
