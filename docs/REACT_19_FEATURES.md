# React 19 Features Guide

**Version:** 1.0  
**Last Updated:** November 10, 2025  
**Status:** Production Standard

## Overview

This document defines how to use **React 19 features** in the application. React 19 introduces several powerful features that simplify code and improve performance.

---

## Key React 19 Features

### 1. React Compiler (Automatic Optimization)

**What it does:** Automatically optimizes components without manual `useMemo`/`useCallback`.

**Impact:** Most `useMemo`/`useCallback` are now unnecessary.

#### When to Keep useMemo/useCallback

Only keep in these specific cases:

```typescript
// ✅ KEEP: Context value (object identity)
const value = useMemo(() => ({ state, actions }), [state, actions]);
// Reason: Context value identity prevents consumer re-renders

// ✅ KEEP: Expensive calculation (>10ms, benchmarked)
const sorted = useMemo(() => expensiveSort(largeArray), [largeArray]);
// Reason: Calculation takes 15ms avg (benchmarked)

// ✅ KEEP: useEffect dependency
const callback = useCallback(() => {...}, []);
useEffect(() => { callback(); }, [callback]);
// Reason: useEffect dependency stability
```

#### When to Remove useMemo/useCallback

```typescript
// ❌ REMOVE: Simple computations
const filtered = useMemo(() => arr.filter(x => x.active), [arr]);
// React Compiler optimizes automatically

// ❌ REMOVE: Event handlers
const handleClick = useCallback(() => {...}, []);
// React Compiler optimizes automatically

// ❌ REMOVE: Inline functions
const Component = useMemo(() => <Child />, []);
// React Compiler optimizes automatically
```

**Rule:** If you keep `useMemo`/`useCallback`, **MUST add comment** explaining why:

```typescript
const value = useMemo(() => ({ user, actions }), [user, actions]);
// Kept: Context value identity prevents consumer re-renders
```

---

### 2. useOptimistic (Optimistic Updates)

**What it does:** Provides instant UI feedback before server confirmation.

**Use when:** Creating/updating/deleting data with mutations.

#### Basic Pattern

```typescript
import { useOptimistic } from 'react';

function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  );

  const handleAdd = async (text: string) => {
    const tempTodo = { id: 'temp', text, completed: false };
    addOptimisticTodo(tempTodo); // Instant UI update

    try {
      const savedTodo = await createTodo(text);
      setTodos(prev => [...prev, savedTodo]); // Replace temp with real
    } catch (error) {
      // Optimistic update automatically reverts on error
      handleError(error);
    }
  };

  return (
    <ul>
      {optimisticTodos.map(todo => (
        <li key={todo.id} className={todo.id === 'temp' ? 'pending' : ''}>
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
```

#### Advanced Pattern: Update/Delete

```typescript
function TodoItem({ todo }: { todo: Todo }) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    todo.completed,
    (state, newValue: boolean) => newValue
  );

  const handleToggle = async () => {
    setOptimisticStatus(!todo.completed); // Instant UI update

    try {
      await updateTodo(todo.id, { completed: !todo.completed });
    } catch (error) {
      // Reverts automatically
      handleError(error);
    }
  };

  return (
    <div>
      <input
        type="checkbox"
        checked={optimisticStatus}
        onChange={handleToggle}
        className={optimisticStatus !== todo.completed ? 'pending' : ''}
      />
      {todo.text}
    </div>
  );
}
```

#### Integration with TanStack Query

```typescript
import { useOptimistic } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

function UserProfile() {
  const { data: user } = useUserProfile();
  const queryClient = useQueryClient();

  const [optimisticUser, setOptimisticUser] = useOptimistic(
    user,
    (state, newData: Partial<User>) => ({ ...state, ...newData })
  );

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onMutate: (newData) => {
      setOptimisticUser(newData); // Instant UI update
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
    onError: (error) => {
      // Optimistic update reverted automatically
      handleError(error);
    },
  });

  return (
    <div>
      <h1>{optimisticUser.name}</h1>
      <button onClick={() => updateMutation.mutate({ name: 'New Name' })}>
        Update
      </button>
    </div>
  );
}
```

---

### 3. use() Hook (Resource Reading)

**What it does:** Reads values from promises or context directly in render.

**Use when:** Consuming context or handling async data in render.

#### Pattern 1: Context Consumption

```typescript
import { use } from 'react';
import { UserContext } from '@/contexts/UserContext';

// ❌ OLD WAY
function OldComponent() {
  const { user, actions } = useContext(UserContext);
  return <div>{user.name}</div>;
}

// ✅ NEW WAY (React 19)
function NewComponent() {
  const { user, actions } = use(UserContext);
  return <div>{user.name}</div>;
}
```

**Benefits:**

- More concise
- Can be used in loops/conditions (unlike `useContext`)
- Better performance with React Compiler

#### Pattern 2: Promise Reading

```typescript
import { use, Suspense } from 'react';

function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise); // Suspends until resolved

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// Parent component
function App() {
  const userPromise = fetchUser('123');

  return (
    <Suspense fallback={<Spinner />}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}
```

#### Pattern 3: Conditional Promise Reading

```typescript
function ConditionalData({ shouldFetch, dataPromise }) {
  // ✅ use() can be used conditionally (unlike hooks)
  const data = shouldFetch ? use(dataPromise) : null;

  if (!shouldFetch) return <div>Not fetching</div>;
  return <div>{data.content}</div>;
}
```

---

### 4. Suspense (Async Components)

**What it does:** Declarative loading states for async operations.

**Use when:** Code splitting, lazy loading, async data fetching.

#### Pattern 1: Route Code Splitting

```typescript
import { lazy, Suspense } from 'react';

// Lazy load route components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Settings = lazy(() => import('@/pages/Settings'));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

#### Pattern 2: Component Code Splitting

```typescript
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('@/components/Chart'));

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart data={chartData} />
      </Suspense>
    </div>
  );
}
```

#### Pattern 3: Nested Suspense Boundaries

```typescript
function Page() {
  return (
    <div>
      {/* Fast content loads immediately */}
      <Header />

      {/* User data suspends independently */}
      <Suspense fallback={<UserSkeleton />}>
        <UserProfile />
      </Suspense>

      {/* Posts suspend independently */}
      <Suspense fallback={<PostsSkeleton />}>
        <PostsList />
      </Suspense>

      <Footer />
    </div>
  );
}
```

#### Pattern 4: Suspense with TanStack Query

```typescript
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

// Component using suspense query (no loading states needed!)
function UserProfile() {
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', 'profile'],
    queryFn: fetchUserProfile,
  });

  return <div>{user.name}</div>; // No loading check needed
}

// Parent with Suspense boundary
function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <UserProfile />
    </Suspense>
  );
}
```

---

### 5. Server Actions (Future)

**Status:** Not yet implemented (requires Next.js or RSC setup).

**Planned:** When migrating to Next.js App Router.

```typescript
// Future pattern
'use server';

export async function createUser(formData: FormData) {
  const name = formData.get('name');
  const user = await db.user.create({ data: { name } });
  return user;
}
```

---

## Feature Decision Tree

### Should I use useOptimistic?

```
Are you creating/updating/deleting data?
├─ YES → Do users expect instant feedback?
│  ├─ YES → ✅ Use useOptimistic
│  └─ NO → ❌ Use regular mutation
└─ NO → ❌ Not applicable
```

**Examples:**

- ✅ Toggle todo completed
- ✅ Like/unlike post
- ✅ Add item to cart
- ❌ Login (no optimistic auth)
- ❌ Delete account (confirmation needed)

### Should I use use() for context?

```
Are you consuming React Context?
├─ YES → Do you need it conditionally or in loops?
│  ├─ YES → ✅ Use use()
│  └─ NO → ✅ Use use() (modern pattern)
└─ NO → ❌ Not applicable
```

### Should I use Suspense?

```
Are you lazy loading code or components?
├─ YES → ✅ Use Suspense
└─ NO → Are you using useSuspenseQuery?
   ├─ YES → ✅ Use Suspense
   └─ NO → ❌ Not needed
```

### Should I keep useMemo/useCallback?

```
Is it a Context value?
├─ YES → ✅ Keep (add comment)
└─ NO → Is it an expensive calculation (>10ms)?
   ├─ YES → ✅ Keep (add comment)
   └─ NO → Is it a useEffect dependency?
      ├─ YES → ✅ Keep (add comment)
      └─ NO → ❌ Remove (React Compiler optimizes)
```

---

## Migration Examples

### Migration 1: Remove Unnecessary useMemo

**Before:**

```typescript
function ProductList({ products }) {
  const filtered = useMemo(
    () => products.filter(p => p.inStock),
    [products]
  );

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => a.price - b.price),
    [filtered]
  );

  return <ul>{sorted.map(p => <li>{p.name}</li>)}</ul>;
}
```

**After:**

```typescript
function ProductList({ products }) {
  // React Compiler optimizes automatically
  const filtered = products.filter(p => p.inStock);
  const sorted = [...filtered].sort((a, b) => a.price - b.price);

  return <ul>{sorted.map(p => <li>{p.name}</li>)}</ul>;
}
```

### Migration 2: Add useOptimistic

**Before:**

```typescript
function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const [isPending, setIsPending] = useState(false);

  const handleLike = async () => {
    setIsPending(true);
    try {
      const newLikes = await likePost(postId);
      setLikes(newLikes);
    } finally {
      setIsPending(false);
    }
  };

  return <button disabled={isPending}>{likes} Likes</button>;
}
```

**After:**

```typescript
function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(likes);

  const handleLike = async () => {
    setOptimisticLikes(likes + 1); // Instant UI update

    try {
      const newLikes = await likePost(postId);
      setLikes(newLikes);
    } catch (error) {
      handleError(error); // Reverts automatically
    }
  };

  return <button>{optimisticLikes} Likes</button>;
}
```

### Migration 3: use() for Context

**Before:**

```typescript
import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

function Button() {
  const theme = useContext(ThemeContext);
  return <button style={{ color: theme.primary }}>Click</button>;
}
```

**After:**

```typescript
import { use } from 'react';
import { ThemeContext } from './ThemeContext';

function Button() {
  const theme = use(ThemeContext);
  return <button style={{ color: theme.primary }}>Click</button>;
}
```

### Migration 4: Add Suspense

**Before:**

```typescript
function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  });

  if (isLoading) return <Spinner />;

  return <div>{data.total}</div>;
}
```

**After:**

```typescript
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

function Dashboard() {
  const { data } = useSuspenseQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  });

  return <div>{data.total}</div>; // No loading check!
}

// In parent
<Suspense fallback={<Spinner />}>
  <Dashboard />
</Suspense>
```

---

## Current Usage in Codebase

### useOptimistic

**Currently:** Not widely used (opportunity for enhancement).

**Candidates for useOptimistic:**

- `src/domains/admin/components/UserTable.tsx` - User status toggles
- `src/domains/auth/components/LoginForm.tsx` - Login feedback
- `src/components/shared/LikeButton.tsx` - Like/unlike actions

### use() Hook

**Currently:** Used for context in some components.

**Preferred Pattern:** Migrate all `useContext` to `use()`.

### Suspense

**Currently:** Used for route code splitting.

**Status:** ✅ Already implemented properly.

**Location:** `src/App.tsx` with lazy-loaded routes.

### useMemo/useCallback

**Status:** Audit in progress (removing unnecessary instances).

**Goal:** Keep only when required (context values, expensive calculations, useEffect deps).

---

## Best Practices

### Do's ✅

1. **Use useOptimistic** for instant UI updates
2. **Use use()** for context (modern pattern)
3. **Use Suspense** for code splitting
4. **Remove useMemo/useCallback** unless required
5. **Add comments** if keeping useMemo/useCallback
6. **Test optimistic updates** with error scenarios
7. **Provide fallback UI** for Suspense boundaries

### Don'ts ❌

1. **Don't use useOptimistic** for critical operations (login, delete account)
2. **Don't nest Suspense** unnecessarily (performance cost)
3. **Don't remove useMemo** for Context values
4. **Don't use useCallback** for simple event handlers
5. **Don't forget error handling** with optimistic updates
6. **Don't use Suspense** without fallback UI

---

## Performance Guidelines

### React Compiler Optimization

**What gets optimized:**

- Component re-renders
- Prop comparisons
- Inline function stability
- JSX element memoization

**What doesn't get optimized:**

- Context value identity
- Expensive calculations (>10ms)
- External library callbacks

### Measurement

**Before removing useMemo/useCallback:**

```typescript
import { Profiler } from 'react';

<Profiler id="MyComponent" onRender={(id, phase, actualDuration) => {
  console.log(`${id} (${phase}): ${actualDuration}ms`);
}}>
  <MyComponent />
</Profiler>
```

**Benchmark expensive calculations:**

```typescript
console.time('calculation');
const result = expensiveSort(data);
console.timeEnd('calculation'); // "calculation: 15ms"

// If >10ms consistently, keep useMemo with comment
```

---

## Testing React 19 Features

### Testing useOptimistic

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should show optimistic update immediately', async () => {
  render(<LikeButton postId="1" initialLikes={5} />);

  const button = screen.getByRole('button');
  expect(button).toHaveTextContent('5 Likes');

  await userEvent.click(button);

  // Optimistic update shows immediately
  expect(button).toHaveTextContent('6 Likes');

  // Wait for server confirmation
  await waitFor(() => {
    expect(screen.getByText('6 Likes')).toBeInTheDocument();
  });
});
```

### Testing use() Hook

```typescript
import { render, screen } from '@testing-library/react';
import { UserContext } from './UserContext';

it('should consume context with use()', () => {
  render(
    <UserContext.Provider value={{ name: 'John' }}>
      <UserProfile />
    </UserContext.Provider>
  );

  expect(screen.getByText('John')).toBeInTheDocument();
});
```

### Testing Suspense

```typescript
import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';

it('should show fallback while loading', async () => {
  render(
    <Suspense fallback={<div>Loading...</div>}>
      <AsyncComponent />
    </Suspense>
  );

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Loaded content')).toBeInTheDocument();
  });
});
```

---

## Troubleshooting

### Issue: useOptimistic not reverting on error

**Check:**

1. Is error being thrown/caught?
2. Is optimistic state managed correctly?
3. Is component re-rendering?

### Issue: Suspense not showing fallback

**Check:**

1. Is component actually suspending?
2. Is Suspense boundary wrapping suspended component?
3. Is fallback prop provided?

### Issue: use() not working

**Check:**

1. React version ≥19?
2. Is it a Context or Promise?
3. Is component inside Context Provider?

---

## Support

**Questions?**

- See: React 19 docs: <https://react.dev/>
- See: TanStack Query Suspense: <https://tanstack.com/query/latest/docs/framework/react/guides/suspense>

**Report Issues:**

- File bug with React version
- Include reproduction code
- Check browser console for errors

---

## Version History

- **v1.0** (Nov 10, 2025) - Initial documentation
  - Documented useOptimistic, use(), Suspense patterns
  - useMemo/useCallback removal guidelines
  - Migration examples and best practices
