# Quick Start Guide for Developers

**Get up and running in 15 minutes**

---

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

---

## 🚀 Installation (5 minutes)

```bash
# 1. Clone repository
git clone <repository-url>
cd usermn1

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env

# 4. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📖 Essential Reading (5 minutes)

**Read these in order:**

1. **Architecture Overview** → `DEVELOPER_DOCUMENTATION.md` (Section 2)
2. **Standard Patterns** → `DEVELOPER_DOCUMENTATION.md` (Section 4)
3. **Complete Use Case** → `DEVELOPER_DOCUMENTATION.md` (Section 5)

---

## 🎯 Your First Feature (5 minutes)

### Scenario: Add "Notes" feature to users

**Step 1: Define Types** (`src/domains/user/types/index.ts`)

```typescript
export interface UserNote {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface CreateNoteRequest {
  user_id: string;
  content: string;
}
```

**Step 2: Create Service** (`src/domains/user/services/userNotesService.ts`)

```typescript
import { apiGet, apiPost } from '@/core/api/apiHelpers';
import type { UserNote, CreateNoteRequest } from '../types';

export const getUserNotes = async (userId: string) => {
  return apiGet<UserNote[]>(`/api/v1/users/${userId}/notes`);
};

export const createNote = async (data: CreateNoteRequest) => {
  return apiPost<UserNote>('/api/v1/notes', data);
};
```

**Step 3: Add Query Keys** (`src/services/api/queryKeys.ts`)

```typescript
export const queryKeys = {
  // ... existing ...
  
  userNotes: {
    all: ['userNotes'] as const,
    lists: () => [...queryKeys.userNotes.all, 'list'] as const,
    list: (userId: string) => [...queryKeys.userNotes.lists(), userId] as const,
  },
};
```

**Step 4: Create Hook** (`src/domains/user/hooks/useUserNotes.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/api/queryKeys';
import * as notesService from '../services/userNotesService';

export const useUserNotes = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.userNotes.list(userId),
    queryFn: () => notesService.getUserNotes(userId),
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notesService.createNote,
    onSuccess: (note) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.userNotes.list(note.user_id) 
      });
    },
  });
};
```

**Step 5: Create Component** (`src/domains/user/components/UserNotes.tsx`)

```typescript
import { useState } from 'react';
import { useUserNotes, useCreateNote } from '../hooks/useUserNotes';
import { useToast } from '@/hooks/useToast';
import Button from '@/shared/components/ui/Button';

interface UserNotesProps {
  userId: string;
}

export function UserNotes({ userId }: UserNotesProps) {
  const [content, setContent] = useState('');
  const { data: notes, isLoading } = useUserNotes(userId);
  const createNote = useCreateNote();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createNote.mutateAsync({ user_id: userId, content });
      toast.success('Note added!');
      setContent('');
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h3>Notes</h3>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note..."
        />
        <Button type="submit">Add Note</Button>
      </form>

      <ul>
        {notes?.map(note => (
          <li key={note.id}>{note.content}</li>
        ))}
      </ul>
    </div>
  );
}
```

**Done!** ✅ You've created a complete feature following all standards.

---

## 🔑 Key Patterns Cheat Sheet

### ✅ Logging

```typescript
import { logger } from '@/core/logging';

logger().info('User action', { userId, action });
logger().error('Operation failed', error, { context });
```

### ✅ Error Handling

```typescript
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';

const handleError = useStandardErrorHandler();

try {
  await operation();
} catch (error) {
  handleError(error, { context: { operation: 'myOp' } });
}
```

### ✅ Validation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mySchema } from '@/core/validation/schemas';

const form = useForm({
  resolver: zodResolver(mySchema),
  defaultValues: { /* ... */ },
});
```

### ✅ API Calls

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryKeys } from '@/services/api/queryKeys';

// GET
const { data } = useQuery({
  queryKey: queryKeys.resource.list(filters),
  queryFn: () => service.list(filters),
});

// POST
const mutation = useMutation({
  mutationFn: service.create,
  onSuccess: () => queryClient.invalidateQueries({ queryKey }),
});
```

---

## ❌ Common Mistakes to Avoid

### 1. ❌ Hard-coded API URLs

```typescript
// ❌ DON'T
const response = await fetch('https://api.example.com/users');

// ✅ DO
import { apiGet } from '@/core/api/apiHelpers';
const users = await apiGet('/api/v1/users');
```

### 2. ❌ console.log in production

```typescript
// ❌ DON'T
console.log('User created', user);

// ✅ DO
import { logger } from '@/core/logging';
logger().info('User created', { userId: user.id });
```

### 3. ❌ Not handling errors

```typescript
// ❌ DON'T
const mutation = useMutation({
  mutationFn: createUser,
  // No error handling!
});

// ✅ DO
const mutation = useMutation({
  mutationFn: createUser,
  onError: (error) => handleError(error, { context: { /* ... */ } }),
});
```

### 4. ❌ Skipping validation

```typescript
// ❌ DON'T
const onSubmit = (data) => {
  // Submit without validation
  createUser(data);
};

// ✅ DO
const form = useForm({
  resolver: zodResolver(schema), // Zod validation
});
const onSubmit = form.handleSubmit(async (data) => {
  await createUser(data);
});
```

### 5. ❌ Not using query keys

```typescript
// ❌ DON'T
const { data } = useQuery({
  queryKey: ['users', 'list'],
  queryFn: fetchUsers,
});

// ✅ DO
const { data } = useQuery({
  queryKey: queryKeys.users.list(),
  queryFn: fetchUsers,
});
```

---

## 📁 File Naming Conventions

```
✅ Correct:
- UserCard.tsx           (PascalCase for components)
- useUserData.ts         (camelCase for hooks)
- userService.ts         (camelCase for services)
- types/index.ts         (lowercase for types files)
- schemas.ts             (lowercase for validation)

❌ Incorrect:
- user-card.tsx          (kebab-case)
- Usercard.tsx           (missing capital)
- user_service.ts        (snake_case)
```

---

## 🧪 Testing Your Feature

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

**Test Template:**

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMyHook } from '../useMyHook';

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useMyHook', () => {
  it('should fetch data', async () => {
    const { result } = renderHook(() => useMyHook(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

---

## 🔍 Debugging Tips

### 1. Check React Query DevTools

```typescript
// Already configured in App.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
```

Open DevTools in browser → "React Query" tab

### 2. Check Logs

```typescript
import { logger } from '@/core/logging';

// Add debug logs
logger().debug('State value', { state });
```

### 3. Check Network Tab

- Open DevTools → Network tab
- Look for failed API calls
- Check request/response payloads

### 4. Check Console for Errors

- Look for validation errors
- Check for type errors
- Review error stack traces

---

## 📚 Where to Find Help

| Question | Resource |
|----------|----------|
| Architecture overview | `DEVELOPER_DOCUMENTATION.md` Section 2 |
| Complete example (end-to-end) | `DEVELOPER_DOCUMENTATION.md` Section 5 |
| Validation patterns | `DEVELOPER_DOCUMENTATION.md` Section 6 |
| Error handling | `DEVELOPER_DOCUMENTATION.md` Section 7 |
| API integration | `DEVELOPER_DOCUMENTATION.md` Section 8 |
| Testing guidelines | `DEVELOPER_DOCUMENTATION.md` Section 11 |
| Quick patterns | `QUICK_REFERENCE_GUIDE.md` |
| Coding standards | `.github/copilot-instructions.md` |

---

## ✅ Checklist: Before Committing Code

- [ ] No `console.log` statements
- [ ] All errors handled with `useStandardErrorHandler`
- [ ] All API calls use `apiGet/apiPost/apiPut/apiDelete`
- [ ] All logging uses `logger()`
- [ ] All forms use Zod validation
- [ ] All query keys from `queryKeys` factory
- [ ] No hard-coded URLs or magic strings
- [ ] TypeScript types defined
- [ ] Tests written
- [ ] No lint errors (`npm run lint`)
- [ ] No type errors (`npm run type-check`)

---

## 🚀 Next Steps

1. **Read full documentation**: `DEVELOPER_DOCUMENTATION.md`
2. **Review complete example**: Lead Management (Section 5)
3. **Study existing code**: `src/domains/admin/` (reference implementation)
4. **Build your first feature**: Start small, follow patterns
5. **Ask for code review**: Get feedback from team

---

## 💡 Pro Tips

1. **Use Copilot**: It knows all patterns (trained on `.github/copilot-instructions.md`)
2. **Copy-paste patterns**: Reuse validated patterns from existing code
3. **Start with types**: Define types → service → hook → component
4. **Test as you go**: Write tests while building feature
5. **Follow domain structure**: Keep domain files together

---

**Happy Coding! 🎉**

For detailed information, see: `DEVELOPER_DOCUMENTATION.md`
