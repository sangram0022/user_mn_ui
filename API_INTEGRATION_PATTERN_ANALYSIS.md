# API Integration Pattern Analysis & Standardization

## 🎯 Executive Summary

**Current State**: Inconsistent API integration patterns across domains
**Goal**: Establish single source of truth for all backend API integrations
**Impact**: Simplified maintenance, reduced bugs, consistent error handling

---

## 📊 Current Architecture

### Standard Flow (5 Layers)
```
┌─────────────────────────────────────────────────────────────┐
│  1. UI Page Component (e.g., UsersPage.tsx)                │
│     - User interactions                                     │
│     - Loading/Error UI states                              │
│     - Data display                                          │
└──────────────────┬──────────────────────────────────────────┘
                   │ uses custom hooks
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  2. React Query Hooks (e.g., useAdminUsers.hooks.ts)      │
│     - useQuery for reads (GET)                             │
│     - useMutation for writes (POST/PUT/DELETE)             │
│     - Cache management (queryKeys, invalidation)           │
│     - Optimistic updates                                   │
└──────────────────┬──────────────────────────────────────────┘
                   │ calls service functions
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Domain Service (e.g., adminService.ts)                 │
│     - API endpoint calls                                   │
│     - Request/response handling                            │
│     - Type transformations                                 │
└──────────────────┬──────────────────────────────────────────┘
                   │ uses apiClient
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  4. API Client (apiClient.ts)                              │
│     - Axios instance configuration                         │
│     - Request/Response interceptors                        │
│     - Token injection                                      │
│     - Retry logic with exponential backoff                 │
│     - CSRF protection                                      │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP call
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Backend API (FastAPI Python)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Pattern Analysis by Domain

### ✅ Admin Domain (CONSISTENT - Reference Implementation)

**File**: `src/domains/admin/services/adminService.ts`

**Pattern**:
```typescript
// 1. Imports from common utilities
import { apiClient } from '../../../services/api/apiClient';
import { API_PREFIXES, unwrapResponse } from '../../../services/api/common';

// 2. Use centralized API prefix
const API_PREFIX = API_PREFIXES.ADMIN;

// 3. List operations (GET) - return raw response.data
export const listUsers = async (filters?: ListUsersFilters): Promise<ListUsersResponse> => {
  const response = await apiClient.get<ListUsersResponse>(`${API_PREFIX}/users`);
  return response.data; // Backend already wrapped properly
};

// 4. Create operations (POST) - use unwrapResponse
export const createUser = async (data: CreateUserRequest): Promise<CreateUserResponse> => {
  const response = await apiClient.post<CreateUserResponse>(`${API_PREFIX}/users`, data);
  return unwrapResponse<CreateUserResponse>(response.data);
};

// 5. Update operations (PUT) - use unwrapResponse
export const updateUser = async (id: string, data: UpdateUserRequest): Promise<UpdateUserResponse> => {
  const response = await apiClient.put<UpdateUserResponse>(`${API_PREFIX}/users/${id}`, data);
  return unwrapResponse<UpdateUserResponse>(response.data);
};

// 6. Delete operations (DELETE) - use unwrapResponse
export const deleteUser = async (id: string, options?: DeleteUserOptions): Promise<DeleteUserResponse> => {
  const response = await apiClient.delete<DeleteUserResponse>(`${API_PREFIX}/users/${id}`, { data: options });
  return unwrapResponse<DeleteUserResponse>(response.data);
};
```

**Key Characteristics**:
- ✅ Uses `API_PREFIXES` constant
- ✅ Uses `unwrapResponse` for mutations (POST/PUT/DELETE)
- ✅ Returns `response.data` directly for list operations (GET with pagination)
- ✅ Comprehensive TypeScript types
- ✅ JSDoc comments for all functions

---

### ✅ Auth Domain (MOSTLY CONSISTENT)

**File**: `src/domains/auth/services/authService.ts`

**Pattern**:
```typescript
import { apiClient } from '../../../services/api/apiClient';
import { API_PREFIXES, unwrapResponse } from '../../../services/api/common';

const API_PREFIX = API_PREFIXES.AUTH;

// Uses unwrapResponse for login/register
export const login = async (data: LoginRequest): Promise<LoginResponseData> => {
  const response = await apiClient.post<LoginResponse>(`${API_PREFIX}/login`, data);
  return unwrapResponse<LoginResponseData>(response.data);
};

// Returns raw response.data for logout (not wrapped by backend)
export const logout = async (): Promise<LogoutResponse> => {
  const response = await apiClient.post<LogoutResponse>(`${API_PREFIX}/logout`);
  return response.data;
};
```

**Status**: ✅ Consistent with admin pattern

---

### ⚠️ Profile Domain (INCONSISTENT - Needs Fix)

**File**: `src/domains/profile/services/profileService.ts`

**Problem**:
```typescript
// ❌ Does NOT import unwrapResponse
import { apiClient } from '../../../services/api/apiClient';
import { API_PREFIXES } from '../../../services/api/common';

// ❌ Always returns raw response.data (should use unwrapResponse for PUT)
export const getProfile = async (): Promise<GetProfileResponse> => {
  const response = await apiClient.get<GetProfileResponse>(`${API_PREFIX}/me`);
  return response.data; // ✅ OK for GET
};

export const updateProfile = async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
  const response = await apiClient.put<UpdateProfileResponse>(`${API_PREFIX}/me`, data);
  return response.data; // ❌ Should use unwrapResponse for PUT
};
```

**Required Fix**:
```typescript
import { API_PREFIXES, unwrapResponse } from '../../../services/api/common'; // Add unwrapResponse

export const updateProfile = async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
  const response = await apiClient.put<UpdateProfileResponse>(`${API_PREFIX}/me`, data);
  return unwrapResponse<UpdateProfileResponse>(response.data); // ✅ Fixed
};
```

---

### ⚠️ Token Service (SPECIAL CASE - OK)

**File**: `src/domains/auth/services/tokenService.ts`

**Pattern**: Always returns `response.data` (no unwrapping needed)

**Status**: ✅ OK - Token refresh responses are not wrapped by backend

---

## 🔧 Common Utilities (Single Source of Truth)

### API Client (`src/services/api/apiClient.ts`)

**Features**:
- ✅ Axios instance with base URL configuration
- ✅ Request interceptor: Token injection
- ✅ Response interceptor: Token refresh on 401
- ✅ Retry logic with exponential backoff (1s, 2s, 4s, 8s)
- ✅ CSRF token support
- ✅ Error logging

**Usage**: Import `apiClient` for ALL HTTP calls

---

### Response Unwrapper (`src/services/api/common.ts`)

**Purpose**: Extract data from backend's wrapped response format

**Backend Response Format**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2025-01-10T12:00:00Z"
}
```

**Function**:
```typescript
export function unwrapResponse<T>(response: unknown): T {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response format');
  }

  const apiResponse = response as ApiResponse<T>;

  if (!apiResponse.success || apiResponse.error) {
    throw new Error(apiResponse.error || 'Request failed');
  }

  return apiResponse.data;
}
```

**When to Use**:
- ✅ **POST** (create operations) - Backend wraps response
- ✅ **PUT** (update operations) - Backend wraps response
- ✅ **DELETE** (delete operations) - Backend wraps response
- ❌ **GET with pagination** (list operations) - Backend returns data directly
- ❌ **GET single item** (if backend doesn't wrap) - Depends on endpoint

---

### API Prefixes (`src/services/api/common.ts`)

**Constants**:
```typescript
export const API_PREFIXES = {
  AUTH: '/api/v1/auth',
  ADMIN: '/api/v1/admin',
  ADMIN_USERS: '/api/v1/admin/users',
  ADMIN_RBAC: '/api/v1/admin/rbac',
  ADMIN_AUDIT: '/api/v1/admin/audit-logs',
  ADMIN_EXPORT: '/api/v1/admin/export',
  PROFILE: '/api/v1/users/profile',
} as const;
```

**Usage**: ✅ ALL services MUST use these constants (no hardcoded strings)

---

## 🎯 Standard Pattern (Decision Tree)

### When Building a New Service Function

```
┌─────────────────────────────────────────────────────────┐
│  Is it a GET request with pagination/list?             │
└─────────────┬───────────────────────────────────────────┘
              │
        ┌─────┴─────┐
        │           │
       YES         NO
        │           │
        │           ▼
        │    ┌──────────────────────────────────────┐
        │    │ Is it POST/PUT/DELETE mutation?     │
        │    └──────┬───────────────────────────────┘
        │           │
        │      ┌────┴────┐
        │      │         │
        │     YES       NO
        │      │         │
        ▼      ▼         ▼
   return    return    Check backend
   response  unwrapResponse  response format
   .data     (response.data)  and decide
```

### Standard Template

```typescript
// ============================================================================
// Domain Service Template
// ============================================================================

import { apiClient } from '../../../services/api/apiClient';
import { API_PREFIXES, unwrapResponse } from '../../../services/api/common';
import type { /* Import types */ } from '../types';

const API_PREFIX = API_PREFIXES.YOUR_DOMAIN;

// ----------------------------------------------------------------------------
// READ Operations (GET)
// ----------------------------------------------------------------------------

/**
 * GET /api/v1/domain/items
 * List items with pagination
 */
export const listItems = async (filters?: Filters): Promise<ListResponse> => {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const queryString = queryParams.toString();
  const url = queryString ? `${API_PREFIX}/items?${queryString}` : `${API_PREFIX}/items`;
  
  const response = await apiClient.get<ListResponse>(url);
  return response.data; // ✅ Backend returns data directly
};

/**
 * GET /api/v1/domain/items/:id
 * Get single item by ID
 */
export const getItem = async (id: string): Promise<ItemResponse> => {
  const response = await apiClient.get<ItemResponse>(`${API_PREFIX}/items/${id}`);
  return unwrapResponse<ItemResponse>(response.data); // ✅ Backend wraps response
};

// ----------------------------------------------------------------------------
// CREATE Operations (POST)
// ----------------------------------------------------------------------------

/**
 * POST /api/v1/domain/items
 * Create new item
 */
export const createItem = async (data: CreateRequest): Promise<CreateResponse> => {
  const response = await apiClient.post<CreateResponse>(`${API_PREFIX}/items`, data);
  return unwrapResponse<CreateResponse>(response.data); // ✅ Use unwrapResponse
};

// ----------------------------------------------------------------------------
// UPDATE Operations (PUT)
// ----------------------------------------------------------------------------

/**
 * PUT /api/v1/domain/items/:id
 * Update existing item
 */
export const updateItem = async (id: string, data: UpdateRequest): Promise<UpdateResponse> => {
  const response = await apiClient.put<UpdateResponse>(`${API_PREFIX}/items/${id}`, data);
  return unwrapResponse<UpdateResponse>(response.data); // ✅ Use unwrapResponse
};

// ----------------------------------------------------------------------------
// DELETE Operations (DELETE)
// ----------------------------------------------------------------------------

/**
 * DELETE /api/v1/domain/items/:id
 * Delete item by ID
 */
export const deleteItem = async (id: string, options?: DeleteOptions): Promise<DeleteResponse> => {
  const response = await apiClient.delete<DeleteResponse>(
    `${API_PREFIX}/items/${id}`,
    { data: options }
  );
  return unwrapResponse<DeleteResponse>(response.data); // ✅ Use unwrapResponse
};

// ----------------------------------------------------------------------------
// Export
// ----------------------------------------------------------------------------

const yourDomainService = {
  listItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
};

export default yourDomainService;
```

---

## 📋 Inconsistencies Found & Fixes Required

### 1. ⚠️ Profile Service - Missing unwrapResponse

**File**: `src/domains/profile/services/profileService.ts`

**Issue**: `updateProfile` returns raw `response.data` instead of using `unwrapResponse`

**Fix**: Add `unwrapResponse` import and use it for PUT operation

**Priority**: 🔴 HIGH (breaks error handling)

---

### 2. ⚠️ Potential Issue in Export Services

**File**: `src/domains/admin/services/adminExportService.ts` (lines 63, 89, 115)

**Found**: Multiple `return response.data;` calls

**Investigation Needed**: Check if these endpoints return wrapped or unwrapped responses

**Priority**: 🟡 MEDIUM

---

### 3. ⚠️ Audit Service Response Handling

**File**: `src/domains/admin/services/adminAuditService.ts` (line 143)

**Found**: `return response.data;` 

**Investigation Needed**: Verify response format

**Priority**: 🟡 MEDIUM

---

## 🚀 Action Plan

### Phase 1: Fix Critical Issues (IMMEDIATE)
1. ✅ Fix `profileService.ts` - Add `unwrapResponse` to `updateProfile`
2. ✅ Build and test profile update flow

### Phase 2: Verify All Services (TODAY)
1. ⚠️ Check all services in `src/domains/*/services/`
2. ⚠️ Verify response handling matches backend format
3. ⚠️ Document any special cases

### Phase 3: Extract Common Utilities (NEXT)
1. ⚠️ Create standard query configurations helper
2. ⚠️ Create standard mutation patterns helper
3. ⚠️ Standardize error handling across all hooks

### Phase 4: Documentation (ONGOING)
1. ⚠️ Update ARCHITECTURE.md with standard pattern
2. ⚠️ Create service template file for new domains
3. ⚠️ Add JSDoc examples to common.ts

---

## 📚 Reference Files

### Core Files (Single Source of Truth)
- `src/services/api/apiClient.ts` - HTTP client with interceptors
- `src/services/api/common.ts` - Response unwrapper, API prefixes, error types
- `src/services/api/queryClient.ts` - React Query configuration, query keys

### Reference Implementation
- `src/domains/admin/services/adminService.ts` - ✅ GOLD STANDARD
- `src/domains/admin/hooks/useAdminUsers.hooks.ts` - ✅ Hook patterns
- `src/domains/admin/pages/UsersPage.tsx` - ✅ Page integration

### Needs Review
- `src/domains/profile/services/profileService.ts` - 🔴 Fix updateProfile
- `src/domains/admin/services/adminExportService.ts` - 🟡 Verify exports
- `src/domains/admin/services/adminAuditService.ts` - 🟡 Verify audit logs

---

## ✅ Standard Checklist for New Services

- [ ] Import `apiClient` from `services/api/apiClient`
- [ ] Import `API_PREFIXES, unwrapResponse` from `services/api/common`
- [ ] Use `API_PREFIXES.YOUR_DOMAIN` constant (no hardcoded strings)
- [ ] Use `unwrapResponse` for POST/PUT/DELETE operations
- [ ] Return `response.data` directly for GET list operations
- [ ] Add comprehensive TypeScript types
- [ ] Add JSDoc comments with endpoint path
- [ ] Export individual functions AND default service object
- [ ] Create corresponding React Query hooks
- [ ] Use centralized `queryKeys` from queryClient.ts

---

## 🎓 Developer Guidelines

### DO ✅
- Use `unwrapResponse` for mutations (POST/PUT/DELETE)
- Use centralized `API_PREFIXES` constants
- Return raw `response.data` for paginated lists
- Add JSDoc with HTTP method and path
- Follow the 5-layer architecture
- Handle errors in hooks, not services

### DON'T ❌
- Hardcode API endpoint strings
- Mix `unwrapResponse` with non-wrapped responses
- Add try-catch in services (let errors bubble to hooks)
- Duplicate response handling logic
- Create local API client instances

---

## 📊 Metrics

### Current Status
- **Total Service Files**: ~20+
- **Consistent Services**: ~15 (75%)
- **Needs Fix**: ~3 (15%)
- **Needs Review**: ~2 (10%)

### After Fixes (Target)
- **Consistent Services**: 100%
- **Single Source of Truth**: ✅
- **Duplicate Code**: 0

---

**Last Updated**: 2025-01-10
**Maintainer**: Development Team
**Version**: 1.0
