# API Helpers - Developer Guide

## 📚 Overview

This directory contains standardized utilities for backend API integration. These helpers establish a **single source of truth** for all API call patterns, ensuring consistency across the entire codebase.

## 🎯 Purpose

- ✅ **Eliminate code duplication** in service layers
- ✅ **Standardize response handling** (unwrapping, error handling)
- ✅ **Simplify service implementation** with reusable patterns
- ✅ **Ensure consistency** across all domain services

---

## 📂 Files

### `apiHelpers.ts`

Core utility functions for API calls. Provides standardized wrappers around `apiClient` with automatic response handling.

**Key Features:**
- Query string builders
- Standard HTTP method wrappers (GET, POST, PUT, PATCH, DELETE)
- Automatic response unwrapping for mutations
- Bulk operation helpers
- Resource URL builders
- Type guards and error extractors

### `exampleService.ts`

Reference implementation showing how to use `apiHelpers` in a real service. Use this as a template when creating new services.

---

## 🚀 Quick Start

### 1. Import Helpers

```typescript
import { API_PREFIXES } from '@/services/api/common';
import { ApiHelpers } from '@/core/api/apiHelpers';
```

### 2. Define API Prefix

```typescript
const API_PREFIX = API_PREFIXES.YOUR_DOMAIN; // e.g., ADMIN, AUTH, PROFILE
```

### 3. Use Standard Patterns

```typescript
// List with filters (GET)
export const listItems = async (filters?: Filters): Promise<ListResponse> => {
  return ApiHelpers.get<ListResponse>(API_PREFIX, filters);
};

// Get single item (GET with unwrap)
export const getItem = async (id: string): Promise<Item> => {
  const url = ApiHelpers.buildResourceUrl(API_PREFIX, id);
  return ApiHelpers.getOne<Item>(url);
};

// Create (POST with unwrap)
export const createItem = async (data: CreateRequest): Promise<CreateResponse> => {
  return ApiHelpers.post<CreateResponse>(API_PREFIX, data);
};

// Update (PUT with unwrap)
export const updateItem = async (id: string, data: UpdateRequest): Promise<UpdateResponse> => {
  const url = ApiHelpers.buildResourceUrl(API_PREFIX, id);
  return ApiHelpers.put<UpdateResponse>(url, data);
};

// Delete (DELETE with unwrap)
export const deleteItem = async (id: string): Promise<DeleteResponse> => {
  const url = ApiHelpers.buildResourceUrl(API_PREFIX, id);
  return ApiHelpers.delete<DeleteResponse>(url);
};
```

---

## 📖 API Reference

### Query Builders

#### `buildQueryString(filters: Record<string, unknown>): string`

Converts filters object to URL query string.

**Handles:**
- Undefined/null/empty values (skipped)
- Arrays (appended multiple times)
- Nested objects (flattened)

**Example:**
```typescript
const filters = { status: 'active', roles: ['admin', 'user'], page: 1 };
const queryString = ApiHelpers.buildQueryString(filters);
// Result: "status=active&roles=admin&roles=user&page=1"
```

#### `buildUrlWithQuery(baseUrl: string, filters?: Record<string, unknown>): string`

Combines base URL with query parameters.

**Example:**
```typescript
const url = ApiHelpers.buildUrlWithQuery('/api/v1/users', { status: 'active' });
// Result: "/api/v1/users?status=active"
```

---

### HTTP Methods

#### `apiGet<T>(endpoint: string, filters?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<T>`

Standard GET request for **paginated lists**. Returns raw `response.data`.

**Use for:**
- List endpoints with pagination
- Endpoints that return data structure directly

**Example:**
```typescript
const users = await ApiHelpers.get<UserListResponse>(
  '/api/v1/admin/users',
  { status: 'active', page: 1 }
);
```

---

#### `apiGetOne<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T>`

GET request for **single resource** with automatic unwrapping.

**Use for:**
- Single item retrieval
- Endpoints that wrap response in `{ success, data }` format

**Example:**
```typescript
const user = await ApiHelpers.getOne<User>('/api/v1/admin/users/123');
```

---

#### `apiPost<T>(endpoint: string, data: unknown, config?: AxiosRequestConfig): Promise<T>`

POST request with automatic unwrapping.

**Use for:**
- Creating new resources
- Custom actions that return data

**Example:**
```typescript
const created = await ApiHelpers.post<CreateUserResponse>(
  '/api/v1/admin/users',
  { email: 'user@example.com', name: 'John Doe' }
);
```

---

#### `apiPut<T>(endpoint: string, data: unknown, config?: AxiosRequestConfig): Promise<T>`

PUT request with automatic unwrapping.

**Use for:**
- Full resource updates

**Example:**
```typescript
const updated = await ApiHelpers.put<UpdateUserResponse>(
  '/api/v1/admin/users/123',
  { email: 'newemail@example.com', name: 'Jane Doe' }
);
```

---

#### `apiPatch<T>(endpoint: string, data: unknown, config?: AxiosRequestConfig): Promise<T>`

PATCH request with automatic unwrapping.

**Use for:**
- Partial resource updates

**Example:**
```typescript
const patched = await ApiHelpers.patch<User>(
  '/api/v1/admin/users/123',
  { status: 'active' }
);
```

---

#### `apiDelete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T>`

DELETE request with automatic unwrapping.

**Example:**
```typescript
const result = await ApiHelpers.delete<DeleteResponse>(
  '/api/v1/admin/users/123'
);
```

---

#### `apiDownload(endpoint: string, filters?: Record<string, unknown>): Promise<Blob>`

Download file (returns `Blob`). No unwrapping.

**Use for:**
- CSV exports
- PDF downloads
- Excel files

**Example:**
```typescript
const blob = await ApiHelpers.download('/api/v1/admin/export/users', {
  format: 'csv',
  status: 'active'
});

// Download in browser
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'users.csv';
link.click();
```

---

### Bulk Operations

#### `apiBulkOperation<T>(endpoint: string, ids: string[], config?: AxiosRequestConfig): Promise<T>`

POST request with array of IDs for bulk operations.

**Example:**
```typescript
const result = await ApiHelpers.bulkOperation<BulkDeleteResponse>(
  '/api/v1/admin/users/bulk-delete',
  ['id1', 'id2', 'id3']
);
```

---

### URL Builders

#### `buildResourceUrl(baseUrl: string, id: string): string`

Constructs resource URL with ID.

**Example:**
```typescript
const url = ApiHelpers.buildResourceUrl('/api/v1/admin/users', '123');
// Result: "/api/v1/admin/users/123"
```

---

#### `buildResourceActionUrl(baseUrl: string, id: string, action: string): string`

Constructs resource action URL.

**Example:**
```typescript
const url = ApiHelpers.buildResourceActionUrl('/api/v1/admin/users', '123', 'approve');
// Result: "/api/v1/admin/users/123/approve"
```

---

### Type Guards

#### `isPaginatedResponse(data: unknown): boolean`

Checks if response has pagination structure.

**Example:**
```typescript
if (ApiHelpers.isPaginatedResponse(response)) {
  // Handle paginated data
}
```

---

#### `isWrappedResponse(data: unknown): boolean`

Checks if response is wrapped in `{ success, data }` format.

**Example:**
```typescript
if (ApiHelpers.isWrappedResponse(response)) {
  // Use unwrapResponse
}
```

---

### Error Handling

#### `extractErrorMessage(error: unknown): string`

Extracts error message from various error formats.

**Handles:**
- String errors
- Error objects with `message` field
- API error responses with `error`, `detail`, `message` fields
- Nested response errors

**Example:**
```typescript
try {
  await ApiHelpers.post('/api/v1/users', data);
} catch (error) {
  const message = ApiHelpers.extractErrorMessage(error);
  toast.error(message);
}
```

---

## 🎯 When to Use What

### GET Requests

| Scenario | Use | Example |
|----------|-----|---------|
| List with pagination | `ApiHelpers.get()` | `ApiHelpers.get<ListResponse>(url, filters)` |
| Single resource | `ApiHelpers.getOne()` | `ApiHelpers.getOne<User>(url)` |
| File download | `ApiHelpers.download()` | `ApiHelpers.download(url, filters)` |

### Mutations

| Operation | Method | Helper |
|-----------|--------|--------|
| Create | POST | `ApiHelpers.post()` |
| Full update | PUT | `ApiHelpers.put()` |
| Partial update | PATCH | `ApiHelpers.patch()` |
| Delete | DELETE | `ApiHelpers.delete()` |
| Bulk operation | POST | `ApiHelpers.bulkOperation()` |

---

## ✅ Best Practices

### DO ✅

1. **Use helpers for all API calls**
   ```typescript
   // ✅ Good
   return ApiHelpers.get<ListResponse>(API_PREFIX, filters);
   ```

2. **Use URL builders for resource paths**
   ```typescript
   // ✅ Good
   const url = ApiHelpers.buildResourceUrl(API_PREFIX, id);
   ```

3. **Handle errors in hooks, not services**
   ```typescript
   // Services: Let errors bubble
   export const createUser = async (data: CreateRequest) => {
     return ApiHelpers.post<CreateResponse>(API_PREFIX, data);
   };
   
   // Hooks: Catch errors
   const { mutate } = useMutation({
     mutationFn: createUser,
     onError: (error) => {
       const message = ApiHelpers.extractErrorMessage(error);
       toast.error(message);
     }
   });
   ```

4. **Use TypeScript generics**
   ```typescript
   // ✅ Good - Type-safe
   const user = await ApiHelpers.getOne<User>(url);
   ```

### DON'T ❌

1. **Don't bypass helpers**
   ```typescript
   // ❌ Bad - Direct apiClient usage
   const response = await apiClient.get('/api/v1/users');
   return unwrapResponse(response.data);
   
   // ✅ Good - Use helper
   return ApiHelpers.getOne<User>('/api/v1/users');
   ```

2. **Don't mix patterns**
   ```typescript
   // ❌ Bad - Inconsistent
   export const createUser = async (data: CreateRequest) => {
     const response = await apiClient.post(url, data);
     return unwrapResponse(response.data); // Manual unwrap
   };
   
   // ✅ Good - Use helper
   export const createUser = async (data: CreateRequest) => {
     return ApiHelpers.post<CreateResponse>(url, data);
   };
   ```

3. **Don't hardcode URLs**
   ```typescript
   // ❌ Bad
   const url = `/api/v1/admin/users/${id}`;
   
   // ✅ Good
   const url = ApiHelpers.buildResourceUrl(API_PREFIXES.ADMIN_USERS, id);
   ```

---

## 📝 Service Template

Use this template when creating new services:

```typescript
/**
 * [Domain] Service
 * All API calls for [domain] operations
 */

import { API_PREFIXES } from '@/services/api/common';
import { ApiHelpers } from '@/core/api/apiHelpers';
import type { /* Import your types */ } from '../types';

const API_PREFIX = API_PREFIXES.YOUR_DOMAIN;

// ============================================================================
// READ Operations (GET)
// ============================================================================

export const listItems = async (filters?: Filters): Promise<ListResponse> => {
  return ApiHelpers.get<ListResponse>(API_PREFIX, filters);
};

export const getItem = async (id: string): Promise<Item> => {
  const url = ApiHelpers.buildResourceUrl(API_PREFIX, id);
  return ApiHelpers.getOne<Item>(url);
};

// ============================================================================
// CREATE Operations (POST)
// ============================================================================

export const createItem = async (data: CreateRequest): Promise<CreateResponse> => {
  return ApiHelpers.post<CreateResponse>(API_PREFIX, data);
};

// ============================================================================
// UPDATE Operations (PUT/PATCH)
// ============================================================================

export const updateItem = async (id: string, data: UpdateRequest): Promise<UpdateResponse> => {
  const url = ApiHelpers.buildResourceUrl(API_PREFIX, id);
  return ApiHelpers.put<UpdateResponse>(url, data);
};

// ============================================================================
// DELETE Operations (DELETE)
// ============================================================================

export const deleteItem = async (id: string): Promise<DeleteResponse> => {
  const url = ApiHelpers.buildResourceUrl(API_PREFIX, id);
  return ApiHelpers.delete<DeleteResponse>(url);
};

// ============================================================================
// BULK Operations
// ============================================================================

export const bulkDeleteItems = async (ids: string[]): Promise<BulkDeleteResponse> => {
  const url = `${API_PREFIX}/bulk-delete`;
  return ApiHelpers.bulkOperation<BulkDeleteResponse>(url, ids);
};

// ============================================================================
// CUSTOM Actions
// ============================================================================

export const approveItem = async (id: string): Promise<Item> => {
  const url = ApiHelpers.buildResourceActionUrl(API_PREFIX, id, 'approve');
  return ApiHelpers.post<Item>(url, {});
};

// ============================================================================
// Export
// ============================================================================

const yourDomainService = {
  listItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  bulkDeleteItems,
  approveItem,
};

export default yourDomainService;
```

---

## 🔍 Migration Guide

### Converting Existing Services

**Before (Manual pattern):**
```typescript
export const createUser = async (data: CreateUserRequest): Promise<CreateUserResponse> => {
  const response = await apiClient.post<CreateUserResponse>(`${API_PREFIX}/users`, data);
  return unwrapResponse<CreateUserResponse>(response.data);
};

export const listUsers = async (filters?: ListUsersFilters): Promise<ListUsersResponse> => {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
  }
  const queryString = queryParams.toString();
  const url = queryString ? `${API_PREFIX}/users?${queryString}` : `${API_PREFIX}/users`;
  const response = await apiClient.get<ListUsersResponse>(url);
  return response.data;
};
```

**After (Using helpers):**
```typescript
export const createUser = async (data: CreateUserRequest): Promise<CreateUserResponse> => {
  return ApiHelpers.post<CreateUserResponse>(`${API_PREFIX}/users`, data);
};

export const listUsers = async (filters?: ListUsersFilters): Promise<ListUsersResponse> => {
  return ApiHelpers.get<ListUsersResponse>(`${API_PREFIX}/users`, filters);
};
```

**Benefits:**
- ✅ 60% less code
- ✅ Consistent error handling
- ✅ No manual query string building
- ✅ Automatic unwrapping
- ✅ Easier to maintain

---

## 🧪 Testing

### Testing with Helpers

```typescript
import { ApiHelpers } from '@/core/api/apiHelpers';
import { vi } from 'vitest';

// Mock the helpers
vi.mock('@/core/api/apiHelpers', () => ({
  ApiHelpers: {
    get: vi.fn(),
    post: vi.fn(),
    // ... other methods
  }
}));

// In your test
it('should fetch users', async () => {
  const mockUsers = [{ id: '1', name: 'John' }];
  (ApiHelpers.get as any).mockResolvedValue({ items: mockUsers });
  
  const result = await listUsers({ status: 'active' });
  
  expect(ApiHelpers.get).toHaveBeenCalledWith(
    '/api/v1/admin/users',
    { status: 'active' }
  );
  expect(result.items).toEqual(mockUsers);
});
```

---

## 📚 Related Documentation

- [API Integration Pattern Analysis](../../API_INTEGRATION_PATTERN_ANALYSIS.md)
- [API Integration Consistency Fix Summary](../../API_INTEGRATION_CONSISTENCY_FIX_SUMMARY.md)
- [Architecture Guide](../../ARCHITECTURE.md)

---

## 🤝 Contributing

When adding new helpers:

1. Add comprehensive JSDoc comments
2. Include usage examples
3. Add to the exported `ApiHelpers` object
4. Update this README
5. Add tests
6. Update `exampleService.ts` if needed

---

**Last Updated**: 2025-01-10  
**Version**: 1.0  
**Maintainer**: Development Team
