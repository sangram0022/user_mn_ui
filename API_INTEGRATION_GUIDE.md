# API Integration Guide

**Complete guide for frontend-backend API integration**

---

## Table of Contents

1. [Overview](#overview)
2. [API Architecture](#api-architecture)
3. [Backend API Endpoints](#backend-api-endpoints)
4. [Frontend Integration](#frontend-integration)
5. [Authentication Flow](#authentication-flow)
6. [Error Handling](#error-handling)
7. [Examples](#examples)

---

## Overview

### Backend Stack

- **Framework:** FastAPI (Python 3.14)
- **Database:** DynamoDB
- **Authentication:** JWT tokens
- **API Version:** v1
- **Base URL:** `http://localhost:8000/api/v1`

### Frontend Stack

- **Framework:** React 19.1.1 + TypeScript
- **API Client:** TanStack Query v5
- **HTTP Library:** Fetch API (wrapped in apiHelpers)
- **State Management:** TanStack Query + Zustand

---

## API Architecture

### Request/Response Flow

```
Frontend Component
    ↓
React Hook (TanStack Query)
    ↓
Service Layer (domain service)
    ↓
API Helper (apiGet/Post/Put/Delete)
    ↓
API Client (centralized fetch wrapper)
    ↓
Backend API (FastAPI)
    ↓
Database (DynamoDB)
```

### Standard API Response Format

**Success Response:**

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Email already exists",
      "phone": "Invalid phone format"
    }
  }
}
```

---

## Backend API Endpoints

### Authentication Endpoints

#### POST `/api/v1/auth/login`

**Purpose:** User login

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user"
    }
  },
  "message": "Login successful"
}
```

**Frontend Integration:**

```typescript
// Service (src/domains/auth/services/authService.ts)
export const login = async (credentials: LoginCredentials) => {
  return apiPost<LoginResponse>('/api/v1/auth/login', credentials);
};

// Hook (src/domains/auth/hooks/useAuth.hooks.ts)
export const useLogin = () => {
  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem('access_token', data.data.access_token);
      localStorage.setItem('refresh_token', data.data.refresh_token);
    },
  });
};

// Component usage
const { mutateAsync: login } = useLogin();
await login({ email, password });
```

#### POST `/api/v1/auth/register`

**Purpose:** User registration

**Request:**

```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+1234567890"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_456",
      "email": "newuser@example.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "status": "active",
      "created_at": "2025-01-10T10:00:00Z"
    }
  },
  "message": "Registration successful"
}
```

#### POST `/api/v1/auth/refresh`

**Purpose:** Refresh access token

**Request:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

---

### User Management Endpoints

#### GET `/api/v1/users`

**Purpose:** List users with pagination and filters

**Query Parameters:**

- `page` (int): Page number (default: 1)
- `page_size` (int): Items per page (default: 10, max: 100)
- `status` (string): Filter by status (active, inactive, pending)
- `role` (string): Filter by role (admin, user, moderator)
- `search` (string): Search by name or email
- `sort_by` (string): Sort field (created_at, first_name, last_name)
- `sort_order` (string): Sort direction (asc, desc)

**Example Request:**

```
GET /api/v1/users?page=1&page_size=10&status=active&sort_by=created_at&sort_order=desc
```

**Response:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "role": "user",
        "status": "active",
        "created_at": "2025-01-10T10:00:00Z",
        "updated_at": "2025-01-10T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 10,
      "total_items": 50,
      "total_pages": 5
    }
  }
}
```

**Frontend Integration:**

```typescript
// Service
export const listUsers = async (filters?: UserFilters) => {
  return apiGet<ListUsersResponse>('/api/v1/users', filters);
};

// Hook
export const useUserList = (filters?: UserFilters) => {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => userService.listUsers(filters),
    staleTime: 30000,
  });
};

// Component usage
const { data, isLoading } = useUserList({ 
  status: 'active', 
  page: 1 
});
```

#### GET `/api/v1/users/{user_id}`

**Purpose:** Get single user details

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "role": "user",
    "status": "active",
    "created_at": "2025-01-10T10:00:00Z",
    "updated_at": "2025-01-10T10:00:00Z",
    "last_login": "2025-01-10T15:00:00Z"
  }
}
```

**Frontend Integration:**

```typescript
// Service
export const getUser = async (userId: string) => {
  return apiGet<User>(`/api/v1/users/${userId}`);
};

// Hook
export const useUser = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.users.detail(userId ?? ''),
    queryFn: () => userService.getUser(userId!),
    enabled: !!userId,
  });
};

// Component usage
const { data: user } = useUser(userId);
```

#### POST `/api/v1/users`

**Purpose:** Create new user

**Request:**

```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+1234567890",
  "role": "user"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_789",
    "email": "newuser@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "role": "user",
    "status": "active",
    "created_at": "2025-01-10T10:00:00Z"
  },
  "message": "User created successfully"
}
```

**Frontend Integration:**

```typescript
// Service
export const createUser = async (data: CreateUserRequest) => {
  return apiPost<CreateUserResponse>('/api/v1/users', data);
};

// Hook
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.users.lists() 
      });
    },
  });
};

// Component usage
const createUser = useCreateUser();
await createUser.mutateAsync(formData);
```

#### PUT `/api/v1/users/{user_id}`

**Purpose:** Update user

**Request:**

```json
{
  "first_name": "John",
  "last_name": "Doe Updated",
  "phone": "+0987654321"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe Updated",
    "phone": "+0987654321",
    "updated_at": "2025-01-10T16:00:00Z"
  },
  "message": "User updated successfully"
}
```

#### DELETE `/api/v1/users/{user_id}`

**Purpose:** Delete user

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Frontend Integration:**

```typescript
// Service
export const deleteUser = async (userId: string) => {
  return apiDelete<void>(`/api/v1/users/${userId}`);
};

// Hook
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: (_data, userId) => {
      queryClient.removeQueries({ 
        queryKey: queryKeys.users.detail(userId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.users.lists() 
      });
    },
  });
};
```

---

### Role Management Endpoints

#### GET `/api/v1/roles`

**Purpose:** List all available roles

**Response:**

```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "id": "role_admin",
        "name": "admin",
        "display_name": "Administrator",
        "permissions": [
          "users:read",
          "users:write",
          "users:delete",
          "roles:read",
          "roles:write"
        ]
      },
      {
        "id": "role_user",
        "name": "user",
        "display_name": "User",
        "permissions": [
          "profile:read",
          "profile:write"
        ]
      }
    ]
  }
}
```

---

### Lead Management Endpoints

#### POST `/api/v1/leads`

**Purpose:** Create new lead

**Request:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "source": "website",
  "notes": "Interested in enterprise plan"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "lead_123",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Acme Corp",
    "source": "website",
    "status": "new",
    "notes": "Interested in enterprise plan",
    "created_at": "2025-01-10T10:00:00Z"
  },
  "message": "Lead created successfully"
}
```

#### GET `/api/v1/leads`

**Purpose:** List leads with filters

**Query Parameters:**

- `status` (string): new, contacted, qualified, converted, lost
- `source` (string): website, referral, social, other
- `page` (int): Page number
- `page_size` (int): Items per page

**Response:**

```json
{
  "success": true,
  "data": {
    "leads": [
      {
        "id": "lead_123",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "company": "Acme Corp",
        "source": "website",
        "status": "new",
        "created_at": "2025-01-10T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 10,
      "total_items": 25,
      "total_pages": 3
    }
  }
}
```

---

## Frontend Integration

### Complete Integration Example

Let's implement complete user management integration:

#### Step 1: Define Types

```typescript
// src/domains/user/types/index.ts
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: User['role'];
}

export interface UserFilters {
  page?: number;
  page_size?: number;
  status?: User['status'];
  role?: User['role'];
  search?: string;
  sort_by?: 'created_at' | 'first_name' | 'last_name';
  sort_order?: 'asc' | 'desc';
}
```

#### Step 2: Create Service

```typescript
// src/domains/user/services/userService.ts
import { apiGet, apiPost, apiPut, apiDelete } from '@/core/api/apiHelpers';
import type { 
  User, 
  CreateUserRequest, 
  UserFilters 
} from '../types';

export const listUsers = async (filters?: UserFilters) => {
  return apiGet<{ users: User[]; pagination: Pagination }>(
    '/api/v1/users',
    filters as Record<string, unknown>
  );
};

export const getUser = async (userId: string) => {
  return apiGet<User>(`/api/v1/users/${userId}`);
};

export const createUser = async (data: CreateUserRequest) => {
  return apiPost<User>('/api/v1/users', data);
};

export const updateUser = async (
  userId: string, 
  data: Partial<CreateUserRequest>
) => {
  return apiPut<User>(`/api/v1/users/${userId}`, data);
};

export const deleteUser = async (userId: string) => {
  return apiDelete<void>(`/api/v1/users/${userId}`);
};

const userService = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};

export default userService;
```

#### Step 3: Create Hooks

```typescript
// src/domains/user/hooks/useUsers.hooks.ts
import { 
  useQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query';
import { queryKeys } from '@/services/api/queryKeys';
import userService from '../services/userService';
import { logger } from '@/core/logging';
import type { CreateUserRequest, UserFilters } from '../types';

export const useUserList = (filters?: UserFilters) => {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => userService.listUsers(filters),
    staleTime: 30000,
  });
};

export const useUser = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.users.detail(userId ?? ''),
    queryFn: () => userService.getUser(userId!),
    enabled: !!userId,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserRequest) => {
      logger().info('Creating user', { email: data.email });
      const user = await userService.createUser(data);
      logger().info('User created', { userId: user.id });
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.users.lists() 
      });
    },
    onError: (error: Error) => {
      logger().error('Failed to create user', error);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      data 
    }: { 
      userId: string; 
      data: Partial<CreateUserRequest> 
    }) => {
      logger().info('Updating user', { userId });
      const user = await userService.updateUser(userId, data);
      logger().info('User updated', { userId });
      return user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(
        queryKeys.users.detail(user.id),
        user
      );
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.users.lists() 
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      logger().info('Deleting user', { userId });
      await userService.deleteUser(userId);
      logger().info('User deleted', { userId });
    },
    onSuccess: (_data, userId) => {
      queryClient.removeQueries({ 
        queryKey: queryKeys.users.detail(userId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.users.lists() 
      });
    },
  });
};
```

#### Step 4: Use in Component

```typescript
// Component usage
import { useUserList, useCreateUser, useDeleteUser } from '../hooks/useUsers.hooks';

const UsersPage = () => {
  const { data, isLoading } = useUserList({ status: 'active' });
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  const users = data?.users || [];

  const handleCreate = async (formData: CreateUserRequest) => {
    await createUser.mutateAsync(formData);
    toast.success('User created!');
  };

  const handleDelete = async (userId: string) => {
    await deleteUser.mutateAsync(userId);
    toast.success('User deleted!');
  };

  return (
    <div>
      {users.map(user => (
        <UserCard 
          key={user.id} 
          user={user} 
          onDelete={() => handleDelete(user.id)}
        />
      ))}
    </div>
  );
};
```

---

## Authentication Flow

### Login Flow

```
1. User enters credentials
   ↓
2. Frontend sends POST /api/v1/auth/login
   ↓
3. Backend validates credentials
   ↓
4. Backend returns JWT tokens
   ↓
5. Frontend stores tokens in localStorage
   ↓
6. Frontend sets auth state
   ↓
7. User is redirected to dashboard
```

### Protected API Calls

```
1. Frontend prepares API request
   ↓
2. API client retrieves token from localStorage
   ↓
3. API client adds Authorization header: "Bearer <token>"
   ↓
4. Request sent to backend
   ↓
5. Backend validates token
   ↓
6. Backend returns response
```

### Token Refresh Flow

```
1. Frontend receives 401 Unauthorized
   ↓
2. Check if refresh token exists
   ↓
3. Send POST /api/v1/auth/refresh with refresh_token
   ↓
4. Backend returns new access_token
   ↓
5. Frontend stores new access_token
   ↓
6. Retry original request with new token
   ↓
7. If refresh fails → logout user
```

**Implementation:**

```typescript
// src/core/api/apiClient.ts
const apiClient = async (url: string, options: RequestInit) => {
  // Add Authorization header
  const token = localStorage.getItem('access_token');
  const headers = {
    ...options.headers,
    'Authorization': token ? `Bearer ${token}` : '',
  };

  let response = await fetch(url, { ...options, headers });

  // Handle 401 - try refresh
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry with new token
      const newToken = localStorage.getItem('access_token');
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, { ...options, headers });
    } else {
      // Refresh failed - logout
      handleLogout();
      throw new Error('Authentication failed');
    }
  }

  return response;
};
```

---

## Error Handling

### Error Codes

| Code | Meaning | Frontend Action |
|------|---------|----------------|
| `VALIDATION_ERROR` | Invalid input | Show field errors |
| `AUTHENTICATION_ERROR` | Auth failed | Redirect to login |
| `AUTHORIZATION_ERROR` | Permission denied | Show error message |
| `NOT_FOUND` | Resource not found | Show 404 page |
| `DUPLICATE_ERROR` | Resource exists | Show error toast |
| `SERVER_ERROR` | Internal error | Show generic error |

### Frontend Error Handling

```typescript
const mutation = useMutation({
  mutationFn: createUser,
  onError: (error) => {
    handleError(error, {
      context: { operation: 'createUser' },
      customMessage: 'Failed to create user',
    });
  },
});
```

**The `handleError` function will:**

1. Extract error code and message
2. Show toast notification
3. Extract field errors (for forms)
4. Log error with context
5. Handle 401 redirect
6. Return formatted error

---

## Examples

See complete examples in:

- **User Management:** `src/domains/admin/` (full CRUD)
- **Authentication:** `src/domains/auth/` (login, register, refresh)
- **Lead Management:** `DEVELOPER_DOCUMENTATION.md` Section 5 (complete example)

---

**Last Updated:** November 12, 2025
