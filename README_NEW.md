# 🏗️ USERMN - User Management System

**Modern React 19 Application with Domain-Driven Design**

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0.1-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.16-cyan.svg)](https://tailwindcss.com/)

---

## 📋 Overview

A production-ready user management system built with cutting-edge technologies and **expert-level Domain-Driven Design (DDD)** architecture. This application manages **61 API endpoints** from a FastAPI backend with perfect 1:1 frontend-backend domain alignment.

### **Key Features**

- ✅ **8 Business Domains** - Auth, Profile, Users, RBAC, Admin, Audit, Monitoring, Metrics
- ✅ **61 React Query Hooks** - One hook per API endpoint
- ✅ **React 19 Features** - useOptimistic, useActionState, use() hook
- ✅ **Domain-Driven Design** - Vertical slice architecture
- ✅ **Type-Safe Routing** - Centralized route paths
- ✅ **Internationalization** - Backend error codes → UI localized messages
- ✅ **Production Monitoring** - Sentry integration + Health checks
- ✅ **DRY Principles** - Single source of truth throughout

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
usermn/
├── src/
│   ├── domains/              # 🎯 8 Business Domains
│   │   ├── auth/            # 16 API endpoints
│   │   ├── profile/         # 2 API endpoints
│   │   ├── users/           # 10 API endpoints
│   │   ├── rbac/            # 12 API endpoints
│   │   ├── admin/           # 2 API endpoints
│   │   ├── audit/           # 5 API endpoints
│   │   └── monitoring/      # 15 API endpoints
│   │
│   ├── core/                # Infrastructure
│   │   ├── layout/         # Single smart layout
│   │   ├── routing/        # ⭐ Centralized routes
│   │   ├── auth/           # Auth context + guards
│   │   └── i18n/           # Internationalization
│   │
│   ├── shared/              # Shared UI components
│   ├── services/            # API clients
│   ├── store/               # Zustand stores
│   ├── utils/               # Utilities
│   └── hooks/               # Global hooks
│
└── docs/                     # 📚 Documentation
    ├── DOMAIN_DRIVEN_ARCHITECTURE.md
    ├── API_ENDPOINT_MAPPING.md
    ├── IMPLEMENTATION_SUMMARY.md
    ├── COMPLETE_ARCHITECTURE_GUIDE.md
    └── VISUAL_ARCHITECTURE.md
```

---

## 🎯 Domain Architecture

### **Perfect Backend Alignment**

Each frontend domain maps 1:1 with backend API groups:

| Domain | Endpoints | React Hooks | Description |
|--------|-----------|-------------|-------------|
| **Auth** | 16 | 16 | Login, register, password reset, CSRF |
| **Profile** | 2 | 2 | User profile management |
| **Users** | 10 | 10 | User CRUD, approval workflow |
| **RBAC** | 12 | 12 | Roles, permissions, assignments |
| **Admin** | 2 | 2 | Dashboard stats, audit logs |
| **Audit** | 5 | 5 | Event tracking, GDPR compliance |
| **Monitoring** | 13 | 13 | Health checks, circuit breakers |
| **Metrics** | 2 | 2 | Business & performance metrics |
| **Total** | **61** | **61** | Complete API coverage |

---

## 📚 Documentation

### **Architecture Documents:**

1. **[DOMAIN_DRIVEN_ARCHITECTURE.md](./DOMAIN_DRIVEN_ARCHITECTURE.md)** - Complete architecture with all 61 endpoints
2. **[API_ENDPOINT_MAPPING.md](./API_ENDPOINT_MAPPING.md)** - Visual mapping of endpoints to hooks
3. **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Quick reference guide
4. **[COMPLETE_ARCHITECTURE_GUIDE.md](./docs/COMPLETE_ARCHITECTURE_GUIDE.md)** - Common questions answered
5. **[VISUAL_ARCHITECTURE.md](./VISUAL_ARCHITECTURE.md)** - Visual diagrams & data flow

---

## 🛠️ Tech Stack

- **React 19.1.1** - Latest React with compiler optimizations
- **TypeScript 5.9.3** - Static type checking
- **Vite 6.0.1** - Lightning-fast build tool
- **Tailwind CSS v4.1.16** - Modern utility-first CSS
- **React Query 5.59.0** - Server state management
- **Zustand 5.0.0** - Global app state
- **React Router v7** - Type-safe routing
- **i18next 23.15.0** - Internationalization
- **Sentry 8.0.0** - Production monitoring

---

## 🎯 Key Features

### **1. Domain-Driven Design**

```
domains/users/
├── pages/           # UI routes
├── components/      # Domain-specific UI
├── hooks/           # React Query hooks
├── services/        # API calls
└── types/           # TypeScript types
```

### **2. Single Source of Truth**

```typescript
// Centralized routes
ROUTE_PATHS.USERS_LIST              // '/users'

// Centralized query keys
queryKeys.users.list({ role: 'admin' })

// Centralized translations
translations/en.json → errors.auth.AUTH_001
```

### **3. React 19 Features**

```typescript
// use() hook for context
const { user, login } = use(AuthContext);

// useOptimistic for instant UI
const [optimisticUsers, addOptimistic] = useOptimistic(users);

// useActionState for forms
const [state, action] = useActionState(createUser);
```

---

## 🚀 Getting Started

### **Installation**

```bash
# Clone repository
git clone <repository-url>
cd usermn

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Environment Variables**

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SENTRY_DSN=your-sentry-dsn
VITE_ENVIRONMENT=development
```

---

## 📈 Performance

- **Code Splitting** - Lazy load domains on demand
- **React Query Caching** - Minimize API calls
- **React 19 Compiler** - Automatic memoization
- **Optimized Bundle** - Tree-shaking unused code

---

## 🌍 Internationalization

Backend sends error codes → Frontend maps to localized messages:

```
Backend: { "code": "AUTH_001" }
English: "Invalid email or password"
Spanish: "Correo electrónico o contraseña no válidos"
```

Supported: 🇬🇧 English | 🇪🇸 Spanish | 🇫🇷 French

---

## 📊 Monitoring

- **Health Checks** - `/health/detailed`
- **Metrics** - Business & performance
- **Logging** - Sentry + localStorage backup

---

## 🎯 Roadmap

- [x] Complete architecture design
- [x] Document all 61 API endpoints
- [ ] Implement core infrastructure (Week 1)
- [ ] Implement auth domain (Week 2)
- [ ] Implement all domains (Week 3-8)

---

**Built with ❤️ using React 19, TypeScript, and Domain-Driven Design**
