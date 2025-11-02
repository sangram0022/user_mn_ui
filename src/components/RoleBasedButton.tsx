// ========================================
// RoleBasedButton Component
// ========================================
// Permission-aware button that disables if unauthorized
// ✅ Minimal, DRY implementation
// ========================================

import { useState } from 'react';
import type { RoleBasedButtonProps } from '../domains/rbac/types/rbac.types';
import { usePermissions } from '../domains/rbac/hooks/usePermissions';
import Button from './Button';

/**
 * Permission-aware button component
 * Disables button if user lacks required permissions
 * Shows tooltip on hover if disabled
 *
 * Example:
 * ```tsx
 * <RoleBasedButton
 *   requiredRole="admin"
 *   onClick={handleDelete}
 *   tooltipOnDisabled="Only admins can delete"
 * >
 *   Delete
 * </RoleBasedButton>
 *
 * <RoleBasedButton
 *   requiredPermissions={['users:delete']}
 *   showTooltip
 * >
 *   Delete User
 * </RoleBasedButton>
 * ```
 */
export function RoleBasedButton({
  children,
  requiredRole,
  requiredPermissions,
  requireAllPermissions = false,
  tooltipOnDisabled,
  showTooltip = false,
  disabled = false,
  className,
  ...props
}: Omit<RoleBasedButtonProps, 'ref'>) {
  const { hasAccess } = usePermissions();
  const [showTooltipState, setShowTooltipState] = useState(false);

  const hasAccess_ = hasAccess({
    requiredRole,
    requiredPermissions,
    requireAllPermissions,
  });

  const isDisabled = disabled || !hasAccess_;
  const tooltip = !hasAccess_ ? tooltipOnDisabled : undefined;

  return (
    <div className="relative inline-block" data-testid="role-based-button-wrapper">
      <Button
        disabled={isDisabled}
        className={className}
        {...(props as any)}
      >
        {children}
      </Button>

      {/* Tooltip */}
      {(showTooltip || showTooltipState) && tooltip && (
        <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-lg z-50">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}

      {/* Hover area for tooltip */}
      {tooltip && (
        <div
          className="absolute inset-0 cursor-not-allowed"
          onMouseEnter={() => setShowTooltipState(true)}
          onMouseLeave={() => setShowTooltipState(false)}
        />
      )}
    </div>
  );
}

// ✅ Export for convenience
export default RoleBasedButton;
