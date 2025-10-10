# 🚀 DDD Quick Reference - Developer Cheat Sheet

**Last Updated**: October 10, 2025  
**For**: Developers working with DDD architecture

---

## 📁 Where Does My Code Go?

Use this quick decision tree:

```
Is it business logic for a specific feature?
├─ YES → domains/[domain-name]/
└─ NO → Continue...
    │
    Is it external/infrastructure concern?
    ├─ YES → infrastructure/[api|storage|monitoring|security]/
    └─ NO → Continue...
        │
        Is it truly reusable across ALL domains?
        ├─ YES → shared/[ui|utils|hooks|types]/
        └─ NO → You probably want domains/
```

---

## 🎯 Quick Import Guide

### ✅ Correct Import Patterns

```typescript
// ✅ Domain importing from infrastructure
import { apiClient } from '@infrastructure/api';
import { logger } from '@infrastructure/monitoring';

// ✅ Domain importing from shared
import { Button } from '@shared/ui';
import { formatDate } from '@shared/utils';

// ✅ Component importing from same domain
import { UserList } from './components';
import { useUsers } from './hooks';

// ✅ Using domain public API
import { LoginForm, useLogin } from '@domains/authentication';
```

### ❌ Anti-Patterns (DON'T DO THIS)

```typescript
// ❌ Infrastructure importing from domains
// infrastructure/api/apiClient.ts
import { UserService } from '@domains/user-management'; // WRONG!

// ❌ Cross-domain imports (bypassing public API)
// domains/user-management/components/UserList.tsx
import { AuthService } from '@domains/authentication/services/AuthService'; // WRONG!
// Use public API instead: import { useAuthState } from '@domains/authentication';

// ❌ Reaching into internal implementation
import { LoginFormInternal } from '@domains/authentication/components/LoginForm'; // WRONG!
// Use public API: import { LoginForm } from '@domains/authentication';
```

---

## 📦 Domain Structure Template

Every domain should follow this structure:

```
domains/[domain-name]/
├── components/          # React components (UI layer)
│   ├── DomainForm.tsx
│   ├── DomainList.tsx
│   └── index.ts        # Component barrel export
├── hooks/              # Custom React hooks
│   ├── useDomainData.ts
│   ├── useDomainCRUD.ts
│   └── index.ts
├── services/           # Business logic (no React)
│   ├── DomainService.ts
│   ├── ValidationService.ts
│   └── index.ts
├── types/              # TypeScript types
│   ├── domain.types.ts
│   └── index.ts
├── pages/              # Full page components
│   ├── DomainListPage.tsx
│   ├── DomainDetailPage.tsx
│   └── index.ts
├── utils/              # Domain-specific utilities
│   ├── validators.ts
│   ├── transformers.ts
│   └── index.ts
└── index.ts            # 🎯 PUBLIC API (barrel export)
```

---

## 🔧 Creating a New Domain

### Quick Start (5 minutes)

```bash
#!/bin/bash
# Create new domain script

DOMAIN_NAME="my-domain"

# 1. Create folder structure
mkdir -p src/domains/$DOMAIN_NAME/{components,hooks,services,types,pages,utils}

# 2. Create barrel exports
cat > src/domains/$DOMAIN_NAME/index.ts << 'EOF'
/**
 * My Domain - Public API
 * @module domains/my-domain
 */

// Components
export { default as MyComponent } from './components/MyComponent';

// Hooks
export { useMyDomain } from './hooks/useMyDomain';

// Services
export { MyDomainService } from './services/MyDomainService';

// Types
export type { MyDomainData, MyDomainFilters } from './types';
EOF

# 3. Create types
cat > src/domains/$DOMAIN_NAME/types/index.ts << 'EOF'
/**
 * My Domain - Type Definitions
 */

export interface MyDomainData {
  id: string;
  name: string;
  createdAt: Date;
}

export interface MyDomainFilters {
  search?: string;
  sortBy?: 'name' | 'date';
}
EOF

# 4. Create component barrel
echo 'export { default as MyComponent } from "./MyComponent";' > src/domains/$DOMAIN_NAME/components/index.ts

# 5. Create hooks barrel
echo 'export { useMyDomain } from "./useMyDomain";' > src/domains/$DOMAIN_NAME/hooks/index.ts

# 6. Create services barrel
echo 'export { MyDomainService } from "./MyDomainService";' > src/domains/$DOMAIN_NAME/services/index.ts

echo "✅ Domain '$DOMAIN_NAME' created successfully!"
```

### Manual Steps

1. **Create folders**: `domains/my-domain/{components,hooks,services,types,pages,utils}`
2. **Define types**: Create `types/mydomain.types.ts`
3. **Create service**: Create `services/MyDomainService.ts`
4. **Create hooks**: Create `hooks/useMyDomain.ts`
5. **Create components**: Create `components/MyDomainComponent.tsx`
6. **Create barrel export**: Update `index.ts` with public API
7. **Document**: Add README.md explaining domain purpose

---

## 🎨 Component Best Practices

### Domain Component Example

```typescript
// domains/user-management/components/UserList.tsx
import React from 'react';
import { Button } from '@shared/ui'; // ✅ Shared UI
import { useUsers } from '../hooks'; // ✅ Same domain
import type { User } from '../types'; // ✅ Same domain types

interface UserListProps {
  filters?: UserFilters;
  onUserSelect?: (user: User) => void;
}

/**
 * User list component - displays paginated user list
 * @domain user-management
 */
export const UserList: React.FC<UserListProps> = ({ filters, onUserSelect }) => {
  const { users, isLoading, error } = useUsers(filters);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="user-list">
      {users.map(user => (
        <div key={user.id} onClick={() => onUserSelect?.(user)}>
          {user.name}
        </div>
      ))}
    </div>
  );
};

export default UserList;
```

---

## 🪝 Hook Best Practices

### Domain Hook Example

```typescript
// domains/user-management/hooks/useUsers.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@infrastructure/api'; // ✅ Infrastructure
import { logger } from '@infrastructure/monitoring'; // ✅ Infrastructure
import type { User, UserFilters } from '../types'; // ✅ Same domain

interface UseUsersResult {
  users: User[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook for fetching and managing users
 * @domain user-management
 */
export const useUsers = (filters?: UserFilters): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<User[]>('/users', { params: filters });
      setUsers(response.data);
      logger.info('Users fetched successfully', { count: response.data.length });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMsg);
      logger.error('Failed to fetch users', { error: err });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  return { users, isLoading, error, refetch: fetchUsers };
};
```

---

## ⚙️ Service Best Practices

### Domain Service Example

```typescript
// domains/user-management/services/UserService.ts
import { apiClient } from '@infrastructure/api';
import { logger } from '@infrastructure/monitoring';
import type { User, CreateUserData, UpdateUserData } from '../types';

/**
 * User management service - handles user business logic
 * @domain user-management
 */
export class UserService {
  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User> {
    try {
      const response = await apiClient.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get user', { id, error });
      throw error;
    }
  }

  /**
   * Create new user
   */
  static async createUser(data: CreateUserData): Promise<User> {
    try {
      // Business logic validation
      this.validateUserData(data);

      const response = await apiClient.post<User>('/users', data);
      logger.info('User created', { userId: response.data.id });
      return response.data;
    } catch (error) {
      logger.error('Failed to create user', { error });
      throw error;
    }
  }

  /**
   * Update existing user
   */
  static async updateUser(id: string, data: UpdateUserData): Promise<User> {
    try {
      const response = await apiClient.put<User>(`/users/${id}`, data);
      logger.info('User updated', { userId: id });
      return response.data;
    } catch (error) {
      logger.error('Failed to update user', { id, error });
      throw error;
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(`/users/${id}`);
      logger.info('User deleted', { userId: id });
    } catch (error) {
      logger.error('Failed to delete user', { id, error });
      throw error;
    }
  }

  /**
   * Private validation method
   */
  private static validateUserData(data: CreateUserData): void {
    if (!data.email || !data.email.includes('@')) {
      throw new Error('Invalid email address');
    }
    // More validation...
  }
}
```

---

## 🔒 Infrastructure Usage Examples

### API Client Usage

```typescript
// In your domain service
import { apiClient } from '@infrastructure/api';

// GET request
const response = await apiClient.get<User[]>('/users');

// POST request
const response = await apiClient.post<User>('/users', userData);

// PUT request
const response = await apiClient.put<User>(`/users/${id}`, updateData);

// DELETE request
await apiClient.delete(`/users/${id}`);

// With query parameters
const response = await apiClient.get<User[]>('/users', {
  params: { page: 1, limit: 10 }
});
```

### Storage Usage

```typescript
// In your domain service
import { StorageManager, LocalStorageAdapter } from '@infrastructure/storage';

// Create storage instance
const userStorage = new StorageManager(
  new LocalStorageAdapter(),
  { prefix: 'user', ttl: 3600 } // 1 hour TTL
);

// Save data
await userStorage.set('preferences', { theme: 'dark' });

// Get data
const preferences = await userStorage.get('preferences');

// Remove data
await userStorage.remove('preferences');
```

### Monitoring Usage

```typescript
// In your domain
import { logger, GlobalErrorHandler, useAnalytics } from '@infrastructure/monitoring';

// Logging
logger.info('User action', { userId, action: 'login' });
logger.error('Operation failed', { error, context });

// Error handling
try {
  await riskyOperation();
} catch (error) {
  GlobalErrorHandler.handleError(error, { component: 'UserList' }, 'high');
}

// Analytics (in component)
const { trackEvent } = useAnalytics();
trackEvent('user_created', { userId });
```

---

## 📝 Barrel Export Best Practices

### Domain Barrel Export Template

```typescript
// domains/my-domain/index.ts
/**
 * My Domain - Public API
 * @module domains/my-domain
 * 
 * @description
 * This module provides functionality for [domain purpose].
 * 
 * @example
 * ```typescript
 * import { MyComponent, useMyDomain, MyDomainService } from '@domains/my-domain';
 * 
 * function MyPage() {
 *   const { data, isLoading } = useMyDomain();
 *   
 *   return <MyComponent data={data} />;
 * }
 * ```
 */

// ===== COMPONENTS =====
export { default as MyComponent } from './components/MyComponent';
export { default as MyOtherComponent } from './components/MyOtherComponent';

// ===== HOOKS =====
export { useMyDomain } from './hooks/useMyDomain';
export { useMyDomainCRUD } from './hooks/useMyDomainCRUD';

// ===== SERVICES =====
export { MyDomainService } from './services/MyDomainService';

// ===== TYPES =====
export type {
  MyDomainData,
  MyDomainFilters,
  MyDomainResponse,
} from './types';

// ===== ENUMS & CONSTANTS =====
export { MyDomainStatus, MY_DOMAIN_CONSTANTS } from './types';

// ===== PAGES (optional - usually imported by routing) =====
export { default as MyDomainListPage } from './pages/MyDomainListPage';
export { default as MyDomainDetailPage } from './pages/MyDomainDetailPage';
```

---

## 🧪 Testing Best Practices

### Domain Unit Test Example

```typescript
// domains/user-management/hooks/useUsers.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useUsers } from './useUsers';
import { apiClient } from '@infrastructure/api';

// Mock infrastructure
vi.mock('@infrastructure/api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('useUsers', () => {
  it('should fetch users successfully', async () => {
    const mockUsers = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
    ];

    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockUsers });

    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.users).toEqual(mockUsers);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('API Error');
    expect(result.current.users).toEqual([]);
  });
});
```

---

## 🚫 Common Mistakes & How to Fix

### Mistake 1: Cross-Domain Dependencies

**❌ Wrong**:
```typescript
// domains/workflow-engine/services/WorkflowService.ts
import { UserService } from '@domains/user-management/services/UserService';
```

**✅ Correct**:
```typescript
// Use infrastructure API client instead
import { apiClient } from '@infrastructure/api';

// Or emit events for cross-domain communication
import { eventBus } from '@infrastructure/events';
eventBus.emit('user.updated', { userId });
```

### Mistake 2: Business Logic in Components

**❌ Wrong**:
```typescript
// domains/user-management/components/UserForm.tsx
const handleSubmit = async (data) => {
  // Business logic in component
  const response = await apiClient.post('/users', data);
  if (response.data.role === 'admin') {
    // Grant admin permissions...
  }
};
```

**✅ Correct**:
```typescript
// Move to service
const { createUser } = useUserCRUD();
const handleSubmit = async (data) => {
  await createUser(data); // Service handles business logic
};
```

### Mistake 3: Infrastructure in Shared Layer

**❌ Wrong**:
```typescript
// shared/utils/userUtils.ts
import { apiClient } from '@infrastructure/api';

export const fetchCurrentUser = () => apiClient.get('/users/me');
```

**✅ Correct**:
```typescript
// Move to user-management domain
// domains/user-management/services/UserService.ts
import { apiClient } from '@infrastructure/api';

export class UserService {
  static async getCurrentUser() {
    return apiClient.get('/users/me');
  }
}
```

---

## 🎯 Quick Decision Matrix

| Code Type | Location | Example |
|-----------|----------|---------|
| Login form component | `domains/authentication/components/` | `LoginForm.tsx` |
| User CRUD operations | `domains/user-management/services/` | `UserService.ts` |
| Custom user hook | `domains/user-management/hooks/` | `useUsers.ts` |
| API HTTP client | `infrastructure/api/` | `apiClient.ts` |
| Logger | `infrastructure/monitoring/` | `logger.ts` |
| Generic Button | `shared/ui/` | `Button.tsx` |
| Date formatting | `shared/utils/` | `date.ts` |
| Generic useDebounce | `shared/hooks/` | `useDebounce.ts` |
| User type definition | `domains/user-management/types/` | `user.types.ts` |
| Global API types | `shared/types/` | `api.types.ts` |

---

## 📚 Additional Resources

- **Full Architecture**: See `ARCHITECTURE.md`
- **Migration Guide**: See `MIGRATION_GUIDE.md`
- **Code Examples**: Check `domains/authentication/` for reference implementation
- **Team Wiki**: [Your wiki link]

---

## 🆘 Need Help?

**Common Questions**:
1. "Where should this component go?" → Use decision tree at top
2. "Can I import from another domain?" → No, use public API only
3. "What goes in shared?" → Only truly reusable code
4. "How do I communicate between domains?" → Use events or composition

**Contact**:
- Slack: #architecture-help
- Email: architecture@company.com
- Office Hours: Tuesdays 2-3pm

---

**Last Updated**: October 10, 2025  
**Version**: 1.0  
**Maintained By**: Architecture Team
