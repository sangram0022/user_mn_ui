/**
 * Focus Trap Hook
 * Traps keyboard focus within a container element (e.g., modals, dialogs)
 * Improves accessibility by preventing focus from leaving the active element
 */

import type { RefObject } from 'react';
import { useEffect } from 'react';

interface UseFocusTrapOptions {
  enabled?: boolean;
  initialFocus?: boolean;
  returnFocus?: boolean;
}

/**
 * Traps focus within a container element
 * @param ref - Ref to the container element
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * const Modal = ({ isOpen, onClose }) => {
 *   const modalRef = useRef<HTMLDivElement>(null);
 *   useFocusTrap(modalRef, { enabled: isOpen });
 *
 *   return (
 *     <div ref={modalRef} role="dialog" aria-modal="true">
 *       <button onClick={onClose}>Close</button>
 *     </div>
 *   );
 * };
 * ```
 */
export const useFocusTrap = (
  ref: RefObject<HTMLElement>,
  options: UseFocusTrapOptions = {}
): void => {
  const { enabled = true, initialFocus = true, returnFocus = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const element = ref.current;
    if (!element) return;

    // Store previously focused element to return focus later
    const previouslyFocusedElement = document.activeElement as HTMLElement;

    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      const selector = [
        'button:not([disabled])',
        '[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]',
      ].join(', ');

      return Array.from(element.querySelectorAll(selector));
    };

    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];

    // Focus first element initially
    if (initialFocus && firstElement) {
      firstElement.focus();
    }

    // Handle Tab key navigation
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const currentFocusableElements = getFocusableElements();
      const currentFirst = currentFocusableElements[0];
      const currentLast = currentFocusableElements[currentFocusableElements.length - 1];

      // Shift + Tab (backwards)
      if (e.shiftKey) {
        if (document.activeElement === currentFirst) {
          e.preventDefault();
          currentLast?.focus();
        }
      }
      // Tab (forwards)
      else {
        if (document.activeElement === currentLast) {
          e.preventDefault();
          currentFirst?.focus();
        }
      }
    };

    // Prevent focus from leaving the container
    const handleFocusOut = (e: FocusEvent) => {
      if (!element.contains(e.relatedTarget as Node)) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    element.addEventListener('keydown', handleTab);
    element.addEventListener('focusout', handleFocusOut);

    // Cleanup
    return () => {
      element.removeEventListener('keydown', handleTab);
      element.removeEventListener('focusout', handleFocusOut);

      // Return focus to previously focused element
      if (returnFocus && previouslyFocusedElement) {
        previouslyFocusedElement.focus();
      }
    };
  }, [ref, enabled, initialFocus, returnFocus]);
};

export default useFocusTrap;
