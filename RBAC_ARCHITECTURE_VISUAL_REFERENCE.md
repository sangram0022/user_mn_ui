# RBAC Architecture - Visual Reference

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION LAYER                   │
│                                                                 │
│  Login Page → AuthPage → Dashboard → AdminPanel → UserManage  │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                         │
│                                                                 │
│  AuthContext (stores: user, permissions, isAuthenticated)     │
│         ↓                           ↓                          │
│  useAuth Hook                  authStorage (localStorage)      │
│         ↓                           ↓                          │
│  getUser(), getToken()         Persist session                │
└────────────────────────────────┬───────────────────────────────┘
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PERMISSION LAYER                            │
│                                                                 │
│  rolePermissionMap.ts (SINGLE SOURCE OF TRUTH)                │
│  ├─ ROLE_HIERARCHY: { public: 0, user: 1, ... admin: 4 }     │
│  ├─ ROLE_PERMISSIONS: { admin: ['users:*', 'rbac:*', ...] }  │
│  └─ getEffectivePermissions(role): string[]                   │
│                                                                 │
│  usePermissions Hook (provides checking functions)            │
│  ├─ hasRole(role): boolean                                    │
│  ├─ hasPermission(perm): boolean                              │
│  ├─ hasAccess(options): boolean                               │
│  └─ permissions: string[]                                     │
└────────────────────────────┬──────────────────────────────────┘
                             │
                ┌────────────┼────────────┐
                ↓            ↓            ↓
┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐
│  UI COMPONENTS   │  │   ROUTING    │  │  API PROTECTION  │
│                  │  │              │  │                  │
│ CanAccess       │  │RouteRenderer │  │ apiClient with   │
│ RoleBasedButton │  │              │  │ auth interceptor │
│                  │  │ ✓ Public    │  │                  │
│                  │  │ ✓ Protected │  │ Authorization:   │
│                  │  │ ✓ Admin     │  │ Bearer <token>   │
│                  │  │ ✓ Forbidden │  │                  │
└──────────────────┘  └──────────────┘  └──────────────────┘
        ↓                    ↓                    ↓
    Conditional         Route Guard          API Header
    Rendering          Redirection           Injection
        ↓                    ↓                    ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND VALIDATION                           │
│                                                                 │
│  Every API endpoint validates:                                │
│  1. Token is valid?                                           │
│  2. User has required role?                                   │
│  3. User has required permission?                             │
│  4. Return 200 (success) or 403 (forbidden)                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: User Login to Permission Check

```
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: User Logs In                                             │
└──────────────────────────────────────────────────────────────────┘
  
  LoginPage.tsx
      ↓
  authService.login({ email, password })
      ↓
  POST /api/v1/auth/login
      ↓
  Backend Response:
  {
    access_token: "eyJ...",
    refresh_token: "eyJ...",
    user: {
      user_id: "123",
      email: "admin@test.com",
      roles: ["admin", "manager"],  ← Multiple roles!
      first_name: "John",
      last_name: "Doe",
      is_active: true,
      is_verified: true
    }
  }


┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: AuthContext Processes Login                              │
└──────────────────────────────────────────────────────────────────┘

  auth.login(tokens, user)
      ↓
  AuthContext.login() executes:
      ├─ authStorage.setTokens(tokens)
      ├─ authStorage.setUser(user)
      └─ setState({ user, isAuthenticated: true })
      ↓
  AuthContext computes permissions:
      roles: ["admin", "manager"]
      ↓
      For each role, getEffectivePermissions(role):
      - getEffectivePermissions("admin")
        → Returns: ["auth:*", "users:*", "rbac:*", "admin:*", ...]
      - getEffectivePermissions("manager")
        → Returns: ["users:manage_team", "audit:view_team_logs", ...]
      ↓
      Combine all permissions (deduplicate with Set):
      permissions = ["auth:*", "users:*", "rbac:*", "admin:*",
                     "users:manage_team", "audit:view_team_logs", ...]
      ↓
  AuthContextValue = {
    user: { user_id, email, roles, ... },
    isAuthenticated: true,
    permissions: ["auth:*", "users:*", ...],
    login, logout, checkAuth, refreshSession, updateUser
  }


┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: Component Uses Permissions                               │
└──────────────────────────────────────────────────────────────────┘

  AdminDashboard.tsx renders:
      ↓
  const { hasPermission, hasRole } = usePermissions()
      ↓
  usePermissions() gets auth context and provides:
  - hasRole("admin") → true (because user.roles includes "admin")
  - hasPermission("users:delete") → true (because permissions include "admin:*")
  - hasAccess({ requiredRole: "manager" }) → true (because user.roles includes "manager")
      ↓
  Components render based on permission checks:
  
  <CanAccess requiredRole="admin">
    <AdminPanel />  ← Rendered because user.roles includes "admin"
  </CanAccess>
  
  <RoleBasedButton requiredPermissions="users:delete">
    Delete  ← Enabled because hasPermission("users:delete") = true
  </RoleBasedButton>


┌──────────────────────────────────────────────────────────────────┐
│ STEP 4: API Call with Authorization                              │
└──────────────────────────────────────────────────────────────────┘

  Component calls API:
      apiClient.get("/admin/users")
      ↓
  Request interceptor runs:
      ├─ Get accessToken from authStorage
      ├─ Add header: Authorization: Bearer <accessToken>
      ├─ Get CSRF token from storage
      └─ Add header: X-CSRF-Token: <csrf>
      ↓
  API Request:
      GET /api/v1/admin/users
      Headers: {
        Authorization: Bearer eyJ...,
        X-CSRF-Token: abc123...,
        Content-Type: application/json
      }
      ↓
  Backend Middleware Validation:
      1. Verify token signature → Valid
      2. Check user role → "admin" → Allowed for /admin/users
      3. Check permission → user has "users:view_list" → Allowed
      4. Process request → Return 200 with users data
      ↓
  Response: 200 OK with user data
      ↓
  Component receives data and renders
```

## Permission Hierarchy Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUPER_ADMIN (Level 5)                        │
│              * = ALL permissions                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Has: auth:*, users:*, rbac:*, admin:*, audit:*, etc.  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ↑ inherits                            │
├─────────────────────────────────────────────────────────────────┤
│                      ADMIN (Level 4)                            │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ + users:*, rbac:*, admin:system_settings, audit:export│  │
│  │ + All manager permissions                              │  │
│  │ + All employee permissions                             │  │
│  │ + All user permissions                                 │  │
│  │ + All public permissions                               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ↑ inherits                            │
├─────────────────────────────────────────────────────────────────┤
│                     MANAGER (Level 3)                           │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ + users:manage_team, rbac:view_roles                   │  │
│  │ + audit:view_team_logs, monitoring:view_basic          │  │
│  │ + All employee permissions                              │  │
│  │ + All user permissions                                 │  │
│  │ + All public permissions                               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ↑ inherits                            │
├─────────────────────────────────────────────────────────────────┤
│                     EMPLOYEE (Level 2)                          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ + users:view_list, users:view_details                  │  │
│  │ + audit:view_own_logs                                  │  │
│  │ + All user permissions                                 │  │
│  │ + All public permissions                               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ↑ inherits                            │
├─────────────────────────────────────────────────────────────────┤
│                        USER (Level 1)                           │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ + profile:view_own, profile:update_own                 │  │
│  │ + profile:change_password, auth:logout                 │  │
│  │ + All public permissions                               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ↑ inherits                            │
├─────────────────────────────────────────────────────────────────┤
│                       PUBLIC (Level 0)                          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ auth:login, auth:register, public:view                │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Example: Manager Role Check

  user.roles = ["manager"]
  
  hasRole("manager") → true (level 3 >= level 3)
  hasRole("admin") → false (level 3 < level 4)
  hasRole("employee") → true (level 3 >= level 2) ✓ INHERITED
  hasRole("user") → true (level 3 >= level 1) ✓ INHERITED
  hasRole("public") → true (level 3 >= level 0) ✓ INHERITED
```

## Permission Checking Logic Flowchart

```
┌─────────────────────────────────────────────────────────────────┐
│ hasPermission("users:delete") called                             │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
              Check permissions array:
              ["auth:*", "users:*", "rbac:*", ...]
                             ↓
                    ┌────────┴────────┐
                    ↓                 ↓
             Does array      Is there a wildcard
             contain exact   permission that matches?
             match?
                    ↓                 ↓
                   NO              YES
                    │                │
                    ├─ "users:*" ────→ Extract prefix: "users:"
                    │    YES              "users:delete" starts with "users:"?
                    │     │                     ↓
                    │     ↓                    YES
                    │   RETURN TRUE       RETURN TRUE
                    │
                    └─ "admin:*"
                         NO
                         │
                         ↓
                      RETURN FALSE


Example Permission Checks:

  1. user.roles = ["admin"]
     permissions = ["auth:*", "users:*", "rbac:*", "admin:*", ...]
     
     hasPermission("users:delete") ?
     ├─ "users:delete" in array? NO
     ├─ "users:*" in array? YES
     ├─ Extract "users:" and check if "users:delete" starts with it
     └─ YES, "users:delete" starts with "users:"
        → RETURN TRUE ✓

  2. user.roles = ["employee"]
     permissions = ["users:view_list", "users:view_details", ...]
     
     hasPermission("users:delete") ?
     ├─ "users:delete" in array? NO
     ├─ "users:*" in array? NO
     └─ RETURN FALSE ✗

  3. user.roles = ["super_admin"]
     permissions = ["*", "auth:*", "users:*", ...]
     
     hasPermission("anything:here") ?
     ├─ "*" in array? YES
     └─ RETURN TRUE ✓ (Super admin has everything)
```

## Component Decision Tree

```
┌────────────────────────────────────────────────────────────────┐
│ Rendering Decision: Show or Hide Element?                      │
└────────────────┬───────────────────────────────────────────────┘
                 ↓
         Need to show/hide
         based on permissions?
                 │
        ┌────────┴────────┐
       YES               NO
        │                 └─ Render normally
        ↓
   Use <CanAccess>?
        │
        ├─ YES: Render conditionally
        │       ├─ Has permission? → Render children
        │       └─ No permission? → Render fallback
        │
        └─ NO: Check inline in component
            └─ const { hasPermission } = usePermissions()
               if (hasPermission(...)) { ... }


┌────────────────────────────────────────────────────────────────┐
│ Button Decision: Enable or Disable?                             │
└────────────────┬───────────────────────────────────────────────┘
                 ↓
         Is it a sensitive action?
         (delete, update, create, etc.)
                 │
        ┌────────┴────────┐
       YES               NO
        │                 └─ Normal button
        ↓
   Use <RoleBasedButton>?
        │
        ├─ YES: Auto-disable if no permission
        │       ├─ Has permission? → Enabled
        │       └─ No permission? → Disabled + tooltip
        │
        └─ NO: Use <Button> with manual check
            └─ onClick: Check then execute


┌────────────────────────────────────────────────────────────────┐
│ Route Decision: Render or Redirect?                             │
└────────────────┬───────────────────────────────────────────────┘
                 ↓
         Is loading?
                 │
        ┌────────┴────────┐
       YES               NO
        │                 └─ Next check
        ↓                       ↓
    Show spinner        Is authenticated?
                               │
                        ┌──────┴──────┐
                       YES            NO
                        │              └─ Redirect to /login
                        ↓
                   Has required role?
                        │
                 ┌──────┴──────┐
                YES            NO
                 │              └─ Show "Access Denied"
                 ↓
             Render page
```

## API Authorization Sequence

```
Frontend                              Backend
    │                                   │
    ├─ Generate login request            │
    │  POST /auth/login                  │
    │  { email, password }               │
    ├──────────────────────────────────→│
    │                                    │ Validate credentials
    │                                    │ Generate tokens
    │                                    │ Fetch user data + roles
    │                                    │
    │ Login response:                    │
    │ { access_token, user }             │
    │←──────────────────────────────────┤
    │                                    │
    ├─ Store in localStorage             │
    ├─ Compute permissions from roles    │
    ├─ Set AuthContext                   │
    │                                    │
    ├─ Request: GET /admin/users         │
    │  (interceptor adds header)         │
    │  Authorization: Bearer <token>    │
    ├──────────────────────────────────→│
    │                                    │ Verify token
    │                                    │ ├─ Signature valid?
    │                                    │ ├─ Token expired?
    │                                    │ └─ User still active?
    │                                    │
    │                                    │ Check authorization
    │                                    │ ├─ User has admin role?
    │                                    │ └─ User has users:view_list?
    │                                    │
    │                                    │ If authorized:
    │                                    │ → Query users
    │                                    │ → Return 200 + data
    │                                    │
    │                                    │ If not authorized:
    │                                    │ → Return 403 Forbidden
    │                                    │
    │ Response: 200 + users data         │
    │ (or 403 if denied)                 │
    │←──────────────────────────────────┤
    │                                    │
    ├─ If 403: Show error message        │
    ├─ If 401: Logout & redirect         │
    └─ If 200: Render data               │
```

## Permission Check Methods Comparison

```
┌──────────────┬──────────────────────┬──────────────────────────┐
│ Method       │ Use Case             │ Example                  │
├──────────────┼──────────────────────┼──────────────────────────┤
│ hasRole()    │ Check single role    │ hasRole('admin')         │
│              │ with hierarchy       │ → true if admin/super    │
├──────────────┼──────────────────────┼──────────────────────────┤
│ hasPermission│ Check single         │ hasPermission('users:    │
│              │ permission with      │   delete')               │
│              │ wildcard support     │ → true if 'users:*'      │
├──────────────┼──────────────────────┼──────────────────────────┤
│ hasAnyRole   │ Check if user has    │ hasAnyRole(['admin',     │
│              │ any of multiple      │   'auditor'])            │
│              │ roles                │ → true if either role    │
├──────────────┼──────────────────────┼──────────────────────────┤
│ hasAllRoles  │ Check if user has    │ hasAllRoles(['manager',  │
│              │ all specified roles  │   'employee'])           │
│              │                      │ → true if has both       │
├──────────────┼──────────────────────┼──────────────────────────┤
│ hasAccess()  │ Complex check:       │ hasAccess({              │
│              │ role + permission    │   requiredRole:'admin',  │
│              │ combination          │   requiredPerms:         │
│              │                      │   'users:*'              │
│              │                      │ })                       │
└──────────────┴──────────────────────┴──────────────────────────┘
```

---

## Quick Decision Guide

```
What do you need?                What to use?
─────────────────────────────────────────────────────────
Show/hide UI element            → <CanAccess>
Disable button if no permission → <RoleBasedButton>
Check in component logic        → usePermissions() hook
Protect a route                 → RouteRenderer + guard
Check API access                → apiRoleMapping.ts
Store role mapping              → rolePermissionMap.ts
Access user data                → useAuth() hook
Check multiple permissions      → hasAccess() with array
Check single permission         → hasPermission()
Check role hierarchy            → hasRole() (auto-inherits)
```

---

**Print this page for quick reference while implementing! 🖨️**
