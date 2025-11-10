# API Patterns Guide

**Author:** Code Audit Implementation  
**Date:** 2025-11-09  
**Version:** 1.0  
**Related:** CODE_AUDIT_FIX_PLAN.md Phase 2

## 📋 Table of Contents

1. [Overview](#overview)
2. [TanStack Query Pattern](#tanstack-query-pattern)
3. [Type-Only Imports](#type-only-imports)
4. [Async/Await Pattern](#asyncawait-pattern)
5. [API Response Types](#api-response-types)
6. [Creating API Hooks](#creating-api-hooks)
7. [Best Practices](#best-practices)
8. [Common Patterns](#common-patterns)
9. [Testing](#testing)
10. [Migration Guide](#migration-guide)

---

## Overview

### What This Guide Covers

This guide documents the standardized API patterns implemented in Phase 2 of the code audit:

- ✅ **TanStack Query** for all API calls (no raw axios/fetch)
- ✅ **Type-only imports** for better tree-shaking
- ✅ **Async/await** over .then()/.catch() chains
- ✅ **Standardized response types** (Single Source of Truth)
- ✅ **Hook-based architecture** for reusability
- ✅ **Error handling integration** with useStandardErrorHandler

### Architecture Overview

```
Component
    ↓
Custom Hook (useUserProfile)
    ↓
TanStack Query (useQuery/useMutation)
    ↓
API Helper (apiGet, apiPost, apiPut, apiDelete)
    ↓
API Client (axios instance)
    ↓
Backend API
```

---

## TanStack Query Pattern

### Why TanStack Query?

**Benefits:**
- ✅ Automatic caching and cache invalidation
- ✅ Built-in loading/error states
- ✅ Automatic refetching
- ✅ Optimistic updates
- ✅ Request deduplication
- ✅ Pagination support
- ✅ Infinite scroll support

### Basic Query Pattern

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/core/api/apiHelpers';
import type { UserProfile } from '@/types';

export function useUserProfile() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => apiGet<UserProfile>('/api/v1/users/profile/me'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

// Usage in component
function ProfilePage() {
  const { data: profile, isLoading, error } = useUserProfile();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage />;

  return <ProfileView profile={profile} />;
}
```

### Basic Mutation Pattern

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPut } from '@/core/api/apiHelpers';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
import type { UserProfile, UpdateProfileRequest } from '@/types';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const handleError = useStandardErrorHandler();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      apiPut<UserProfile>('/api/v1/users/profile/me', data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      toast.success('Profile updated successfully');
    },
    onError: handleError,
  });
}

// Usage in component
function ProfileEditForm() {
  const mutation = useUpdateProfile();

  const handleSubmit = async (data: FormData) => {
    try {
      await mutation.mutateAsync(data);
    } catch (error) {
      // Error already handled by mutation.onError
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

### Query Keys Strategy

**Hierarchical Structure:**

```typescript
// Define query keys in a central object
const profileKeys = {
  all: ['profile'] as const,
  lists: () => [...profileKeys.all, 'list'] as const,
  list: (filters: string) => [...profileKeys.lists(), { filters }] as const,
  details: () => [...profileKeys.all, 'detail'] as const,
  detail: (id: string) => [...profileKeys.details(), id] as const,
};

// Usage
useQuery({
  queryKey: profileKeys.detail('user-123'),
  queryFn: () => fetchProfile('user-123'),
});

// Invalidate all profile queries
queryClient.invalidateQueries({ queryKey: profileKeys.all });

// Invalidate specific detail
queryClient.invalidateQueries({ queryKey: profileKeys.detail('user-123') });
```

### Advanced: Optimistic Updates

```typescript
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const handleError = useStandardErrorHandler();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      apiPut<UserProfile>('/api/v1/users/profile/me', data),
    
    // Optimistic update
    onMutate: async (newProfile) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user', 'profile'] });
      
      // Snapshot previous value
      const previousProfile = queryClient.getQueryData<UserProfile>(['user', 'profile']);
      
      // Optimistically update to new value
      queryClient.setQueryData(['user', 'profile'], (old: UserProfile | undefined) => ({
        ...old!,
        ...newProfile,
      }));
      
      // Return snapshot for rollback
      return { previousProfile };
    },
    
    // Rollback on error
    onError: (error, variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['user', 'profile'], context.previousProfile);
      }
      handleError(error);
    },
    
    // Refetch on success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
}
```

### Pagination Pattern

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/core/api/apiHelpers';
import type { PaginatedResponse, User } from '@/types';

export function useUsers(page: number, pageSize: number) {
  return useQuery({
    queryKey: ['users', 'list', { page, pageSize }],
    queryFn: () =>
      apiGet<PaginatedResponse<User>>('/api/v1/users', {
        params: { page, page_size: pageSize },
      }),
    keepPreviousData: true, // Keep previous data while fetching new page
  });
}

// Usage
function UsersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useUsers(page, 20);

  return (
    <>
      {isLoading && <Skeleton />}
      {data && (
        <>
          <UserList users={data.items} />
          <Pagination
            current={page}
            total={data.total}
            onChange={setPage}
            loading={isFetching}
          />
        </>
      )}
    </>
  );
}
```

---

## Type-Only Imports

### Why Type-Only Imports?

**Benefits:**
- ✅ Better tree-shaking (smaller bundle size)
- ✅ Faster compilation
- ✅ Clear separation of types and values
- ✅ ESLint enforcement via `@typescript-eslint/consistent-type-imports`

### ESLint Configuration

```javascript
// eslint.config.js
'@typescript-eslint/consistent-type-imports': ['error', {
  prefer: 'type-imports',
  fixStyle: 'separate-type-imports',
  disallowTypeAnnotations: false,
}]
```

### Pattern Examples

```typescript
// ❌ WRONG: Importing types as values
import { User, Role, Permission } from '@/types';
import { ApiResponse } from '@/core/api/types';

// ✅ CORRECT: Type-only imports
import type { User, Role, Permission } from '@/types';
import type { ApiResponse } from '@/core/api/types';

// ✅ CORRECT: Mixed import (value + types)
import { useState } from 'react';
import type { ReactNode } from 'react';

// ✅ CORRECT: Inline type import
export function MyComponent(props: import('@/types').UserProps) {
  // ...
}
```

### Automatic Fixing

```bash
# Fix all type imports automatically
npm run lint -- --fix
```

### Common Scenarios

```typescript
// Function parameters
import type { User } from '@/types';

function processUser(user: User) {
  // user is a type, not a value
}

// Generic types
import type { ApiResponse } from '@/core/api/types';

const response: ApiResponse<User> = await apiGet('/users');

// Type assertions
import type { UserProfile } from '@/types';

const profile = data as UserProfile;

// Interface/Type definitions
import type { BaseUser } from '@/types';

interface ExtendedUser extends BaseUser {
  // ...
}
```

---

## Async/Await Pattern

### Why Async/Await?

**Benefits:**
- ✅ More readable than .then()/.catch() chains
- ✅ Better error handling with try/catch
- ✅ Easier debugging
- ✅ Consistent code style

### Migration Examples

```typescript
// ❌ BEFORE: Promise chains
apiClient.get('/users')
  .then(res => res.data)
  .then(users => setUsers(users))
  .catch(err => handleError(err));

// ✅ AFTER: Async/await
try {
  const res = await apiClient.get('/users');
  setUsers(res.data);
} catch (error) {
  handleError(error);
}
```

```typescript
// ❌ BEFORE: Nested promises
apiClient.get('/users')
  .then(users => {
    return apiClient.get(`/users/${users[0].id}/profile`);
  })
  .then(profile => {
    setProfile(profile);
  })
  .catch(handleError);

// ✅ AFTER: Async/await
try {
  const users = await apiClient.get('/users');
  const profile = await apiClient.get(`/users/${users[0].id}/profile`);
  setProfile(profile);
} catch (error) {
  handleError(error);
}
```

### Exception: React.lazy()

```typescript
// ✅ CORRECT: React.lazy uses promise chains (idiomatic)
const ProfilePage = lazy(() => 
  import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage }))
);
```

### Parallel Requests

```typescript
// ✅ CORRECT: Use Promise.all for parallel requests
const [users, roles, permissions] = await Promise.all([
  apiGet<User[]>('/users'),
  apiGet<Role[]>('/roles'),
  apiGet<Permission[]>('/permissions'),
]);

// ❌ WRONG: Sequential when they could be parallel
const users = await apiGet<User[]>('/users');
const roles = await apiGet<Role[]>('/roles'); // Waits for users
const permissions = await apiGet<Permission[]>('/permissions'); // Waits for roles
```

---

## API Response Types

### Standard Response Structure

```typescript
// src/core/api/types.ts

/**
 * Standard API response wrapper
 * Backend wraps all responses in this format
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  field_errors?: Record<string, string[]>;
  timestamp?: string;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Validation error response (422)
 */
export interface ValidationErrorResponse {
  success: false;
  error: string;
  field_errors: Record<string, string[]>;
}
```

### Usage with API Helpers

```typescript
import { apiGet, apiPost } from '@/core/api/apiHelpers';
import type { ApiResponse, User } from '@/types';

// API helper automatically unwraps ApiResponse<T> to T
const user = await apiGet<User>('/api/v1/users/123');
// user is User, not ApiResponse<User>

// Manual unwrapping if needed
const response = await axios.get<ApiResponse<User>>('/api/v1/users/123');
const user = response.data.data; // Unwrap manually
```

### Type Safety Example

```typescript
// Define response types matching backend exactly
export interface UserProfile {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  status: 'active' | 'inactive' | 'suspended';
  is_verified: boolean;
  roles: string[];
  created_at: string;
  last_login: string | null;
  updated_at: string | null;
}

// TypeScript ensures type safety
const profile = await apiGet<UserProfile>('/api/v1/users/profile/me');

// TypeScript error: Property 'invalid_field' does not exist
console.log(profile.invalid_field); // ❌ Compile error

// TypeScript autocomplete works
console.log(profile.email); // ✅ Autocomplete available
```

---

## Creating API Hooks

### Standard Hook Template

```typescript
// src/domains/[domain]/hooks/use[Entity].hooks.ts

import { useApiQuery, useApiMutation } from '@/shared/hooks/useApiModern';
import { apiGet, apiPost, apiPut, apiDelete } from '@/core/api/apiHelpers';
import { API_PREFIXES } from '@/services/api/common';
import type { Entity, CreateEntityRequest, UpdateEntityRequest } from '../types';

const API_PREFIX = API_PREFIXES.ENTITY;

// ========================================
// Query Keys (centralized)
// ========================================

const entityKeys = {
  all: ['entity'] as const,
  lists: () => [...entityKeys.all, 'list'] as const,
  list: (filters: string) => [...entityKeys.lists(), { filters }] as const,
  details: () => [...entityKeys.all, 'detail'] as const,
  detail: (id: string) => [...entityKeys.details(), id] as const,
};

// ========================================
// Query Hooks
// ========================================

/**
 * Fetch single entity
 * GET /api/v1/entities/:id
 */
export function useEntity(id: string, options?: { enabled?: boolean }) {
  return useApiQuery(
    entityKeys.detail(id),
    () => apiGet<Entity>(`${API_PREFIX}/${id}`),
    {
      enabled: options?.enabled !== false,
      staleTime: 5 * 60 * 1000,
      errorToast: true,
    }
  );
}

/**
 * Fetch entity list
 * GET /api/v1/entities
 */
export function useEntities(filters?: Record<string, unknown>) {
  return useApiQuery(
    entityKeys.list(JSON.stringify(filters)),
    () => apiGet<Entity[]>(API_PREFIX, { params: filters }),
    {
      staleTime: 1 * 60 * 1000,
      errorToast: true,
    }
  );
}

// ========================================
// Mutation Hooks
// ========================================

/**
 * Create new entity
 * POST /api/v1/entities
 */
export function useCreateEntity() {
  return useApiMutation(
    (data: CreateEntityRequest) => apiPost<Entity>(API_PREFIX, data),
    {
      successMessage: 'Entity created successfully',
      errorToast: true,
      queryKeyToUpdate: entityKeys.all,
    }
  );
}

/**
 * Update entity
 * PUT /api/v1/entities/:id
 */
export function useUpdateEntity() {
  return useApiMutation(
    ({ id, data }: { id: string; data: UpdateEntityRequest }) =>
      apiPut<Entity>(`${API_PREFIX}/${id}`, data),
    {
      successMessage: 'Entity updated successfully',
      errorToast: true,
      queryKeyToUpdate: entityKeys.all,
    }
  );
}

/**
 * Delete entity
 * DELETE /api/v1/entities/:id
 */
export function useDeleteEntity() {
  return useApiMutation(
    (id: string) => apiDelete(`${API_PREFIX}/${id}`),
    {
      successMessage: 'Entity deleted successfully',
      errorToast: true,
      queryKeyToUpdate: entityKeys.all,
    }
  );
}

// ========================================
// Combined Hook (Optional)
// ========================================

export function useEntityWithMutations(id: string) {
  const entityQuery = useEntity(id);
  const updateMutation = useUpdateEntity();
  const deleteMutation = useDeleteEntity();

  return {
    // Query state
    entity: entityQuery.data,
    isLoading: entityQuery.isLoading,
    error: entityQuery.error,
    refetch: entityQuery.refetch,
    
    // Mutations
    update: updateMutation.mutate,
    updateAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    
    delete: deleteMutation.mutate,
    deleteAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
```

### File Organization

```
src/domains/[domain]/
├── hooks/
│   ├── use[Entity].hooks.ts          ← Query/mutation hooks
│   └── __tests__/
│       └── use[Entity].hooks.test.ts ← Hook tests
├── types/
│   └── [entity].types.ts             ← Type definitions
├── services/
│   └── [entity]Service.ts            ← Business logic (if needed)
└── pages/
    ├── [Entity]Page.tsx              ← Uses hooks
    └── [Entity]EditPage.tsx          ← Uses hooks
```

---

## Best Practices

### ✅ DO: Use TanStack Query for All API Calls

```typescript
// ✅ CORRECT
const { data, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: () => apiGet('/users'),
});

// ❌ WRONG: Raw axios in component
useEffect(() => {
  axios.get('/users').then(setUsers);
}, []);
```

### ✅ DO: Use Type-Only Imports

```typescript
// ✅ CORRECT
import type { User } from '@/types';

// ❌ WRONG
import { User } from '@/types';
```

### ✅ DO: Use Async/Await

```typescript
// ✅ CORRECT
try {
  const user = await apiGet('/users/123');
} catch (error) {
  handleError(error);
}

// ❌ WRONG
apiGet('/users/123')
  .then(user => ...)
  .catch(error => ...);
```

### ✅ DO: Define Query Keys Centrally

```typescript
// ✅ CORRECT
const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => [...userKeys.all, id] as const,
};

// ❌ WRONG: Magic strings everywhere
useQuery({ queryKey: ['users', id], ... });
```

### ✅ DO: Handle Errors with Standard Handler

```typescript
// ✅ CORRECT
const handleError = useStandardErrorHandler();

useMutation({
  mutationFn: createUser,
  onError: handleError,
});

// ❌ WRONG: Manual error handling
onError: (error) => {
  toast.error(error.message);
}
```

### ✅ DO: Use Optimistic Updates for Better UX

```typescript
// ✅ CORRECT: Immediate feedback
onMutate: async (newData) => {
  await queryClient.cancelQueries({ queryKey: ['entity'] });
  const previous = queryClient.getQueryData(['entity']);
  queryClient.setQueryData(['entity'], newData);
  return { previous };
},
onError: (err, variables, context) => {
  queryClient.setQueryData(['entity'], context.previous);
},
```

---

## Common Patterns

### Pattern 1: List + Create + Update + Delete

```typescript
function EntityManagementPage() {
  // List
  const { data: entities, isLoading } = useEntities();
  
  // Create
  const createMutation = useCreateEntity();
  
  // Update
  const updateMutation = useUpdateEntity();
  
  // Delete
  const deleteMutation = useDeleteEntity();

  const handleCreate = async (data: CreateRequest) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (id: string, data: UpdateRequest) => {
    await updateMutation.mutateAsync({ id, data });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) return <Skeleton />;

  return (
    <>
      <EntityList
        entities={entities}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
      <CreateEntityButton onClick={() => handleCreate(formData)} />
    </>
  );
}
```

### Pattern 2: Master-Detail

```typescript
function EntityDetailPage({ id }: { id: string }) {
  // Fetch entity
  const { data: entity, isLoading } = useEntity(id);
  
  // Fetch related data (only if entity exists)
  const { data: relatedItems } = useRelatedItems(entity?.id, {
    enabled: !!entity,
  });

  if (isLoading) return <Skeleton />;
  if (!entity) return <NotFound />;

  return (
    <>
      <EntityView entity={entity} />
      <RelatedItemsList items={relatedItems} />
    </>
  );
}
```

### Pattern 3: Search/Filter

```typescript
function EntitySearchPage() {
  const [filters, setFilters] = useState({ search: '', status: 'all' });
  
  const { data, isLoading, isFetching } = useEntities(filters);

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
    // Query automatically refetches with new filters
  };

  return (
    <>
      <SearchInput onChange={handleSearchChange} />
      {isFetching && <LoadingOverlay />}
      <EntityList entities={data?.items} />
    </>
  );
}
```

---

## Testing

### Testing Query Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserProfile } from '../useProfile.hooks';
import * as apiHelpers from '@/core/api/apiHelpers';

vi.mock('@/core/api/apiHelpers');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

it('should fetch user profile', async () => {
  const mockProfile = { user_id: '123', email: 'test@example.com' };
  vi.mocked(apiHelpers.apiGet).mockResolvedValue(mockProfile);

  const { result } = renderHook(() => useUserProfile(), {
    wrapper: createWrapper(),
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.data).toEqual(mockProfile);
  expect(apiHelpers.apiGet).toHaveBeenCalledWith('/api/v1/users/profile/me');
});
```

### Testing Mutation Hooks

```typescript
it('should update profile and invalidate cache', async () => {
  const mockUpdatedProfile = { user_id: '123', first_name: 'Updated' };
  vi.mocked(apiHelpers.apiPut).mockResolvedValue(mockUpdatedProfile);

  const { result } = renderHook(() => useUpdateProfile(), {
    wrapper: createWrapper(),
  });

  result.current.mutate({ first_name: 'Updated' });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.data).toEqual(mockUpdatedProfile);
  expect(apiHelpers.apiPut).toHaveBeenCalledWith(
    '/api/v1/users/profile/me',
    { first_name: 'Updated' }
  );
});
```

---

## Migration Guide

### Step 1: Identify API Calls

Search for:
- `axios.get`
- `axios.post`
- `apiClient.get`
- `.then()` chains
- `fetch()`

### Step 2: Create Hook

Create new hook file following template above.

### Step 3: Replace in Components

```typescript
// BEFORE
function MyComponent() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    apiClient.get('/data')
      .then(res => setData(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <Error />;
  return <View data={data} />;
}

// AFTER
function MyComponent() {
  const { data, isLoading, error } = useData();

  if (isLoading) return <Spinner />;
  if (error) return <Error />;
  return <View data={data} />;
}
```

### Step 4: Test

Run tests and verify:
- Data fetches correctly
- Loading states work
- Errors handled properly
- Cache invalidation works

---

## Related Documentation

- [ERROR_HANDLING.md](./ERROR_HANDLING.md) - Error handling with API calls
- [REACT_19_PATTERNS.md](./REACT_19_PATTERNS.md) - React 19 best practices
- [TanStack Query Docs](https://tanstack.com/query/latest) - Official documentation

---

**Last Updated:** 2025-11-09  
**Version:** 1.0  
**Maintainer:** Development Team
