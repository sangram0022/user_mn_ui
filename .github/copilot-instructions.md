<!-- Use this file to provide workspace-specific custom instructions to Copilot.
For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Copilot Instructions

## General Guidelines

- Write code in a clean, maintainable, and efficient manner.
- Use React and TypeScript best practices.
- Use React 19 features at all possible places, and replace old patterns with new ones.
- No missing import should be there.
- I am going to deploy this app on AWS, so don't implement features that AWS already supports, like resource utilization, observability, or any other features which are by default available in AWS. Keep code clean.
- Use useOptimistic for instant UI updates
- Use useActionState for form submissions
- Use use() for context consumption
- Remove unnecessary useMemo/useCallback (React Compiler handles it)
- Use function components (not class components)
- Use Suspense for code splitting
- Use ErrorBoundary for error handling
- Initialize state lazily with useState(() => ...)
- Split contexts (State + Actions) for better performance
- Ensure single source of truth for all state
- Centralize localStorage access
- Document state ownership

## 🎯 Core Development Principles

### 1. DRY (Don't Repeat Yourself) Principle

**CRITICAL**: Eliminate all code duplication across the codebase.

#### Validation Rules

- **NEVER** duplicate validation logic in multiple files
- **ALWAYS** use centralized validators from `src/core/validation/`
- **SINGLE SOURCE OF TRUTH**: All validation patterns defined once
- ❌ **FORBIDDEN**: Creating validation functions in component files
- ✅ **REQUIRED**: Import from `@/core/validation`

```typescript
// ❌ WRONG: Duplicating validation logic
function validateEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

// ✅ CORRECT: Use centralized validator
import { ValidationBuilder, isValidEmail } from "@/core/validation";
const result = new ValidationBuilder().required().email().validate(email);
```

#### Business Logic

- Extract common logic into reusable functions/hooks
- Share utility functions via `src/shared/utils/`
- Create custom hooks for repeated patterns
- Use composition over duplication

#### Constants and Configuration

- Define constants once in appropriate config files
- Use environment variables for deployment-specific values
- Group related constants together
- Never hardcode values that appear multiple times

### 2. Clean Code Practices

#### Naming Conventions

- **Variables**: Use descriptive camelCase names (`userData`, `isLoading`)
- **Functions**: Use verb-noun pattern (`getUserData`, `validateForm`)
- **Components**: Use PascalCase (`UserProfile`, `LoginForm`)
- **Constants**: Use UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRY_COUNT`)
- **Types/Interfaces**: Use PascalCase with descriptive names (`UserProfile`, `ValidationResult`)
- **Boolean variables**: Use is/has/should prefix (`isAuthenticated`, `hasError`, `shouldRetry`)

#### Function Guidelines

- **Keep functions small**: Maximum 20-30 lines per function
- **Single responsibility**: Each function does ONE thing
- **Pure functions**: No side effects when possible
- **Clear parameters**: Maximum 3-4 parameters, use objects for more
- **Return early**: Use guard clauses to reduce nesting

```typescript
// ❌ WRONG: Too many responsibilities
function processUserData(user: User) {
  // validates, transforms, saves, and sends email
}

// ✅ CORRECT: Single responsibility
function validateUser(user: User): ValidationResult {}
function transformUserData(user: User): TransformedUser {}
function saveUser(user: TransformedUser): Promise<void> {}
function sendWelcomeEmail(email: string): Promise<void> {}
```

#### Code Organization

- **File length**: Keep files under 200-300 lines
- **Logical grouping**: Group related functions together
- **Clear imports**: Organize imports (external → internal → relative)
- **Export clarity**: Export only what's needed from modules

#### Comments and Documentation

- Write self-documenting code (clear names > comments)
- Use JSDoc for public APIs and complex logic
- Explain WHY, not WHAT (code shows what)
- Keep comments up-to-date with code changes

### 3. Single Responsibility Principle (SRP)

**Each module/class/function should have ONE reason to change.**

#### Component Responsibility

```typescript
// ❌ WRONG: Component handles too much
function UserDashboard() {
  // fetching data
  // validation
  // formatting
  // rendering
  // state management
}

// ✅ CORRECT: Separate concerns
function UserDashboard() {
  const { data } = useUserData(); // Data fetching
  const { validate } = useValidation(); // Validation
  const formatted = useFormattedData(data); // Formatting
  return <DashboardView data={formatted} />; // Rendering
}
```

#### Module Responsibility

- **Validation modules**: Only validation logic
- **API modules**: Only HTTP communication
- **Utility modules**: Only pure helper functions
- **Component modules**: Only UI rendering and user interaction

#### Hook Responsibility

- Custom hooks should have a single, clear purpose
- Extract data fetching, state management, side effects separately
- Name hooks to reflect their single responsibility

```typescript
// ✅ CORRECT: Single purpose hooks
const { user, isLoading } = useUserData(userId);
const { validate, errors } = useFormValidation(schema);
const { submit, isSubmitting } = useFormSubmission(onSubmit);
```

### 4. Single Source of Truth (SSOT) Principle

**Every piece of knowledge must have a single, unambiguous representation.**

#### State Management

- **One place** for each piece of application state
- Derive computed values, don't duplicate state
- Use context or global state for shared data
- Avoid prop drilling with proper state architecture

```typescript
// ❌ WRONG: Duplicated state
const [user, setUser] = useState(userData);
const [userName, setUserName] = useState(userData.name); // Duplicate!

// ✅ CORRECT: Single source, derive values
const [user, setUser] = useState(userData);
const userName = user.name; // Derived
```

#### Configuration

- **Backend alignment**: All validation rules match backend exactly
- **Reference**: `src/core/validation/` is SSOT for validation patterns
- **API contracts**: Define types once, share across frontend
- **Environment config**: Single .env file per environment

#### Type Definitions

```typescript
// ✅ CORRECT: Define types once
// src/types/user.types.ts
export interface User {
  id: string;
  email: string;
  name: string;
}

// Use everywhere
import type { User } from "@/types/user.types";
```

#### Validation Rules (CRITICAL)

- **Backend source of truth**: Python FastAPI (`user_mn`)
- **Frontend implementation**: `src/core/validation/` matches backend 100%
- **No local validation**: Always import from core validation
- **Pattern alignment**: Email, password, phone patterns match backend exactly

```typescript
// ✅ CORRECT: Using SSOT validators
import {
  ValidationBuilder,
  EMAIL_REGEX,
  PASSWORD_RULES,
  USERNAME_REGEX,
  PHONE_REGEX,
  NAME_REGEX,
} from "@/core/validation";

// All patterns match backend src/app/core/validation/patterns.py
```

## 🔒 Validation System (SSOT Implementation)

### Architecture

```
src/core/validation/
├── ValidationBuilder.ts         ← Fluent interface for chaining
├── ValidationStatus.ts          ← Status enum (SUCCESS, ERROR, WARNING)
├── ValidationResult.ts          ← Type-safe result dataclasses
├── validators/
│   ├── BaseValidator.ts         ← Common validator interface
│   ├── EmailValidator.ts        ← Email: RFC 5322, 254 chars max
│   ├── PasswordValidator.ts     ← Password: 8-128 chars, strength calc
│   ├── UsernameValidator.ts     ← Username: 3-30 chars, alphanumeric+_
│   ├── PhoneValidator.ts        ← Phone: E.164, 10-15 digits
│   └── NameValidator.ts         ← Name: 2-50 chars, letters/spaces/-/'
└── index.ts                     ← Main exports
```

### Usage Requirements

#### Form Validation (REQUIRED PATTERN)

```typescript
import { ValidationBuilder } from "@/core/validation";

const formResult = new ValidationBuilder()
  .validateField("email", email, (b) => b.required().email())
  .validateField("password", password, (b) => b.required().password())
  .validateField("username", username, (b) => b.required().username())
  .result();

if (!formResult.isValid) {
  setErrors(formResult.errors);
}
```

#### Quick Validation

```typescript
import { quickValidate, isValidEmail } from "@/core/validation";

// Boolean check
if (isValidEmail(email)) {
  /* proceed */
}

// Full result
const result = quickValidate.email(email);
if (!result.isValid) {
  console.log(result.errors);
}
```

#### Password Strength

```typescript
import { calculatePasswordStrength } from "@/core/validation";

const strength = calculatePasswordStrength(password);
// strength.score: 0-100
// strength.strength: 'weak' | 'fair' | 'good' | 'strong' | 'very_strong'
// strength.feedback: string[] with improvement suggestions
```

### Forbidden Patterns

❌ **NEVER create local validation functions:**

```typescript
// ❌ FORBIDDEN
function validateEmail(email: string) {
  /* ... */
}
const emailRegex = /^[^@]+@[^@]+$/;
```

❌ **NEVER duplicate validation logic:**

```typescript
// ❌ FORBIDDEN
if (password.length < 8) {
  /* ... */
}
if (!/[A-Z]/.test(password)) {
  /* ... */
}
```

❌ **NEVER hardcode validation patterns:**

```typescript
// ❌ FORBIDDEN
const pattern = /^[a-zA-Z0-9]+$/;
```

### Backend Alignment Verification

**Before implementing any validation:**

1. Check backend patterns in `user_mn/src/app/core/validation/patterns.py`
2. Verify alignment in `BACKEND_FRONTEND_VALIDATION_ALIGNMENT.md`
3. Use existing validators from `@/core/validation`
4. If new validation needed, extend existing validators

## 📐 Component Design Guidelines

### Component Structure (Required Order)

```typescript
// 1. Imports (grouped)
import { useState } from "react";
import { ValidationBuilder } from "@/core/validation";
import type { User } from "@/types";

// 2. Types/Interfaces
interface Props {}

// 3. Constants (outside component)
const MAX_RETRIES = 3;

// 4. Component
export function MyComponent({ prop }: Props) {
  // 4a. Hooks (top of component)
  const [state, setState] = useState();
  const { data } = useQuery();

  // 4b. Handlers
  const handleSubmit = () => {};

  // 4c. Effects (if needed)
  useEffect(() => {}, []);

  // 4d. Render
  return <div>{/* JSX */}</div>;
}
```

### Prop Drilling Solution

- Use Context for deeply nested shared state
- Use composition (children props) for layout components
- Extract shared logic to custom hooks

### Performance Optimization

- Lazy load routes and heavy components
- Use React Compiler (no manual memoization needed)
- Virtualize long lists (react-window/react-virtual)
- Optimize images (lazy load, proper formats)

## 🚨 CRITICAL: Backup and Reference Pages Policy

### CSS Backup Policy

- **All CSS changes are backed up** in timestamped directories (e.g., `backup-2025-10-28-1317/`)
- Before making major CSS changes, create a new backup using the established backup structure
- Backup includes:
  - `src/App.css`
  - `src/index.css`
  - `src/styles/` directory (complete)
  - Documentation of changes

### Reference Pages - DO NOT MODIFY

- **NEVER apply CSS changes to reference pages** located in `src/_reference_backup_ui/`
- These pages are for **reference purposes only**
- Reference pages include:
  - `ComponentPatternsReference.tsx`
  - `FormPatternsReference.tsx`
  - `HtmlShowcase.tsx`
  - `ModernHtmlPage.tsx`
  - `ProductsPage.tsx`
  - `ServicesPage.tsx`
  - `UIElementsShowcase.tsx`
  - All associated documentation files

### When Working with Styles:

1. **Before changes**: Create backup if major modifications planned
2. **During changes**: Only modify files in `src/styles/`, `src/App.css`, or `src/index.css`
3. **Never touch**: Any files in `src/_reference_backup_ui/`
4. **Documentation**: Update relevant markdown files for architectural changes

### Backup Directory Structure:

```
backup-YYYY-MM-DD-HHMM/
├── css/
│   ├── App.css
│   ├── index.css
│   └── styles/ (complete directory)
├── reference-pages/
│   └── _reference_backup_ui/ (complete directory)
└── README.md (backup documentation)
```

## Project Architecture Notes

- Follow Domain-Driven Design principles
- Maintain clean separation of concerns
- Use established design system tokens
- Keep components atomic and reusable
- Implement proper error boundaries
- Use TypeScript strictly (no any types)
