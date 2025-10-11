# Contributing to User Management System

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Architecture Guidelines](#architecture-guidelines)

## 🤝 Code of Conduct

### Our Standards

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Collaborative**: Work together constructively
- **Be Professional**: Maintain professional behavior in all interactions
- **Be Inclusive**: Welcome contributors from all backgrounds

### Unacceptable Behavior

- Harassment, discrimination, or intimidation
- Trolling, insulting, or derogatory comments
- Publishing others' private information
- Any conduct that could reasonably be considered inappropriate

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v22.5.1 or higher
- **npm**: v10.8.2 or higher
- **Git**: Latest version
- **VSCode** (recommended) with extensions listed in `.vscode/extensions.json`

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/user_mn_ui.git
   cd user_mn_ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Husky hooks**
   ```bash
   npm run prepare
   ```

4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔄 Development Workflow

### 1. Choose an Issue

- Browse [open issues](https://github.com/sangram0022/user_mn_ui/issues)
- Comment on the issue to claim it
- Wait for maintainer approval before starting work

### 2. Create a Branch

```bash
# Feature branch
git checkout -b feature/add-user-export

# Bug fix branch
git checkout -b fix/login-validation-error

# Documentation branch
git checkout -b docs/update-api-guide
```

### 3. Make Changes

- Write clean, documented code
- Follow the [Coding Standards](#coding-standards)
- Add tests for new features
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run linter
npm run lint
```

### 5. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with conventional commit message
git commit -m "feat: Add user export functionality"
```

### 6. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

## 📐 Coding Standards

### TypeScript Guidelines

1. **Use TypeScript**: All new code must be TypeScript
2. **Strict Mode**: Enable all strict type checking
3. **No `any`**: Avoid `any` type, use `unknown` if needed
4. **Explicit Return Types**: Always specify function return types
5. **Interface over Type**: Prefer interfaces for object shapes

```typescript
// ✅ Good
interface User {
  id: string
  name: string
  email: string
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Bad
function getUser(id) {
  // ...
}
```

### React Guidelines

1. **Functional Components**: Use functional components with hooks
2. **Named Exports**: Prefer named exports over default exports
3. **Props Interface**: Always define props interface
4. **Memo Wisely**: Only use `memo` when necessary
5. **Custom Hooks**: Extract reusable logic into custom hooks

```typescript
// ✅ Good
interface UserCardProps {
  user: User
  onEdit: (user: User) => void
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  // ...
}

// ❌ Bad
export default function UserCard(props) {
  // ...
}
```

### File Organization

```
src/domains/[domain]/
├── components/          # Domain-specific components
│   ├── UserList.tsx
│   └── UserCard.tsx
├── hooks/              # Domain-specific hooks
│   ├── useUsers.ts
│   └── useUserPermissions.ts
├── services/           # Business logic
│   └── userService.ts
├── store/              # State management
│   └── userStore.ts
├── types/              # TypeScript types
│   └── index.ts
└── index.ts            # Public API
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `UserList.tsx` |
| Hooks | camelCase with `use` | `useUsers.ts` |
| Services | camelCase with `Service` | `userService.ts` |
| Stores | camelCase with `Store` | `userStore.ts` |
| Types/Interfaces | PascalCase | `User`, `UserFilters` |
| Constants | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |
| Functions | camelCase | `getUserById` |
| Files | kebab-case | `user-list.tsx` |

### Code Style

- **Line Length**: Maximum 100 characters
- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Trailing Commas**: Required in multiline

```typescript
// ✅ Good
const user: User = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
};

// ❌ Bad
const user = {
  id: "123",
  name: "John Doe",
  email: "john@example.com"
}
```

## 🧪 Testing Requirements

### Test Coverage Requirements

- **Lines**: 80% minimum
- **Functions**: 80% minimum
- **Branches**: 75% minimum
- **Statements**: 80% minimum

### Test Organization

```
src/domains/user/
├── components/
│   ├── UserList.tsx
│   └── __tests__/
│       └── UserList.test.tsx
├── hooks/
│   ├── useUsers.ts
│   └── __tests__/
│       └── useUsers.test.ts
```

### Test Guidelines

1. **Unit Tests**: Test individual functions/components
2. **Integration Tests**: Test feature workflows
3. **E2E Tests**: Test critical user journeys
4. **Test Naming**: `should [expected behavior] when [condition]`

```typescript
describe('UserList', () => {
  it('should render users when data is loaded', () => {
    // Test implementation
  });

  it('should show loading state when fetching data', () => {
    // Test implementation
  });

  it('should display error message when fetch fails', () => {
    // Test implementation
  });
});
```

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system changes
- **ci**: CI/CD changes
- **chore**: Other changes (dependencies, etc.)
- **revert**: Revert previous commit

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples

```bash
# Simple feature
feat(auth): Add password reset functionality

# Bug fix with details
fix(users): Resolve infinite scroll pagination bug

The pagination was not properly resetting when filters changed,
causing duplicate items to appear in the list.

Closes #123

# Breaking change
feat(api)!: Update user endpoint to v2

BREAKING CHANGE: The /api/users endpoint now requires
authentication and returns a different response format.

Migration guide: See docs/MIGRATION.md
```

### Commit Rules

- ✅ Use lowercase for type and scope
- ✅ Keep subject line under 100 characters
- ✅ Use imperative mood ("Add feature" not "Added feature")
- ✅ Reference issues in footer
- ✅ Explain **why** in body, not **what** (code shows what)

## 🔀 Pull Request Process

### Before Creating PR

- [ ] All tests pass (`npm run test:all`)
- [ ] Code is linted (`npm run lint`)
- [ ] Documentation is updated
- [ ] Commits follow conventional commits
- [ ] Branch is up to date with main

### PR Title Format

Use conventional commit format:
```
feat(users): Add bulk user import feature
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
- [ ] Dependent changes merged

## Related Issues
Closes #123
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: At least one maintainer review required
3. **Changes Requested**: Address feedback and update PR
4. **Approval**: Maintainer approves PR
5. **Merge**: Maintainer merges when ready

### After Merge

- Delete your feature branch
- Update your local repository
- Close related issues

## 🏗️ Architecture Guidelines

### Domain-Driven Design

Follow DDD principles:

```
src/
├── domains/              # Business domains
│   ├── authentication/
│   ├── users/
│   └── workflows/
├── infrastructure/       # Technical infrastructure
│   ├── api/
│   ├── storage/
│   └── security/
└── shared/              # Shared utilities
    ├── components/
    ├── hooks/
    └── utils/
```

### Dependency Rules

- ✅ Infrastructure → Shared
- ✅ Domain → Infrastructure
- ✅ Domain → Shared
- ❌ Infrastructure → Domain
- ❌ Shared → Domain
- ⚠️ Domain → Domain (use events)

### State Management

- Use **Zustand** for global state
- Keep state close to where it's used
- Use React Context for non-serializable state
- Avoid prop drilling with custom hooks

### Security Guidelines

1. **Input Validation**: Always validate user input
2. **Output Encoding**: Encode output to prevent XSS
3. **Authentication**: Verify user identity
4. **Authorization**: Check user permissions
5. **HTTPS**: Always use HTTPS in production
6. **CSP**: Follow Content Security Policy
7. **Dependencies**: Keep dependencies updated

## 📚 Additional Resources

- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Domain-Driven Design](https://www.domainlanguage.com/ddd/)
- [Architecture Decision Records](./docs/adr/README.md)

## ❓ Questions?

- Check [FAQ](./docs/FAQ.md)
- Search [existing issues](https://github.com/sangram0022/user_mn_ui/issues)
- Ask in [Discussions](https://github.com/sangram0022/user_mn_ui/discussions)
- Contact maintainers

## 🙏 Thank You!

Your contributions make this project better. We appreciate your time and effort!

---

**Happy Coding!** 🚀
