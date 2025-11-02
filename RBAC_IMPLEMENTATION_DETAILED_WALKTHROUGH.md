# RBAC Implementation - Detailed Code Walkthrough

## How Your RBAC System Will Work

### Visual Flow Diagram

```
User Login
    ↓
Backend validates credentials
    ↓
Backend returns: User { roles: ['admin', 'manager'], ... }
    ↓
Frontend stores User + Permissions in AuthContext
    ↓
getEffectivePermissions('admin') computes all permissions
    ↓
AuthContext.permissions = ['auth:*', 'users:*', 'rbac:*', 'admin:*', ...]
    ↓
usePermissions() provides hooks: hasRole(), hasPermission(), hasAccess()
    ↓
Components use these hooks: <CanAccess>, <RoleBasedButton>, ProtectedRoute
    ↓
UI renders based on user permissions
```

---

## Step-by-Step Walkthrough with Real Code

### STEP 1: User Logs In

**File:** `src/domains/auth/pages/LoginPage.tsx`

```typescript
import { useAuth } from '@/domains/auth/hooks/useAuth';
import authService from '@/domains/auth/services/authService';

export default function LoginPage() {
  const { login } = useAuth();

  const handleSubmit = async (email: string, password: string) => {
    // 1. Call backend login endpoint
    const response = await authService.login({ email, password });
    
    // Backend returns:
    // {
    //   access_token: "eyJhbGc...",
    //   refresh_token: "eyJhbGc...",
    //   user: {
    //     user_id: "123",
    //     email: "admin@test.com",
    //     first_name: "John",
    //     last_name: "Doe",
    //     roles: ["admin", "manager"],  // ← Multiple roles!
    //     is_active: true,
    //     is_verified: true
    //   }
    // }

    // 2. Store in AuthContext
    login(
      {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
      },
      response.user
    );
    // Now the user is authenticated!
  };

  return (
    // Your login form JSX
  );
}
```

---

### STEP 2: AuthContext Computes Permissions

**File:** `src/domains/auth/context/AuthContext.tsx`

When you call `login()`, AuthContext does this:

```typescript
const login = useCallback((tokens: AuthTokens, user: User) => {
  // Store user and tokens
  authStorage.setTokens(tokens);
  authStorage.setUser(user);

  setState({
    user,
    isAuthenticated: true,
    isLoading: false,
  });
});

// Then the context value is created:
const value: AuthContextValue = {
  user: state.user,  // { user_id, email, roles: ['admin'] }
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,

  // ✅ PERMISSIONS ARE COMPUTED HERE
  permissions: state.user
    ? state.user.roles.flatMap(role => getEffectivePermissions(role))
    : [],
  // If user.roles = ['admin']
  // getEffectivePermissions('admin') returns ALL admin permissions
  // Result: permissions = ['auth:*', 'users:*', 'rbac:*', 'admin:*', ...]

  // Actions...
  login,
  logout,
  checkAuth,
  refreshSession,
  updateUser,
};

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
```

---

### STEP 3: Component Uses usePermissions Hook

**Example File:** `src/domains/admin/pages/DashboardPage.tsx`

```typescript
import { usePermissions } from '@/domains/rbac/hooks/usePermissions';
import { CanAccess } from '@/components/CanAccess';

export default function AdminDashboard() {
  // ✅ This hook gets permissions from AuthContext
  const { user, hasPermission, hasRole, hasAccess } = usePermissions();

  console.log('User:', user);
  // Output: { user_id: '123', email: 'admin@test.com', roles: ['admin'], ... }

  console.log('Has admin role?', hasRole('admin'));
  // Output: true

  console.log('Has users:delete permission?', hasPermission('users:delete'));
  // Output: true (because admin role has 'admin:*' permission)

  return (
    <div>
      {/* Basic role check */}
      <CanAccess requiredRole="admin">
        <div className="bg-red-100 p-4">
          <h2>⚠️ Admin Only Section</h2>
          <p>Only admins can see this.</p>
        </div>
      </CanAccess>

      {/* Permission check */}
      <CanAccess requiredPermissions="users:delete">
        <button onClick={handleDeleteUser}>Delete User</button>
      </CanAccess>

      {/* Multiple permissions (ANY) */}
      <CanAccess requiredPermissions={['users:create', 'users:update']}>
        <div>Can create or update users</div>
      </CanAccess>

      {/* Multiple permissions (ALL) */}
      <CanAccess
        requiredPermissions={['users:view_list', 'users:export']}
        requireAllPermissions={true}
      >
        <button>Export Users</button>
      </CanAccess>

      {/* Complex access check */}
      {hasAccess({
        requiredRole: 'manager',
        requiredPermissions: ['users:manage_team'],
      }) && (
        <div>Team management section</div>
      )}
    </div>
  );
}
```

---

## Real-World Scenario: User Management Page

### Scenario: Admin Delete User

**Before RBAC:** Hard to know who can access what
```typescript
// ❌ OLD WAY - No permission checking
function UserList() {
  return users.map(user => (
    <div key={user.id}>
      <span>{user.name}</span>
      <button onClick={() => deleteUser(user.id)}>Delete</button> {/* Anyone can click! */}
    </div>
  ));
}
```

**With RBAC:** Clear permission enforcement
```typescript
// ✅ NEW WAY - Permission checking
import { CanAccess } from '@/components/CanAccess';
import { RoleBasedButton } from '@/components/RoleBasedButton';

function UserList({ users }) {
  const { hasPermission } = usePermissions();

  // Only render this section if user can access it
  if (!hasPermission('users:view_list')) {
    return <div>You don't have permission to view users</div>;
  }

  return users.map(user => (
    <div key={user.id} className="flex items-center justify-between p-4 border rounded">
      <span>{user.name}</span>

      <div className="flex gap-2">
        {/* Edit button - requires manager role */}
        <RoleBasedButton
          requiredRole="manager"
          onClick={() => editUser(user.id)}
          disabledTooltip="Only managers can edit users"
        >
          Edit
        </RoleBasedButton>

        {/* Delete button - requires admin role AND permission */}
        <RoleBasedButton
          requiredRole="admin"
          requiredPermissions="users:delete"
          onClick={() => deleteUser(user.id)}
          disabledTooltip="Only admins can delete users"
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Delete
        </RoleBasedButton>
      </div>
    </div>
  ));
}
```

**What Happens:**
1. User with `manager` role views the page
   - Edit button: ✅ ENABLED (manager role requirement met)
   - Delete button: ❌ DISABLED (requires admin role, not met)
   - Hover on delete: Shows tooltip "Only admins can delete users"

2. User with `admin` role views the page
   - Edit button: ✅ ENABLED (admin has manager+ permissions)
   - Delete button: ✅ ENABLED (admin role requirement met)

---

## Complex Scenario: Role-Based Dashboard

**File:** `src/domains/admin/pages/AdminDashboard.tsx`

```typescript
import { usePermissions } from '@/domains/rbac/hooks/usePermissions';
import { CanAccess } from '@/components/CanAccess';

export default function AdminDashboard() {
  const { user, hasAccess, hasPermission } = usePermissions();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {/* ========== SECTION 1: User Management ========== */}
      <CanAccess requiredPermissions="users:view_list">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Users</h3>
          <p>Total Users: {userCount}</p>
          <button>View All Users</button>
        </div>
      </CanAccess>

      {/* ========== SECTION 2: Role Management ========== */}
      <CanAccess requiredRole="admin">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Roles</h3>
          <p>Manage system roles</p>
          <button>Manage Roles</button>
        </div>
      </CanAccess>

      {/* ========== SECTION 3: System Settings ========== */}
      <CanAccess requiredRole="super_admin" fallback={
        <div className="bg-gray-100 rounded-lg p-6 opacity-50">
          <h3 className="text-lg font-bold mb-4">System Settings</h3>
          <p className="text-gray-500">Super admin only</p>
        </div>
      }>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">System Settings</h3>
          <button>Configure</button>
        </div>
      </CanAccess>

      {/* ========== SECTION 4: Audit Logs ========== */}
      <CanAccess requiredPermissions={['audit:view_all_logs', 'audit:export_logs']}>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Audit Logs</h3>
          <button>View Logs</button>
          <button>Export Logs</button>
        </div>
      </CanAccess>

      {/* ========== SECTION 5: Monitoring ========== */}
      <CanAccess
        requiredPermissions={['monitoring:view_detailed', 'monitoring:manage_cache']}
        requireAllPermissions={false} // Show if has ANY permission
      >
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">System Monitoring</h3>
          <div className="space-y-2">
            {hasPermission('monitoring:view_detailed') && (
              <p>✅ Can view detailed metrics</p>
            )}
            {hasPermission('monitoring:manage_cache') && (
              <p>✅ Can manage cache</p>
            )}
          </div>
        </div>
      </CanAccess>

      {/* ========== SECTION 6: Role-Based Actions ========== */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Your Access Level</h3>
        <div className="space-y-2 text-sm">
          <p><strong>User:</strong> {user?.email}</p>
          <p><strong>Roles:</strong> {user?.roles.join(', ')}</p>
          <p><strong>Permissions:</strong> {hasAccess({
            requiredRole: 'admin'
          }) ? '🔐 Admin' : '👤 Regular User'}</p>
        </div>
      </div>
    </div>
  );
}
```

---

## Permission Hierarchy: How It Works

### The Permission Cascade

When a user logs in with `roles: ['manager']`:

```typescript
// 1. Frontend calls getEffectivePermissions('manager')
const managerPerms = getEffectivePermissions('manager');

// 2. Function checks role hierarchy:
//    ROLE_HIERARCHY['manager'] = 3
//    So we include permissions from:
//    - PUBLIC (level 0)
//    - USER (level 1)
//    - EMPLOYEE (level 2)
//    - MANAGER (level 3)

// 3. Result:
const allPerms = [
  // From PUBLIC
  'auth:login',
  'auth:register',
  'public:view',
  
  // From USER
  'auth:login', // duplicate, deduplicated by Set
  'auth:logout',
  'profile:view_own',
  'profile:update_own',
  'profile:change_password',
  
  // From EMPLOYEE
  'users:view_list',
  'users:view_details',
  'audit:view_own_logs',
  
  // From MANAGER
  'users:manage_team',
  'rbac:view_roles',
  'audit:view_team_logs',
  'monitoring:view_basic',
];

// 4. Now hasPermission('users:view_list') returns true
// Because 'users:view_list' is in the permissions array
```

### Checking Multiple Permissions

```typescript
const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();

// Check single
hasPermission('users:delete');  // false if user is manager (not admin)

// Check ANY - returns true if user has at least one
hasAnyPermission(['users:create', 'users:update']);

// Check ALL - returns true if user has all of them
hasAllPermissions(['users:view_list', 'audit:view_own_logs']);
```

---

## Real-World Implementation: Admin Users Page

**File:** `src/domains/admin/pages/AdminUsersPage.tsx`

```typescript
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { usePermissions } from '@/domains/rbac/hooks/usePermissions';
import { CanAccess } from '@/components/CanAccess';
import { RoleBasedButton } from '@/components/RoleBasedButton';
import Button from '@/components/Button';
import userService from '@/domains/user/services/userService';

export default function AdminUsersPage() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { hasAccess, hasPermission } = usePermissions();

  // ✅ Permission check before API call
  if (!hasPermission('users:view_list')) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h2 className="text-red-800 font-bold">Access Denied</h2>
        <p className="text-red-700">You don't have permission to view users.</p>
      </div>
    );
  }

  // Fetch users (API call includes auth token in header)
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', 'list'],
    queryFn: () => userService.getUsers(), // Backend checks user role again
  });

  // Delete mutation with permission check
  const deleteMutation = useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: () => {
      // Refresh users list
    },
  });

  const handleDeleteUser = (userId: string) => {
    if (!hasPermission('users:delete')) {
      alert('You do not have permission to delete users');
      return;
    }
    deleteMutation.mutate(userId);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>

        {/* Create button - visible only if has permission */}
        <CanAccess requiredPermissions="users:create">
          <Button
            variant="primary"
            onClick={() => navigate('/admin/users/create')}
          >
            Create User
          </Button>
        </CanAccess>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Roles</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(user => (
              <tr key={user.user_id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{user.first_name} {user.last_name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {user.roles.join(', ')}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  {/* View button - everyone can view */}
                  <CanAccess requiredPermissions="users:view_details">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/admin/users/${user.user_id}`)}
                    >
                      View
                    </Button>
                  </CanAccess>

                  {/* Edit button - requires manager role */}
                  <RoleBasedButton
                    requiredRole="manager"
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/users/${user.user_id}/edit`)}
                    disabledTooltip="Only managers can edit users"
                  >
                    Edit
                  </RoleBasedButton>

                  {/* Delete button - requires admin role */}
                  <RoleBasedButton
                    requiredRole="admin"
                    requiredPermissions="users:delete"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteUser(user.user_id)}
                    disabledTooltip="Only admins can delete users"
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </RoleBasedButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**What Happens:**
1. Component renders
2. `hasPermission('users:view_list')` is checked
   - If false: Show "Access Denied" message, stop here
   - If true: Continue
3. API call: `userService.getUsers()`
   - Frontend: Includes auth token in header
   - Backend: Validates user role again
   - If not authorized: Returns 403 Forbidden
4. Users displayed with action buttons
   - Each button has permission checks
   - Disabled buttons show tooltips on hover

---

## API Calls with Auth

### How Authorization Flows

```typescript
// 1. Component uses api client
import { apiClient } from '@/services/api/apiClient';

// 2. Component calls API
const users = await apiClient.get('/admin/users');

// 3. Request interceptor runs automatically:
//    - Adds auth header: 'Authorization: Bearer <token>'
//    - Includes CSRF token for mutations

// 4. Backend receives request:
//    POST /api/v1/admin/users/delete
//    Headers: {
//      Authorization: Bearer eyJhbGc...,
//      X-CSRF-Token: abc123def456...
//    }

// 5. Backend middleware checks:
//    - Is token valid? YES
//    - Does token user have 'users:delete' permission? 
//    - Is user role 'admin' or 'super_admin'?
//    - If YES to all: Process request
//    - If NO: Return 403 Forbidden

// 6. Response comes back to frontend
```

---

## Testing RBAC Implementation

### Unit Test for usePermissions Hook

```typescript
// src/__tests__/hooks/usePermissions.test.ts

import { renderHook } from '@testing-library/react';
import { usePermissions } from '@/domains/rbac/hooks/usePermissions';
import { AuthContext } from '@/domains/auth/context/AuthContext';
import { ReactNode } from 'react';

describe('usePermissions', () => {
  // Test 1: Admin role has all permissions
  it('should grant all permissions for admin role', () => {
    const adminUser = {
      user_id: '1',
      email: 'admin@test.com',
      first_name: 'Admin',
      last_name: 'User',
      roles: ['admin'],
      is_active: true,
      is_verified: true,
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthContext.Provider
        value={{
          user: adminUser,
          isAuthenticated: true,
          isLoading: false,
          permissions: ['admin:*', 'users:*', 'rbac:*'],
          login: jest.fn(),
          logout: jest.fn(),
          checkAuth: jest.fn(),
          refreshSession: jest.fn(),
          updateUser: jest.fn(),
        }}
      >
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => usePermissions(), { wrapper });

    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasPermission('users:delete')).toBe(true);
    expect(result.current.hasPermission('rbac:manage_roles')).toBe(true);
  });

  // Test 2: Manager role cannot delete users
  it('should not grant delete permission for manager role', () => {
    const managerUser = {
      user_id: '2',
      email: 'manager@test.com',
      first_name: 'Manager',
      last_name: 'User',
      roles: ['manager'],
      is_active: true,
      is_verified: true,
    };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthContext.Provider
        value={{
          user: managerUser,
          isAuthenticated: true,
          isLoading: false,
          permissions: ['users:manage_team', 'audit:view_team_logs'],
          login: jest.fn(),
          logout: jest.fn(),
          checkAuth: jest.fn(),
          refreshSession: jest.fn(),
          updateUser: jest.fn(),
        }}
      >
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => usePermissions(), { wrapper });

    expect(result.current.hasPermission('users:delete')).toBe(false);
    expect(result.current.hasRole('admin')).toBe(false);
  });
});
```

---

## Troubleshooting Common Issues

### Issue: Permission always returns false

**Cause:** AuthContext permissions array is empty

**Solution:**
```typescript
// Check in AuthContext that permissions are being computed
console.log('User roles:', state.user?.roles);
console.log('Computed permissions:', state.user?.roles.flatMap(role => getEffectivePermissions(role)));

// Make sure rolePermissionMap.ts has entries for all roles
```

### Issue: Route always redirects to login

**Cause:** Auth check failing in RouteRenderer

**Solution:**
```typescript
// In RouteRenderer, add logging:
console.log('Auth state:', { isAuthenticated, isLoading, user });

// Check that AuthContext provides value
// Wrap app with <AuthProvider>
```

### Issue: CanAccess not rendering anything

**Cause:** Wrong permission name or no fallback

**Solution:**
```typescript
// Provide fallback to see what's happening
<CanAccess
  requiredPermissions="users:view_list"
  fallback={<p>DEBUG: No access to users:view_list</p>}
>
  <UserList />
</CanAccess>

// Check exact permission name in apiRoleMapping.ts
```

---

## Summary

Your RBAC system now:
✅ Extracts permissions from user roles  
✅ Provides flexible permission checking hooks  
✅ Protects routes based on roles  
✅ Conditionally renders UI components  
✅ Disables buttons when unauthorized  
✅ Aligns with backend security  

**You have a complete, production-ready RBAC system! 🎉**
