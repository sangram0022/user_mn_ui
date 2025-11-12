# Admin Error Handling & Validation

Comprehensive error handling system for the admin domain with centralized error management, toast notifications, and error boundaries.

## 📋 Table of Contents

- [Overview](#overview)
- [Error Handler](#error-handler)
- [Toast Notifications](#toast-notifications)
- [Error Boundary](#error-boundary)
- [Usage Examples](#usage-examples)
- [Error Codes](#error-codes)
- [Best Practices](#best-practices)

## 🎯 Overview

The admin error handling system provides:

1. **Centralized Error Handling**: Single source of truth for error processing
2. **User-Friendly Messages**: Maps error codes to readable messages
3. **Toast Notifications**: Visual feedback for success/error/info/warning
4. **Error Boundaries**: Catches React component errors gracefully
5. **TypeScript Support**: Full type safety for all error operations

## 🔧 Error Handler

### Import

```typescript
import {
  handleAdminError,
  handleValidationError,
  showSuccess,
  showError,
  showSuccessMessage,
  SUCCESS_MESSAGES,
} from '@/domains/admin/utils';
```

### Basic Usage

```typescript
// In mutation handlers
const { mutate: createUser, isPending } = useCreateUser({
  onSuccess: () => {
    showSuccessMessage('USER_CREATED');
    // or: showSuccess('User created successfully');
  },
  onError: (error) => {
    handleAdminError(error, 'Failed to create user');
  },
});
```

### Advanced Error Handling

```typescript
try {
  const result = await createRole(data);
  showSuccess('Role created successfully', 3000); // Custom duration
} catch (error) {
  // Custom error handling with options
  handleAdminError(error, 'Failed to create role', {
    showToast: true, // Show toast notification (default: true)
    duration: 5000, // Toast duration in ms (default: 5000)
    logError: true, // Log to console in dev (default: true)
  });
}
```

### Validation Errors

```typescript
try {
  await updateUser(userId, formData);
  showSuccessMessage('USER_UPDATED');
} catch (error) {
  // Extract field-level validation errors
  const validationErrors = handleValidationError(
    error,
    'Please fix the validation errors'
  );
  
  // validationErrors = { email: 'Invalid email format', ... }
  setFormErrors(validationErrors);
}
```

## 🎨 Toast Notifications

### Types

- **Success**: Green toast for successful operations
- **Error**: Red toast for errors
- **Info**: Blue toast for informational messages
- **Warning**: Yellow toast for warnings

### Usage

```typescript
import { showSuccess, showError, showInfo, showWarning } from '@/domains/admin/utils';

// Success
showSuccess('User approved successfully');
showSuccess('Changes saved', 3000); // Custom duration

// Error
showError('Failed to delete role');

// Info
showInfo('System maintenance scheduled for tonight');

// Warning
showWarning('This action cannot be undone');
```

### Predefined Success Messages

```typescript
import { showSuccessMessage, SUCCESS_MESSAGES } from '@/domains/admin/utils';

// Use predefined messages (type-safe)
showSuccessMessage('USER_CREATED');
showSuccessMessage('ROLE_UPDATED');
showSuccessMessage('USERS_BULK_APPROVED');

// Available messages:
// - USER_CREATED, USER_UPDATED, USER_DELETED
// - USER_APPROVED, USER_REJECTED, USER_ACTIVATED, USER_SUSPENDED
// - USERS_BULK_APPROVED, USERS_BULK_REJECTED, USERS_BULK_DELETED
// - ROLE_CREATED, ROLE_UPDATED, ROLE_DELETED
// - ROLE_ASSIGNED, ROLE_REVOKED, ROLES_ASSIGNED
// - ANALYTICS_EXPORTED, ANALYTICS_REFRESHED
// - AUDIT_EXPORTED, AUDIT_CLEARED
// - SETTINGS_UPDATED, SETTINGS_RESET
// - OPERATION_SUCCESS, CHANGES_SAVED, DATA_EXPORTED
```

## 🛡️ Error Boundary

Wraps admin pages to catch and display errors gracefully.

### Basic Usage

```typescript
import { AdminErrorBoundary } from '@/domains/admin/components';

function AdminPage() {
  return (
    <AdminErrorBoundary>
      <YourAdminContent />
    </AdminErrorBoundary>
  );
}
```

### With Custom Options

```typescript
<AdminErrorBoundary
  showRetry={true}        // Show "Try Again" button (default: true)
  showHome={true}         // Show "Go to Dashboard" button (default: true)
  showSupport={true}      // Show "Contact Support" button (default: true)
  onError={(error, errorInfo) => {
    // Custom error handling
    console.error('Admin page error:', error, errorInfo);
  }}
>
  <YourAdminContent />
</AdminErrorBoundary>
```

### With Custom Fallback UI

```typescript
<AdminErrorBoundary
  fallback={
    <div className="p-8 text-center">
      <h2>Oops! Something went wrong</h2>
      <button onClick={() => window.location.reload()}>
        Reload Page
      </button>
    </div>
  }
>
  <YourAdminContent />
</AdminErrorBoundary>
```

## 📝 Usage Examples

### Example 1: User Creation

```typescript
import { useCreateUser } from '@/domains/admin/hooks';
import { handleAdminError, showSuccessMessage } from '@/domains/admin/utils';
import { AdminErrorBoundary } from '@/domains/admin/components';

function CreateUserPage() {
  const { mutate: createUser, isPending } = useCreateUser({
    onSuccess: () => {
      showSuccessMessage('USER_CREATED');
      navigate('/admin/users');
    },
    onError: (error) => {
      handleAdminError(error, 'Failed to create user');
    },
  });

  const handleSubmit = (data: CreateUserRequest) => {
    createUser(data);
  };

  return (
    <AdminErrorBoundary>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <button type="submit" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </AdminErrorBoundary>
  );
}
```

### Example 2: Bulk Operations

```typescript
import { useApproveUsers } from '@/domains/admin/hooks';
import { handleAdminError, showSuccessMessage } from '@/domains/admin/utils';

function BulkApprovalButton({ selectedIds }: { selectedIds: string[] }) {
  const { mutate: approveUsers, isPending } = useApproveUsers({
    onSuccess: (data) => {
      const count = selectedIds.length;
      showSuccess(`${count} user${count !== 1 ? 's' : ''} approved successfully`);
    },
    onError: (error) => {
      handleAdminError(error, 'Failed to approve users');
    },
  });

  return (
    <button
      onClick={() => approveUsers(selectedIds)}
      disabled={isPending || selectedIds.length === 0}
    >
      Approve Selected ({selectedIds.length})
    </button>
  );
}
```

### Example 3: Form Validation

```typescript
import { useState } from 'react';
import { useUpdateRole } from '@/domains/admin/hooks';
import { handleValidationError, showSuccessMessage } from '@/domains/admin/utils';

function EditRoleForm({ roleName }: { roleName: string }) {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { mutate: updateRole, isPending } = useUpdateRole({
    onSuccess: () => {
      showSuccessMessage('ROLE_UPDATED');
      setFormErrors({});
    },
    onError: (error) => {
      const validationErrors = handleValidationError(error);
      setFormErrors(validationErrors);
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      updateRole({ roleName, data: formData });
    }}>
      <input
        name="display_name"
        className={formErrors.display_name ? 'border-red-500' : ''}
      />
      {formErrors.display_name && (
        <p className="text-red-500 text-sm">{formErrors.display_name}</p>
      )}
      {/* More fields */}
    </form>
  );
}
```

## 🔢 Error Codes

The system supports 100+ error codes mapped to user-friendly messages:

### User Errors (USER_001 - USER_010)
- `USER_001`: User not found
- `USER_002`: Email address already exists
- `USER_003`: User already approved
- `USER_004`: User already rejected
- `USER_005`: Invalid user status transition
- And more...

### Role Errors (ROLE_001 - ROLE_010)
- `ROLE_001`: Role not found
- `ROLE_002`: Role name already exists
- `ROLE_003`: Cannot delete system role
- And more...

### Permission Errors (PERM_001 - PERM_005)
- `PERM_001`: Permission denied
- `PERM_002`: Insufficient privileges
- And more...

### Analytics Errors (ANALYTICS_001 - ANALYTICS_005)
### Audit Errors (AUDIT_001 - AUDIT_005)
### Auth Errors (AUTH_001 - AUTH_008)
### Validation Errors (VALIDATION_001 - VALIDATION_010)
### System Errors (SYSTEM_001 - SYSTEM_008)

See `errorHandler.ts` for complete list.

## ✅ Best Practices

### 1. Always Wrap Admin Pages

```typescript
// ✅ Good
function AdminPage() {
  return (
    <AdminErrorBoundary>
      <PageContent />
    </AdminErrorBoundary>
  );
}

// ❌ Bad - No error boundary
function AdminPage() {
  return <PageContent />;
}
```

### 2. Use Predefined Success Messages

```typescript
// ✅ Good - Type-safe, consistent
showSuccessMessage('USER_CREATED');

// ❌ Okay but not preferred - Hard to maintain
showSuccess('User created successfully');
```

### 3. Provide Fallback Messages

```typescript
// ✅ Good - Fallback for unknown errors
handleAdminError(error, 'Failed to complete operation');

// ❌ Bad - No fallback
handleAdminError(error);
```

### 4. Handle Validation Separately

```typescript
// ✅ Good - Extract field errors
const validationErrors = handleValidationError(error);
setFormErrors(validationErrors);

// ❌ Bad - Generic error for validation issues
handleAdminError(error);
```

### 5. Use Custom Durations for Important Messages

```typescript
// ✅ Good - Longer duration for critical messages
showError('User account suspended', 10000); // 10 seconds

// ✅ Good - Shorter for quick actions
showSuccess('Changes saved', 2000); // 2 seconds
```

### 6. Don't Show Multiple Toasts for Same Error

```typescript
// ✅ Good
try {
  await operation();
} catch (error) {
  handleAdminError(error); // Shows toast internally
}

// ❌ Bad - Shows duplicate toasts
try {
  await operation();
} catch (error) {
  showError('Operation failed');
  handleAdminError(error); // Shows another toast
}
```

## 🚀 Integration with React Query

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleAdminError, showSuccessMessage } from '@/domains/admin/utils';

function useCustomMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiCall,
    onSuccess: () => {
      showSuccessMessage('OPERATION_SUCCESS');
      queryClient.invalidateQueries({ queryKey: ['admin', 'data'] });
    },
    onError: (error) => {
      handleAdminError(error, 'Operation failed');
    },
  });
}
```

## 📚 Additional Resources

- Error Types: `src/core/error/types.ts`
- Core Error Handler: `src/core/error/errorHandler.ts`
- Toast Store: `src/store/notificationStore.ts`
- Toast Component: `src/shared/components/ui/Toast.tsx`

---

**Last Updated**: November 3, 2025  
**Version**: 1.0.0
