/**
 * Accessibility Components Index
 * Barrel export for all accessibility components
 */

export { SkipLinks } from './SkipLinks';
export { AccessibleModal } from './AccessibleModal';
export { AccessibleBreadcrumbs } from './AccessibleBreadcrumbs';
export { AccessibleDropdown } from './AccessibleDropdown';
export { PageAnnouncements } from './PageAnnouncements';
export { AccessibleFormField } from './AccessibleFormField';

// Re-export types
export type { BreadcrumbItem, AccessibleBreadcrumbsProps } from './AccessibleBreadcrumbs';
export type { DropdownItem, AccessibleDropdownProps } from './AccessibleDropdown';
export type { AccessibleFormFieldProps } from './AccessibleFormField';

// Demo component still in original file
export { AccessibilityDemo } from '../AccessibilityEnhancements';
