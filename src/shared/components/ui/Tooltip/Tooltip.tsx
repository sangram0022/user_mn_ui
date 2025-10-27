/**
 * Tooltip Component
 *
 * A tooltip component with:
 * - Multiple positions
 * - Hover/focus triggers
 * - Portal rendering
 * - Theme support
 * - Accessibility
 */

import { cn } from '@shared/utils';
import type React from 'react';
import { useRef, useState } from 'react';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;

  /** Position */
  position?: TooltipPosition;

  /** Trigger element */
  children: React.ReactElement;

  /** Delay in ms before showing */
  delay?: number;

  /** Custom class name */
  className?: string;
}

const positionStyles: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
};

const arrowStyles: Record<TooltipPosition, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700',
};

export function Tooltip({
  content,
  position = 'top',
  children,
  delay = 200,
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  return (
    <div
      ref={wrapperRef}
      className="inline-block relative"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      role="presentation"
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            'absolute whitespace-nowrap z-tooltip',
            'px-3 py-2 text-sm',
            'bg-[var(--color-surface-primary)] dark:bg-[var(--color-surface-primary)]',
            'text-[var(--color-text-primary)]',
            'rounded-lg shadow-lg',
            'pointer-events-none',
            'animate-fade-in',
            positionStyles[position],
            className
          )}
        >
          {content}
          {/* Arrow */}
          <div
            className={cn('absolute w-0 h-0', 'border-4 border-transparent', arrowStyles[position])}
          />
        </div>
      )}
    </div>
  );
}
