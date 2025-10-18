# Ref Guard Pattern - Quick Reference

## The Golden Rule

**NEVER reset refs in cleanup functions!**

## The Pattern

### βœ… CORRECT

```typescript
const hasInitializedRef = useRef(false);

useEffect(() => {
  if (hasInitializedRef.current) return; // Skip if already ran
  hasInitializedRef.current = true; // Mark as ran

  // Your setup code here (runs once)

  return () => {
    // βœ… Don't reset ref - keep it true forever
    // Your cleanup code here (runs every unmount)
  };
}, []);
```

### ❌ WRONG

```typescript
const hasInitializedRef = useRef(false);

useEffect(() => {
  if (hasInitializedRef.current) return;
  hasInitializedRef.current = true;

  // Your setup code

  return () => {
    hasInitializedRef.current = false; // ❌ THIS BREAKS STRICTMODE!
    // Cleanup
  };
}, []);
```

## Why?

In React StrictMode (development):

1. **Mount** β†' ref=false β†' set to true β†' run setup
2. **Cleanup** (fake unmount) β†' if you reset ref to false β†' **PROBLEM!**
3. **Remount** β†' ref=false again β†' run setup **AGAIN** β†' Duplicates!

If you **don't** reset:

1. **Mount** β†' ref=false β†' set to true β†' run setup
2. **Cleanup** (fake unmount) β†' ref **stays** true
3. **Remount** β†' ref=true β†' **skip setup** β†' Perfect!

## Real Examples

### Example 1: API Auto-fetch

```typescript
const autoFetchExecutedRef = useRef(false);

useEffect(() => {
  if (autoFetchExecutedRef.current) return;
  autoFetchExecutedRef.current = true;

  if (autoFetch && url) {
    executeRequest();
  }

  return () => {
    // βœ… Don't reset autoFetchExecutedRef
    abortControllerRef.current?.abort();
  };
}, [autoFetch, url]); // Dependencies OK - ref prevents re-run
```

### Example 2: Event Listeners

```typescript
const activityListenersSetupRef = useRef(false);

useEffect(() => {
  if (activityListenersSetupRef.current) return;
  activityListenersSetupRef.current = true;

  window.addEventListener('click', handleActivity);
  window.addEventListener('keydown', handleActivity);

  return () => {
    // βœ… Don't reset activityListenersSetupRef
    window.removeEventListener('click', handleActivity);
    window.removeEventListener('keydown', handleActivity);
  };
}, []);
```

### Example 3: Initial Load

```typescript
const hasInitialLoadedRef = useRef(false);

useEffect(() => {
  if (hasInitialLoadedRef.current) return;
  hasInitialLoadedRef.current = true;

  loadInitialData();

  return () => {
    // βœ… Don't reset hasInitialLoadedRef
    abortController?.abort();
  };
}, [loadInitialData]);
```

## When to Use This Pattern

Use ref guards when you want code to run **ONCE** across:

- βœ… Initial data fetches
- βœ… Event listener setup
- βœ… Subscription activation
- βœ… Timer/interval setup
- βœ… Analytics tracking
- βœ… Session initialization

## When NOT to Use

Don't use ref guards for:

- ❌ Code that should run on every render
- ❌ Code that should run when dependencies change
- ❌ Reactive updates based on props/state

## Testing

Your tests should verify:

```typescript
it('should only fetch once in StrictMode', async () => {
  const fetchSpy = vi.fn();

  render(
    <StrictMode>
      <YourComponent onFetch={fetchSpy} />
    </StrictMode>
  );

  await waitFor(() => {
    expect(fetchSpy).toHaveBeenCalledTimes(1); // Not 2!
  });
});
```

## Checklist

Before committing code with refs:

- [ ] Ref is used for one-time guard?
- [ ] Ref is set to `true` after setup runs?
- [ ] Ref is **NOT** reset to `false` in cleanup?
- [ ] Cleanup only handles resource disposal (not ref reset)?
- [ ] Code tested in StrictMode?

## Common Mistakes

### Mistake 1: Resetting in cleanup

```typescript
return () => {
  ref.current = false; // ❌ WRONG!
};
```

### Mistake 2: Not checking ref

```typescript
useEffect(() => {
  // Missing: if (ref.current) return;
  ref.current = true;
  setup();
}, []);
```

### Mistake 3: Using ref for reactive code

```typescript
useEffect(() => {
  if (ref.current) return; // ❌ This prevents re-runs on prop changes
  ref.current = true;

  fetchData(userId); // This WON'T update when userId changes!
}, [userId]);
```

## Quick Fix Checklist

If you have duplicate operations:

1. **Add ref**: `const ref = useRef(false);`
2. **Add guard**: `if (ref.current) return;`
3. **Set ref**: `ref.current = true;`
4. **Remove reset**: Delete `ref.current = false` from cleanup
5. **Test**: Verify in StrictMode

## Resources

- Full documentation: `WEEK_1_TEST_COVERAGE_COMPLETE.md`
- Tests: `src/__tests__/strictMode.test.tsx`
- Examples: `src/hooks/useSessionManagement.ts`, `src/hooks/useApi.ts`

---

**Remember**: Refs for guards should be **write-once**, never reset!
