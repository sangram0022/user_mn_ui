# React 19 Patterns & Best Practices

**Last Updated:** November 10, 2025  
**React Version:** 19.1.1  
**Status:** ✅ Production Ready

## Table of Contents

1. [Overview](#overview)
2. [React 19 Compiler](#react-19-compiler)
3. [Hook Optimization Rules](#hook-optimization-rules)
4. [useCallback & useMemo Guidelines](#usecallback--usememo-guidelines)
5. [Context Patterns](#context-patterns)
6. [Form Patterns](#form-patterns)
7. [State Management](#state-management)
8. [Migration Examples](#migration-examples)
9. [Performance Checklist](#performance-checklist)
10. [Common Pitfalls](#common-pitfalls)

---

## Overview

React 19 introduces the **React Compiler**, which automatically optimizes component re-renders without manual memoization. This guide establishes patterns for when to keep `useCallback`/`useMemo` and when to remove them.

### Key Principles

1. **React Compiler handles most optimizations** - Remove manual memoization unless justified
2. **Context values need identity stability** - Keep `useMemo` for Context.Provider values
3. **Actions in contexts need stability** - Keep `useCallback` for context action functions
4. **Document all kept hooks** - Add comments explaining WHY they're retained

---

## React 19 Compiler

### What the Compiler Does

The React Compiler automatically:
- Memoizes component outputs
- Optimizes re-renders
- Handles prop equality checks
- Optimizes list rendering
- Manages closure optimizations

### What You Still Need to Do

Manual optimization is ONLY needed for:

1. **Context Provider values** (object identity)
2. **useEffect dependencies** (explicit dependency management)
3. **Expensive calculations** (>10ms with benchmark proof)
4. **Third-party libraries** (if they require stable references)

---

## Hook Optimization Rules

### ✅ REMOVE useCallback/useMemo

Remove in these cases (Compiler handles them):

```typescript
// ❌ REMOVE: Simple computations
const filtered = useMemo(() => arr.filter(x => x.active), [arr]);

// ❌ REMOVE: Event handlers  
const handleClick = useCallback(() => setCount(c => c + 1), []);

// ❌ REMOVE: Component props
const memoizedProps = useMemo(() => ({ data, onUpdate }), [data, onUpdate]);

// ❌ REMOVE: Inline functions
const Component = useCallback(() => <div>{value}</div>, [value]);

// ✅ CORRECT: Let Compiler handle it
const filtered = arr.filter(x => x.active);
const handleClick = () => setCount(c => c + 1);
const props = { data, onUpdate };
```

### ✅ KEEP useCallback/useMemo

Keep ONLY in these specific cases:

#### 1. Context Provider Values

```typescript
// ✅ KEEP: Context value identity prevents consumer re-renders
const value = useMemo(() => ({
  state,
  actions: { login, logout, checkAuth }
}), [state, login, logout, checkAuth]);
// Kept: Context value identity (prevents unnecessary re-renders)

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
```

**Real Example:** `src/domains/auth/context/AuthContext.tsx`

```typescript
const value: AuthContextValue = useMemo(() => ({
  // State
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  permissions: state.permissions,
  
  // Actions
  login,
  logout,
  checkAuth,
  refreshSession,
  updateUser,
}), [state.user, state.isAuthenticated, state.isLoading, state.permissions, login, logout, checkAuth, refreshSession, updateUser]);
// Kept: useMemo for context value identity (prevents unnecessary re-renders)
```

#### 2. Context Action Functions

```typescript
// ✅ KEEP: Action stability for context consumers
const login = useCallback((tokens: AuthTokens, user: User) => {
  tokenService.storeTokens(tokens);
  setState({ user, isAuthenticated: true });
}, []);
// Kept: useCallback for context value stability (prevents consumer re-renders)

const logout = useCallback(async () => {
  await authService.logout();
  tokenService.clearTokens();
  setState({ user: null, isAuthenticated: false });
}, []);
// Kept: useCallback for context value stability (prevents consumer re-renders)
```

**Real Example:** `src/domains/auth/context/AuthContext.tsx`

#### 3. Expensive Calculations (Benchmarked)

```typescript
// ✅ KEEP: Calculation takes >10ms (benchmarked)
const sortedData = useMemo(() => {
  return massiveArray
    .filter(complexFilter)
    .sort(expensiveSort)
    .map(complexTransform);
}, [massiveArray]);
// Kept: Expensive calculation (15ms avg, benchmarked)
```

**Requirement:** Must have benchmark proof showing >10ms execution time.

#### 4. useEffect Dependencies

```typescript
// ✅ KEEP: Needed as useEffect dependency
const fetchData = useCallback(async () => {
  const result = await api.getData(id);
  setData(result);
}, [id]);
// Kept: useEffect dependency

useEffect(() => {
  fetchData();
}, [fetchData]);
```

**Note:** Consider if the effect can be restructured to avoid this pattern.

---

## useCallback & useMemo Guidelines

### Decision Tree

```
Is it a Context Provider value?
├─ YES → KEEP useMemo (with comment)
└─ NO
    ├─ Is it a Context action function?
    │   ├─ YES → KEEP useCallback (with comment)
    │   └─ NO
    │       ├─ Is it a useEffect dependency?
    │       │   ├─ YES → KEEP (with comment, consider refactor)
    │       │   └─ NO
    │       │       ├─ Is it an expensive calculation (>10ms)?
    │       │       │   ├─ YES → KEEP useMemo (with benchmark proof)
    │       │       │   └─ NO → REMOVE (Compiler handles it)
```

### Comment Requirements

**MUST add comments** for all kept hooks:

```typescript
// ✅ CORRECT: With explanation
const value = useMemo(() => ({ state, actions }), [state, actions]);
// Kept: Context value identity prevents consumer re-renders

const login = useCallback((user) => setUser(user), []);
// Kept: useCallback for context value stability

const result = useMemo(() => expensiveCalc(data), [data]);
// Kept: Expensive calculation (15ms avg, benchmarked)

// ❌ WRONG: No comment
const value = useMemo(() => ({ state, actions }), [state, actions]);
```

### Migration Pattern

**Before (React 18):**
```typescript
const handleClick = useCallback(() => {
  setCount(c => c + 1);
}, []);

const filtered = useMemo(() => items.filter(x => x.active), [items]);
```

**After (React 19):**
```typescript
// React 19 Compiler: No useCallback needed - compiler optimizes automatically
const handleClick = () => {
  setCount(c => c + 1);
};

// React 19 Compiler: No useMemo needed - simple filter operation
const filtered = items.filter(x => x.active);
```

---

## Context Patterns

### Split Context Pattern (Recommended)

Split state and actions into separate contexts for optimal performance:

```typescript
// State Context
const AuthStateContext = createContext<AuthState | null>(null);

// Actions Context  
const AuthActionsContext = createContext<AuthActions | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);
  
  // Keep: Actions need stability for context consumers
  const actions = useMemo(() => ({
    login: (user: User) => setState(s => ({ ...s, user, isAuthenticated: true })),
    logout: () => setState(s => ({ ...s, user: null, isAuthenticated: false })),
  }), []);
  // Kept: useMemo for actions object identity
  
  return (
    <AuthStateContext.Provider value={state}>
      <AuthActionsContext.Provider value={actions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}

// Separate hooks for state and actions
export function useAuthState() {
  const context = use(AuthStateContext);
  if (!context) throw new Error('useAuthState must be used within AuthProvider');
  return context;
}

export function useAuthActions() {
  const context = use(AuthActionsContext);
  if (!context) throw new Error('useAuthActions must be used within AuthProvider');
  return context;
}
```

**Benefits:**
- Components using only actions don't re-render on state changes
- Components using only state don't re-render on action reference changes
- Better performance profiling

### Combined Context Pattern (Current)

**Real Example:** `src/domains/auth/context/AuthContext.tsx`

```typescript
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(() => {
    // Lazy initialization
    const user = tokenService.getUser() as User | null;
    const rolesArray = normalizeRoles(user?.roles);
    return {
      user,
      isAuthenticated: !!tokenService.getAccessToken(),
      isLoading: true,
      permissions: rolesArray.length > 0
        ? getEffectivePermissionsForRoles(rolesArray as UserRole[])
        : [],
    };
  });

  // Actions: Keep useCallback for context stability
  const login = useCallback((tokens: AuthTokens, user: User, rememberMe: boolean = false) => {
    // Implementation
  }, []);
  // Kept: useCallback for context value stability (prevents consumer re-renders)

  const logout = useCallback(async () => {
    // Implementation
  }, []);
  // Kept: useCallback for context value stability (prevents consumer re-renders)

  // Context value: Keep useMemo for object identity
  const value: AuthContextValue = useMemo(() => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    permissions: state.permissions,
    login,
    logout,
    checkAuth,
    refreshSession,
    updateUser,
  }), [state.user, state.isAuthenticated, state.isLoading, state.permissions, login, logout, checkAuth, refreshSession, updateUser]);
  // Kept: useMemo for context value identity (prevents unnecessary re-renders)

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

---

## Form Patterns

### useOptimistic for Instant UI Updates

Use `useOptimistic` for optimistic updates during async operations:

```typescript
import { useOptimistic } from 'react';

function TodoList({ todos, addTodo }: TodoListProps) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, { ...newTodo, pending: true }]
  );

  const handleSubmit = async (formData: FormData) => {
    const newTodo = { id: crypto.randomUUID(), text: formData.get('text') as string };
    
    // Add optimistically (instant UI update)
    addOptimisticTodo(newTodo);
    
    // Send to server
    await addTodo(newTodo);
  };

  return (
    <form action={handleSubmit}>
      <input name="text" />
      <button type="submit">Add</button>
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id} className={todo.pending ? 'opacity-50' : ''}>
            {todo.text}
          </li>
        ))}
      </ul>
    </form>
  );
}
```

**Real Example:** `src/shared/examples/OptimisticFormExample.tsx`

### useActionState for Form Submissions

Use `useActionState` when working with Server Actions pattern:

```typescript
import { useActionState } from 'react';

async function updateProfile(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    await api.updateProfile({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    });
    return { success: true, message: 'Profile updated!' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function ProfileForm() {
  const [state, formAction] = useActionState(updateProfile, { success: false });

  return (
    <form action={formAction}>
      <input name="name" />
      <input name="email" />
      <button type="submit">Update</button>
      {state.error && <p className="error">{state.error}</p>}
      {state.success && <p className="success">{state.message}</p>}
    </form>
  );
}
```

**Note:** Current app uses TanStack Query for API calls (already optimal).

---

## State Management

### Lazy State Initialization

**Always use lazy initialization** for expensive initial state:

```typescript
// ❌ WRONG: Expensive calculation runs on every render
const [data, setData] = useState(expensiveCalculation());

// ✅ CORRECT: Runs only once on mount
const [data, setData] = useState(() => expensiveCalculation());

// ✅ CORRECT: Real example from AuthContext
const [state, setState] = useState<AuthState>(() => {
  const user = tokenService.getUser() as User | null;
  const rolesArray = normalizeRoles(user?.roles);
  return {
    user,
    isAuthenticated: !!tokenService.getAccessToken(),
    isLoading: true,
    permissions: rolesArray.length > 0
      ? getEffectivePermissionsForRoles(rolesArray as UserRole[])
      : [],
  };
});
```

### State Updates

```typescript
// ❌ WRONG: May use stale state
setCount(count + 1);

// ✅ CORRECT: Functional update with previous state
setCount(prev => prev + 1);

// ✅ CORRECT: Object merge
setState(prev => ({ ...prev, isLoading: true }));
```

---

## Migration Examples

### Example 1: Simple Event Handler

**Before:**
```typescript
const handleClick = useCallback(() => {
  setCount(c => c + 1);
}, []);
```

**After:**
```typescript
// React 19 Compiler: No useCallback needed - compiler optimizes automatically
const handleClick = () => {
  setCount(c => c + 1);
};
```

**Commit:** See Phase 3 cleanup commits

### Example 2: Filtered Data

**Before:**
```typescript
const filteredUsers = useMemo(() => {
  return users
    .filter(u => u.isActive)
    .sort((a, b) => a.name.localeCompare(b.name));
}, [users]);
```

**After:**
```typescript
// React 19 Compiler: No useMemo needed - simple filter and sort
const filteredUsers = users
  .filter(u => u.isActive)
  .sort((a, b) => a.name.localeCompare(b.name));
```

**Real Example:** `src/domains/admin/pages/RolesManagementPage.tsx:341`

### Example 3: Component Props

**Before:**
```typescript
const memoizedProps = useMemo(() => ({
  data,
  onUpdate,
  isLoading
}), [data, onUpdate, isLoading]);

<ChildComponent {...memoizedProps} />
```

**After:**
```typescript
// React 19 Compiler: No useMemo needed - compiler handles prop optimization
<ChildComponent 
  data={data}
  onUpdate={onUpdate}
  isLoading={isLoading}
/>
```

### Example 4: Derived State (Simple)

**Before:**
```typescript
const total = useMemo(() => items.reduce((sum, item) => sum + item.price, 0), [items]);
```

**After:**
```typescript
// React 19 Compiler: No useMemo needed - simple reduce operation
const total = items.reduce((sum, item) => sum + item.price, 0);
```

**Real Example:** `src/domains/admin/pages/UsersManagementPage.tsx:425`

### Example 5: Kept - Password Strength (Benchmarked)

**Code:**
```typescript
import { useMemo } from 'react';

function PasswordStrength({ password }: { password: string }) {
  const strength = useMemo(() => calculateStrength(password), [password]);
  // Kept: Expensive calculation (regex operations, scoring algorithm)
  
  return <StrengthMeter strength={strength} />;
}
```

**Real Example:** `src/domains/auth/components/PasswordStrength.tsx:77`

**Justification:** `calculateStrength()` performs multiple regex operations and scoring calculations.

### Example 6: Kept - RBAC Permission Check

**Code:**
```typescript
const hasAccess = useMemo(() => {
  if (loading) return false;
  return checkPermission(userPermissions, requiredPermission);
}, [loading, userPermissions, requiredPermission]);
// Kept: Permission checking with wildcard matching is moderately expensive
```

**Real Example:** `src/domains/rbac/components/OptimizedRoleBasedButton.tsx:49`

**Justification:** Wildcard permission matching involves pattern checking across arrays.

---

## Performance Checklist

### Build Time

- [ ] Enable React Compiler in build config
- [ ] Verify babel plugin is configured
- [ ] Check for compiler warnings in build output

### Runtime

- [ ] Profile component re-renders (React DevTools Profiler)
- [ ] Measure expensive calculations (>10ms threshold)
- [ ] Check context consumer re-render patterns
- [ ] Validate lazy loading works correctly

### Code Review

- [ ] All removed `useCallback`/`useMemo` have justification comments (if kept)
- [ ] Context values use `useMemo` with comments
- [ ] Context actions use `useCallback` with comments
- [ ] No premature optimization (let Compiler work first)
- [ ] Lazy state initialization for expensive initial state

---

## Common Pitfalls

### ❌ Pitfall 1: Removing Context Value Memoization

```typescript
// ❌ WRONG: Context value recreated every render → all consumers re-render
function Provider({ children }) {
  const [state, setState] = useState(initialState);
  const actions = { login, logout }; // New object every render!
  
  return <Context.Provider value={{ state, actions }}>{children}</Context.Provider>;
}

// ✅ CORRECT: Stable context value
function Provider({ children }) {
  const [state, setState] = useState(initialState);
  
  const value = useMemo(() => ({ state, actions }), [state, actions]);
  // Kept: Context value identity prevents consumer re-renders
  
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
```

### ❌ Pitfall 2: Premature Optimization

```typescript
// ❌ WRONG: Optimizing before measuring
const result = useMemo(() => simpleCalculation(), [dep]);

// ✅ CORRECT: Let Compiler handle it first, optimize if profiling shows issues
const result = simpleCalculation();
```

### ❌ Pitfall 3: Missing Lazy Initialization

```typescript
// ❌ WRONG: Runs on every render
const [data, setData] = useState(JSON.parse(localStorage.getItem('data')));

// ✅ CORRECT: Runs only once
const [data, setData] = useState(() => JSON.parse(localStorage.getItem('data') || '{}'));
```

### ❌ Pitfall 4: Stale Closures in Effects

```typescript
// ❌ WRONG: May capture stale values
useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + 1); // Stale count
  }, 1000);
  return () => clearInterval(timer);
}, []); // Missing count dependency

// ✅ CORRECT: Functional update
useEffect(() => {
  const timer = setInterval(() => {
    setCount(c => c + 1); // Always current
  }, 1000);
  return () => clearInterval(timer);
}, []); // No dependencies needed
```

---

## Real-World Examples from Codebase

### AuthContext (Full Pattern)

**File:** `src/domains/auth/context/AuthContext.tsx`

**What's Kept:**
- `useMemo` for context value (object identity)
- `useCallback` for all action functions (context stability)

**What's Removed:**
- Event handlers in components consuming this context
- Derived state computations (roles normalization happens inline)

### RolesManagementPage (Compiler Optimization)

**File:** `src/domains/admin/pages/RolesManagementPage.tsx`

**What's Removed:**
- Line 267: `useMemo` for simple grouping operation
- Line 341: `useMemo` for filter and sort

**Comments Added:**
```typescript
// React 19 Compiler: No useMemo needed - simple grouping operation
const groupedByDomain = /* ... */;

// React 19 Compiler: No useMemo needed - simple filter and sort
const filteredRoles = /* ... */;
```

### OptimizedCanAccess (Permission Checks)

**File:** `src/domains/rbac/components/OptimizedCanAccess.tsx:42`

**What's Kept:**
```typescript
const accessResult = useMemo(() => {
  // Permission checking logic with wildcards
}, [permissions, requiredPermissions, mode]);
// Kept: Permission matching is moderately expensive with wildcards
```

**Justification:** Wildcard pattern matching across permission arrays.

---

## Testing Your Optimizations

### Manual Testing

1. **React DevTools Profiler:**
   - Record interactions
   - Check "Why did this render?"
   - Validate no unnecessary re-renders

2. **Console Performance:**
   ```typescript
   console.time('calculation');
   const result = expensiveFunction();
   console.timeEnd('calculation');
   // If <10ms consistently, remove useMemo
   ```

3. **Lighthouse Audit:**
   ```bash
   npm run test:performance
   ```

### Automated Testing

```typescript
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

describe('useExpensiveCalculation', () => {
  it('should memoize expensive calculation', () => {
    const expensiveFn = vi.fn((x: number) => x * 2);
    
    const { result, rerender } = renderHook(
      ({ value }) => useMemo(() => expensiveFn(value), [value]),
      { initialProps: { value: 5 } }
    );
    
    expect(expensiveFn).toHaveBeenCalledTimes(1);
    
    // Same prop value - should not recalculate
    rerender({ value: 5 });
    expect(expensiveFn).toHaveBeenCalledTimes(1);
    
    // Different prop value - should recalculate
    rerender({ value: 10 });
    expect(expensiveFn).toHaveBeenCalledTimes(2);
  });
});
```

---

## Summary: Quick Reference

| Scenario | Action | Comment Required |
|----------|--------|------------------|
| Context Provider value | ✅ KEEP `useMemo` | Yes - "Context value identity" |
| Context action functions | ✅ KEEP `useCallback` | Yes - "Context value stability" |
| useEffect dependency | ✅ KEEP `useCallback` | Yes - "useEffect dependency" |
| Expensive calc (>10ms) | ✅ KEEP `useMemo` | Yes - with benchmark proof |
| Event handlers | ❌ REMOVE `useCallback` | Comment removal reason |
| Simple computations | ❌ REMOVE `useMemo` | Comment removal reason |
| Component props | ❌ REMOVE `useMemo` | Comment removal reason |
| Derived state (simple) | ❌ REMOVE `useMemo` | Comment removal reason |

**Default Rule:** When in doubt, REMOVE and let React Compiler optimize. Only add back if profiling shows a real performance issue.

---

## Additional Resources

- [React 19 Release Notes](https://react.dev/blog/2024/04/25/react-19)
- [React Compiler Documentation](https://react.dev/learn/react-compiler)
- [React DevTools Profiler Guide](https://react.dev/learn/react-developer-tools)
- Project Examples: Search codebase for "React 19 Compiler:" comments

---

**Maintained by:** Development Team  
**Last Review:** November 10, 2025  
**Next Review:** February 10, 2026
