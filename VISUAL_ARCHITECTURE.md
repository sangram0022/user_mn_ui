# 🎨 Visual Architecture Diagram

**Domain-Driven Design - User Management System**

---

## 🏗️ System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          REACT 19 APPLICATION                             │
│                            (usermn project)                               │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼──────┐  ┌────▼─────┐  ┌─────▼──────┐
            │   BROWSER    │  │  MOBILE  │  │   TABLET   │
            │   (Chrome)   │  │ (Safari) │  │   (Edge)   │
            └──────────────┘  └──────────┘  └────────────┘

═══════════════════════════════════════════════════════════════════════════

                         APPLICATION LAYERS
                         
┌──────────────────────────────────────────────────────────────────────────┐
│  LAYER 1: PRESENTATION (UI)                                              │
│  ────────────────────────────────────────────────────────────────────    │
│                                                                           │
│  🎯 8 BUSINESS DOMAINS                                                   │
│                                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │    AUTH     │  │   PROFILE   │  │    USERS    │  │    RBAC     │   │
│  │  16 APIs    │  │   2 APIs    │  │  10 APIs    │  │  12 APIs    │   │
│  │             │  │             │  │             │  │             │   │
│  │ • Login     │  │ • Get       │  │ • List      │  │ • Roles     │   │
│  │ • Register  │  │ • Update    │  │ • Create    │  │ • Perms     │   │
│  │ • Password  │  │             │  │ • Approve   │  │ • Assign    │   │
│  │ • CSRF      │  │             │  │ • Delete    │  │ • Cache     │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │    ADMIN    │  │    AUDIT    │  │  MONITORING │  │   METRICS   │   │
│  │   2 APIs    │  │   5 APIs    │  │  13 APIs    │  │   2 APIs    │   │
│  │             │  │             │  │             │  │             │   │
│  │ • Stats     │  │ • Events    │  │ • Health    │  │ • Business  │   │
│  │ • Logs      │  │ • GDPR      │  │ • Circuits  │  │ • Perf      │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
┌───────────────────────────────────▼───────────────────────────────────────┐
│  LAYER 2: STATE MANAGEMENT                                                │
│  ────────────────────────────────────────────────────────────────────     │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  REACT QUERY (Server State - Single Source of Truth)               │ │
│  │  ─────────────────────────────────────────────────────────────────  │ │
│  │  • 61 React Hooks for 61 API Endpoints                             │ │
│  │  • Automatic caching & background refetching                       │ │
│  │  • Optimistic updates                                              │ │
│  │  • Request deduplication                                           │ │
│  │  • Query key factories (queryKeys.users.list, etc.)               │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐   │
│  │   ZUSTAND        │  │  CONTEXT API     │  │  LOCAL STATE         │   │
│  │ (Global UI)      │  │ (Cross-cutting)  │  │ (Component UI)       │   │
│  │                  │  │                  │  │                      │   │
│  │ • Theme          │  │ • AuthContext    │  │ • Modal state        │   │
│  │ • Sidebar        │  │ • LocaleContext  │  │ • Form state         │   │
│  │ • Locale         │  │ • use() hook     │  │ • Filter state       │   │
│  │ • Toasts         │  │                  │  │                      │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
┌───────────────────────────────────▼───────────────────────────────────────┐
│  LAYER 3: INFRASTRUCTURE                                                  │
│  ────────────────────────────────────────────────────────────────────     │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  ROUTING (React Router v7)                                          │ │
│  │  ─────────────────────────────────────────────────────────────────  │ │
│  │  • Centralized ROUTE_PATHS (single source)                         │ │
│  │  • RouteGuard (public, auth, admin, permission)                    │ │
│  │  • Lazy loading with Suspense                                      │ │
│  │  • Type-safe navigation helpers                                    │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐   │
│  │   LAYOUT         │  │   AUTH           │  │   i18n               │   │
│  │                  │  │                  │  │                      │   │
│  │ • Single Layout  │  │ • AuthContext    │  │ • Backend codes      │   │
│  │ • Conditional    │  │ • Roles          │  │ • Translation files  │   │
│  │ • Sidebar        │  │ • Permissions    │  │ • Error mapping      │   │
│  │ • Header         │  │ • Guards         │  │ • Multi-language     │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘   │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  MONITORING & LOGGING                                               │ │
│  │  ─────────────────────────────────────────────────────────────────  │ │
│  │  • Logger utility (debug, info, warn, error)                       │ │
│  │  • Sentry integration (production)                                 │ │
│  │  • localStorage backup (last 100 logs)                             │ │
│  │  • API interceptors (track all calls)                              │ │
│  │  • Performance tracking                                            │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
┌───────────────────────────────────▼───────────────────────────────────────┐
│  LAYER 4: API & NETWORK                                                   │
│  ────────────────────────────────────────────────────────────────────     │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  API CLIENT (Axios)                                                 │ │
│  │  ─────────────────────────────────────────────────────────────────  │ │
│  │  • Single apiClient instance                                       │ │
│  │  • Request interceptors (auth tokens, logging)                     │ │
│  │  • Response interceptors (error handling, logging)                 │ │
│  │  • Automatic token refresh                                         │ │
│  │  • CSRF protection                                                 │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐   │
│  │  SERVICES        │  │  QUERY CLIENT    │  │  ERROR HANDLER       │   │
│  │                  │  │                  │  │                      │   │
│  │ • authService    │  │ • React Query    │  │ • Code mapping       │   │
│  │ • userService    │  │ • Config         │  │ • i18n messages      │   │
│  │ • roleService    │  │ • Cache          │  │ • Toast display      │   │
│  │ • auditService   │  │ • Devtools       │  │ • Sentry tracking    │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────────┘   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   FASTAPI BACKEND             │
                    │   (61 API Endpoints)          │
                    │                               │
                    │   /api/v1/auth/*              │
                    │   /api/v1/profile/*           │
                    │   /api/v1/admin/*             │
                    │   /health/*                   │
                    │   /api/v1/metrics/*           │
                    └───────────────────────────────┘
```

---

**Complete visual architecture with all layers mapped!** 🎨
