/**
 * Shared UI Components - Design System
 * @module shared/ui
 *
 * Reusable UI components used across all domains
 */

// Modal Component - Production-grade modal with accessibility
export { Modal, ModalFooter, type ModalProps, type ModalSize } from './Modal';

// Badge Component - Standardized badges for severity levels
export { Badge, type BadgeProps, type BadgeSize, type BadgeVariant } from './Badge';

// Badge Utilities - Helper functions for badges
export { getSeverityBadgeVariant, getStatusBadgeVariant } from './badgeUtils';

// To be implemented - move truly reusable components here
// export { Button } from './Button';
// export { Input } from './Input';
// export { Loading } from './Loading';
// export { ErrorBoundary } from './ErrorBoundary';
