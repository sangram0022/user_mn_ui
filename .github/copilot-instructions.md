<!-- Use this file to provide workspace-specific custom instructions to Copilot.
For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Copilot Instructions

## General Guidelines

- Write code in a clean, maintainable, and efficient manner.
- use react and typescript best practices.
  use react 19 features at all possible places, and replace old patterns with new ones.
- no missing import should be there
- i am going to deploy this app on AWS, so dont implement features that aws already support, like resource utilization, observability, any any other, which is by default available in asw, keep code clean
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
