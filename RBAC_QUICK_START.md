# 🚀 RBAC Quick Start

## Import Pattern
```typescript
// Main hook - use this in components
import { usePermissions, PERMISSION_CONSTANTS } from '@/domains/rbac';

// UI components
import { CanAccess, RoleBasedButton } from '@/components';

// Utilities (if needed)
import { 
  getEffectivePermissions,
  hasPermission,
  ROLE_HIERARCHY 
} from '@/domains/rbac/utils/rolePermissionMap';
```

## Basic Usage

### Check Permissions in Component
```typescript
export function DashboardPage() {
  const { hasPermission, hasRole } = usePermissions();
  
  // Single permission check
  const canDelete = hasPermission(PERMISSION_CONSTANTS.USERS.DELETE);
  
  // Single role check
  const isAdmin = hasRole('admin');
  
  // Multiple roles (OR logic)
  const isManager = hasRole(['manager', 'admin']);
  
  return (
    <>
      {canDelete && <button>Delete</button>}
      {isAdmin && <AdminPanel />}
    </>
  );
}
```

### Conditional Rendering
```typescript
// Show content only if authorized
<CanAccess 
  requiredRole="admin"
  fallback={<p>Access Denied</p>}
>
  <AdminFeatures />
</CanAccess>

// With permissions
<CanAccess 
  requiredPermissions={[
    PERMISSION_CONSTANTS.USERS.DELETE,
    PERMISSION_CONSTANTS.USERS.CREATE
  ]}
  requireAllPermissions={false}
>
  <UserActions />
</CanAccess>
```

### Permission-Aware Button
```typescript
<RoleBasedButton
  requiredRole="admin"
  onClick={handleDelete}
  tooltipOnDisabled="Only admins can delete users"
  showTooltip
  variant="danger"
>
  Delete User
</RoleBasedButton>

// Button with specific permissions
<RoleBasedButton
  requiredPermissions={[
    PERMISSION_CONSTANTS.USERS.MANAGE_TEAM,
    PERMISSION_CONSTANTS.AUDIT.VIEW_ALL_LOGS
  ]}
  requireAllPermissions={true}
  tooltipOnDisabled="Missing required permissions"
>
  Manage Team & Audit
</RoleBasedButton>
```

## Permission Levels

### Roles (from lowest to highest)
1. **public** - No authentication
2. **user** - Basic authenticated user
3. **employee** - Internal employee
4. **manager** - Management level
5. **admin** - Administrator (most features)
6. **super_admin** - Full system access
7. **auditor** - Audit-only access (special)

### Permission Constants (Reference)
```typescript
PERMISSION_CONSTANTS = {
  AUTH: { LOGIN, LOGOUT, REGISTER, REFRESH_TOKEN, ALL },
  PROFILE: { VIEW_OWN, EDIT_OWN, VIEW_ANY, EDIT_ANY, ALL },
  USERS: { VIEW_LIST, VIEW_DETAIL, CREATE, UPDATE, DELETE, MANAGE_TEAM, ALL },
  RBAC: { VIEW_ROLES, ASSIGN_ROLES, MANAGE_ROLES, ALL },
  AUDIT: { VIEW_OWN_LOGS, VIEW_ALL_LOGS, EXPORT_LOGS, ALL },
  ADMIN: { DASHBOARD, SYSTEM_CONFIG, MONITORING, ALL },
  EMAIL: { SEND_VERIFICATION, VERIFY, ALL },
  MFA: { ENABLE, DISABLE, VERIFY, ALL },
  SESSIONS: { VIEW_OWN, VIEW_ALL, REVOKE, ALL },
  FEATURES: { VIEW, MANAGE, ALL },
  GDPR: { EXPORT_DATA, DELETE_DATA, ALL },
}
```

## Hook Methods

### usePermissions() - Full Suite
```typescript
const {
  // Basic checks
  hasRole(role),                    // string | string[]
  hasPermission(permission),        // string
  hasAllPermissions(perms),         // string[]
  hasAnyPermission(perms),          // string[]
  hasAccess(options),               // Complex check
  
  // Role level checks
  getRoleLevel(role),               // number
  hasRoleLevel(minimumLevel),       // number
  
  // API endpoint checks
  canAccessEndpoint(method, path),  // string, string
  getEndpointPermissions(method, path),
} = usePermissions();
```

### useRole(role) - Simplified
```typescript
const canAccessAdmin = useRole('admin');
// Returns: boolean
```

### usePermission(permission) - Simplified
```typescript
const canDeleteUsers = usePermission(PERMISSION_CONSTANTS.USERS.DELETE);
// Returns: boolean
```

### useUserRoles() - Get All Roles
```typescript
const userRoles = useUserRoles();
// Returns: string[]
```

### useUserPermissions() - Get All Permissions
```typescript
const userPerms = useUserPermissions();
// Returns: string[]
```

## Advanced Usage

### Complex Access Check
```typescript
const { hasAccess } = usePermissions();

const canApprove = hasAccess({
  requiredRole: ['manager', 'admin'],     // Must have one
  requiredPermissions: [
    PERMISSION_CONSTANTS.USERS.MANAGE_TEAM,
    PERMISSION_CONSTANTS.AUDIT.VIEW_OWN_LOGS
  ],
  requireAllPermissions: true              // Must have ALL
});
```

### Route Guards
```typescript
// In your route guard component
export const AdminRoute: FC<Props> = ({ children }) => {
  const { hasRole } = usePermissions();
  
  if (!hasRole(['admin', 'super_admin'])) {
    return <Navigate to="/denied" />;
  }
  
  return <>{children}</>;
};
```

### With useActionState (React 19)
```typescript
import { useActionState } from 'react';
import { usePermissions } from '@/domains/rbac';

export function DeleteUserForm() {
  const { hasPermission } = usePermissions();
  const [state, action, isPending] = useActionState(deleteUser, null);
  
  const canDelete = hasPermission(PERMISSION_CONSTANTS.USERS.DELETE);
  
  return (
    <form action={action}>
      <button 
        type="submit" 
        disabled={!canDelete || isPending}
      >
        Delete
      </button>
    </form>
  );
}
```

## Common Patterns

### Show/Hide UI Elements
```typescript
// Conditional rendering
{hasPermission('users:delete') && (
  <button onClick={handleDelete}>Delete</button>
)}

// Or with component
<CanAccess requiredPermissions="users:delete">
  <button onClick={handleDelete}>Delete</button>
</CanAccess>
```

### Disable Buttons for Non-Admins
```typescript
<RoleBasedButton
  requiredRole="admin"
  onClick={handleAction}
  tooltipOnDisabled="Admin only"
  showTooltip
>
  Admin Action
</RoleBasedButton>
```

### Check Multiple Permissions
```typescript
// ALL permissions required
const canManage = hasAllPermissions([
  PERMISSION_CONSTANTS.USERS.DELETE,
  PERMISSION_CONSTANTS.USERS.CREATE,
  PERMISSION_CONSTANTS.AUDIT.VIEW_ALL_LOGS
]);

// ANY permission required
const canModify = hasAnyPermission([
  PERMISSION_CONSTANTS.USERS.DELETE,
  PERMISSION_CONSTANTS.USERS.UPDATE
]);
```

### API Endpoint Verification
```typescript
const { canAccessEndpoint } = usePermissions();

if (canAccessEndpoint('DELETE', '/api/users/:id')) {
  await fetch(`/api/users/${userId}`, { method: 'DELETE' });
}
```

## Permission Wildcards

Permissions support wildcard matching:

```typescript
// Specific permission
'users:delete'

// All user permissions
'users:*'

// All permissions
'*:*'

// Wildcard matching examples
hasPermission('users:delete', 'users:*')     // true
hasPermission('users:delete', 'users:delete') // true
hasPermission('users:delete', 'admin:*')     // false
hasPermission('profile:edit_own', '*:*')     // true
```

## Backend Compatibility

All roles and permissions align with **user_mn** Python FastAPI backend:
- Backend validates ALL API calls
- Frontend is UI layer only
- Role names match exactly
- Permission structure matches

## Security Notes

✅ **Frontend (UI Layer)**
- Controls what users SEE
- Disables UI elements
- Shows/hides features

✅ **Backend (Security Layer)**
- Validates every API call
- Controls what users CAN DO
- Returns 403 if unauthorized

**Always remember:** Frontend is for UX, backend is for security!

## Troubleshooting

**"usePermissions must be used within RbacProvider"**
- Wrap your app with `<RbacProvider>` inside `<AuthProvider>`

**Permission not working**
- Check user has correct role in database
- Verify role is in `ROLE_HIERARCHY`
- Check permission is in `ROLE_PERMISSIONS[role]`

**Button always disabled**
- Verify user has required role/permission
- Check typo in permission string
- Use `PERMISSION_CONSTANTS` instead of hardcoding

**Components not found**
- Import from `@/components` or `@/domains/rbac`
- Check relative import paths
- Ensure files are saved

## Performance Tips

✅ Use memoized hooks (`usePermissions`, `useRole`)
✅ Permissions are cached internally
✅ Permission checks are O(n) with early exit
✅ Use specific hooks for single checks (`useRole`, `usePermission`)
✅ Avoid computing permissions in loops

## Next Steps

1. ✅ Core RBAC system is ready
2. ⏳ Enhance AuthContext with permissions extraction
3. ⏳ Wrap app with RbacProvider
4. ⏳ Update RouteGuards with permission checks
5. ⏳ Deploy components to pages
6. ⏳ Test with `npm run dev`

See **RBAC_INTEGRATION_GUIDE.md** for detailed integration steps.

---

**🎯 Quick Reference Complete - Ready to Use!**
