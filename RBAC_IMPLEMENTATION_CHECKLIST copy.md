# RBAC Implementation Checklist & Quick Reference

## Complete Implementation Checklist

### Phase 1: Core Infrastructure (Steps 1-2, ~30 minutes)

#### Step 1.1: Role-Permission Mapping
- [ ] Create file: `src/domains/auth/utils/rolePermissionMap.ts`
- [ ] Define `RoleLevel` enum (PUBLIC=0 to SUPER_ADMIN=5)
- [ ] Define `ROLE_HIERARCHY` mapping
- [ ] Define `ROLE_PERMISSIONS` record with all permissions per role
- [ ] Implement `getEffectivePermissions()` function
- [ ] Implement `hasMinimumRole()` function
- [ ] Test with: `npm test`

**Quick Test:**
```typescript
import { getEffectivePermissions } from '@/domains/auth/utils/rolePermissionMap';

// Should return 50+ permissions
console.log(getEffectivePermissions('admin'));

// Should include common perms
console.log(getEffectivePermissions('user'));
```

#### Step 1.2: Enhance AuthContext
- [ ] Open: `src/domains/auth/context/AuthContext.tsx`
- [ ] Add import: `import { getEffectivePermissions } from '../utils/rolePermissionMap';`
- [ ] Update interface: Add `permissions: string[]` to `AuthContextValue`
- [ ] Update value creation: Add `permissions: state.user ? state.user.roles.flatMap(role => getEffectivePermissions(role)) : [],`
- [ ] Save and verify no TypeScript errors

**Quick Test:**
```typescript
// In any component within <AuthProvider>:
const auth = use(AuthContext);
console.log('Permissions:', auth.permissions); // Should see array of permissions
```

---

### Phase 2: Permission Checking Hooks (Steps 3-4, ~20 minutes)

#### Step 2.1: Create useAuth Hook
- [ ] Create file: `src/domains/auth/hooks/useAuth.ts`
- [ ] Import `use` from React
- [ ] Import `AuthContext` from context
- [ ] Implement hook that uses `use(AuthContext)`
- [ ] Add null check and error throw
- [ ] Return auth context

#### Step 2.2: Create usePermissions Hook
- [ ] Create/Update file: `src/domains/rbac/hooks/usePermissions.ts`
- [ ] Import `use` from React and `useAuth`
- [ ] Implement 8 functions:
  - [ ] `hasRole(role)` - Single role check with hierarchy
  - [ ] `hasAnyRole(roles)` - Multiple roles (ANY)
  - [ ] `hasAllRoles(roles)` - Multiple roles (ALL)
  - [ ] `hasPermission(perm)` - Single permission + wildcards
  - [ ] `hasAnyPermission(perms)` - Multiple permissions (ANY)
  - [ ] `hasAllPermissions(perms)` - Multiple permissions (ALL)
  - [ ] `hasAccess(options)` - Complex role + permission checks
- [ ] Return object with all methods
- [ ] Verify TypeScript types compile

**Quick Test:**
```typescript
// In admin page within <AuthProvider>:
const { hasRole, hasPermission, hasAccess } = usePermissions();

console.log('Is admin?', hasRole('admin'));
console.log('Can delete users?', hasPermission('users:delete'));
console.log('Can manage?', hasAccess({ requiredRole: 'manager', requiredPermissions: 'users:view_list' }));
```

---

### Phase 3: UI Components (Steps 5-6, ~20 minutes)

#### Step 3.1: Create CanAccess Component
- [ ] Create file: `src/components/CanAccess.tsx`
- [ ] Import `usePermissions` from RBAC hooks
- [ ] Define `CanAccessProps` interface
- [ ] Implement component that:
  - [ ] Calls `hasAccess()` with props
  - [ ] Returns children if has access
  - [ ] Returns fallback if no access
- [ ] Export component

**Quick Test:**
```tsx
<CanAccess requiredRole="admin" fallback={<p>No access</p>}>
  <AdminPanel />
</CanAccess>
```

#### Step 3.2: Create RoleBasedButton Component
- [ ] Create file: `src/components/RoleBasedButton.tsx`
- [ ] Import `usePermissions`
- [ ] Create component extending HTMLButtonElement
- [ ] Implement that:
  - [ ] Calls `hasAccess()` with required props
  - [ ] Disables button if no access
  - [ ] Shows tooltip on hover (optional)
  - [ ] Uses your existing Button styling
- [ ] Export component

**Quick Test:**
```tsx
<RoleBasedButton
  requiredRole="admin"
  onClick={handleDelete}
>
  Delete
</RoleBasedButton>
```

#### Step 3.3: Create ProtectedRoute Component (Optional)
- [ ] Create file: `src/core/routing/ProtectedRoute.tsx` OR update RouteRenderer
- [ ] Implement route guard that checks:
  - [ ] `isLoading` → show loading
  - [ ] `!isAuthenticated` → redirect to login
  - [ ] `requiredRoles` → check permissions
  - [ ] If no access → show access denied or redirect

---

### Phase 4: Routing Integration (Steps 7-8, ~15 minutes)

#### Step 4.1: Update RouteRenderer
- [ ] Open: `src/core/routing/RouteRenderer.tsx` or create it
- [ ] Import `usePermissions` hook
- [ ] Add guards for each route type:
  - [ ] Guard 'public': Check if authenticated → redirect to dashboard
  - [ ] Guard 'protected': Check if authenticated → redirect to login
  - [ ] Guard 'admin': Check if authenticated + required roles
  - [ ] Guard 'none': Render as-is
- [ ] Add loading state handling
- [ ] Add access denied handling

#### Step 4.2: Test Route Protection
- [ ] Login as regular user
- [ ] Try accessing `/admin` → should redirect or show access denied
- [ ] Login as admin
- [ ] Access `/admin` → should show page
- [ ] Logout → should redirect to login

---

### Phase 5: API Endpoint Mapping (Steps 9, ~10 minutes)

#### Step 5.1: Create API Role Mapping
- [ ] Create file: `src/domains/rbac/utils/apiRoleMapping.ts`
- [ ] Define `API_ENDPOINT_ROLE_MAP` with all endpoints:
  - [ ] Auth endpoints (public)
  - [ ] Protected endpoints (user+)
  - [ ] Admin endpoints
  - [ ] Super admin endpoints
- [ ] Implement helper functions:
  - [ ] `getRequiredRolesForEndpoint(method, path)`
  - [ ] `canRoleAccessEndpoint(method, path, role)`
  - [ ] `getAccessibleEndpoints(role)`

**Format:**
```typescript
const API_ENDPOINT_ROLE_MAP: Record<string, string[]> = {
  'POST /auth/login': ['public'],
  'GET /admin/users': ['admin', 'super_admin'],
  'DELETE /admin/users/:id': ['super_admin'],
};
```

---

### Phase 6: Component Updates (Steps 10, ~30 minutes)

#### Step 6.1: Update Layout Navigation
- [ ] Open: `src/components/Layout.tsx`
- [ ] Import `CanAccess` and `RoleBasedButton` components
- [ ] Add role-based navigation items:
  - [ ] Admin link: Wrap in `<CanAccess requiredRole="admin">`
  - [ ] Auditor link: Wrap in `<CanAccess requiredRole="auditor">`
  - [ ] User dashboard: Show when authenticated
- [ ] Update auth buttons section:
  - [ ] Show user name + roles when authenticated
  - [ ] Add logout button with permission check
- [ ] Test responsive behavior on mobile

#### Step 6.2: Update Admin Pages
For each admin/protected page:
- [ ] [ ] Add permission check at top of component
- [ ] [ ] Show access denied if no permission
- [ ] [ ] Wrap dangerous actions in `<RoleBasedButton>`
- [ ] [ ] Show success/error messages

Example pages to update:
- [ ] `src/domains/admin/pages/DashboardPage.tsx`
- [ ] `src/domains/admin/pages/AuditLogsPage.tsx`
- [ ] `src/domains/user/pages/DashboardPage.tsx`

---

### Phase 7: Testing (Steps 11-12, ~20 minutes)

#### Step 7.1: Manual Testing
- [ ] **Test Scenario 1: Public User**
  - [ ] Visit `/login` → accessible ✅
  - [ ] Visit `/admin` → redirected or denied ✅
  - [ ] Cannot see admin nav links ✅

- [ ] **Test Scenario 2: Regular User**
  - [ ] Login successfully ✅
  - [ ] Can view dashboard ✅
  - [ ] Cannot see admin panel ✅
  - [ ] Edit profile button visible ✅
  - [ ] Delete button disabled/hidden ✅

- [ ] **Test Scenario 3: Admin User**
  - [ ] Login successfully ✅
  - [ ] Can view admin panel ✅
  - [ ] Edit and delete buttons enabled ✅
  - [ ] Can manage users ✅
  - [ ] Can manage roles ✅

- [ ] **Test Scenario 4: Permission Checks**
  - [ ] `hasRole('admin')` works correctly ✅
  - [ ] `hasPermission('users:delete')` works ✅
  - [ ] `hasAccess({...})` combines checks ✅
  - [ ] Wildcard permissions work (`admin:*`) ✅

#### Step 7.2: API Testing
- [ ] Open browser DevTools → Network tab
- [ ] Make API calls as different roles
- [ ] Verify:
  - [ ] Authorization header present ✅
  - [ ] Backend returns 200 for authorized requests ✅
  - [ ] Backend returns 403 for unauthorized requests ✅
  - [ ] Error handling works correctly ✅

---

## Implementation Order

**Recommended sequence:**
1. ✅ Create rolePermissionMap.ts (15 min)
2. ✅ Enhance AuthContext (10 min)
3. ✅ Create useAuth and usePermissions hooks (15 min)
4. ✅ Create CanAccess and RoleBasedButton (15 min)
5. ✅ Update RouteRenderer/ProtectedRoute (10 min)
6. ✅ Create apiRoleMapping.ts (10 min)
7. ✅ Update Layout and admin pages (30 min)
8. ✅ Manual testing and fixes (20 min)

**Total time: ~2 hours**

---

## File Structure After Implementation

```
src/
├── components/
│   ├── CanAccess.tsx                    ← NEW
│   ├── RoleBasedButton.tsx              ← NEW
│   ├── Layout.tsx                       ← MODIFIED
│   ├── Button.tsx
│   └── ...
├── core/
│   ├── routing/
│   │   ├── RouteRenderer.tsx            ← NEW or MODIFIED
│   │   ├── config.ts
│   │   └── ...
│   └── ...
├── domains/
│   ├── auth/
│   │   ├── context/
│   │   │   └── AuthContext.tsx          ← MODIFIED
│   │   ├── hooks/
│   │   │   └── useAuth.ts               ← NEW
│   │   ├── utils/
│   │   │   └── rolePermissionMap.ts     ← NEW
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── rbac/
│   │   ├── hooks/
│   │   │   └── usePermissions.ts        ← NEW or ENHANCED
│   │   ├── utils/
│   │   │   └── apiRoleMapping.ts        ← NEW
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── admin/
│   │   ├── pages/
│   │   │   └── DashboardPage.tsx        ← MODIFIED
│   │   └── ...
│   └── ...
└── ...
```

---

## Quick Reference: Function Signatures

### Permission Checking

```typescript
// From usePermissions hook
const { 
  user,                                           // User | null
  permissions,                                    // string[]
  hasRole: (role: string) => boolean,            // Single role check
  hasAnyRole: (roles: string[]) => boolean,      // ANY of roles
  hasAllRoles: (roles: string[]) => boolean,     // ALL roles
  hasPermission: (perm: string) => boolean,      // Single permission
  hasAnyPermission: (perms: string[]) => boolean, // ANY permission
  hasAllPermissions: (perms: string[]) => boolean,// ALL permissions
  hasAccess: (options: PermissionCheckOptions) => boolean, // Complex check
} = usePermissions();

interface PermissionCheckOptions {
  requiredRole?: string | string[];
  requiredPermissions?: string | string[];
  requireAllPermissions?: boolean;
}
```

### Components

```typescript
// CanAccess - Conditional rendering
<CanAccess
  requiredRole="admin"
  requiredPermissions="users:delete"
  requireAllPermissions={false}
  fallback={<div>No access</div>}
>
  <Content />
</CanAccess>

// RoleBasedButton - Button with permission check
<RoleBasedButton
  requiredRole="admin"
  requiredPermissions="users:delete"
  disabledTooltip="Only admins can delete"
  onClick={handleDelete}
>
  Delete
</RoleBasedButton>
```

---

## Common Use Cases

### Use Case 1: Show Admin Panel Only
```typescript
<CanAccess requiredRole="admin">
  <AdminDashboard />
</CanAccess>
```

### Use Case 2: Check Before Action
```typescript
const { hasPermission } = usePermissions();

if (!hasPermission('users:delete')) {
  alert('You cannot delete users');
  return;
}
deleteUser(userId);
```

### Use Case 3: Disable Button for Non-Authorized
```typescript
<RoleBasedButton
  requiredRole="manager"
  onClick={handleEdit}
>
  Edit
</RoleBasedButton>
```

### Use Case 4: Complex Permission Logic
```typescript
const { hasAccess } = usePermissions();

const canExport = hasAccess({
  requiredRole: 'manager',
  requiredPermissions: ['users:view_list', 'users:export'],
  requireAllPermissions: true,
});

if (canExport) {
  <button>Export Users</button>
}
```

### Use Case 5: Show Different UI for Different Roles
```typescript
const { hasRole } = usePermissions();

return (
  <>
    {hasRole('admin') && <AdminTools />}
    {hasRole('manager') && <ManagerTools />}
    {hasRole('user') && <UserProfile />}
  </>
);
```

---

## Role & Permission Reference

### Role Hierarchy
| Role | Level | Inherits From |
|------|-------|---------------|
| public | 0 | - |
| user | 1 | public |
| employee | 2 | user |
| manager | 3 | employee |
| admin | 4 | manager |
| super_admin | 5 | admin |

### Key Permissions

**Authentication:**
- `auth:login`, `auth:logout`, `auth:*`

**Profile:**
- `profile:view_own`, `profile:update_own`, `profile:*`

**Users Management:**
- `users:view_list`, `users:view_details`, `users:create`, `users:update_any`, `users:delete`, `users:*`

**RBAC:**
- `rbac:view_roles`, `rbac:manage_roles`, `rbac:manage_permissions`, `rbac:*`

**Audit:**
- `audit:view_own_logs`, `audit:view_team_logs`, `audit:view_all_logs`, `audit:export_logs`, `audit:*`

**Admin:**
- `admin:system_settings`, `admin:*`

**Monitoring:**
- `monitoring:view_basic`, `monitoring:view_detailed`, `monitoring:manage_cache`, `monitoring:*`

---

## Debugging Tips

### Enable Debug Logging

```typescript
// In usePermissions.ts, add console.logs:
console.log('User:', user);
console.log('Permissions:', permissions);
console.log('Has admin?', hasRole('admin'));
console.log('Has users:delete?', hasPermission('users:delete'));
```

### Check Browser LocalStorage

```javascript
// In DevTools console:
localStorage.getItem('user') // See stored user
localStorage.getItem('token') // See token
```

### Monitor API Calls

```javascript
// DevTools Network tab:
// Check Authorization header: Bearer <token>
// Check response status: 200 (allowed) vs 403 (forbidden)
```

### Test Role Changes

```typescript
// Manually change user role in localStorage for testing:
const mockUser = { ...JSON.parse(localStorage.getItem('user')), roles: ['admin'] };
localStorage.setItem('user', JSON.stringify(mockUser));
// Refresh page to see changes
```

---

## Next Steps After Implementation

1. **Monitor & Audit:**
   - Use apiRoleMapping.ts to document all endpoints
   - Verify backend returns correct status codes (200, 403, 401)

2. **Extend:**
   - Add role assignment UI in admin panel
   - Add permission assignment UI
   - Add audit logging for role changes

3. **Optimize:**
   - Cache permissions in React Query
   - Pre-load permissions on login
   - Debounce permission checks

4. **Secure:**
   - Verify all sensitive actions check permissions
   - Log all permission checks for audit trail
   - Implement rate limiting for sensitive endpoints

---

## Verification Checklist

Before considering RBAC complete:

- [ ] All routes properly protected
- [ ] All buttons respect permissions
- [ ] All API calls check auth
- [ ] Backend validates permissions
- [ ] Frontend shows access denied
- [ ] Permissions update on role change
- [ ] Logout clears all auth data
- [ ] Token refresh works
- [ ] No permission bypasses
- [ ] Error handling works
- [ ] Mobile responsive

**You're ready to deploy! 🚀**
