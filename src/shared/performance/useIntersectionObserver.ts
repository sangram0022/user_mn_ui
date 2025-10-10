/**
 * Custom Intersection Observer Hook
 * High-performance implementation for lazy loading and visibility detection
 */

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

export interface UseIntersectionObserverOptions { threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean; }

export function useIntersectionObserver<T extends Element>(
  elementRef: RefObject<T>,
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: UseIntersectionObserverOptions = {},
  enabled: boolean = true
): void { const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    triggerOnce = false
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasTriggered = useRef(false);

  useEffect(() => { if (!enabled || !elementRef.current) return;

    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => { if (triggerOnce && hasTriggered.current) return;
        
        const intersectingEntries = entries.filter(entry => entry.isIntersecting);
        if (intersectingEntries.length > 0) {
          hasTriggered.current = true;
          callback(entries);
          
          if (triggerOnce) {
            observerRef.current?.disconnect();
          }
        } else if (!triggerOnce) { callback(entries);
        }
      },
      { threshold,
        root,
        rootMargin
      }
    );

    observerRef.current.observe(elementRef.current);

    return () => { if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [elementRef, callback, threshold, root, rootMargin, triggerOnce, enabled]);

  // Reset trigger state when triggerOnce or enabled changes
  useEffect(() => { if (enabled) {
      hasTriggered.current = false;
    }
  }, [triggerOnce, enabled]);
}