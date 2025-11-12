/**
 * Keyboard Navigation Hook
 * 
 * Provides keyboard navigation patterns for interactive components.
 * Handles arrow keys, Enter, Escape, and Tab navigation.
 * 
 * @param options - Configuration object with key handlers
 * @returns elementRef - Ref to attach to the navigable element
 * 
 * @example
 * ```tsx
 * const navRef = useKeyboardNavigation({
 *   onArrowUp: () => selectPrevious(),
 *   onArrowDown: () => selectNext(),
 *   onEnter: () => confirmSelection(),
 *   onEscape: () => closeMenu(),
 * });
 * 
 * return <div ref={navRef}>...</div>;
 * ```
 */

import { useEffect, useRef } from 'react';

export interface KeyboardNavigationOptions {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onTab?: (e: KeyboardEvent) => void;
  disabled?: boolean;
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions) {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (options.disabled) return;

    const element = elementRef.current;
    if (!element) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          options.onArrowUp?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          options.onArrowDown?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          options.onArrowLeft?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          options.onArrowRight?.();
          break;
        case 'Enter':
          e.preventDefault();
          options.onEnter?.();
          break;
        case 'Escape':
          e.preventDefault();
          options.onEscape?.();
          break;
        case 'Tab':
          options.onTab?.(e);
          break;
      }
    };

    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [options]);

  return elementRef;
}
