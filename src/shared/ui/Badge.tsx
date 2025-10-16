import type { ReactNode } from 'react';

/**
 * Badge variant types
 */
export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'critical';

/**
 * Badge size types
 */
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * Badge component props
 */
export interface BadgeProps {
  /** Badge content */
  children: ReactNode;
  /** Visual variant of the badge */
  variant?: BadgeVariant;
  /** Size of the badge */
  size?: BadgeSize;
  /** Custom className */
  className?: string;
  /** Optional icon to display before text */
  icon?: ReactNode;
  /** Whether to make the badge clickable */
  onClick?: () => void;
  /** Whether to show a dot indicator */
  showDot?: boolean;
}

/**
 * Get the CSS classes for badge variant
 */
const getBadgeVariantClasses = (variant: BadgeVariant): string => {
  const variantMap: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    critical: 'bg-red-600 text-white dark:bg-red-700 dark:text-white',
  };
  return variantMap[variant];
};

/**
 * Get the CSS classes for badge size
 */
const getBadgeSizeClasses = (size: BadgeSize): string => {
  const sizeMap: Record<BadgeSize, string> = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };
  return sizeMap[size];
};

/**
 * Get the dot color for the variant
 */
const getDotColorClasses = (variant: BadgeVariant): string => {
  const dotMap: Record<BadgeVariant, string> = {
    default: 'bg-gray-400',
    primary: 'bg-blue-500',
    secondary: 'bg-purple-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-cyan-500',
    critical: 'bg-red-600',
  };
  return dotMap[variant];
};

/**
 * Badge Component
 *
 * A flexible badge component for displaying status, severity, categories, or labels.
 *
 * Features:
 * - Multiple visual variants (success, error, warning, info, etc.)
 * - Three size options
 * - Optional icon support
 * - Optional dot indicator
 * - Clickable variant
 * - Dark mode support
 * - Semantic color mapping for severity levels
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Badge variant="success">Active</Badge>
 * <Badge variant="error">Failed</Badge>
 * <Badge variant="warning">Pending</Badge>
 *
 * // With icon
 * <Badge variant="info" icon={<InfoIcon />}>
 *   Information
 * </Badge>
 *
 * // With dot indicator
 * <Badge variant="success" showDot>
 *   Online
 * </Badge>
 *
 * // Clickable badge
 * <Badge variant="primary" onClick={() => console.log('Clicked')}>
 *   Click me
 * </Badge>
 *
 * // Different sizes
 * <Badge size="sm">Small</Badge>
 * <Badge size="md">Medium</Badge>
 * <Badge size="lg">Large</Badge>
 * ```
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon,
  onClick,
  showDot = false,
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center gap-1 font-medium rounded-full transition-colors';
  const variantClasses = getBadgeVariantClasses(variant);
  const sizeClasses = getBadgeSizeClasses(size);
  const clickableClasses = onClick ? 'cursor-pointer hover:opacity-80 active:opacity-90' : '';

  const combinedClassName =
    `${baseClasses} ${variantClasses} ${sizeClasses} ${clickableClasses} ${className}`.trim();

  const content = (
    <>
      {showDot && (
        <span
          className={`inline-block w-2 h-2 rounded-full ${getDotColorClasses(variant)}`}
          aria-hidden="true"
        />
      )}
      {icon && (
        <span className="inline-flex items-center" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={combinedClassName}>
        {content}
      </button>
    );
  }

  return <span className={combinedClassName}>{content}</span>;
}

export default Badge;
