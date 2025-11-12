# Troubleshooting Guide

**Common Issues and Solutions**

---

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Development Server Issues](#development-server-issues)
3. [API Integration Issues](#api-integration-issues)
4. [Form Validation Issues](#form-validation-issues)
5. [State Management Issues](#state-management-issues)
6. [Build Issues](#build-issues)
7. [Testing Issues](#testing-issues)
8. [TypeScript Issues](#typescript-issues)

---

## Installation Issues

### Issue: npm install fails

**Symptoms:**
```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**
```bash
# Clear cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Wrong Node version

**Symptoms:**
```bash
Error: The engine "node" is incompatible with this module
```

**Solution:**
```bash
# Check your Node version
node --version

# Should be >= 18.0.0
# Install correct version using nvm:
nvm install 18
nvm use 18
```

---

## Development Server Issues

### Issue: Port 5173 already in use

**Symptoms:**
```bash
Error: Port 5173 is already in use
```

**Solution:**

**Option 1: Kill existing process**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5173 | xargs kill -9
```

**Option 2: Use different port**
```bash
npm run dev -- --port 3000
```

### Issue: Hot reload not working

**Symptoms:**
- Changes not reflecting automatically
- Need to manually refresh

**Solution:**

**1. Check Vite config** (`vite.config.ts`):
```typescript
export default defineConfig({
  server: {
    watch: {
      usePolling: true, // Enable if using WSL or Docker
    },
  },
});
```

**2. Check file limits (Linux/Mac)**:
```bash
# Increase file watch limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Issue: Module not found errors

**Symptoms:**
```bash
Error: Cannot find module '@/core/api'
```

**Solution:**

**1. Check path aliases** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**2. Check Vite config** (`vite.config.ts`):
```typescript
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**3. Restart dev server**:
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## API Integration Issues

### Issue: CORS errors

**Symptoms:**
```
Access to fetch at 'https://api.example.com' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solution:**

**Option 1: Configure proxy** (`vite.config.ts`):
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

**Option 2: Update API to allow CORS**:
```python
# Backend (FastAPI)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: 401 Unauthorized errors

**Symptoms:**
```
Error: 401 Unauthorized
```

**Solution:**

**1. Check token in localStorage**:
```typescript
// Open browser console
console.log(localStorage.getItem('auth_token'));
```

**2. Check if token is expired**:
```typescript
import { isTokenExpired } from '@/core/auth/tokenUtils';

const token = localStorage.getItem('auth_token');
if (isTokenExpired(token)) {
  // Token expired, need to refresh
}
```

**3. Check Authorization header**:
```typescript
// In apiHelpers.ts, verify:
headers: {
  'Authorization': `Bearer ${getToken()}`,
}
```

### Issue: Network errors (ERR_CONNECTION_REFUSED)

**Symptoms:**
```
Error: ERR_CONNECTION_REFUSED
```

**Solution:**

**1. Check if backend is running**:
```bash
# Python backend
cd user_mn
.venv\Scripts\python.exe -m uvicorn src.app.main:app --host 127.0.0.1 --port 8000
```

**2. Check API URL in config**:
```typescript
// src/core/config/index.ts
export const config = {
  api: {
    baseUrl: 'http://localhost:8000', // Verify correct port
  },
};
```

### Issue: Request timeout

**Symptoms:**
```
Error: Request timeout after 30000ms
```

**Solution:**

**Increase timeout in apiClient**:
```typescript
// src/core/api/apiClient.ts
const API_TIMEOUT = 60000; // 60 seconds
```

---

## Form Validation Issues

### Issue: Validation not working

**Symptoms:**
- Form submits with invalid data
- No error messages shown

**Solution:**

**1. Check Zod schema**:
```typescript
import { z } from 'zod';

// Ensure schema is defined
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
});
```

**2. Check resolver in useForm**:
```typescript
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(schema), // Must have resolver
  defaultValues: { /* ... */ },
});
```

**3. Check form mode**:
```typescript
const form = useForm({
  resolver: zodResolver(schema),
  mode: 'onBlur', // Validate on blur
  reValidateMode: 'onChange', // Re-validate on change
});
```

### Issue: Field errors not displaying

**Symptoms:**
- Validation fails but no error messages shown

**Solution:**

**Check error rendering**:
```typescript
<Input
  {...form.register('email')}
  error={form.formState.errors.email?.message} // Must pass error
/>
```

### Issue: Async validation not working

**Symptoms:**
- Email uniqueness check not working
- Username availability check fails

**Solution:**

**Use AsyncValidationBuilder**:
```typescript
import { AsyncValidationBuilder } from '@/core/validation';

const validateEmailUnique = async (email: string) => {
  const response = await apiGet('/api/v1/users/check-email', { email });
  return response.available;
};

const schema = z.object({
  email: z.string()
    .email('Invalid email')
    .refine(
      async (email) => {
        const available = await validateEmailUnique(email);
        return available;
      },
      { message: 'Email already exists' }
    ),
});
```

---

## State Management Issues

### Issue: Query not refetching

**Symptoms:**
- Data not updating after mutation
- Stale data displayed

**Solution:**

**1. Check cache invalidation**:
```typescript
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    // MUST invalidate queries
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.users.lists() 
    });
  },
});
```

**2. Check query key consistency**:
```typescript
// Ensure same query key in useQuery and invalidation
const { data } = useQuery({
  queryKey: queryKeys.users.list({ status: 'active' }),
  //                                     ^^^^^^^^^^^
});

// Must match exactly:
queryClient.invalidateQueries({ 
  queryKey: queryKeys.users.list({ status: 'active' })
  //                                     ^^^^^^^^^^^
});
```

### Issue: Infinite refetch loop

**Symptoms:**
- API called repeatedly
- Performance degradation

**Solution:**

**1. Check dependencies in useQuery**:
```typescript
// ❌ DON'T: New object on every render
const { data } = useQuery({
  queryKey: ['users', { status: 'active' }], // New object reference
});

// ✅ DO: Stable reference
const filters = useMemo(() => ({ status: 'active' }), []);
const { data } = useQuery({
  queryKey: queryKeys.users.list(filters),
});
```

**2. Use proper staleTime**:
```typescript
const { data } = useQuery({
  queryKey: queryKeys.users.list(),
  queryFn: fetchUsers,
  staleTime: 30000, // 30 seconds - don't refetch immediately
});
```

### Issue: Optimistic update not working

**Symptoms:**
- UI doesn't update immediately
- Requires page refresh to see changes

**Solution:**

**Use useOptimistic (React 19)**:
```typescript
import { useOptimistic } from 'react';

const [optimisticUsers, addOptimisticUser] = useOptimistic(
  users,
  (state, newUser) => [...state, newUser]
);

const mutation = useMutation({
  mutationFn: createUser,
  onMutate: (newUser) => {
    addOptimisticUser(newUser); // Instant UI update
  },
});
```

---

## Build Issues

### Issue: Build fails with type errors

**Symptoms:**
```bash
npm run build
Error: Type 'string | undefined' is not assignable to type 'string'
```

**Solution:**

**1. Fix type errors**:
```typescript
// ❌ DON'T
const userId: string = user?.id; // Could be undefined

// ✅ DO
const userId: string = user?.id ?? ''; // Provide default
// OR
const userId: string | undefined = user?.id; // Allow undefined
```

**2. Run type-check before build**:
```bash
npm run type-check
npm run build
```

### Issue: Build bundle too large

**Symptoms:**
```bash
Warning: Bundle size exceeds recommended limit
dist/index.js 2.5 MB
```

**Solution:**

**1. Analyze bundle**:
```bash
npm run analyze-bundle
```

**2. Use code splitting**:
```typescript
// Lazy load routes
const AdminPage = lazy(() => import('@/domains/admin/pages/AdminPage'));
```

**3. Remove unused imports**:
```bash
# Check unused exports
npx depcheck
```

### Issue: Environment variables not working in production

**Symptoms:**
- Config values undefined in production
- API calls failing

**Solution:**

**1. Check environment variable naming**:
```bash
# Must start with VITE_
VITE_API_BASE_URL=https://api.example.com
```

**2. Access in code**:
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

**3. Rebuild after changing .env**:
```bash
npm run build
```

---

## Testing Issues

### Issue: Tests failing with "QueryClient" error

**Symptoms:**
```
Error: No QueryClient set, use QueryClientProvider
```

**Solution:**

**Wrap tests with QueryClientProvider**:
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }, // Disable retries in tests
      mutations: { retry: false },
    },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const { result } = renderHook(() => useMyHook(), {
  wrapper: createWrapper(),
});
```

### Issue: E2E tests timing out

**Symptoms:**
```
Error: Test timeout of 30000ms exceeded
```

**Solution:**

**1. Increase timeout** (`playwright.config.ts`):
```typescript
export default defineConfig({
  timeout: 60000, // 60 seconds
});
```

**2. Wait for elements properly**:
```typescript
// ❌ DON'T
await page.click('button'); // Might not exist yet

// ✅ DO
await page.waitForSelector('button');
await page.click('button');
```

### Issue: Mock data not working

**Symptoms:**
- Tests using real API
- Tests failing with network errors

**Solution:**

**Use MSW (Mock Service Worker)**:
```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/v1/users', (req, res, ctx) => {
    return res(ctx.json({ data: [] }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## TypeScript Issues

### Issue: "any" type errors

**Symptoms:**
```
Error: Type 'any' is not allowed
```

**Solution:**

**Define proper types**:
```typescript
// ❌ DON'T
const data: any = await fetch('/api/users');

// ✅ DO
interface User {
  id: string;
  name: string;
}
const data: User[] = await apiGet<User[]>('/api/v1/users');
```

### Issue: "Cannot find module" for type imports

**Symptoms:**
```
Error: Cannot find module '@/types/user'
```

**Solution:**

**Use "import type"**:
```typescript
// ❌ DON'T
import { User } from '@/types/user';

// ✅ DO
import type { User } from '@/types/user';
```

### Issue: Circular dependency errors

**Symptoms:**
```
Warning: Circular dependency detected
src/domains/user/types -> src/domains/auth/types -> src/domains/user/types
```

**Solution:**

**1. Create shared types file**:
```typescript
// src/shared/types/index.ts
export interface BaseUser {
  id: string;
  email: string;
}
```

**2. Import from shared**:
```typescript
import type { BaseUser } from '@/shared/types';
```

---

## Performance Issues

### Issue: Slow page load

**Symptoms:**
- Initial page load > 3 seconds
- Lighthouse score < 70

**Solution:**

**1. Use lazy loading**:
```typescript
const AdminPage = lazy(() => import('@/domains/admin/pages/AdminPage'));
```

**2. Optimize images**:
```typescript
<img
  src="/images/hero.webp"
  loading="lazy"
  alt="Hero"
/>
```

**3. Run Lighthouse audit**:
```bash
npm run lighthouse
```

### Issue: Memory leaks

**Symptoms:**
- Browser becomes slow over time
- Tab crashes

**Solution:**

**Clean up useEffect**:
```typescript
useEffect(() => {
  const subscription = observable.subscribe();
  
  // MUST return cleanup function
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

---

## Getting Help

### 1. Check Documentation

- `DEVELOPER_DOCUMENTATION.md` - Complete guide
- `QUICK_START_GUIDE_FOR_DEVELOPERS.md` - Quick patterns
- `QUICK_REFERENCE_GUIDE.md` - Pattern reference

### 2. Check Existing Code

Look at working examples in:
- `src/domains/admin/` - Admin features
- `src/domains/auth/` - Authentication
- `src/pages/ModernContactForm.tsx` - Form example

### 3. Enable Debug Logging

```typescript
import { logger } from '@/core/logging';

// Add debug logs
logger().debug('Component state', { state });
logger().debug('API response', { response });
```

### 4. Use Browser DevTools

- **Console tab**: Check for errors
- **Network tab**: Check API calls
- **React DevTools**: Inspect component state
- **React Query DevTools**: Check query cache

### 5. Ask Team

If issue persists:
1. Document exact error message
2. List steps to reproduce
3. Share relevant code
4. Share console output
5. Contact team

---

**Last Updated:** November 12, 2025
