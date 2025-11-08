# 🔧 API Migration Guide - Step by Step

**Status**: Ready for implementation  
**Target**: Migrate all API calls to useApiModern pattern

---

## 📋 Migration Checklist

### Service Files (Currently ~18 files with direct apiClient)

#### Auth Services
- [ ] `src/domains/auth/services/authService.ts` - 15 methods
- [ ] `src/domains/auth/services/tokenService.ts` - 3 methods
- [ ] `src/domains/auth/services/secureAuthService.ts` - 3 methods

#### Admin Services
- [ ] `src/domains/admin/services/adminService.ts` - 10 methods
- [ ] `src/domains/admin/services/adminRoleService.ts` - 8 methods
- [ ] `src/domains/admin/services/adminAuditService.ts` - 2 methods
- [ ] `src/domains/admin/services/adminExportService.ts` - 3 methods
- [ ] `src/domains/admin/services/adminAnalyticsService.ts` - 1 method
- [ ] `src/domains/admin/services/adminApprovalService.ts` - 2 methods

#### User Services
- [ ] `src/domains/users/services/userService.ts` - 8 methods
- [ ] `src/domains/profile/services/profileService.ts` - 2 methods

---

## 🎯 Migration Pattern

### BEFORE: Direct apiClient usage

```typescript
// ❌ OLD PATTERN - Service file
import { apiClient } from '@/services/api/apiClient';

export async function getUsers(filters?: UserFilters): Promise<User[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  
  const url = `/api/v1/users?${params.toString()}`;
  const response = await apiClient.get<{ success: boolean; data: User[] }>(url);
  return response.data.data;
}

// ❌ OLD PATTERN - Component using service
import { getUsers } from '@/services/userService';

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getUsers({ status: 'active' });
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;
  return <div>{users.map(u => <UserCard key={u.id} user={u} />)}</div>;
}
```

### AFTER: useApiModern pattern

```typescript
// ✅ NEW PATTERN - Hook file (create new file)
// src/domains/users/hooks/useUsers.hooks.ts
import { useApiQuery, useApiMutation } from '@/shared/hooks/useApiModern';
import { apiGet, apiPost, buildQueryString } from '@/core/api/apiHelpers';
import type { User, UserFilters } from '../types';

/**
 * Get list of users with optional filters
 */
export function useUsers(filters?: UserFilters) {
  return useApiQuery(
    ['users', filters],
    () => {
      const query = filters ? `?${buildQueryString(filters)}` : '';
      return apiGet<User[]>(`/api/v1/users${query}`);
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      errorToast: true
    }
  );
}

/**
 * Get single user by ID
 */
export function useUser(userId: string) {
  return useApiQuery(
    ['user', userId],
    () => apiGet<User>(`/api/v1/users/${userId}`),
    {
      enabled: !!userId,
      errorToast: true
    }
  );
}

/**
 * Create new user (mutation)
 */
export function useCreateUser() {
  return useApiMutation(
    (data: CreateUserRequest) => apiPost<User>('/api/v1/users', data),
    {
      successMessage: 'User created successfully',
      queryKeyToUpdate: ['users']
    }
  );
}

// ✅ NEW PATTERN - Component using hooks
import { useUsers, useCreateUser } from '@/domains/users/hooks/useUsers.hooks';

function UserList() {
  const { data: users, isLoading, error } = useUsers({ status: 'active' });
  const createUser = useCreateUser();

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  if (!users) return null;

  return (
    <div>
      {users.map(u => <UserCard key={u.id} user={u} />)}
      <CreateUserButton onClick={() => createUser.mutate({ name: 'John' })} />
    </div>
  );
}
```

---

## 📝 Step-by-Step Migration Process

### Step 1: Create Hook File

For each service file, create a corresponding hook file:

```bash
# Example structure
src/domains/
  auth/
    hooks/
      useAuth.hooks.ts          # ✅ Create this
    services/
      authService.ts            # ⚠️ Will deprecate
  users/
    hooks/
      useUsers.hooks.ts         # ✅ Create this
    services/
      userService.ts            # ⚠️ Will deprecate
```

### Step 2: Convert Service Functions to Hooks

#### For GET requests → useApiQuery

```typescript
// BEFORE (service)
export async function getProfile(): Promise<UserProfile> {
  const response = await apiClient.get('/api/v1/profile/me');
  return response.data.data;
}

// AFTER (hook)
export function useProfile() {
  return useApiQuery(
    ['profile'],
    () => apiGet<UserProfile>('/api/v1/profile/me')
  );
}
```

#### For POST/PUT/DELETE → useApiMutation

```typescript
// BEFORE (service)
export async function updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  const response = await apiClient.put('/api/v1/profile/me', data);
  return response.data.data;
}

// AFTER (hook)
export function useUpdateProfile() {
  return useApiMutation(
    (data: UpdateProfileRequest) => apiPut<UserProfile>('/api/v1/profile/me', data),
    {
      successMessage: 'Profile updated',
      queryKeyToUpdate: ['profile']
    }
  );
}
```

### Step 3: Update Component Imports

```typescript
// BEFORE
import { getProfile, updateProfile } from '@/services/profileService';
import { useState, useEffect } from 'react';

// AFTER
import { useProfile, useUpdateProfile } from '@/domains/profile/hooks/useProfile.hooks';
// Remove useState/useEffect - not needed anymore!
```

### Step 4: Update Component Logic

```typescript
// BEFORE
function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleUpdate = async (data: UpdateProfileRequest) => {
    try {
      const updated = await updateProfile(data);
      setProfile(updated);
    } catch (err) {
      alert(err.message);
    }
  };
}

// AFTER
function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const handleUpdate = (data: UpdateProfileRequest) => {
    updateProfile.mutate(data);
  };
}
```

### Step 5: Handle Special Cases

#### Case 1: Dependent Queries

```typescript
// User details depends on userId from route
function UserDetailPage() {
  const { userId } = useParams();
  const { data: user } = useUser(userId!);
  const { data: roles } = useUserRoles(userId!, { enabled: !!userId });
}
```

#### Case 2: Optimistic Updates

```typescript
export function useToggleUserStatus() {
  return useApiMutation(
    ({ userId, status }: { userId: string; status: boolean }) =>
      apiPut(`/api/v1/users/${userId}/status`, { status }),
    {
      // Optimistic update - instant UI feedback
      optimisticUpdate: (currentData: User[], variables) => {
        return currentData?.map(user =>
          user.id === variables.userId
            ? { ...user, active: variables.status }
            : user
        );
      },
      queryKeyToUpdate: ['users']
    }
  );
}
```

#### Case 3: Manual Error Handling

```typescript
function ProfilePage() {
  const updateProfile = useUpdateProfile();

  const handleUpdate = async (data: UpdateProfileRequest) => {
    try {
      await updateProfile.mutateAsync(data);
      navigate('/profile/success');
    } catch (error) {
      // Custom error handling if needed
      if (error instanceof APIError && error.responseStatus === 413) {
        toast.error('File too large');
      }
    }
  };
}
```

---

## ⚠️ Common Pitfalls

### 1. Don't Mix Patterns

```typescript
// ❌ BAD - Mixing service and hooks
function Component() {
  const { data } = useProfile();
  
  const handleUpdate = async () => {
    await updateProfile(data); // ❌ Using service function!
  };
}

// ✅ GOOD - Use hooks consistently
function Component() {
  const { data } = useProfile();
  const updateProfile = useUpdateProfile();
  
  const handleUpdate = () => {
    updateProfile.mutate(data); // ✅ Using hook
  };
}
```

### 2. Don't Forget Query Keys

```typescript
// ❌ BAD - Generic query key
useApiQuery(['data'], () => getUsers());

// ✅ GOOD - Specific query key with parameters
useApiQuery(['users', filters], () => getUsers(filters));
```

### 3. Don't Disable Error Toasts Without Reason

```typescript
// ❌ BAD - Silently fail
useApiQuery(['users'], getUsers, { errorToast: false });

// ✅ GOOD - Handle error explicitly
useApiQuery(['users'], getUsers, {
  errorToast: false,
  onError: (error) => {
    // Custom handling
    showCustomNotification(error.message);
  }
});
```

---

## 🧪 Testing Checklist

After migration, verify:

- [ ] All API calls still work
- [ ] Loading states display correctly
- [ ] Error messages show properly
- [ ] Success messages appear
- [ ] Data refreshes on mutation
- [ ] Optimistic updates work
- [ ] No console errors
- [ ] TypeScript compiles
- [ ] ESLint passes

---

## 📊 Progress Tracking

Track your migration progress:

```typescript
// Migration Status
Total Service Functions: ~50
✅ Migrated: 0
⏳ In Progress: 0
❌ Remaining: 50

// By Domain
Auth: 0/15
Admin: 0/24
Users: 0/10
Profile: 0/2
```

---

## 🎉 Benefits After Migration

1. **Automatic Error Handling** - No more try-catch boilerplate
2. **Automatic Loading States** - No more useState for loading
3. **Automatic Caching** - Smart data caching with React Query
4. **Automatic Refetching** - Data stays fresh automatically
5. **Optimistic Updates** - Instant UI feedback
6. **DevTools Support** - React Query DevTools for debugging
7. **Consistent Patterns** - One way to do API calls

---

**Next**: Start with `src/domains/auth/services/authService.ts` as it's most commonly used
