# React.js RBAC Implementation Guide - usermn1 App

## Overview

This is a **comprehensive, step-by-step RBAC implementation guide** specifically tailored to your **usermn1 React 19 + Vite + Tailwind** application.

### Your Tech Stack
✅ **React 19** with hooks (use(), useCallback, useState)  
✅ **Zustand** for state management (appStore, notificationStore, themeStore)  
✅ **React Router v7** for routing with lazy loading  
✅ **Axios** for API calls with interceptors  
✅ **React Query (TanStack)** for server state  
✅ **Design System** with Tailwind CSS v4.1.16  
✅ **TypeScript** with strict typing  
✅ **Domain-driven architecture** (auth, rbac, admin, audit, users, etc.)  

### What You'll Build
✅ RBAC context enhancement with permissions extraction  
✅ Permission checking hooks (usePermissions, useRoleAccess)  
✅ Protected route components  
✅ Role-based UI rendering  
✅ Role-to-API endpoint mapping system  

---

## 1. Your Current Architecture

### 1.1 Existing Components You'll Use

**Authentication:**
- `src/domains/auth/context/AuthContext.tsx` - Already uses React 19's `use()` hook
- `src/domains/auth/types/auth.types.ts` - User type with `roles: string[]`
- User: `{ user_id, email, first_name, last_name, roles, is_active, is_verified }`

**Routing:**
- `src/core/routing/config.ts` - Centralized config with RouteGuard and requiredRoles
- `src/app/App.tsx` - Uses routes from config

**API:**
- `src/services/api/apiClient.ts` - Axios with interceptors
- `src/services/api/queryClient.ts` - React Query setup
- `src/services/api/interceptors.ts` - Token management

**RBAC Domain:**
- `src/domains/rbac/` - Existing structure with hooks, pages, services, types
- Hooks: usePermissions, useRole, useRoles, useUserRoles, etc.

**UI Components:**
- `src/components/Button.tsx` - Design system button
- `src/components/Layout.tsx` - Main layout

---

## 2. Step-by-Step Implementation

### **STEP 1: Create Role-to-Permission Mapping**

**File:** `src/domains/auth/utils/rolePermissionMap.ts` (NEW FILE)

This maps backend roles to frontend permissions, serving as your SINGLE SOURCE OF TRUTH.

```typescript
// ========================================
// Role-to-Permission Mapping
// Maps backend roles to frontend permission checks
// Based on: user_mn backend constants
// ========================================

/**
 * Role hierarchy levels
 * Used for hierarchical permission checks
 */
export enum RoleLevel {
  PUBLIC = 0,
  USER = 1,
  EMPLOYEE = 2,
  MANAGER = 3,
  ADMIN = 4,
  SUPER_ADMIN = 5,
}

/**
 * Role hierarchy mapping
 * Maps role names to their permission levels
 */
export const ROLE_HIERARCHY: Record<string, RoleLevel> = {
  'public': RoleLevel.PUBLIC,
  'user': RoleLevel.USER,
  'employee': RoleLevel.EMPLOYEE,
  'manager': RoleLevel.MANAGER,
  'admin': RoleLevel.ADMIN,
  'super_admin': RoleLevel.SUPER_ADMIN,
};

/**
 * ✅ SINGLE SOURCE OF TRUTH for permissions by role
 * Maps each backend role to its associated permissions
 * Derived from: user_mn/src/app/core/constants/permission_codes.py
 * 
 * Used by:
 * - usePermissions hook for permission checks
 * - RBAC components for conditional rendering
 * - API endpoint protection
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  public: [
    'auth:login',
    'auth:register',
    'public:view',
  ],

  user: [
    'auth:login',
    'auth:logout',
    'profile:view_own',
    'profile:update_own',
    'profile:change_password',
  ],

  employee: [
    // Inherit user permissions
    'auth:login',
    'auth:logout',
    'profile:view_own',
    'profile:update_own',
    'profile:change_password',
    // Plus employee-specific
    'users:view_list',
    'users:view_details',
    'audit:view_own_logs',
  ],

  manager: [
    // Inherit employee permissions
    'auth:login',
    'auth:logout',
    'profile:view_own',
    'profile:update_own',
    'profile:change_password',
    'users:view_list',
    'users:view_details',
    'audit:view_own_logs',
    // Plus manager-specific
    'users:manage_team',
    'rbac:view_roles',
    'audit:view_team_logs',
    'monitoring:view_basic',
  ],

  admin: [
    // Inherit manager permissions
    'auth:login',
    'auth:logout',
    'profile:view_own',
    'profile:update_own',
    'profile:change_password',
    'users:view_list',
    'users:view_details',
    'audit:view_own_logs',
    'users:manage_team',
    'rbac:view_roles',
    'audit:view_team_logs',
    'monitoring:view_basic',
    // Plus admin-specific
    'users:create',
    'users:update_any',
    'users:delete',
    'rbac:manage_roles',
    'rbac:manage_permissions',
    'audit:view_all_logs',
    'audit:export_logs',
    'admin:system_settings',
    'monitoring:view_detailed',
    'monitoring:manage_cache',
  ],

  super_admin: [
    // ALL permissions with wildcard
    '*', // Grant all permissions
  ],
};

/**
 * Get all effective permissions for a user's role
 * Includes permissions from role hierarchy
 */
export function getEffectivePermissions(role: string): string[] {
  const permissions = new Set<string>();
  const roleLevel = ROLE_HIERARCHY[role.toLowerCase()];

  if (roleLevel === undefined) return [];

  // Add permissions from this role and all lower roles
  Object.entries(ROLE_HIERARCHY).forEach(([roleName, level]) => {
    if (level <= roleLevel) {
      const rolePerms = ROLE_PERMISSIONS[roleName] || [];
      rolePerms.forEach(p => permissions.add(p));
    }
  });

  return Array.from(permissions);
}

/**
 * Check if user's role has minimum required level
 * Example: user with 'manager' role passes hasMinimumRole(userRole, 'employee')
 */
export function hasMinimumRole(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole.toLowerCase()];
  const requiredLevel = ROLE_HIERARCHY[requiredRole.toLowerCase()];

  if (userLevel === undefined || requiredLevel === undefined) return false;
  return userLevel >= requiredLevel;
}
```

---

### **STEP 2: Enhance Auth Context with Permissions**

**File:** `src/domains/auth/context/AuthContext.tsx` (MODIFY - Add permissions)

Add permissions extraction to your existing AuthContext:

```typescript
// At the top, add this import:
import { getEffectivePermissions } from '../utils/rolePermissionMap';

// Update the AuthContextValue interface - ADD this line:
export interface AuthContextValue extends AuthState, AuthActions {
  permissions: string[];  // ← Add this line
}

// In the value object within AuthProvider, ADD this:
const value: AuthContextValue = {
  // ... existing fields
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  
  // ✅ ADD: Compute permissions from user's roles
  permissions: state.user 
    ? state.user.roles.flatMap(role => getEffectivePermissions(role))
    : [],
  
  // ... existing actions
  login,
  logout,
  checkAuth,
  refreshSession,
  updateUser,
};
```

---

### **STEP 3: Create useAuth Hook**

**File:** `src/domains/auth/hooks/useAuth.ts` (NEW FILE - if not exists)

This hook provides access to auth context using React 19's `use()` pattern:

```typescript
// ========================================
// useAuth Hook - Access auth context
// React 19 optimized with use()
// ========================================

import { use } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook to access authentication state and actions
 * Requires AuthProvider in parent component tree
 * 
 * Usage:
 * const { user, isAuthenticated, isLoading, permissions, logout } = useAuth();
 * 
 * ✅ React 19: Uses use() hook for context
 * ✅ Throws error if used outside AuthProvider
 */
export function useAuth() {
  const auth = use(AuthContext);

  if (!auth) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return auth;
}
```

---

### **STEP 4: Create usePermissions Hook**

**File:** `src/domains/rbac/hooks/usePermissions.ts` (ENHANCE or CREATE)

This is the main hook for all permission checks:

```typescript
// ========================================
// usePermissions Hook
// Central hook for all permission checks
// Handles roles, permissions, and access control
// ========================================

import { use } from 'react';
import { AuthContext } from '@/domains/auth/context/AuthContext';
import {
  ROLE_HIERARCHY,
  hasMinimumRole,
  getEffectivePermissions,
} from '@/domains/auth/utils/rolePermissionMap';

/**
 * Options for complex access checks
 */
interface PermissionCheckOptions {
  requiredRole?: string | string[];
  requiredPermissions?: string | string[];
  requireAllPermissions?: boolean; // false = ANY permission, true = ALL permissions
}

/**
 * Main permissions hook - Use this for all permission checks!
 * 
 * ✅ React 19: Uses use() hook for context
 * ✅ Supports role hierarchy
 * ✅ Supports permission wildcards (e.g., 'users:*')
 * ✅ Supports role inheritance
 */
export function usePermissions() {
  const auth = use(AuthContext);

  if (!auth) {
    throw new Error('usePermissions must be used within AuthProvider');
  }

  const { user, permissions } = auth;

  /**
   * Check if user has specific role or higher
   * Uses role hierarchy: higher roles inherit lower permissions
   * 
   * Example: hasRole('admin') returns true if user is admin OR super_admin
   * Example: hasRole('employee') returns true if user is manager/admin/super_admin
   */
  function hasRole(role: string): boolean {
    if (!user) return false;
    return user.roles.some(userRole => hasMinimumRole(userRole, role));
  }

  /**
   * Check if user has ANY of specified roles
   */
  function hasAnyRole(roles: string[]): boolean {
    if (!user) return false;
    return roles.some(role => hasRole(role));
  }

  /**
   * Check if user has ALL specified roles
   */
  function hasAllRoles(roles: string[]): boolean {
    if (!user) return false;
    return roles.every(role => hasRole(role));
  }

  /**
   * Check if user has specific permission
   * Supports wildcard permissions:
   * - '*' = all permissions
   * - 'users:*' = all user permissions
   */
  function hasPermission(permission: string): boolean {
    if (!permissions || permissions.length === 0) return false;

    return permissions.some(p => {
      if (p === '*') return true; // Wildcard: grant all
      if (p.endsWith(':*')) {
        // Pattern: 'users:*' grants all 'users:' permissions
        const prefix = p.slice(0, -1); // Remove the '*'
        return permission.startsWith(prefix);
      }
      return p === permission; // Exact match
    });
  }

  /**
   * Check if user has ANY of specified permissions
   */
  function hasAnyPermission(perms: string[]): boolean {
    return perms.some(p => hasPermission(p));
  }

  /**
   * Check if user has ALL specified permissions
   */
  function hasAllPermissions(perms: string[]): boolean {
    return perms.every(p => hasPermission(p));
  }

  /**
   * Main access check - Most flexible method
   * Combines role and permission checks
   * 
   * Examples:
   * - hasAccess({ requiredRole: 'admin' })
   * - hasAccess({ requiredPermissions: ['users:create'] })
   * - hasAccess({ requiredRole: 'manager', requiredPermissions: ['users:view_list'] })
   * - hasAccess({ requiredPermissions: ['users:create', 'users:update'], requireAllPermissions: true })
   */
  function hasAccess(options: PermissionCheckOptions): boolean {
    if (!user) return false;

    // Check role if specified
    if (options.requiredRole) {
      const requiredRoles = Array.isArray(options.requiredRole)
        ? options.requiredRole
        : [options.requiredRole];

      const hasRequiredRole = requiredRoles.some(role => hasRole(role));
      if (!hasRequiredRole) return false; // Fail fast if no required role
    }

    // Check permissions if specified
    if (options.requiredPermissions) {
      const requiredPerms = Array.isArray(options.requiredPermissions)
        ? options.requiredPermissions
        : [options.requiredPermissions];

      if (options.requireAllPermissions) {
        // Require ALL permissions
        if (!hasAllPermissions(requiredPerms)) return false;
      } else {
        // Require ANY permission
        if (!hasAnyPermission(requiredPerms)) return false;
      }
    }

    return true;
  }

  return {
    user,
    permissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasAccess,
  };
}
```

---

### **STEP 5: Update Routing with RBAC Protection**

**File:** `src/core/routing/config.ts` (MODIFY - Enhance guard logic)

Update your route renderer to check permissions:

```typescript
// Create or update: src/core/routing/RouteRenderer.tsx (if not exists)

import { ReactNode, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { use } from 'react';
import { AuthContext } from '@/domains/auth/context/AuthContext';
import { usePermissions } from '@/domains/rbac/hooks/usePermissions';
import type { RouteConfig } from './config';

interface RouteRendererProps {
  route: RouteConfig;
}

/**
 * Route Renderer with RBAC protection
 * Handles:
 * - Public routes (no auth required)
 * - Protected routes (auth required)
 * - Admin routes (admin role required)
 * - Role-specific routes (specific roles required)
 */
export function RouteRenderer({ route }: RouteRendererProps) {
  const auth = use(AuthContext);
  const { hasAccess } = usePermissions();

  // Loading state
  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // GUARD 1: Public routes (accessible to everyone)
  if (route.guard === 'public') {
    // If already authenticated, redirect to dashboard
    if (auth.isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <route.component />
      </Suspense>
    );
  }

  // GUARD 2: Protected routes (require authentication)
  if (route.guard === 'protected') {
    if (!auth.isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <route.component />
      </Suspense>
    );
  }

  // GUARD 3: Admin routes (require specific roles)
  if (route.guard === 'admin') {
    if (!auth.isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    // Check required roles for this route
    if (route.requiredRoles && route.requiredRoles.length > 0) {
      const hasRequiredRole = hasAccess({
        requiredRole: route.requiredRoles,
      });

      if (!hasRequiredRole) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
              <p className="text-gray-600 mb-4">
                You don't have permission to access this page.
              </p>
              <a
                href="/dashboard"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        );
      }
    }

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <route.component />
      </Suspense>
    );
  }

  // GUARD 4: No guard (render as-is)
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <route.component />
    </Suspense>
  );
}
```

---

### **STEP 6: Create RBAC UI Components**

#### **Component 1: CanAccess (Conditional Rendering)**

**File:** `src/components/CanAccess.tsx` (NEW FILE)

Use this to conditionally render UI based on permissions:

```typescript
// ========================================
// CanAccess Component - Conditional rendering
// Show/hide UI based on roles & permissions
// ========================================

import { ReactNode } from 'react';
import { usePermissions } from '@/domains/rbac/hooks/usePermissions';

interface CanAccessProps {
  requiredRole?: string | string[];
  requiredPermissions?: string | string[];
  requireAllPermissions?: boolean;
  fallback?: ReactNode; // Show if no access
  children: ReactNode; // Show if has access
}

/**
 * Component for conditional rendering based on permissions
 * 
 * ✅ Perfect for showing/hiding UI elements
 * ✅ Supports role and permission checks
 * ✅ Provides fallback content
 * 
 * Usage:
 * <CanAccess
 *   requiredRole="admin"
 *   fallback={<p>You don't have admin access</p>}
 * >
 *   <AdminPanel />
 * </CanAccess>
 * 
 * Usage with permissions:
 * <CanAccess requiredPermissions="users:delete">
 *   <button onClick={handleDelete}>Delete User</button>
 * </CanAccess>
 * 
 * Usage with multiple permissions (ANY):
 * <CanAccess requiredPermissions={['users:create', 'users:update']}>
 *   <div>Can manage users</div>
 * </CanAccess>
 * 
 * Usage with multiple permissions (ALL):
 * <CanAccess
 *   requiredPermissions={['users:view_list', 'users:export']}
 *   requireAllPermissions={true}
 * >
 *   <button>Export Users</button>
 * </CanAccess>
 */
export function CanAccess({
  requiredRole,
  requiredPermissions,
  requireAllPermissions = false,
  fallback = null,
  children,
}: CanAccessProps) {
  const { hasAccess } = usePermissions();

  const hasPermission = hasAccess({
    requiredRole,
    requiredPermissions: requiredPermissions
      ? Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions]
      : undefined,
    requireAllPermissions,
  });

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}
```

#### **Component 2: RoleBasedButton**

**File:** `src/components/RoleBasedButton.tsx` (NEW FILE)

```typescript
// ========================================
// RoleBasedButton Component
// Button that disables/enables based on permissions
// ========================================

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { usePermissions } from '@/domains/rbac/hooks/usePermissions';

interface RoleBasedButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  requiredRole?: string | string[];
  requiredPermissions?: string | string[];
  requireAllPermissions?: boolean;
  disabledTooltip?: string;
  children: ReactNode;
}

/**
 * Button component that respects RBAC
 * Disables button if user lacks permission
 * 
 * ✅ Use your existing Button component for styling
 * ✅ Shows tooltip on hover when disabled
 * 
 * Usage:
 * <RoleBasedButton
 *   requiredRole="admin"
 *   onClick={handleDelete}
 *   disabledTooltip="Only admins can delete"
 * >
 *   Delete
 * </RoleBasedButton>
 */
export function RoleBasedButton({
  requiredRole,
  requiredPermissions,
  requireAllPermissions = false,
  disabledTooltip = "You don't have permission",
  children,
  ...props
}: RoleBasedButtonProps) {
  const { hasAccess } = usePermissions();

  const hasPermission = hasAccess({
    requiredRole,
    requiredPermissions: requiredPermissions
      ? Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions]
      : undefined,
    requireAllPermissions,
  });

  return (
    <div className="relative group">
      <button
        {...props}
        disabled={!hasPermission || props.disabled}
        className={`
          ${props.className || ''}
          ${!hasPermission ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {children}
      </button>
      {!hasPermission && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {disabledTooltip}
        </div>
      )}
    </div>
  );
}
```

---

### **STEP 7: Update Layout Navigation with Role-Based Access**

**File:** `src/components/Layout.tsx` (MODIFY - Add role-based nav items)

Update your existing Layout to show/hide navigation based on roles:

```typescript
// In your Layout component, update the navigation section:

import { CanAccess } from './CanAccess';
import { RoleBasedButton } from './RoleBasedButton';

// Inside the <nav> section, add role-based menu items:

<nav className="hidden md:flex items-center gap-6">
  <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
  
  {/* Show products/services to authenticated users */}
  <CanAccess requiredPermissions="public:view">
    <Link to="/products" className="text-gray-700 hover:text-blue-600">Products</Link>
    <Link to="/services" className="text-gray-700 hover:text-blue-600">Services</Link>
  </CanAccess>
  
  {/* Show admin link only to admins */}
  <CanAccess requiredRole="admin">
    <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-bold text-red-600">
      Admin
    </Link>
  </CanAccess>
  
  {/* Show auditor link only to auditors */}
  <CanAccess requiredRole="auditor">
    <Link to="/auditor" className="text-gray-700 hover:text-blue-600 font-bold text-purple-600">
      Auditor
    </Link>
  </CanAccess>
  
  <Link to="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
</nav>

// Update the auth buttons section:

{!auth.isAuthenticated && (
  <div className="hidden md:flex items-center gap-3">
    <Link to="/login">
      <Button variant="ghost" size="md">Login</Button>
    </Link>
    <Link to="/register">
      <Button variant="primary" size="md">Get Started</Button>
    </Link>
  </div>
)}

{auth.isAuthenticated && (
  <div className="hidden md:flex items-center gap-3">
    <span className="text-gray-700 font-medium">
      {auth.user?.first_name} ({auth.user?.roles.join(', ')})
    </span>
    <RoleBasedButton
      requiredPermissions="profile:view_own"
      onClick={() => window.location.href = '/dashboard'}
      variant="ghost"
      size="md"
    >
      Dashboard
    </RoleBasedButton>
    <Button
      variant="ghost"
      size="md"
      onClick={() => auth.logout()}
    >
      Logout
    </Button>
  </div>
)}
```

---

## 3. Role-to-API Endpoint Mapping

### **How to Map Roles to Backend API Endpoints**

Create a mapping that documents which roles can access which API endpoints:

**File:** `src/domains/rbac/utils/apiRoleMapping.ts` (NEW FILE)

```typescript
// ========================================
// API Endpoint to Role Mapping
// Documents which roles can access which endpoints
// Single Source of Truth for API security
// ========================================

/**
 * Maps API endpoints to required roles
 * Used for debugging and documenting API access control
 * 
 * Format: 'METHOD /path' => ['required', 'roles']
 */
export const API_ENDPOINT_ROLE_MAP: Record<string, string[]> = {
  // ============================================
  // Auth Endpoints (Public)
  // ============================================
  'POST /auth/login': ['public'],
  'POST /auth/register': ['public'],
  'POST /auth/forgot-password': ['public'],
  'POST /auth/reset-password': ['public'],

  // ============================================
  // Auth Endpoints (Protected)
  // ============================================
  'POST /auth/logout': ['user', 'employee', 'manager', 'admin', 'super_admin'],
  'POST /auth/change-password': ['user', 'employee', 'manager', 'admin', 'super_admin'],
  'GET /auth/refresh': ['user', 'employee', 'manager', 'admin', 'super_admin'],

  // ============================================
  // Profile Endpoints
  // ============================================
  'GET /users/profile': ['user', 'employee', 'manager', 'admin', 'super_admin'],
  'PUT /users/profile': ['user', 'employee', 'manager', 'admin', 'super_admin'],

  // ============================================
  // Users Management (Employee+)
  // ============================================
  'GET /admin/users': ['employee', 'manager', 'admin', 'super_admin'],
  'GET /admin/users/:id': ['employee', 'manager', 'admin', 'super_admin'],
  'POST /admin/users': ['manager', 'admin', 'super_admin'],
  'PUT /admin/users/:id': ['manager', 'admin', 'super_admin'],
  'DELETE /admin/users/:id': ['admin', 'super_admin'],

  // ============================================
  // RBAC Endpoints (Admin+)
  // ============================================
  'GET /admin/roles': ['admin', 'super_admin'],
  'POST /admin/roles': ['admin', 'super_admin'],
  'PUT /admin/roles/:id': ['admin', 'super_admin'],
  'DELETE /admin/roles/:id': ['super_admin'],

  'GET /admin/permissions': ['admin', 'super_admin'],
  'POST /admin/permissions': ['super_admin'],

  // ============================================
  // Audit Endpoints
  // ============================================
  'GET /audit/logs': ['admin', 'auditor', 'super_admin'],
  'GET /audit/logs/:id': ['admin', 'auditor', 'super_admin'],
  'POST /audit/logs/export': ['admin', 'super_admin'],

  // ============================================
  // Admin System (Super Admin only)
  // ============================================
  'GET /admin/settings': ['super_admin'],
  'PUT /admin/settings': ['super_admin'],
  'POST /admin/cache/clear': ['super_admin'],
};

/**
 * Get required roles for an API endpoint
 * 
 * Usage:
 * const roles = getRequiredRolesForEndpoint('GET', '/admin/users');
 * // returns ['employee', 'manager', 'admin', 'super_admin']
 */
export function getRequiredRolesForEndpoint(
  method: string,
  path: string
): string[] {
  const key = `${method.toUpperCase()} ${path}`;
  return API_ENDPOINT_ROLE_MAP[key] || [];
}

/**
 * Check if a role can access an endpoint
 */
export function canRoleAccessEndpoint(
  method: string,
  path: string,
  userRole: string
): boolean {
  const requiredRoles = getRequiredRolesForEndpoint(method, path);
  return requiredRoles.includes(userRole);
}

/**
 * Get all accessible endpoints for a role
 */
export function getAccessibleEndpoints(userRole: string): string[] {
  return Object.entries(API_ENDPOINT_ROLE_MAP)
    .filter(([, roles]) => roles.includes(userRole))
    .map(([endpoint]) => endpoint);
}
```

### **Using the API Role Mapping in Components**

```typescript
// Example: Show API endpoints available to user in admin panel

import { getAccessibleEndpoints } from '@/domains/rbac/utils/apiRoleMapping';
import { usePermissions } from '@/domains/rbac/hooks/usePermissions';

function AdminAPIDocs() {
  const { user } = usePermissions();

  if (!user) return null;

  const userRole = user.roles[0]; // Get primary role
  const endpoints = getAccessibleEndpoints(userRole);

  return (
    <div>
      <h2>Available Endpoints for {userRole}</h2>
      <ul>
        {endpoints.map(endpoint => (
          <li key={endpoint}>{endpoint}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 4. Implementation Checklist

### Phase 1: Core Setup (30 minutes)
- [ ] Create `rolePermissionMap.ts` with role hierarchy
- [ ] Enhance `AuthContext.tsx` to compute permissions
- [ ] Create `useAuth.ts` hook
- [ ] Create `usePermissions.ts` hook

### Phase 2: UI Components (20 minutes)
- [ ] Create `CanAccess.tsx` component
- [ ] Create `RoleBasedButton.tsx` component
- [ ] Update `Layout.tsx` with role-based navigation

### Phase 3: Routing (15 minutes)
- [ ] Create/Update `RouteRenderer.tsx` with guard logic
- [ ] Test route protection

### Phase 4: API Mapping (15 minutes)
- [ ] Create `apiRoleMapping.ts`
- [ ] Document all endpoints

### Phase 5: Testing (20 minutes)
- [ ] Test permission checks
- [ ] Test route protection
- [ ] Test UI component rendering

---

## 5. Usage Examples

### Example 1: Check Permission in Component

```typescript
import { usePermissions } from '@/domains/rbac/hooks/usePermissions';

function UserList() {
  const { hasPermission } = usePermissions();

  if (!hasPermission('users:view_list')) {
    return <div>No permission to view users</div>;
  }

  return (
    <div>
      {/* Your users list */}
    </div>
  );
}
```

### Example 2: Conditional Rendering

```typescript
import { CanAccess } from '@/components/CanAccess';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>

      <CanAccess requiredRole="admin">
        <AdminPanel />
      </CanAccess>

      <CanAccess requiredPermissions="users:delete" fallback={<p>No delete access</p>}>
        <button>Delete User</button>
      </CanAccess>
    </div>
  );
}
```

### Example 3: Role-Based Button

```typescript
import { RoleBasedButton } from '@/components/RoleBasedButton';

function UserActions() {
  return (
    <div>
      <RoleBasedButton
        requiredRole="admin"
        onClick={handleDelete}
        disabledTooltip="Only admins can delete users"
      >
        Delete
      </RoleBasedButton>
    </div>
  );
}
```

### Example 4: Complex Access Check

```typescript
import { usePermissions } from '@/domains/rbac/hooks/usePermissions';

function EditUser() {
  const { hasAccess } = usePermissions();

  // Require admin role AND both permissions
  if (!hasAccess({
    requiredRole: 'manager',
    requiredPermissions: ['users:view_details', 'users:update_any'],
    requireAllPermissions: true,
  })) {
    return <div>No access</div>;
  }

  return <form>{/* Edit form */}</form>;
}
```

---

## 6. Testing RBAC

### Test Permissions Hook

```typescript
// src/__tests__/hooks/usePermissions.test.ts

import { renderHook } from '@testing-library/react';
import { usePermissions } from '@/domains/rbac/hooks/usePermissions';
import { AuthContext } from '@/domains/auth/context/AuthContext';

const mockAdminUser = {
  user_id: '1',
  email: 'admin@test.com',
  first_name: 'Admin',
  last_name: 'User',
  roles: ['admin'],
  is_active: true,
  is_verified: true,
};

describe('usePermissions', () => {
  it('should check admin role correctly', () => {
    const wrapper = ({ children }) => (
      <AuthContext.Provider
        value={{
          user: mockAdminUser,
          isAuthenticated: true,
          isLoading: false,
          permissions: ['admin:*'],
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
  });
});
```

---

## 7. Quick Reference

### Permission Check Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `hasRole(role)` | Check if user has specific role | `hasRole('admin')` |
| `hasPermission(perm)` | Check single permission | `hasPermission('users:delete')` |
| `hasAnyPermission(perms)` | Check if user has ANY permission | `hasAnyPermission(['users:create', 'users:update'])` |
| `hasAllPermissions(perms)` | Check if user has ALL permissions | `hasAllPermissions(['users:view', 'users:export'])` |
| `hasAccess(options)` | Complex check with roles + permissions | `hasAccess({ requiredRole: 'admin', requiredPermissions: 'users:*' })` |

### Components

| Component | Purpose | When to Use |
|-----------|---------|-------------|
| `<CanAccess>` | Conditional rendering | Show/hide UI elements |
| `<RoleBasedButton>` | Button with permission check | Disable buttons based on permissions |
| `ProtectedRoute` | Route guard | Protect routes in router |

---

## 8. Backend Alignment

Your RBAC maps to your backend (`user_mn`) as follows:

**Backend Files:**
- `user_mn/src/app/core/constants/role_names.py` → `ROLE_HIERARCHY` in `rolePermissionMap.ts`
- `user_mn/src/app/core/constants/permission_codes.py` → `ROLE_PERMISSIONS` in `rolePermissionMap.ts`

**User Type:**
- Backend: User with `roles: List[str]` → Frontend: User with `roles: string[]`
- Backend: Role-based permission checks → Frontend: Role-based component rendering

**API Endpoints:**
- Backend: Role validation on each endpoint → Frontend: Pre-rendering checks with `apiRoleMapping.ts`

---

## 9. Next Steps

1. ✅ Implement all files from Steps 1-7
2. ✅ Test permission hooks
3. ✅ Update all route-protected pages to use `<CanAccess>` or `<RoleBasedButton>`
4. ✅ Add role-based features to admin panel
5. ✅ Document all API endpoints in `apiRoleMapping.ts`

**You now have a complete, production-ready RBAC system! 🎉**
