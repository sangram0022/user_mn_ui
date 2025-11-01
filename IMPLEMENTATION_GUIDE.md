# 🚀 Implementation Guide - USERMN

**Quick Start Guide for Modern React 19 Architecture**

---

## 📋 Step-by-Step Implementation

### **Step 1: Project Setup**

```bash
# 1. Update package.json dependencies
npm install react@^19.1.1 react-dom@^19.1.1
npm install react-router-dom@^7.0.0
npm install zustand@^5.0.0
npm install lucide-react@latest

# 2. Dev dependencies
npm install -D @types/react@^19.0.0 @types/react-dom@^19.0.0
npm install -D @vitejs/plugin-react@^4.3.0
npm install -D typescript@^5.9.3
```

### **Step 2: Create Folder Structure**

```bash
# Run this in project root
mkdir -p src/domains/{auth,dashboard,users,admin,profile}/{ pages,components,hooks,services,store,types,utils}
mkdir -p src/{app/providers,layouts,routing,hooks,services,store,utils,types}
mkdir -p docs
```

---

## 🏗️ Core Files to Create

### **1. App Provider (Central)**

**File:** `src/app/providers/AppProvider.tsx`

```typescript
import { StrictMode, type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';
import { ErrorBoundary } from '../ErrorBoundary';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>
  );
}
```

### **2. Theme Provider (React 19)**

**File:** `src/app/providers/ThemeProvider.tsx`

```typescript
import { createContext, useState, type ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  };

  return (
    <ThemeContext value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext>
  );
}
```

### **3. Custom Hook (React 19 `use()`)**

**File:** `src/hooks/useTheme.ts`

```typescript
import { use } from 'react';
import { ThemeContext } from '@/app/providers/ThemeProvider';

export function useTheme() {
  const context = use(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### **4. Route Configuration**

**File:** `src/routing/routes.tsx`

```typescript
import { lazy, Suspense, type ComponentType } from 'react';
import type { RouteObject } from 'react-router-dom';

// Layouts
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';

// Lazy load pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/domains/auth/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/domains/dashboard/pages/DashboardPage'));
const UserListPage = lazy(() => import('@/domains/users/pages/UserListPage'));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
  </div>
);

function withSuspense(Component: ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: withSuspense(HomePage) },
      { path: 'dashboard', element: withSuspense(DashboardPage) },
      { path: 'users', element: withSuspense(UserListPage) },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: withSuspense(LoginPage) },
    ],
  },
];
```

### **5. Main Layout**

**File:** `src/layouts/MainLayout.tsx`

```typescript
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        <Sidebar />
        
        <main className="flex-1 p-6 bg-surface-secondary">
          <Outlet />
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
```

### **6. Updated Main Entry**

**File:** `src/main.tsx`

```typescript
import { createRoot } from 'react-dom/client';
import { AppProvider } from './app/providers/AppProvider';
import App from './App';
import './index.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <AppProvider>
    <App />
  </AppProvider>
);
```

### **7. Updated App Component**

**File:** `src/App.tsx`

```typescript
import { useRoutes } from 'react-router-dom';
import { routes } from './routing/routes';

export default function App() {
  const element = useRoutes(routes);
  return element;
}
```

---

## 🎨 Design System Files

### **File:** `src/design-system/index.ts`

```typescript
export * from './tokens';
export * from './variants';
export * from './theme';
```

### **File:** `src/design-system/theme.ts`

```typescript
import { tokens } from './tokens';

export const theme = {
  light: {
    colors: {
      background: tokens.colors.neutral[50],
      foreground: tokens.colors.neutral[900],
      primary: tokens.colors.brand.primary,
    },
  },
  dark: {
    colors: {
      background: tokens.colors.neutral[900],
      foreground: tokens.colors.neutral[50],
      primary: tokens.colors.brand.primary,
    },
  },
};
```

---

## 🔐 Auth Domain Example

### **File:** `src/domains/auth/pages/LoginPage.tsx`

```typescript
import { useActionState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { authService } from '../services/authService';

interface FormState {
  error: string | null;
  success: boolean;
}

export default function LoginPage() {
  const navigate = useNavigate();
  
  const [state, formAction, isPending] = useActionState(
    async (prevState: FormState, formData: FormData): Promise<FormState> => {
      try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        
        await authService.login({ email, password });
        navigate('/dashboard');
        
        return { error: null, success: true };
      } catch (error) {
        return { 
          error: error instanceof Error ? error.message : 'Login failed',
          success: false 
        };
      }
    },
    { error: null, success: false }
  );

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-6">Login</h1>
        
        <form action={formAction} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
          
          <Input
            label="Password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
          
          {state.error && (
            <div className="text-semantic-error text-sm">{state.error}</div>
          )}
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isPending}
          >
            {isPending ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
}
```

### **File:** `src/domains/auth/services/authService.ts`

```typescript
interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

class AuthService {
  private baseUrl = import.meta.env.VITE_API_URL || '/api';

  async login(credentials: LoginCredentials): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json();
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  }

  async logout(): Promise<void> {
    await fetch(`${this.baseUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }
}

export const authService = new AuthService();
```

### **File:** `src/domains/auth/hooks/useAuth.ts`

```typescript
import { use } from 'react';
import { AuthContext } from '@/app/providers/AuthProvider';

export function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

## 📊 Dashboard Domain Example

### **File:** `src/domains/dashboard/pages/DashboardPage.tsx`

```typescript
import { Suspense } from 'react';
import { StatsCard } from '../components/StatsCard';
import { ActivityFeed } from '../components/ActivityFeed';
import { useDashboardData } from '../hooks/useDashboardData';

function DashboardContent() {
  const { stats, activities, isLoading } = useDashboardData();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed activities={activities} />
        <ChartCard />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
```

### **File:** `src/domains/dashboard/hooks/useDashboardData.ts`

```typescript
import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';

export function useDashboardData() {
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, activitiesData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getActivities(),
        ]);
        
        setStats(statsData);
        setActivities(activitiesData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return { stats, activities, isLoading };
}
```

---

## 🔧 Utility Functions

### **File:** `src/utils/cn.ts`

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### **File:** `src/utils/format.ts`

```typescript
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
```

---

## 🧪 Testing Setup

### **File:** `src/domains/auth/__tests__/LoginPage.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../pages/LoginPage';
import { authService } from '../services/authService';

vi.mock('../services/authService');

describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('submits form with credentials', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authService.login);
    
    render(<LoginPage />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
```

---

## 📝 Configuration Files

### **Update:** `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/domains': resolve(__dirname, './src/domains'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/design-system': resolve(__dirname, './src/design-system'),
      '@/types': resolve(__dirname, './src/types'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
        },
      },
    },
  },
});
```

### **Update:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/components": ["./src/components"],
      "@/domains/*": ["./src/domains/*"],
      "@/hooks": ["./src/hooks"],
      "@/utils": ["./src/utils"],
      "@/design-system": ["./src/design-system"],
      "@/types": ["./src/types"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 🚀 Quick Commands

```bash
# Development
npm run dev

# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Test
npm run test
npm run test:watch
npm run test:coverage
```

---

## 📋 Checklist

### **Phase 1: Setup** ✅
- [ ] Create folder structure
- [ ] Setup providers
- [ ] Configure routing
- [ ] Setup design system
- [ ] Create base components

### **Phase 2: Auth Domain**
- [ ] Login page with `useActionState`
- [ ] Register page
- [ ] Password reset
- [ ] Auth service
- [ ] Auth guards

### **Phase 3: Dashboard**
- [ ] Dashboard layout
- [ ] Stats cards
- [ ] Charts
- [ ] Activity feed

### **Phase 4: Users Domain**
- [ ] User list with pagination
- [ ] User details
- [ ] User editing
- [ ] Bulk operations

---

## 🎯 Next Steps

1. **Run** the setup commands
2. **Create** the folder structure
3. **Copy** the core files from this guide
4. **Test** the basic routing
5. **Build** domain by domain

---

**Ready to build! 🚀**
