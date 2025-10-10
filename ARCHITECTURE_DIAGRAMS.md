# 🎨 DDD Architecture - Visual Diagrams

**Project**: User Management UI  
**Last Updated**: October 10, 2025

---

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                             │
│                        (React Components / UI)                          │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │  Login Page  │  │  Dashboard   │  │  User List   │  ... more       │
│  └──────────────┘  └──────────────┘  └──────────────┘                │
└─────────────────────────────────────────────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DOMAIN LAYER                                   │
│                     (Business Logic / Features)                         │
│                                                                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐          │
│  │ Authentication │  │ User Management│  │ Workflow Engine│          │
│  │     Domain     │  │     Domain     │  │     Domain     │          │
│  ├────────────────┤  ├────────────────┤  ├────────────────┤          │
│  │ • Components   │  │ • Components   │  │ • Components   │          │
│  │ • Hooks        │  │ • Hooks        │  │ • Hooks        │          │
│  │ • Services     │  │ • Services     │  │ • Services     │          │
│  │ • Types        │  │ • Types        │  │ • Types        │          │
│  └────────────────┘  └────────────────┘  └────────────────┘          │
│                                                                         │
│  ┌────────────────┐  ┌────────────────┐                               │
│  │   Analytics    │  │System Admin    │                               │
│  │     Domain     │  │     Domain     │                               │
│  └────────────────┘  └────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE LAYER                                │
│                    (External / Technical Concerns)                      │
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │     API     │  │   Storage   │  │ Monitoring  │  │  Security   │ │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤  ├─────────────┤ │
│  │ • apiClient │  │ • Local     │  │ • Logger    │  │ • Auth      │ │
│  │ • Endpoints │  │ • Session   │  │ • Errors    │  │ • Perms     │ │
│  │ • Services  │  │ • IndexedDB │  │ • Analytics │  │ • Encrypt   │ │
│  │ • Errors    │  │ • TTL       │  │ • WebVitals │  │ • Sanitize  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SHARED LAYER                                    │
│                    (Reusable Across All Domains)                        │
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │    UI    │  │  Utils   │  │  Hooks   │  │  Types   │              │
│  ├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤              │
│  │ • Button │  │ • Date   │  │ • Debounce│ │ • Common │              │
│  │ • Input  │  │ • String │  │ • Media  │  │ • API    │              │
│  │ • Modal  │  │ • Array  │  │ • State  │  │ • Global │              │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
┌─────────────┐
│    User     │
└─────┬───────┘
      │ Interaction
      ▼
┌─────────────────────────────────────────────┐
│         PRESENTATION LAYER                  │
│  ┌──────────────────────────────────────┐  │
│  │  LoginPage (React Component)         │  │
│  │  • Renders UI                        │  │
│  │  • Handles user input                │  │
│  └──────────────────────────────────────┘  │
└─────┬───────────────────────────────────────┘
      │ Uses Hook
      ▼
┌─────────────────────────────────────────────┐
│         DOMAIN LAYER                        │
│  ┌──────────────────────────────────────┐  │
│  │  useLogin() Hook                     │  │
│  │  • State management                  │  │
│  │  • Validation logic                  │  │
│  └──────────┬───────────────────────────┘  │
│             │ Calls Service                 │
│  ┌──────────▼───────────────────────────┐  │
│  │  AuthService                         │  │
│  │  • Business logic                    │  │
│  │  • Data transformation               │  │
│  └──────────────────────────────────────┘  │
└─────┬───────────────────────────────────────┘
      │ Uses Infrastructure
      ▼
┌─────────────────────────────────────────────┐
│       INFRASTRUCTURE LAYER                  │
│  ┌──────────────────────────────────────┐  │
│  │  apiClient                           │  │
│  │  • HTTP requests                     │  │
│  │  • Error handling                    │  │
│  │  • Token injection                   │  │
│  └──────────┬───────────────────────────┘  │
│             │                               │
│  ┌──────────▼───────────────────────────┐  │
│  │  StorageManager                      │  │
│  │  • Save token                        │  │
│  │  • Persist session                   │  │
│  └──────────┬───────────────────────────┘  │
│             │                               │
│  ┌──────────▼───────────────────────────┐  │
│  │  Logger                              │  │
│  │  • Log events                        │  │
│  │  • Track metrics                     │  │
│  └──────────────────────────────────────┘  │
└─────┬───────────────────────────────────────┘
      │ External Request
      ▼
┌─────────────┐
│  Backend    │
│     API     │
└─────────────┘
```

---

## 🏗️ Domain Structure Deep Dive

### Authentication Domain Example

```
domains/authentication/
│
├── components/                    # 🎨 PRESENTATION
│   ├── LoginForm.tsx             # Login form component
│   ├── RegisterForm.tsx          # Registration form
│   ├── AuthGuard.tsx             # Route protection
│   ├── PasswordResetForm.tsx     # Password reset
│   └── index.ts                  # Barrel export
│
├── hooks/                        # 🪝 STATE & LOGIC
│   ├── useLogin.ts               # Login hook
│   │   ├─ const [isLoading, setIsLoading] = useState()
│   │   ├─ const login = async (credentials) => {...}
│   │   └─ return { login, isLoading, error }
│   │
│   ├── useRegister.ts            # Registration hook
│   ├── useAuthState.ts           # Auth state management
│   ├── useLogout.ts              # Logout hook
│   ├── usePasswordReset.ts       # Password reset hook
│   ├── useTokenRefresh.ts        # Token refresh hook
│   └── index.ts
│
├── services/                     # ⚙️ BUSINESS LOGIC
│   ├── AuthService.ts            # Main auth service
│   │   ├─ static async login(credentials)
│   │   ├─ static async register(data)
│   │   ├─ static async logout()
│   │   └─ static async refreshToken()
│   │
│   ├── TokenService.ts           # Token management
│   │   ├─ static saveToken(token)
│   │   ├─ static getToken()
│   │   ├─ static clearToken()
│   │   └─ static isTokenValid()
│   │
│   ├── SessionService.ts         # Session management
│   │   ├─ static createSession(user, token)
│   │   ├─ static getSession()
│   │   └─ static destroySession()
│   │
│   └── index.ts
│
├── types/                        # 📋 TYPE DEFINITIONS
│   ├── auth.types.ts
│   │   ├─ interface User
│   │   ├─ interface AuthToken
│   │   ├─ interface UserSession
│   │   ├─ interface LoginCredentials
│   │   ├─ interface RegisterData
│   │   ├─ enum UserRole
│   │   ├─ enum AuthStatus
│   │   └─ enum AuthErrorCode
│   │
│   └── index.ts
│
├── pages/                        # 📄 FULL PAGE COMPONENTS
│   ├── LoginPage.tsx             # /login route
│   ├── RegisterPage.tsx          # /register route
│   ├── ForgotPasswordPage.tsx    # /forgot-password route
│   └── index.ts
│
├── utils/                        # 🔧 DOMAIN UTILITIES
│   ├── validators.ts             # Email, password validation
│   ├── tokenUtils.ts             # Token parsing, expiration
│   └── index.ts
│
└── index.ts                      # 🎯 PUBLIC API
    └─ Exports all public interfaces
```

---

## 🔄 Import Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     App.tsx (Root)                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         │                         │
         ▼                         ▼
┌────────────────┐        ┌────────────────┐
│   LoginPage    │        │ Dashboard Page │
└────────┬───────┘        └────────┬───────┘
         │ import                  │ import
         │ from @domains           │ from @domains
         ▼                         ▼
┌─────────────────────────────────────────────┐
│     DOMAIN PUBLIC API (Barrel Exports)      │
│                                             │
│  import { LoginForm, useLogin }             │
│  from '@domains/authentication';            │
│                                             │
│  import { UserList, useUsers }              │
│  from '@domains/user-management';           │
└─────────────────┬───────────────────────────┘
                  │ Domain uses
         ┌────────┼────────┐
         │                 │
         ▼                 ▼
┌────────────────┐  ┌────────────────┐
│ Infrastructure │  │     Shared     │
│                │  │                │
│ @infrastructure│  │    @shared     │
│   /api         │  │      /ui       │
│   /storage     │  │      /utils    │
│   /monitoring  │  │      /hooks    │
│   /security    │  │      /types    │
└────────────────┘  └────────────────┘
```

---

## 🚫 Forbidden Import Patterns

```
❌ WRONG: Cross-Domain Imports

domains/workflow-engine/
  └── services/WorkflowService.ts
      import { UserService } from '@domains/user-management'; // ❌ NO!

⚠️ Problem: Creates tight coupling between domains
✅ Solution: Use infrastructure API or events


❌ WRONG: Infrastructure Importing Domain

infrastructure/api/
  └── apiClient.ts
      import { AuthService } from '@domains/authentication'; // ❌ NO!

⚠️ Problem: Circular dependency
✅ Solution: Domain uses infrastructure, not vice versa


❌ WRONG: Bypassing Public API

App.tsx
  import { LoginFormInternal } from '@domains/authentication/components/LoginFormInternal'; // ❌ NO!

⚠️ Problem: Accessing internal implementation
✅ Solution: Use barrel export: import { LoginForm } from '@domains/authentication';
```

---

## ✅ Correct Import Patterns

```
✅ CORRECT: Domain → Infrastructure

domains/authentication/hooks/useLogin.ts
  import { apiClient } from '@infrastructure/api';
  import { logger } from '@infrastructure/monitoring';
  import { StorageManager } from '@infrastructure/storage';


✅ CORRECT: Domain → Shared

domains/user-management/components/UserList.tsx
  import { Button } from '@shared/ui';
  import { formatDate } from '@shared/utils';
  import { useDebounce } from '@shared/hooks';


✅ CORRECT: Component → Domain Hook

domains/authentication/components/LoginForm.tsx
  import { useLogin } from '../hooks';
  import { LoginCredentials } from '../types';


✅ CORRECT: External → Domain Public API

App.tsx
  import { LoginForm, useAuthState } from '@domains/authentication';
  import { UserList, useUsers } from '@domains/user-management';
```

---

## 🎯 Dependency Rules

```
┌─────────────────────────────────────────────┐
│             DOMAINS                         │
│   (Can import from ↓ Infrastructure         │
│                  ↓ Shared)                  │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│         INFRASTRUCTURE                      │
│   (Can import from ↓ Shared)                │
│   (NO imports from Domains)                 │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│            SHARED                           │
│   (Can import from other Shared)            │
│   (NO imports from Domains/Infrastructure)  │
└─────────────────────────────────────────────┘
```

**Rules**:
1. **Domains** can import from **Infrastructure** and **Shared**
2. **Infrastructure** can import from **Shared** ONLY
3. **Shared** can import from other **Shared** modules ONLY
4. **NO** circular dependencies allowed
5. **NO** cross-domain imports (use events/composition)

---

## 🔄 Event-Driven Communication (Alternative to Cross-Domain)

When domains need to communicate:

```
┌──────────────────┐         ┌──────────────────┐
│  Authentication  │         │ User Management  │
│     Domain       │         │     Domain       │
└────────┬─────────┘         └────────▲─────────┘
         │                            │
         │ 1. User logs in            │ 3. Receives event
         │    Emit event              │    Updates UI
         ▼                            │
┌─────────────────────────────────────┴────┐
│      Infrastructure Event Bus            │
│                                           │
│  eventBus.emit('user.logged_in', {...})  │
│  eventBus.on('user.logged_in', handler)  │
└──────────────────────────────────────────┘
```

**Example Implementation**:
```typescript
// In Authentication Domain
import { eventBus } from '@infrastructure/events';

const handleLogin = (user: User) => {
  // Emit event instead of calling other domain
  eventBus.emit('user.logged_in', { userId: user.id, timestamp: new Date() });
};

// In User Management Domain
import { eventBus } from '@infrastructure/events';

useEffect(() => {
  const handler = (event) => {
    console.log('User logged in:', event.userId);
    // Update UI or fetch data
  };
  
  eventBus.on('user.logged_in', handler);
  
  return () => eventBus.off('user.logged_in', handler);
}, []);
```

---

## 📊 File Organization Example

### Before (Traditional)
```
src/
├── components/
│   ├── LoginPage.tsx              # 😕 Mixed with other components
│   ├── Dashboard.tsx
│   ├── UserList.tsx
│   └── WorkflowBuilder.tsx        # 😕 Hard to find related files
│
└── services/
    ├── authService.ts             # 😕 Separated from auth components
    ├── userService.ts
    └── workflowService.ts
```

### After (DDD)
```
src/
├── domains/
│   ├── authentication/            # ✅ Everything auth-related together
│   │   ├── components/
│   │   │   └── LoginForm.tsx
│   │   ├── services/
│   │   │   └── AuthService.ts
│   │   └── hooks/
│   │       └── useLogin.ts
│   │
│   ├── user-management/           # ✅ Everything user-related together
│   │   ├── components/
│   │   │   └── UserList.tsx
│   │   └── services/
│   │       └── UserService.ts
│   │
│   └── workflow-engine/           # ✅ Everything workflow-related together
│       ├── components/
│       │   └── WorkflowBuilder.tsx
│       └── services/
│           └── WorkflowService.ts
```

**Benefits**:
- ✅ Related files grouped together
- ✅ Easy to find what you need
- ✅ Clear boundaries
- ✅ Independent testing

---

## 🎓 Learning Path

```
Day 1-2: Read Documentation
  ├── ARCHITECTURE.md (understand principles)
  ├── DDD_QUICK_REFERENCE.md (practical examples)
  └── MIGRATION_GUIDE.md (implementation plan)

Day 3-4: Study Examples
  ├── Review authentication domain structure
  ├── Study barrel exports pattern
  └── Understand import patterns

Day 5: Hands-On Practice
  ├── Create a new domain
  ├── Move one component
  └── Test imports

Week 2: Team Implementation
  ├── Migrate one domain per developer
  ├── Daily code reviews
  └── Update imports

Week 3-4: Complete Migration
  ├── All domains implemented
  ├── Integration testing
  └── Documentation updates
```

---

## 📈 Maturity Model

```
Level 1: Basic Structure
  └── Folders created, types defined

Level 2: Working Domains
  └── One domain fully implemented

Level 3: Multiple Domains
  └── 3+ domains working, infrastructure integrated

Level 4: Complete Migration
  └── All code in DDD structure, legacy removed

Level 5: Optimized
  └── Performance tuned, micro-frontend ready

Current Status: Level 2 (Infrastructure + Auth domain foundation)
```

---

**Last Updated**: October 10, 2025  
**Created By**: 25-Year React Expert  
**Version**: 1.0
