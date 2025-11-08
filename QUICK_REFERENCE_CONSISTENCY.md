# Quick Reference: Code Consistency Fixes

**TL;DR Version for Developers**

---

## 🚨 Critical Issues to Fix NOW

### 1. Stop Using console.log/warn/error

**❌ DON'T:**
```typescript
console.error('Failed to load user:', error);
console.warn('Token expired');
console.log('User created successfully');
```

**✅ DO:**
```typescript
import { logger } from '@/core/logging';
import { toast } from '@/shared/hooks/useToast';

// For errors
logger().error('Failed to load user', error);
toast.error(error, 'Failed to load user');

// For warnings
logger().warn('Token expired', { userId });

// For success
toast.success('User created successfully');
logger().info('User created', { userId });
```

---

### 2. Stop Duplicating Error Utilities

**❌ DON'T:**
```typescript
// In your domain file
function extractErrorMessage(error: unknown) {
  // Custom implementation
}
```

**✅ DO:**
```typescript
import { extractErrorMessage, extractErrorDetails } from '@/core/error';

const message = extractErrorMessage(error);
const details = extractErrorDetails(error);
```

---

### 3. Use TanStack Query for Data Fetching

**❌ DON'T:**
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  service.getData()
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);
```

**✅ DO:**
```typescript
import { useApiQuery } from '@/shared/hooks/useApiModern';

const { data, isLoading, error } = useApiQuery(
  ['data', id],
  () => service.getData(id),
  { errorToast: true }
);
```

---

### 4. Use apiClient, Not fetch()

**❌ DON'T:**
```typescript
const response = await fetch('/api/users', {
  headers: { Authorization: `Bearer ${token}` }
});
```

**✅ DO:**
```typescript
import { apiClient } from '@/services/api/apiClient';

const response = await apiClient.get('/api/v1/users');
// Token, retry, CSRF all handled automatically
```

---

## 📖 Pattern Reference

### Service Functions

**Pattern:**
```typescript
export const functionName = async (params): Promise<ResponseType> => {
  const response = await apiClient.METHOD<Type>(endpoint, data?, config?);
  return unwrapResponse<Type>(response.data);
};
```

**Example:**
```typescript
export const createUser = async (data: CreateUserRequest): Promise<User> => {
  const response = await apiClient.post<CreateUserResponse>(
    '/api/v1/admin/users',
    data
  );
  return unwrapResponse<User>(response.data);
};
```

---

### Query Hooks

**Pattern:**
```typescript
export function useResourceName(id: string) {
  return useApiQuery(
    ['resource', id],
    () => service.getResource(id),
    { errorToast: true, staleTime: 5 * 60 * 1000 }
  );
}
```

**Example:**
```typescript
export function useUser(userId: string) {
  return useApiQuery(
    ['users', userId],
    () => adminService.getUser(userId),
    { errorToast: true, staleTime: 5 * 60 * 1000 }
  );
}
```

---

### Mutation Hooks

**Pattern:**
```typescript
export function useResourceMutation() {
  const queryClient = useQueryClient();
  
  return useApiMutation(
    (data: RequestType) => service.mutate(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['resource'] });
      },
      successMessage: 'Operation completed successfully',
      errorToast: true,
    }
  );
}
```

**Example:**
```typescript
export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useApiMutation(
    ({ userId, data }: { userId: string; data: UpdateUserRequest }) =>
      adminService.updateUser(userId, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
      },
      successMessage: 'User updated successfully',
      errorToast: true,
    }
  );
}
```

---

### Error Handling in Components

**Pattern:**
```typescript
function MyComponent() {
  const mutation = useResourceMutation();
  
  const handleSubmit = (data) => {
    mutation.mutate(data, {
      onSuccess: () => {
        // Handle success
      },
      onError: (error) => {
        // Error already shown via toast (errorToast: true)
        // Additional error handling if needed
      }
    });
  };
  
  return (/* ... */);
}
```

---

## 🔍 Code Review Checklist

When reviewing code, check for:

- [ ] No `console.log/warn/error` (use `logger()` and `toast`)
- [ ] No duplicate error utilities (import from `@/core/error`)
- [ ] Services use `apiClient` (not `axios` or `fetch`)
- [ ] Hooks use TanStack Query (not manual state management)
- [ ] Error messages imported from `@/core/error/messages`
- [ ] Toast notifications for user feedback
- [ ] Query keys follow pattern `['resource', id]`
- [ ] Mutations invalidate related queries

---

## 🚀 Migration Guide

### Migrating a Manual Hook to TanStack Query

**Step 1:** Identify the pattern
```typescript
// OLD: Manual state management
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

**Step 2:** Replace with TanStack Query
```typescript
// NEW: TanStack Query
const { isLoading, error } = useApiQuery(...);
```

**Step 3:** Update return value
```typescript
// OLD
return { loading, error, data, refetch };

// NEW (TanStack Query provides these)
return query; // Contains { data, isLoading, error, refetch, ... }
```

---

### Migrating console.log to logger + toast

**Step 1:** Import utilities
```typescript
import { logger } from '@/core/logging';
import { toast } from '@/shared/hooks/useToast';
```

**Step 2:** Replace console calls
```typescript
// OLD
console.error('Error:', error);
console.warn('Warning:', message);
console.log('Success:', data);

// NEW
logger().error('Error', error instanceof Error ? error : undefined);
toast.error(error);

logger().warn('Warning', { message });

logger().info('Success', { data });
toast.success('Operation completed successfully');
```

---

## 📚 Where to Find Things

### Error Handling
- **Core utilities:** `src/core/error/`
- **Error types:** `src/core/error/types.ts`
- **Error messages:** `src/core/error/messages.ts` (after refactoring)
- **Error handler:** `src/core/error/errorHandler.ts`

### API Calls
- **API Client:** `src/services/api/apiClient.ts`
- **Common utilities:** `src/services/api/common.ts`
- **Query hooks:** `src/shared/hooks/useApiModern.ts`
- **Service functions:** `src/domains/*/services/*.ts`

### Logging & Toasts
- **Logger:** `src/core/logging/`
- **Toast hook:** `src/shared/hooks/useToast.ts`
- **Notification store:** `src/store/notificationStore.ts`

---

## 🆘 Common Mistakes

### Mistake 1: Using wrong import
```typescript
// ❌ Wrong
import { useApiQuery } from '@/shared/hooks/useApi';

// ✅ Correct
import { useApiQuery } from '@/shared/hooks/useApiModern';
```

### Mistake 2: Forgetting to unwrap response
```typescript
// ❌ Wrong - returns { success, data, message }
return response.data;

// ✅ Correct - returns just the data
return unwrapResponse(response.data);
```

### Mistake 3: Not invalidating queries after mutation
```typescript
// ❌ Wrong - stale data
const mutation = useApiMutation(service.update);

// ✅ Correct - fresh data
const mutation = useApiMutation(service.update, {
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resource'] });
  }
});
```

### Mistake 4: Manual error handling when not needed
```typescript
// ❌ Wrong - duplicate error handling
const query = useApiQuery(
  ['users'],
  () => service.getUsers(),
  { errorToast: true } // Already shows error
);

if (query.error) {
  toast.error(query.error); // Duplicate!
}

// ✅ Correct - error already handled
const query = useApiQuery(
  ['users'],
  () => service.getUsers(),
  { errorToast: true }
);
// No need for manual error display
```

---

## 🎯 Quick Wins

Start with these easy fixes:

1. **Replace console.log in your current file** (5 minutes)
2. **Import error utilities from core** (2 minutes)
3. **Use toast for success messages** (3 minutes)
4. **Check your imports use useApiModern** (1 minute)

Total time: **~10 minutes** to improve consistency significantly!

---

## 📞 Questions?

- **Detailed patterns:** See `ERROR_HANDLING_AUDIT.md`
- **API best practices:** See `API_CALLS_AUDIT.md`
- **Implementation steps:** See `IMPLEMENTATION_PLAN.md`
- **Executive summary:** See `AUDIT_SUMMARY.md`

---

**Last Updated:** January 29, 2025  
**Status:** ✅ Ready for use
