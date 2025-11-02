/**
 * Focus Trap Hook for Modals and Dialogs
 * Ensures keyboard focus stays within the component (WCAG 2.1 AA)
 */

import { useEffect, useRef } from 'react';

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'area[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  isActive: boolean
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!isActive || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus first element when trap activates
    firstFocusable?.focus();

    // Store previously focused element to restore later
    const previouslyFocused = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      // Shift + Tab (backwards)
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable?.focus();
          e.preventDefault();
        }
      }
      // Tab (forwards)
      else {
        if (document.activeElement === lastFocusable) {
          firstFocusable?.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
      // Restore focus when trap is removed
      previouslyFocused?.focus();
    };
  }, [isActive]);

  return ref;
}
