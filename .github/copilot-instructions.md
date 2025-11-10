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
- Follow Domain-Driven Design principles
- Maintain clean separation of concerns
- Use established design system tokens
- Keep components atomic and reusable
- Implement proper error boundaries
- Use TypeScript strictly (no any types)
- All API calls through TanStack Query
- All errors through useStandardErrorHandler
- All logging through centralized logger

Purpose

- Provide authoritative guidance for Copilot AI and contributors to implement, refactor and audit the React + TypeScript project.
- Enforce consistency, SOLID, DRY, no-dead-code, high performance and production-readiness.

Core Principles (apply to every change)

- Consistency: identical patterns for similar functionality (services, hooks, components, error handling, logging, i18n).
- SOLID: single responsibility, explicit abstractions, dependency inversion for external services.
- DRY: single source of truth for config, API contracts, validation, query keys, types, error formats.
- No dead / redundant code: remove unused modules, tests, fixtures; document intentionally retained legacy.
- Performance-first: code-splitting, lazy loading, virtualize large lists, minimize re-renders, optimize assets.
- Production-ready: strict typing, comprehensive tests, CI gates, security best-practices, observability (instrumentation, logging).

Scope

- Frontend app (React + TypeScript) including services, shared libs, pages, hooks, tests and docs.

Standard Patterns (mandatory)

1. API Layer
   - All network calls via a central apiClient wrapper (fetch/axios) with request/response interceptors.
   - TanStack Query for data fetching; single SSOT for queryKeys.
   - Service → hook → component pattern for every endpoint.
   - Unified error shape and standardized error handling hook (useStandardErrorHandler).
   - Avoid inline `fetch`/`axios` in components.

2. State & Context
   - Split contexts into State + Actions where appropriate.
   - Global app state via clear domain stores (React context or lightweight store); no prop drilling.
   - Central token management service (tokenService) used everywhere; no duplicate localStorage access.

3. Component & Hooks
   - Small function components, single responsibility, <= 200-300 LOC per file.
   - Custom hooks for repeated logic; each hook one responsibility.
   - Use React 19 features where applicable: useOptimistic for UI-only optimistic updates, useActionState for server-action like forms, use() where valid, Suspense for code-splitting.
   - Remove unnecessary useMemo/useCallback; keep only when justified (document why).

4. UI / UX Patterns
   - All text via i18n/localization functions; no hard-coded user-facing strings.
   - Central design tokens and variants; reuse design-system components.
   - Loading and error patterns consistent across app (StandardLoading, StandardError).

5. Validation & Types
   - Centralized validation SSOT that mirrors backend (sync with backend validation rules).
   - All API types and DTOs defined once and imported as type-only.
   - Use `import type` for type-only imports.

6. Auth & RBAC
   - Single auth context/dependency for login/logout/refresh and permission checks.
   - RBAC checks via a single `CanAccess`/`requirePermission` utility.
   - API client must always attach Authorization header (and handle refresh transparently).

7. Error Handling & Logging
   - Centralized standard error handler with consistent behavior (401 redirect, field errors mapping, toast).
   - Structured logging via centralized logger (no console.log in prod code).
   - Error boundaries and logging for UI crashes.

8. Performance & Accessibility
   - Lazy-load heavy routes, code-split, prefetch critical data.
   - Virtualize long lists (react-window/react-virtual) where > 200 items.
   - Optimize images (responsive, modern formats, lazy load).
   - Lighthouse checks in CI and bundle size budgets.
   - Ensure ARIA, keyboard nav, focus management.

9. Testing & CI
   - Unit tests (Vitest), integration tests, e2e (Playwright).
   - Mock network at e2e layer; no reliance on prod services.
   - Enforce lint, type-check, tests and security scans in CI.

Detect Missing Implementations & Poor Patterns (search targets)

- Multiple apiClient implementations or direct fetch calls in components.
- Duplicate token/localStorage access code.
- Ad-hoc validation in components instead of centralized validators.
- Multiple query key factories or hard-coded query keys.
- Components performing data fetching and business logic (no separation).
- Console.log or dev-only code left in prod paths.
- Hard-coded user messages and strings.
- Blocking synchronous operations in render/effects.
- Large files > 300 LOC with mixed responsibilities.
- Tests hitting real backend services in CI or not using mocks.
- Duplicate or unused UI components and reference pages mixed with prod code.

High-Priority Suggestions (ranked)

1. Create SSOT modules:
   - Central config (env parsing + runtime flags).
   - Central apiClient (with interceptors for auth, CSRF, retry).
   - Central queryKeys factory.
   - Central tokenService and auth context.
   - Centralized validation and types module.
   - Centralized logger and diagnostic utilities.
2. Enforce service→hook→component pattern; refactor ad-hoc endpoints.
3. Consolidate error handling: single useStandardErrorHandler hook used by all hooks.
4. Ensure RBAC checks are declarative and consistent (CanAccess component + hook).
5. Add request/response metrics middleware and integrate with observability (do not duplicate cloud vendor features).
6. Add retry/backoff wrapper for transient network failures.
7. Migrate long lists to virtualization and audit heavy renders.
8. Run dead-code detection tooling and remove unused assets/components; keep backups for reference pages externally.
9. Document patterns in a single developer guide and enforce via pre-commit / CI checks.

Implementation Plan (phased)

- Phase 0 — Audit (1–2 days)
  - Run static analysis (ESLint, TypeScript), dead-code detection, tests, bundle analysis; produce findings with severity (P0-P3).
- Phase 1 — SSOT & infra (2–4 days)
  - Implement central apiClient, tokenService, queryKeys, config and logger. Update imports across codebase.
- Phase 2 — Services & Hooks (3–6 days)
  - Refactor domain services to use central apiClient; create hooks that use TanStack Query; enforce standard error handler.
- Phase 3 — Validation & Types (2–3 days)
  - Centralize validation rules and types; align with backend; remove local validators.
- Phase 4 — Auth / RBAC / UI Patterns (2–4 days)
  - Standardize auth flow, permission checks, and UI components (loading, error, empty states).
- Phase 5 — Performance & Tests (3–5 days)
  - Add virtualization, prefetching, Lighthouse checks; migrate/expand unit & e2e tests; enforce CI gating.
- Phase 6 — Cleanup & Docs (1–2 days)
  - Remove dead code, update documentation, add PR checklist and developer guide.

Deliverables per phase

- Audit report with prioritized findings.
- SSOT modules and small, focused refactor PRs.
- Test coverage report and CI configuration updates.
- Developer guide and architecture decision records.

Checks & Automation

- Provide an `audit` script to run linters, type checks, tests, bundle analysis and dead-code scan.
- CI must fail on:
  - Type errors
  - Lint failures
  - Test failures
  - Coverage below thresholds
  - Bundle size exceeding budget
- Add pre-commit hooks to run quick lint/type checks.

Quick CLI examples

- Start dev: `npm run dev`
- Build: `npm run build`
- Start prod preview: `npm run preview`
- Run unit tests: `npm run test`
- Run e2e: `npm run test:e2e`
- Run audit (local): `npm run audit`

Notes & Constraints

- Do not commit secrets; use env and secret manager.
- Keep PRs small and focused; one concern per PR.
- If a recommended change conflicts with a deliberate architecture decision, document the rationale and keep as-is.
- Reference pages / showcases must be kept out of production change sets; maintain as read-only backups.

Reporting

- Automated audits produce machine-readable and human-readable findings.
- Each P0 finding must include reproduction steps, suggested fix, code references, and test plan.

Usage

- Use this prompt as authoritative guidance for code generation, refactors and PR suggestions.
- If an auto-suggestion does not comply, reject it and state why.

Appendix — Key patterns to enforce

- Service → hook → component
- Single apiClient + tokenService
- Centralized queryKeys and types
- Centralized validation SSOT
- Standardized error handler and logging
- React 19 features applied where applicable (useOptimistic, useActionState, use())
