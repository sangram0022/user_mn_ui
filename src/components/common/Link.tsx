/**
 * Optimized Link Component with Route Preloading
 *
 * Enhances react-router Link with intelligent prefetching:
 * - Preloads route on hover/focus
 * - Reduces navigation delay
 * - Seamless user experience
 *
 * @author Senior React Architect
 * @version 1.0.0
 */

import { routePreloader } from '@routing/routePreloader';
import { useCallback } from 'react';
import { Link as RouterLink, type LinkProps } from 'react-router-dom';

export interface OptimizedLinkProps extends LinkProps {
  preload?: boolean;
}

/**
 * Link component with automatic route preloading
 *
 * @example
 * ```tsx
 * <Link to="/dashboard">Go to Dashboard</Link>
 * <Link to="/profile" preload={false}>Profile</Link>
 * ```
 */
export const Link = ({
  to,
  preload = true,
  onMouseEnter,
  onFocus,
  ...props
}: OptimizedLinkProps) => {
  const path = typeof to === 'string' ? to : to.pathname || '';

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (preload && path) {
        routePreloader.preloadRoute(path);
      }
      onMouseEnter?.(e);
    },
    [path, preload, onMouseEnter]
  );

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLAnchorElement>) => {
      if (preload && path) {
        routePreloader.preloadRoute(path);
      }
      onFocus?.(e);
    },
    [path, preload, onFocus]
  );

  return <RouterLink to={to} onMouseEnter={handleMouseEnter} onFocus={handleFocus} {...props} />;
};

export default Link;
