# 🏗️ USERMN - Modern React 19 Architecture

**Project:** User Management System (Modern Architecture)  
**Date:** October 27, 2025  
**Version:** 2.0.0  
**Status:** 🚀 Production-Ready Architecture

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [Project Structure](#project-structure)
4. [Domain-Driven Design](#domain-driven-design)
5. [React 19 Features](#react-19-features)
6. [Routing Strategy](#routing-strategy)
7. [State Management](#state-management)
8. [Design System](#design-system)
9. [Code Organization](#code-organization)
10. [Implementation Roadmap](#implementation-roadmap)

---

## 🎯 Overview

### **Purpose**
A modern, scalable user management system built with React 19, implementing business logic from `user_mn_ui` with a clean, maintainable architecture.

### **Core Technologies**
- ⚛️ **React 19.1.1** - Latest React with compiler optimizations
- 🎨 **Tailwind CSS v4.1.16** - Modern utility-first CSS
- ⚡ **Vite 6.0.1** - Lightning-fast build tool
- 🧭 **React Router v7** - Type-safe routing
- 📦 **TypeScript 5.9.3** - Static type checking
- 🎭 **Zustand** - Lightweight state management

### **Key Goals**
✅ Clean, maintainable architecture  
✅ Domain-Driven Design (DDD)  
✅ React 19 best practices  
✅ Blazing-fast routing  
✅ DRY principles  
✅ Single source of truth  
✅ Scalable for future features

---

## 🏛️ Architecture Principles

### **1. Domain-Driven Design (DDD)**
- Organize by business domains, not technical layers
- Each domain is self-contained with its own:
  - Pages
  - Components
  - Hooks
  - Services
  - Types
  - State

### **2. Clean Code & DRY**
- Single source of truth for design tokens
- Reusable components
- No code duplication
- Clear naming conventions
- Comprehensive TypeScript types

### **3. React 19 Optimizations**
- Use React Compiler (auto-memoization)
- Remove unnecessary `useMemo`/`useCallback`
- `useOptimistic` for instant UI updates
- `useActionState` for form handling
- `use()` for context consumption
- Suspense for code splitting

### **4. Performance First**
- Lazy loading for all routes
- Code splitting per domain
- Optimized bundle sizes
- Modern CSS features
- GPU-accelerated animations

### **5. Scalability**
- Easy to add new domains
- Clear boundaries between features
- Modular architecture
- Plugin-based extensions

---

## 📁 Project Structure

```
usermn/
├── src/
│   ├── app/                          # Core application setup
│   │   ├── App.tsx                   # Root component with routing
│   │   ├── providers.tsx             # All providers in one file (simpler!)
│   │   └── ErrorBoundary.tsx         # Global error handler
│   │
│   ├── domains/                      # Business domains (DDD)
│   │   │
│   │   ├── auth/                     # Authentication domain
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── RegisterPage.tsx
│   │   │   │   └── ForgotPasswordPage.tsx
│   │   │   ├── components/
│   │   │   │   └── PasswordStrength.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts        # React 19 use() hook
│   │   │   ├── services/
│   │   │   │   └── authService.ts
│   │   │   ├── store/
│   │   │   │   └── authStore.ts      # Zustand store
│   │   │   └── types.ts              # All auth types in one file
│   │   │
│   │   ├── users/                    # User Management domain
│   │   │   ├── pages/
│   │   │   │   ├── UserListPage.tsx      # List all users
│   │   │   │   ├── CreateUserPage.tsx    # Create new user
│   │   │   │   ├── ApproveUsersPage.tsx  # Approve pending users
│   │   │   │   └── UserDetailPage.tsx    # View/Edit user
│   │   │   ├── components/
│   │   │   │   ├── UserTable.tsx         # Table with actions
│   │   │   │   ├── UserFilters.tsx
│   │   │   │   ├── RoleSelector.tsx      # Assign/change roles
│   │   │   │   └── BulkActions.tsx       # Bulk operations
│   │   │   ├── hooks/
│   │   │   │   ├── useUsers.ts           # CRUD operations
│   │   │   │   ├── useUserApproval.ts    # Approve users
│   │   │   │   └── useRoleAssignment.ts  # Role management
│   │   │   ├── services/
│   │   │   │   └── userService.ts        # API calls
│   │   │   ├── store/
│   │   │   │   └── userStore.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── admin/                    # Admin-only features
│   │   │   ├── pages/
│   │   │   │   ├── DashboardPage.tsx     # Admin dashboard
│   │   │   │   ├── RolesPage.tsx         # Role management
│   │   │   │   ├── AuditLogsPage.tsx     # System logs
│   │   │   │   └── SettingsPage.tsx      # System settings
│   │   │   ├── components/
│   │   │   │   ├── StatsCard.tsx
│   │   │   │   └── ActivityFeed.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAdminData.ts
│   │   │   ├── services/
│   │   │   │   └── adminService.ts
│   │   │   └── types.ts
│   │   │
│   │   └── profile/                  # User Profile domain
│   │       ├── pages/
│   │       │   ├── ProfilePage.tsx
│   │       │   ├── SettingsPage.tsx
│   │       │   └── SecurityPage.tsx
│   │       ├── components/
│   │       │   ├── ProfileForm.tsx
│   │       │   └── AvatarUpload.tsx
│   │       ├── hooks/
│   │       │   └── useProfile.ts
│   │       ├── services/
│   │       │   └── profileService.ts
│   │       └── types.ts
│   │
│   ├── core/                         # Cross-cutting concerns (NEW!)
│   │   ├── layout/                   # SINGLE LAYOUT SYSTEM
│   │   │   ├── Layout.tsx            # Main smart layout (handles all)
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx           # Conditional rendering
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── routing/                  # Routing system
│   │   │   ├── routes.tsx            # All routes with metadata
│   │   │   ├── RouteGuard.tsx        # Auth/role guards
│   │   │   └── constants.ts          # Route paths
│   │   │
│   │   ├── auth/                     # Auth cross-cutting
│   │   │   ├── AuthContext.tsx       # React 19 context
│   │   │   ├── PermissionGuard.tsx   # Permission checks
│   │   │   └── roles.ts              # Role definitions
│   │   │
│   │   └── i18n/                     # Internationalization (FUTURE)
│   │       ├── config.ts             # i18n setup (placeholder)
│   │       └── translations/         # Translation files
│   │           ├── en.json
│   │           └── es.json
│   │
│   ├── design-system/                # Design System (Single Source of Truth)
│   │   ├── tokens.ts                 # Design tokens
│   │   ├── variants.ts               # Component variants
│   │   ├── theme.ts                  # Theme configuration
│   │   └── index.ts                  # Exports
│   │
│   ├── components/                   # Shared UI Components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Table.tsx
│   │   ├── Toast.tsx
│   │   └── index.ts
│   │
│   ├── hooks/                        # Global hooks
│   │   ├── useTheme.ts               # React 19 use() hook
│   │   ├── useBreakpoint.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   └── usePermissions.ts         # Check user permissions
│   │
│   ├── services/                     # API infrastructure
│   │   ├── api.ts                    # Axios/Fetch client
│   │   ├── errorHandler.ts           # Global error handling
│   │   └── interceptors.ts           # Request/response interceptors
│   │
│   ├── store/                        # Global state (Zustand)
│   │   ├── appStore.ts               # Theme, sidebar, etc.
│   │   └── types.ts
│   │
│   ├── utils/                        # Utility functions
│   │   ├── cn.ts                     # Class name merger
│   │   ├── format.ts                 # Date, number formatters
│   │   ├── validation.ts             # Form validators
│   │   └── constants.ts              # App constants
│   │
│   ├── types/                        # Global TypeScript types
│   │   ├── global.d.ts
│   │   ├── api.types.ts
│   │   └── user.types.ts
│   │
│   ├── index.css                     # Global styles
│   ├── main.tsx                      # Entry point
│   └── vite-env.d.ts                 # Vite types
│
├── public/                           # Static assets
│   ├── favicon.ico
│   └── manifest.json
│
├── docs/                             # Documentation
│   ├── ARCHITECTURE.md               # This file
│   ├── ADMIN_FEATURES.md             # Admin functionality guide
│   └── CONTRIBUTING.md               # Contribution guide
│
├── .github/
│   └── copilot-instructions.md       # Copilot guidelines
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 🔑 Key Architectural Decisions

### **1. Single Layout System (Not Three!)**

**❌ OLD WAY:** Multiple layout files (MainLayout, AuthLayout, AdminLayout)  
**✅ NEW WAY:** ONE smart `Layout.tsx` with conditional rendering

```typescript
// core/layout/Layout.tsx - SINGLE INTELLIGENT LAYOUT
export function Layout() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Determine layout mode based on route
  const isAuthPage = location.pathname.startsWith('/auth');
  const isAdminPage = location.pathname.startsWith('/admin');
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Shows on all pages, different content per mode */}
      {!isAuthPage && <Header showAdminNav={isAdminPage} />}
      
      <div className="flex-1 flex">
        {/* Sidebar - Only show for authenticated users (except auth pages) */}
        {isAuthenticated && !isAuthPage && (
          <Sidebar isAdmin={isAdminPage} />
        )}
        
        {/* Main content area - Full width for auth, with sidebar otherwise */}
        <main className={cn(
          'flex-1 p-6',
          isAuthPage ? 'flex items-center justify-center' : 'bg-surface-secondary'
        )}>
          <Outlet />
        </main>
      </div>
      
      {/* Footer - Hide on auth pages */}
      {!isAuthPage && <Footer compact={isAdminPage} />}
    </div>
  );
}
```

**Benefits:**
- ✅ Single source of truth for layout logic
- ✅ Easier to maintain and debug
- ✅ Consistent behavior across all pages
- ✅ Less code duplication
- ✅ Centralized layout state management

---

### **2. Admin Functionality - Complete Feature Set**

Based on your requirements, here's the admin functionality:

#### **User Management Operations**

```typescript
// domains/users/services/userService.ts
export const userService = {
  // 1. List users with pagination & filters
  async listUsers(params: UserListParams): Promise<PaginatedUsers> {
    return api.get('/api/users', { params });
  },

  // 2. Create new user (admin creates on behalf)
  async createUser(data: CreateUserDto): Promise<User> {
    const response = await api.post('/api/users', data);
    // Auto-generates password on backend
    // Sends welcome email with password
    return response.data;
  },

  // 3. Approve pending user registration
  async approveUser(userId: string): Promise<User> {
    return api.post(`/api/users/${userId}/approve`);
  },

  // 4. Delete user (soft/hard delete)
  async deleteUser(userId: string, hard = false): Promise<void> {
    return api.delete(`/api/users/${userId}`, {
      params: { hard }
    });
  },

  // 5. Assign role to user
  async assignRole(userId: string, roleId: string): Promise<User> {
    return api.put(`/api/users/${userId}/role`, { roleId });
  },

  // 6. Change user role
  async changeRole(userId: string, newRoleId: string): Promise<User> {
    return api.patch(`/api/users/${userId}/role`, { 
      roleId: newRoleId 
    });
  },

  // 7. Resend auto-generated password
  async resendPassword(userId: string): Promise<void> {
    return api.post(`/api/users/${userId}/resend-password`);
  },

  // 8. Bulk operations
  async bulkApprove(userIds: string[]): Promise<void> {
    return api.post('/api/users/bulk/approve', { userIds });
  },

  async bulkDelete(userIds: string[]): Promise<void> {
    return api.post('/api/users/bulk/delete', { userIds });
  },
};
```

#### **Role Management**

```typescript
// core/auth/roles.ts - SINGLE SOURCE OF TRUTH
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  GUEST: 'guest',
} as const;

export const PERMISSIONS = {
  // User permissions
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_APPROVE: 'user:approve',
  
  // Role permissions
  ROLE_ASSIGN: 'role:assign',
  ROLE_MANAGE: 'role:manage',
  
  // System permissions
  AUDIT_VIEW: 'audit:view',
  SETTINGS_MANAGE: 'settings:manage',
} as const;

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_APPROVE,
    PERMISSIONS.ROLE_ASSIGN,
    PERMISSIONS.AUDIT_VIEW,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_APPROVE,
  ],
  [ROLES.USER]: [
    PERMISSIONS.USER_READ,
  ],
  [ROLES.GUEST]: [],
};
```

---

### **3. Cross-Cutting Concerns (NEW `core/` folder)**

Cross-cutting concerns are features that span multiple domains:

```
core/
├── layout/          # Layout system (affects all pages)
├── routing/         # Routing logic (affects navigation)
├── auth/            # Authentication & authorization (affects all domains)
└── i18n/            # Internationalization (future - affects all text)
```

**Why separate from domains?**
- ✅ Used by ALL domains (not domain-specific)
- ✅ Infrastructure concerns, not business logic
- ✅ Easier to upgrade/replace (e.g., switch i18n library)
- ✅ Clear separation of concerns

**Example: Permission Guard (Cross-Cutting)**

```typescript
// core/auth/PermissionGuard.tsx
export function PermissionGuard({ 
  permission, 
  children 
}: PermissionGuardProps) {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}

// Usage in any domain
import { PermissionGuard } from '@/core/auth';

<PermissionGuard permission={PERMISSIONS.USER_DELETE}>
  <DeleteUserButton userId={user.id} />
</PermissionGuard>
```

---

### **4. Internationalization (i18n) - Future Ready**

Structure is prepared but NOT implemented yet:

```typescript
// core/i18n/config.ts (placeholder for future)
export const i18nConfig = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'es', 'fr'], // Add when needed
  fallbackLocale: 'en',
};

// When ready to implement, use: react-i18next or next-intl
```

**Why placeholder?**
- ✅ You said "localization support is not added"
- ✅ Folder structure ready for future
- ✅ No unused code/dependencies
- ✅ Easy to add when needed

---

## 🎯 Domain-Driven Design

### **Domain Structure**

Each domain is self-contained:

```typescript
domains/
└── [domain-name]/
    ├── pages/              # Page components (routes)
    ├── components/         # Domain-specific components
    ├── hooks/             # Domain-specific hooks
    ├── services/          # API/business logic
    ├── store/             # Domain state (Zustand)
    ├── types/             # TypeScript types
    ├── utils/             # Domain utilities
    └── index.ts           # Public API (exports)
```

### **Example: Auth Domain**

```typescript
// domains/auth/index.ts (Public API)
export { LoginPage, RegisterPage } from './pages';
export { LoginForm, SocialLogin } from './components';
export { useLogin, useRegister, useAuth } from './hooks';
export type { LoginCredentials, User, AuthState } from './types';

// Usage from other domains
import { useAuth, type User } from '@/domains/auth';
```

### **Domain Boundaries**

✅ **DO:**
- Keep domain logic within the domain
- Use domain's public API for external access
- Share through `domains/shared`

❌ **DON'T:**
- Import directly from other domain internals
- Create circular dependencies
- Mix domain concerns

---

## ⚛️ React 19 Features

### **1. React Compiler (Auto-Optimization)**

```typescript
// ✅ React 19: No manual memoization needed!
function UserList({ users }: Props) {
  // Automatically memoized by React Compiler
  const sortedUsers = users.sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <ul>
      {sortedUsers.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </ul>
  );
}

// ❌ Old way (React 18)
const sortedUsers = useMemo(
  () => users.sort((a, b) => a.name.localeCompare(b.name)),
  [users]
);
```

### **2. useOptimistic (Instant UI Updates)**

```typescript
// domains/users/hooks/useUserActions.ts
import { useOptimistic } from 'react';

export function useUserActions() {
  const [users, setUsers] = useState<User[]>([]);
  const [optimisticUsers, addOptimisticUser] = useOptimistic(
    users,
    (state, newUser: User) => [...state, newUser]
  );

  const createUser = async (userData: CreateUserDto) => {
    // Show immediately in UI
    const tempUser = { ...userData, id: 'temp-' + Date.now() };
    addOptimisticUser(tempUser);

    try {
      // Then save to server
      const user = await userApi.create(userData);
      setUsers(prev => [...prev, user]);
    } catch (error) {
      // Auto-reverts on error
      toast.error('Failed to create user');
    }
  };

  return { users: optimisticUsers, createUser };
}
```

### **3. useActionState (Form Handling)**

```typescript
// domains/auth/components/LoginForm.tsx
import { useActionState } from 'react';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: FormState, formData: FormData) => {
      try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        
        await authService.login({ email, password });
        return { success: true, error: null };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    { success: false, error: null }
  );

  return (
    <form action={formAction}>
      <Input name="email" type="email" required />
      <Input name="password" type="password" required />
      
      {state.error && <ErrorMessage>{state.error}</ErrorMessage>}
      
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
```

### **4. use() Hook (Context & Promises)**

```typescript
// domains/shared/hooks/useTheme.ts
import { use } from 'react';
import { ThemeContext } from '@/app/providers';

export function useTheme() {
  // ✅ React 19: Simpler context consumption
  const theme = use(ThemeContext);
  return theme;
}

// ✅ Can also unwrap promises
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise); // Suspends until resolved
  return <div>{user.name}</div>;
}
```

### **5. Suspense & Error Boundaries**

```typescript
// routing/LazyRoutes.tsx
import { lazy, Suspense } from 'react';

const LazyUserPage = lazy(() => import('@/domains/users/pages/UserListPage'));

export function UsersRoute() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LazyUserPage />
    </Suspense>
  );
}

// app/ErrorBoundary.tsx
export class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

---

## 🧭 Routing Strategy

### **Route Configuration**

```typescript
// routing/routes.tsx
import { lazy, type ComponentType } from 'react';
import type { RouteObject } from 'react-router-dom';

interface RouteConfig {
  path: string;
  component: ComponentType;
  layout?: 'main' | 'auth' | 'admin';
  guard?: 'public' | 'private' | 'admin';
  title?: string;
}

// Lazy-loaded pages
const LoginPage = lazy(() => import('@/domains/auth/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/domains/dashboard/pages/DashboardPage'));
const UserListPage = lazy(() => import('@/domains/users/pages/UserListPage'));

export const routes: RouteConfig[] = [
  // Public routes
  {
    path: '/login',
    component: LoginPage,
    layout: 'auth',
    guard: 'public',
    title: 'Login',
  },
  
  // Protected routes
  {
    path: '/dashboard',
    component: DashboardPage,
    layout: 'main',
    guard: 'private',
    title: 'Dashboard',
  },
  
  // Admin routes
  {
    path: '/admin/users',
    component: UserListPage,
    layout: 'admin',
    guard: 'admin',
    title: 'User Management',
  },
];
```

### **Route Guards (Middleware)**

```typescript
// routing/RouteGuard.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/domains/auth';

export function RouteGuard({ 
  children, 
  guard 
}: { 
  children: ReactNode; 
  guard?: 'public' | 'private' | 'admin';
}) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (guard === 'public') {
    return isAuthenticated ? <Navigate to="/dashboard" /> : children;
  }

  if (guard === 'private' && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (guard === 'admin' && user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
}
```

### **Performance-Optimized Routing**

```typescript
// routing/LazyRoutes.tsx
import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Code-split per domain
const AuthRoutes = lazy(() => import('@/domains/auth/routes'));
const DashboardRoutes = lazy(() => import('@/domains/dashboard/routes'));
const UsersRoutes = lazy(() => import('@/domains/users/routes'));

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/auth/*" element={<AuthRoutes />} />
        <Route path="/dashboard/*" element={<DashboardRoutes />} />
        <Route path="/users/*" element={<UsersRoutes />} />
      </Routes>
    </Suspense>
  );
}
```

---

## 🗄️ State Management (Single Source of Truth)

### **Philosophy: Minimize State, Maximize DRY**

**Principle:** Don't duplicate state. Every piece of data has ONE owner.

```typescript
// ❌ BAD - State duplication
const [users, setUsers] = useState([]); // Component A
const [users, setUsers] = useState([]); // Component B
const [users, setUsers] = useState([]); // Component C

// ✅ GOOD - Single source of truth
// domains/users/store/userStore.ts (ONE OWNER)
export const useUserStore = create<UserState>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
}));

// All components use the SAME store
```

---

### **State Hierarchy (DRY Architecture)**

```typescript
1. SERVER STATE (Backend is source of truth)
   └─> React Query / TanStack Query (cache + sync)
       └─> Components consume via hooks
       
2. GLOBAL APP STATE (Zustand)
   ├─> Theme (light/dark)
   ├─> Sidebar (open/closed)
   └─> User session (auth token)
   
3. DOMAIN STATE (Zustand domain stores)
   ├─> userStore (users domain)
   ├─> authStore (auth domain)
   └─> adminStore (admin domain)
   
4. CONTEXT (React 19 use() hook)
   ├─> ThemeContext (wrap app)
   ├─> AuthContext (wrap app)
   └─> LocaleContext (wrap app)
   
5. COMPONENT STATE (useState - UI only)
   ├─> Form inputs
   ├─> Modal open/closed
   └─> Temporary UI state
```

---

### **Strategy: Zustand + React Query + Context**

#### **1. Server State (React Query) - RECOMMENDED**

```typescript
// services/api.ts - Single API client (DRY)
import axios from 'axios';
import { QueryClient } from '@tanstack/react-query';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// domains/users/hooks/useUsers.ts - Single source of truth
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';

// Query Keys - Single source of truth
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Hook - Single source of truth for user data
export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => userService.listUsers(filters),
    // Backend is source of truth, no local duplication
  });
}

// Mutation - Updates cached data automatically
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      // Invalidate and refetch - single source of truth maintained
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

// Usage in component - No state duplication!
function UserListPage() {
  const { data: users, isLoading } = useUsers({ status: 'active' });
  const createUser = useCreateUser();
  
  // No local state needed - React Query handles caching
  return <UserTable users={users} />;
}
```

#### **2. Global App State (Zustand) - Minimal**

```typescript
// store/appStore.ts (Global state)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  locale: string;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setLocale: (locale: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      locale: 'en',
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'app-storage' } // localStorage key
  )
);

// Usage - No duplication
function Header() {
  const { theme, toggleTheme } = useAppStore();
  return <button onClick={toggleTheme}>{theme}</button>;
}
```

#### **3. Context (React 19 use() hook) - For Provider Pattern**

```typescript
// core/auth/AuthContext.tsx - Single source of truth for auth
import { createContext, useState, type ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Single source: localStorage
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (credentials: LoginCredentials) => {
    const userData = await authService.login(credentials);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Sync
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    localStorage.removeItem('user'); // Sync
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// hooks/useAuth.ts - React 19 use() hook
import { use } from 'react';
import { AuthContext } from '@/core/auth/AuthContext';

export function useAuth() {
  const context = use(AuthContext); // ✅ React 19 way
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Usage - No duplication
function UserProfile() {
  const { user, logout } = useAuth(); // Single source
  return <div>{user?.name} <button onClick={logout}>Logout</button></div>;
}
```

---

### **DRY Principles Applied**

| Concern | Single Source of Truth | Access Pattern |
|---------|----------------------|----------------|
| **User Data** | React Query cache | `useUsers()` hook |
| **Auth State** | AuthContext + localStorage | `useAuth()` hook |
| **Theme** | Zustand appStore + localStorage | `useAppStore()` hook |
| **Routing** | React Router routes config | `routes.tsx` file |
| **Locale** | LocaleContext + appStore | `useLocale()` hook |
| **API Config** | `services/api.ts` | `apiClient` export |

---

## 🧭 Routing Strategy (Single Source of Truth)

### **Centralized Route Configuration**

```typescript
// core/routing/routes.tsx - SINGLE SOURCE OF TRUTH
import { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { RouteGuard } from './RouteGuard';
import { Layout } from '@/core/layout/Layout';

// Metadata type - DRY route configuration
interface RouteMetadata {
  path: string;
  title: string;
  guard?: 'public' | 'auth' | 'admin';
  permission?: string;
}

// Route registry - SINGLE SOURCE
export const ROUTE_PATHS = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  USERS_LIST: '/users',
  USERS_CREATE: '/users/create',
  USERS_DETAIL: '/users/:id',
  ADMIN_DASHBOARD: '/admin',
  PROFILE: '/profile',
} as const;

// Lazy imports - code splitting
const LoginPage = lazy(() => import('@/domains/auth/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/domains/admin/pages/DashboardPage'));
const UserListPage = lazy(() => import('@/domains/users/pages/UserListPage'));
const CreateUserPage = lazy(() => import('@/domains/users/pages/CreateUserPage'));

// Suspense wrapper - DRY
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

// Routes configuration - SINGLE DEFINITION
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      // Public routes
      {
        path: ROUTE_PATHS.LOGIN,
        element: (
          <RouteGuard guard="public">
            {withSuspense(LoginPage)}
          </RouteGuard>
        ),
      },
      
      // Protected routes
      {
        path: ROUTE_PATHS.DASHBOARD,
        element: (
          <RouteGuard guard="auth">
            {withSuspense(DashboardPage)}
          </RouteGuard>
        ),
      },
      
      // Admin routes with permission
      {
        path: ROUTE_PATHS.USERS_LIST,
        element: (
          <RouteGuard guard="admin" permission="user:read">
            {withSuspense(UserListPage)}
          </RouteGuard>
        ),
      },
      {
        path: ROUTE_PATHS.USERS_CREATE,
        element: (
          <RouteGuard guard="admin" permission="user:create">
            {withSuspense(CreateUserPage)}
          </RouteGuard>
        ),
      },
    ],
  },
];

// Navigation helpers - DRY
export const navigate = {
  toLogin: () => ROUTE_PATHS.LOGIN,
  toDashboard: () => ROUTE_PATHS.DASHBOARD,
  toUserDetail: (id: string) => ROUTE_PATHS.USERS_DETAIL.replace(':id', id),
  toUserCreate: () => ROUTE_PATHS.USERS_CREATE,
};
```

### **Route Guards - Centralized Auth Logic**

```typescript
// core/routing/RouteGuard.tsx - Single guard implementation
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTE_PATHS } from './routes';

interface RouteGuardProps {
  children: React.ReactNode;
  guard?: 'public' | 'auth' | 'admin';
  permission?: string;
}

export function RouteGuard({ children, guard, permission }: RouteGuardProps) {
  const { isAuthenticated, user, hasPermission } = useAuth();
  const location = useLocation();

  // Public routes - redirect if already authenticated
  if (guard === 'public' && isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />;
  }

  // Protected routes - require authentication
  if (guard === 'auth' && !isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.LOGIN} state={{ from: location }} replace />;
  }

  // Admin routes - require admin role
  if (guard === 'admin') {
    if (!isAuthenticated) {
      return <Navigate to={ROUTE_PATHS.LOGIN} state={{ from: location }} replace />;
    }
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
      return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />;
    }
  }

  // Permission check
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
```

---

## 🌍 Localization (Backend-Driven)

### **Architecture: Backend Sends Codes, UI Maps to Messages**

```typescript
// core/i18n/config.ts - Localization setup
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import en from './translations/en.json';
import es from './translations/es.json';
import fr from './translations/fr.json';

export const defaultLocale = 'en';
export const supportedLocales = ['en', 'es', 'fr'] as const;

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
    },
    fallbackLng: defaultLocale,
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export default i18n;

// core/i18n/translations/en.json - SINGLE SOURCE for messages
{
  "errors": {
    "auth": {
      "AUTH_001": "Invalid email or password",
      "AUTH_002": "Account is locked. Please contact support",
      "AUTH_003": "Email not verified. Check your inbox",
      "AUTH_004": "Password must be at least 8 characters",
      "AUTH_005": "Session expired. Please login again"
    },
    "user": {
      "USER_001": "User not found",
      "USER_002": "Email already exists",
      "USER_003": "Insufficient permissions",
      "USER_004": "User account is inactive"
    },
    "validation": {
      "VAL_001": "Required field",
      "VAL_002": "Invalid email format",
      "VAL_003": "Password too weak",
      "VAL_004": "Passwords do not match"
    },
    "system": {
      "SYS_001": "Internal server error. Please try again",
      "SYS_002": "Service temporarily unavailable",
      "SYS_003": "Request timeout. Please check your connection"
    }
  },
  "success": {
    "user": {
      "USER_CREATE": "User created successfully",
      "USER_UPDATE": "User updated successfully",
      "USER_DELETE": "User deleted successfully",
      "USER_APPROVE": "User approved successfully"
    },
    "auth": {
      "LOGIN_SUCCESS": "Welcome back!",
      "LOGOUT_SUCCESS": "Logged out successfully",
      "PASSWORD_RESET": "Password reset email sent"
    }
  },
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "confirm": "Confirm"
  }
}

// core/i18n/translations/es.json - Spanish translations
{
  "errors": {
    "auth": {
      "AUTH_001": "Correo electrónico o contraseña no válidos",
      "AUTH_002": "La cuenta está bloqueada. Contacte con soporte",
      // ... more translations
    }
  }
}
```

### **Usage Pattern: Backend Code → UI Message**

```typescript
// utils/errorHandler.ts - Map backend codes to messages
import i18n from '@/core/i18n/config';
import { logger } from './logger';

export function handleApiError(error: ApiError): string {
  // Backend sends: { code: "AUTH_001", message: "..." }
  const errorCode = error.code;
  
  // Look up localized message
  const localizedMessage = i18n.t(`errors.${getCategoryFromCode(errorCode)}.${errorCode}`);
  
  // Log for debugging
  logger.error('API Error', { code: errorCode, originalMessage: error.message });
  
  // Return localized message to user
  return localizedMessage || i18n.t('errors.system.SYS_001');
}

function getCategoryFromCode(code: string): string {
  const prefix = code.split('_')[0].toLowerCase();
  const categoryMap: Record<string, string> = {
    auth: 'auth',
    user: 'user',
    val: 'validation',
    sys: 'system',
  };
  return categoryMap[prefix] || 'system';
}

// services/api.ts - Intercept errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.code) {
      // Backend sent error code
      const localizedError = handleApiError(error.response.data);
      toast.error(localizedError); // Show localized message
    }
    return Promise.reject(error);
  }
);

// Usage in component
function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      try {
        await authService.login({
          email: formData.get('email'),
          password: formData.get('password'),
        });
        return { error: null };
      } catch (error) {
        // Error already shown as toast (interceptor)
        // Or manually get message:
        return { error: handleApiError(error.response.data) };
      }
    },
    { error: null }
  );

  return (
    <form action={formAction}>
      {/* Backend sends AUTH_001, UI shows "Invalid email or password" */}
      {state.error && <ErrorMessage>{state.error}</ErrorMessage>}
    </form>
  );
}
```

### **Locale Switching**

```typescript
// hooks/useLocale.ts - Single source for locale management
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/appStore';

export function useLocale() {
  const { i18n, t } = useTranslation();
  const { locale, setLocale } = useAppStore();

  const changeLocale = useCallback((newLocale: string) => {
    i18n.changeLanguage(newLocale);
    setLocale(newLocale);
    document.documentElement.lang = newLocale;
  }, [i18n, setLocale]);

  return {
    locale,
    changeLocale,
    t, // Translation function
  };
}

// Usage
function LanguageSelector() {
  const { locale, changeLocale } = useLocale();
  
  return (
    <select value={locale} onChange={(e) => changeLocale(e.target.value)}>
      <option value="en">English</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
    </select>
  );
}
```

---

## 📊 Logging & Monitoring

### **Multi-Layer Logging Strategy**

```typescript
// utils/logger.ts - SINGLE LOGGING UTILITY
import * as Sentry from '@sentry/react';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  action?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  constructor() {
    if (this.isProduction) {
      this.initSentry();
    }
  }

  private initSentry() {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: 1.0,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
    });
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...context,
    };

    // Console logging (always in dev, errors in prod)
    if (this.isDevelopment || level === 'error') {
      const consoleMethod = console[level] || console.log;
      consoleMethod(`[${timestamp}] ${level.toUpperCase()}: ${message}`, context);
    }

    // Send to monitoring service in production
    if (this.isProduction) {
      this.sendToMonitoring(level, logData);
    }

    // Store in localStorage for debugging (last 100 logs)
    this.storeLocally(logData);
  }

  private sendToMonitoring(level: LogLevel, data: any) {
    if (level === 'error') {
      Sentry.captureException(new Error(data.message), {
        contexts: { custom: data },
      });
    } else {
      Sentry.addBreadcrumb({
        level: level as any,
        message: data.message,
        data: data,
      });
    }
  }

  private storeLocally(logData: any) {
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push(logData);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.shift();
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      // Silently fail if localStorage is full
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }

  // User action tracking
  trackAction(action: string, context?: LogContext) {
    this.info(`User Action: ${action}`, { action, ...context });
  }

  // API call tracking
  trackApiCall(method: string, url: string, duration: number, status: number) {
    this.info(`API Call: ${method} ${url}`, {
      method,
      url,
      duration,
      status,
    });
  }
}

export const logger = new Logger();
```

### **Usage Patterns**

```typescript
// 1. Services - API logging
// services/api.ts
import { logger } from '@/utils/logger';

apiClient.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    logger.trackApiCall(
      response.config.method?.toUpperCase() || 'GET',
      response.config.url || '',
      duration,
      response.status
    );
    return response;
  },
  (error) => {
    logger.error('API Error', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// 2. Components - User action tracking
function CreateUserButton() {
  const createUser = useCreateUser();
  
  const handleClick = async () => {
    logger.trackAction('create_user_clicked', {
      userId: currentUser.id,
      timestamp: Date.now(),
    });
    
    try {
      await createUser.mutateAsync(userData);
      logger.info('User created successfully', { newUserId: result.id });
    } catch (error) {
      logger.error('Failed to create user', {
        error: error.message,
        userData: sanitize(userData), // Remove sensitive data
      });
    }
  };
  
  return <Button onClick={handleClick}>Create User</Button>;
}

// 3. Error Boundary - Catch React errors
// app/ErrorBoundary.tsx
import { logger } from '@/utils/logger';

export class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    logger.error('React Error Boundary', {
      error: error.message,
      stack: error.stack,
    });
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Component Error', {
      error: error.message,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// 4. Performance tracking
// utils/performance.ts
import { logger } from './logger';

export function trackPageLoad(pageName: string) {
  const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  logger.info(`Page Load: ${pageName}`, {
    pageName,
    loadTime: navigationTiming.loadEventEnd - navigationTiming.loadEventStart,
    domContentLoaded: navigationTiming.domContentLoadedEventEnd,
    firstPaint: performance.getEntriesByType('paint')[0]?.startTime,
  });
}

// Usage in pages
function UserListPage() {
  useEffect(() => {
    trackPageLoad('UserListPage');
  }, []);
  
  return <div>...</div>;
}
```

### **Log Viewer (Debug Tool)**

```typescript
// components/LogViewer.tsx - Development tool
function LogViewer() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState<LogLevel | 'all'>('all');

  useEffect(() => {
    const storedLogs = JSON.parse(localStorage.getItem('app_logs') || '[]');
    setLogs(storedLogs);
  }, []);

  const filteredLogs = logs.filter(log => 
    filter === 'all' || log.level === filter
  );

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-white shadow-xl rounded-lg overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-bold">Logs</h3>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="debug">Debug</option>
          <option value="info">Info</option>
          <option value="warn">Warn</option>
          <option value="error">Error</option>
        </select>
      </div>
      <div className="overflow-y-auto h-full p-4 space-y-2">
        {filteredLogs.map((log, i) => (
          <div key={i} className={`p-2 rounded text-xs ${getLogColor(log.level)}`}>
            <div className="font-mono">{log.timestamp}</div>
            <div className="font-bold">{log.level.toUpperCase()}</div>
            <div>{log.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Add to app in development mode
function App() {
  return (
    <>
      <AppRoutes />
      {import.meta.env.DEV && <LogViewer />}
    </>
  );
}
```

---

## 📦 Package Dependencies

```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.0.0",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.59.0",
    "axios": "^1.7.0",
    "i18next": "^23.15.0",
    "react-i18next": "^15.0.0",
    "i18next-browser-languagedetector": "^8.0.0",
    "@sentry/react": "^8.0.0",
    "lucide-react": "^0.460.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.1",
    "typescript": "^5.9.3",
    "tailwindcss": "^4.1.16",
    "@tailwindcss/vite": "^4.1.16"
  }
}
```

---

### **State Hierarchy**

```
1. Global State (appStore)
   - Theme
   - Layout preferences
   - User session

2. Domain State (userStore, authStore)
   - Domain-specific data
   - Local to domain
   - Can be reset independently

3. Component State (useState)
   - UI-only state
   - Form inputs
   - Temporary data
```

---

## 🎨 Design System

### **Single Source of Truth**

```typescript
// design-system/tokens.ts
export const tokens = {
  colors: {
    brand: {
      primary: 'oklch(0.7 0.15 260)',
      secondary: 'oklch(0.8 0.12 320)',
    },
    semantic: {
      success: 'oklch(0.7 0.15 142)',
      error: 'oklch(0.65 0.2 25)',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontFamily: {
      sans: ['Inter Variable', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      xs: 'clamp(0.75rem, 0.95vw, 0.875rem)',
      sm: 'clamp(0.875rem, 1.1vw, 1rem)',
      base: 'clamp(1rem, 1.25vw, 1.125rem)',
    },
  },
};

// design-system/variants.ts
export const buttonVariants = {
  base: 'inline-flex items-center justify-center font-semibold transition-all',
  variants: {
    primary: 'bg-brand-primary text-white hover:opacity-90',
    secondary: 'bg-brand-secondary text-white hover:opacity-90',
  },
  sizes: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2 text-base',
    lg: 'px-8 py-3 text-lg',
  },
};
```

---

## 📝 Code Organization

### **Import Aliases**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components": ["./src/components"],
      "@/domains/*": ["./src/domains/*"],
      "@/hooks": ["./src/hooks"],
      "@/utils": ["./src/utils"],
      "@/design-system": ["./src/design-system"],
      "@/types": ["./src/types"]
    }
  }
}

// Usage
import { Button } from '@/components';
import { useAuth } from '@/domains/auth';
import { cn } from '@/utils';
```

### **Naming Conventions**

```typescript
// Components: PascalCase
Button.tsx, UserCard.tsx, LoginForm.tsx

// Hooks: camelCase with "use" prefix
useAuth.ts, useUsers.ts, useTheme.ts

// Utils: camelCase
formatDate.ts, validation.ts, cn.ts

// Types: PascalCase with .types suffix
user.types.ts, api.types.ts

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = '...';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
```

---

## 🚀 Implementation Roadmap

### **Phase 1: Foundation (Week 1)**
- ✅ Setup project structure
- ✅ Configure routing system
- ✅ Setup design system
- ✅ Create base components
- ✅ Setup state management

### **Phase 2: Auth Domain (Week 2)**
- ⏳ Login page
- ⏳ Register page
- ⏳ Password reset
- ⏳ Auth guards
- ⏳ Session management

### **Phase 3: Dashboard Domain (Week 3)**
- ⏳ Dashboard layout
- ⏳ Stats cards
- ⏳ Charts/analytics
- ⏳ Activity feed

### **Phase 4: Users Domain (Week 4)**
- ⏳ User list
- ⏳ User details
- ⏳ User editing
- ⏳ Bulk operations

### **Phase 5: Admin Domain (Week 5-6)**
- ⏳ Role management
- ⏳ Permissions
- ⏳ Audit logs
- ⏳ System settings

### **Phase 6: Profile Domain (Week 7)**
- ⏳ User profile
- ⏳ Settings
- ⏳ Security options

### **Phase 7: Polish & Testing (Week 8)**
- ⏳ E2E tests
- ⏳ Performance optimization
- ⏳ Accessibility audit
- ⏳ Documentation

---

## 📊 Success Metrics

| Metric | Target |
|--------|--------|
| Bundle Size | < 200 KB (gzipped) |
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Lighthouse Score | > 95 |
| Test Coverage | > 80% |
| TypeScript Errors | 0 |

---

## 📚 References

- [React 19 Documentation](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Maintained by:** Development Team  
**Last Updated:** October 27, 2025  
**Next Review:** November 27, 2025
