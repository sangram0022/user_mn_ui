# API Services Architecture

## Overview

The API services have been restructured following industry best practices with a modular, maintainable, and scalable architecture. This document outlines the new structure and usage patterns.

## Architecture

### Core Principles

1. **Separation of Concerns**: Each module has a single, well-defined responsibility
2. **Adapter Pattern**: Legacy compatibility without compromising modern design
3. **Type Safety**: Comprehensive TypeScript types throughout
4. **Reusability**: Common patterns extracted into reusable utilities
5. **Testability**: Each module can be tested independently

### Directory Structure

```
src/
├── services/
│   ├── apiClient.ts              # Modern HTTP client (source of truth)
│   ├── apiClientLegacy.ts        # Backward compatibility wrapper
│   ├── index.ts                  # Main export point
│   └── adapters/                 # Modular adapter pattern
│       ├── index.ts              # Unified adapter export
│       ├── types.ts              # Shared type definitions
│       ├── authAdapter.ts        # Authentication operations
│       ├── userAdapter.ts        # User management operations
│       ├── profileAdapter.ts     # Profile operations
│       ├── analyticsAdapter.ts   # Analytics operations
│       ├── workflowAdapter.ts    # Workflow operations
│       └── requestAdapter.ts     # Generic request handler
├── hooks/
│   ├── index.ts                  # Hooks export point
│   ├── useAsyncOperation.ts      # Async state management
│   ├── usePagination.ts          # Pagination logic
│   ├── useFormState.ts           # Form state management
│   ├── useErrorHandler.ts        # Error handling (existing)
│   ├── useAuth.ts                # Authentication (existing)
│   └── useSessionManagement.ts   # Session management (existing)
└── components/
    └── common/
        └── index.tsx             # Reusable UI components
```

## Usage Guide

### Modern API Client (Recommended)

For new code, use the modern client directly:

```typescript
import { apiClient } from '@/services';

// Authentication
const loginResponse = await apiClient.login(email, password);
const user = await apiClient.getUserProfile();

// User management
const users = await apiClient.getUsers();
const created = await apiClient.createUser(payload);

// Analytics
const analytics = await apiClient.getUserAnalytics();
```

### Adapter Pattern (For Legacy Compatibility)

For components being migrated:

```typescript
import { apiClientAdapter } from '@/services/adapters';

// Same interface as legacy client, but uses modern backend
const result = await apiClientAdapter.register({ email, password, ... });
const users = await apiClientAdapter.getUsers();
```

### Custom Hooks

Simplify component logic with reusable hooks:

```typescript
import { useAsyncOperation, usePagination, useFormState } from '@/hooks';

// Async operations
const { execute, isLoading, error } = useAsyncOperation();
await execute(async () => {
  await apiClient.createUser(data);
});

// Pagination
const pagination = usePagination({ pageSize: 20 });
const users = await apiClient.getUsers({
  skip: pagination.skip,
  limit: pagination.limit
});
pagination.setTotal(usersData.total);

// Form state
const form = useFormState({
  initialValues: { email: '', password: '' },
  validate: (values) => { /* validation logic */ }
});
```

### Common UI Components

Use standardized components for consistency:

```typescript
import { LoadingSpinner, ErrorAlert, Button, Modal, Card } from '@/components/common';

// Loading state
{isLoading && <LoadingSpinner message="Loading users..." />}

// Error display
<ErrorAlert error={error} onDismiss={clearError} />

// Buttons
<Button variant="primary" isLoading={isLoading} onClick={handleSubmit}>
  Save
</Button>

// Modals
<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create User">
  <FormContent />
</Modal>
```

## Adapter Modules

### Authentication Adapter (`authAdapter.ts`)

Handles all authentication-related operations:

- `register()` - User registration
- `forgotPassword()` - Password reset request
- `resetPassword()` - Password reset with token
- `resendVerificationEmail()` - Resend verification
- `verifyEmail()` - Email verification
- `changePassword()` - Password change

### User Adapter (`userAdapter.ts`)

Manages user CRUD operations:

- `getUsers()` - List users with pagination
- `getRoles()` - Get available roles
- `createUser()` - Create new user
- `updateUser()` - Update user details
- `deleteUser()` - Delete user

### Profile Adapter (`profileAdapter.ts`)

Handles user profile operations:

- `getProfile()` - Get current user profile
- `updateProfile()` - Update profile details

### Analytics Adapter (`analyticsAdapter.ts`)

Provides analytics data:

- `getUserAnalytics()` - Get user analytics
- `getLifecycleAnalytics()` - Get lifecycle data

### Workflow Adapter (`workflowAdapter.ts`)

Manages workflow operations:

- `getPendingWorkflows()` - Get pending approvals
- `approveWorkflow()` - Approve workflow (stub)
- `initiateUserLifecycle()` - Initiate lifecycle (stub)

### Request Adapter (`requestAdapter.ts`)

Generic request handler for custom endpoints:

- `makeRequest()` - Execute custom API requests

## Type Safety

All adapters use TypeScript types defined in `types.ts`:

```typescript
// Standard response wrapper
interface StandardResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Legacy user format
interface LegacyUser {
  id: number;
  email: string;
  username?: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  role: { id: number; name: string; description: string };
  lifecycle_stage?: string;
  activity_score?: number;
  last_login_at?: string;
  created_at: string;
}
```

## Migration Strategy

### Phase 1: Immediate (Current)
- ✅ Remove obsolete `apiClientComplete.ts`
- ✅ Create modular adapter structure
- ✅ Maintain backward compatibility via `apiClientLegacy.ts`
- ✅ Extract common hooks and components

### Phase 2: Component Migration
- Update components to use modern `apiClient` directly
- Replace manual state management with custom hooks
- Use common UI components for consistency
- Remove dependency on legacy wrapper

### Phase 3: Backend Integration
- Wire stub functions to real endpoints as they become available
- Update workflow and lifecycle operations
- Enhance analytics with backend data
- Add bulk operations support

### Phase 4: Cleanup
- Remove legacy adapter when all components migrated
- Optimize bundle size
- Add comprehensive testing
- Performance optimization

## Best Practices

### 1. Use the Modern Client
```typescript
// ✅ Good
import { apiClient } from '@/services';
await apiClient.login(email, password);

// ❌ Avoid (unless maintaining legacy code)
import { apiClient } from '@/services/apiClientLegacy';
```

### 2. Extract Common Logic to Hooks
```typescript
// ✅ Good
const { execute, isLoading, error } = useAsyncOperation();

// ❌ Avoid duplicating this in every component
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);
try { setIsLoading(true); ... }
```

### 3. Use Common Components
```typescript
// ✅ Good
<Button variant="primary" isLoading={isLoading}>Submit</Button>

// ❌ Avoid custom implementations
<button className="..." disabled={isLoading}>...</button>
```

### 4. Type Everything
```typescript
// ✅ Good
interface FormData {
  email: string;
  password: string;
}
const [formData, setFormData] = useState<FormData>({ ... });

// ❌ Avoid implicit any
const [formData, setFormData] = useState({ ... });
```

### 5. Handle Errors Consistently
```typescript
// ✅ Good
const { error, clearError } = useErrorHandler();
<ErrorAlert error={error} onDismiss={clearError} />

// ❌ Avoid custom error displays
{error && <div style={{ color: 'red' }}>{error}</div>}
```

## Testing

Each module is designed for independent testing:

```typescript
// Test modern client
import { apiClient } from '@/services';
// Mock and test

// Test adapters
import { authAdapter } from '@/services/adapters/authAdapter';
// Mock base client and test adapter logic

// Test hooks
import { useAsyncOperation } from '@/hooks';
// Test with renderHook from @testing-library/react
```

## Performance Considerations

1. **Code Splitting**: Adapters can be lazy-loaded if needed
2. **Tree Shaking**: Modern build tools remove unused code
3. **Type Stripping**: TypeScript types have zero runtime cost
4. **Memoization**: Hooks use proper React optimization patterns

## Future Enhancements

1. **Request Caching**: Add intelligent caching layer
2. **Optimistic Updates**: Implement optimistic UI updates
3. **Offline Support**: Add offline capability with service workers
4. **Real-time Updates**: WebSocket integration for live data
5. **Advanced Analytics**: Enhanced analytics with charts and dashboards

## Support

For questions or issues:
1. Check this documentation first
2. Review type definitions in `types.ts`
3. Look at adapter implementation examples
4. Consult with the development team

---

**Last Updated**: October 6, 2025  
**Version**: 2.0.0  
**Status**: Production Ready
