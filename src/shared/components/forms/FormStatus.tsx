/**
 * React 19: Form Components with useFormStatus
 *
 * useFormStatus is a React 19 hook that provides access to the status
 * of the parent <form> action, including pending state, data, method, and action URL.
 *
 * Benefits:
 * - ✅ Automatic pending state (no manual prop drilling)
 * - ✅ Child components can access parent form status
 * - ✅ Cleaner API than manual isPending props
 *
 * @module useFormStatus
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useFormStatus } from 'react-dom';

/**
 * React 19: Submit button with automatic pending state
 *
 * This component automatically gets pending state from parent form
 * without manual prop drilling.
 *
 * @example
 * ```tsx
 * <form action={submitAction}>
 *   <input name="email" />
 *   <SubmitButton>Sign In</SubmitButton>
 * </form>
 * ```
 */
export function SubmitButtonWithStatus({
  children,
  className = '',
  loadingText = 'Processing...',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  loadingText?: string;
}) {
  const { pending } = useFormStatus(); // ✅ React 19: Automatic from parent form

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} ${pending ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...props}
    >
      {pending ? (
        <>
          <span className="animate-spin mr-2" aria-hidden="true">
            ⏳
          </span>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * React 19: Form status indicator
 *
 * Shows visual feedback while form is submitting
 *
 * @example
 * ```tsx
 * <form action={submitAction}>
 *   <FormStatusIndicator />
 *   <input name="email" />
 *   <button type="submit">Submit</button>
 * </form>
 * ```
 */
export function FormStatusIndicator() {
  const { pending } = useFormStatus();

  if (!pending) return null;

  return (
    <div
      className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400"
      role="status"
      aria-live="polite"
    >
      <span className="animate-spin" aria-hidden="true">
        ⏳
      </span>
      <span>Submitting form...</span>
    </div>
  );
}

/**
 * React 19: Form field that shows pending state
 *
 * @example
 * ```tsx
 * <form action={submitAction}>
 *   <PendingAwareInput name="email" placeholder="Email" />
 *   <button type="submit">Submit</button>
 * </form>
 * ```
 */
export function PendingAwareInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { pending } = useFormStatus();

  return (
    <input
      {...props}
      disabled={pending || props.disabled}
      className={`${props.className} ${pending ? 'opacity-50' : ''}`}
    />
  );
}

/**
 * React 19: Generic pending wrapper
 *
 * Wraps any content and shows pending state
 *
 * @example
 * ```tsx
 * <form action={submitAction}>
 *   <PendingWrapper>
 *     {(pending) => (
 *       <div className={pending ? 'opacity-50' : ''}>
 *         Form content
 *       </div>
 *     )}
 *   </PendingWrapper>
 * </form>
 * ```
 */
export function PendingWrapper({ children }: { children: (pending: boolean) => ReactNode }) {
  const { pending } = useFormStatus();
  return <>{children(pending)}</>;
}

/**
 * React 19: Hook to use form status in any component
 *
 * Re-export useFormStatus for direct use
 *
 * @example
 * ```tsx
 * function CustomFormComponent() {
 *   const status = useFormStatusHook();
 *   const { pending, data, method, action } = status;
 *
 *   return (
 *     <div>
 *       {pending && <Spinner />}
 *       <span>Method: {method}</span>
 *     </div>
 *   );
 * }
 * ```
 */
