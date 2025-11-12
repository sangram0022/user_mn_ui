/**
 * React 19 Ref Cleanup Examples
 * 
 * React 19 allows ref callbacks to return cleanup functions,
 * similar to useEffect. This eliminates the need for separate
 * useEffect hooks for DOM cleanup.
 */

import { type RefCallback } from 'react';

/**
 * Example 1: Click Outside Handler with Ref Cleanup
 * Old pattern: useRef + useEffect
 * New pattern: ref callback with cleanup return
 */
interface ClickOutsideProps {
  onClickOutside: () => void;
  children: React.ReactNode;
}

export function ClickOutsideHandler({ onClickOutside, children }: ClickOutsideProps) {
  // React 19: Ref callback with cleanup function
  const handleRef: RefCallback<HTMLDivElement> = (node) => {
    if (!node) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!node.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // React 19: Return cleanup function (like useEffect)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  };

  return (
    <div ref={handleRef} className="relative">
      {children}
    </div>
  );
}

/**
 * Example 2: Resize Observer with Ref Cleanup
 */
interface ResizeObserverProps {
  onResize: (entry: ResizeObserverEntry) => void;
  children: React.ReactNode;
}

export function ResizeObserverWrapper({ onResize, children }: ResizeObserverProps) {
  const handleRef: RefCallback<HTMLDivElement> = (node) => {
    if (!node) return;

    const observer = new (window as typeof globalThis & { ResizeObserver: typeof ResizeObserver }).ResizeObserver((entries: ResizeObserverEntry[]) => {
      onResize(entries[0]);
    });

    observer.observe(node);

    // React 19: Cleanup automatically called when ref changes
    return () => {
      observer.disconnect();
    };
  };

  return <div ref={handleRef}>{children}</div>;
}

/**
 * Example 3: Intersection Observer with Ref Cleanup
 */
interface IntersectionObserverProps {
  onIntersect: (isIntersecting: boolean) => void;
  threshold?: number;
  children: React.ReactNode;
}

export function IntersectionObserverComponent({
  onIntersect,
  threshold = 0.1,
  children,
}: IntersectionObserverProps) {
  const handleRef: RefCallback<HTMLDivElement> = (node) => {
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        onIntersect(entries[0].isIntersecting);
      },
      { threshold }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  };

  return <div ref={handleRef}>{children}</div>;
}

/**
 * Example 4: Focus Trap with Ref Cleanup
 */
interface FocusTrapProps {
  active: boolean;
  children: React.ReactNode;
}

export function FocusTrap({ active, children }: FocusTrapProps) {
  const handleRef: RefCallback<HTMLDivElement> = (node) => {
    if (!node || !active) return;

    const focusableElements = node.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    node.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      node.removeEventListener('keydown', handleKeyDown);
    };
  };

  return <div ref={handleRef}>{children}</div>;
}

/**
 * Example 5: Scroll Lock with Ref Cleanup
 */
interface ScrollLockProps {
  locked: boolean;
  children: React.ReactNode;
}

export function ScrollLock({ locked, children }: ScrollLockProps) {
  const handleRef: RefCallback<HTMLDivElement> = (node) => {
    if (!node || !locked) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Get scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  };

  return <div ref={handleRef}>{children}</div>;
}

/**
 * Example 6: Custom Event Listener with Ref Cleanup
 */
interface CustomEventListenerProps {
  eventName: string;
  handler: (event: Event) => void;
  children: React.ReactNode;
}

export function CustomEventListener({
  eventName,
  handler,
  children,
}: CustomEventListenerProps) {
  const handleRef: RefCallback<HTMLDivElement> = (node) => {
    if (!node) return;

    node.addEventListener(eventName, handler);

    return () => {
      node.removeEventListener(eventName, handler);
    };
  };

  return <div ref={handleRef}>{children}</div>;
}

/**
 * Example 7: Animation Frame Loop with Ref Cleanup
 */
interface AnimationLoopProps {
  onFrame: (timestamp: number) => void;
  active: boolean;
  children: React.ReactNode;
}

export function AnimationLoop({ onFrame, active, children }: AnimationLoopProps) {
  const handleRef: RefCallback<HTMLDivElement> = (node) => {
    if (!node || !active) return;

    let animationFrameId: number;

    const animate = (timestamp: number) => {
      onFrame(timestamp);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  };

  return <div ref={handleRef}>{children}</div>;
}

/**
 * Example 8: Mutation Observer with Ref Cleanup
 */
interface MutationObserverProps {
  onMutation: (mutations: MutationRecord[]) => void;
  options?: MutationObserverInit;
  children: React.ReactNode;
}

export function MutationObserverComponent({
  onMutation,
  options = { childList: true, subtree: true },
  children,
}: MutationObserverProps) {
  const handleRef: RefCallback<HTMLDivElement> = (node) => {
    if (!node) return;

    const observer = new MutationObserver(onMutation);
    observer.observe(node, options);

    return () => {
      observer.disconnect();
    };
  };

  return <div ref={handleRef}>{children}</div>;
}
