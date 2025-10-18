/**
 * Shared utilities barrel export
 */

// Error handling utilities
export * from './error';

// Logging utilities
export { logger } from './logger';

// Validation utilities
export * from './formValidation';
export * from './validation';

// User utilities
export * from './user';

// Performance utilities
export * from './performance';

// React 19 resource loading utilities
export * from './resource-loading';

// Date utilities
export * from './dateUtils';

// Class name utilities
export { clsx, cn } from './classNames';

// Re-export design system for convenience
export * from '../design';
