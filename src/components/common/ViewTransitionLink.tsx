import { useViewTransition } from '@hooks/useViewTransition';
import type { FC, MouseEvent } from 'react';
import type { LinkProps as RouterLinkProps } from 'react-router-dom';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

/**
 * Enhanced Link component with View Transitions API support
 *
 * Wraps React Router's Link to provide smooth page transitions
 * using the browser's View Transitions API when available.
 *
 * Features:
 * - Automatic view transitions on navigation
 * - Fallback to standard navigation for unsupported browsers
 * - Maintains all React Router Link functionality
 * - Supports external links (skips transitions)
 * - Respects user's reduced motion preferences
 *
 * @example
 * ```tsx
 * <ViewTransitionLink to="/dashboard">
 *   Go to Dashboard
 * </ViewTransitionLink>
 * ```
 */

export interface ViewTransitionLinkProps extends RouterLinkProps {
  /**
   * Disable view transitions for this specific link
   */
  noTransition?: boolean;

  /**
   * Custom transition type (matches CSS view-transition-name)
   */
  transitionType?: 'fade' | 'slide-forward' | 'slide-back' | 'zoom';
}

export const ViewTransitionLink: FC<ViewTransitionLinkProps> = ({
  to,
  onClick,
  noTransition = false,
  transitionType,
  children,
  ...props
}) => {
  const navigate = useNavigate();
  const { transition } = useViewTransition();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Call original onClick if provided
    if (onClick) {
      onClick(event);
    }

    // Skip if default was prevented or link opens in new tab
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    // Skip if transitions are disabled for this link
    if (noTransition) {
      return;
    }

    // Skip if it's an external link
    const href = typeof to === 'string' ? to : to.pathname || '';
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
      return;
    }

    // Prevent default navigation
    event.preventDefault();

    // Apply transition type to root element if specified
    if (transitionType && typeof document !== 'undefined') {
      document.documentElement.dataset.transition = transitionType;
    }

    // Use view transition for navigation
    transition(() => {
      navigate(to as string, { replace: false });

      // Clean up transition type
      if (transitionType && typeof document !== 'undefined') {
        delete document.documentElement.dataset.transition;
      }
    });
  };

  return (
    <RouterLink to={to} onClick={handleClick} {...props}>
      {children}
    </RouterLink>
  );
};

/**
 * Re-export as default and named export for convenience
 */
export default ViewTransitionLink;
