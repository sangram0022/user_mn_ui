/**
 * Authentication feedback utilities
 * Centralized exports for all auth feedback builders
 */

// Re-export all feedback utilities
export * from './forgotPasswordFeedback';
export * from './passwordResetFeedback';
export * from './registrationFeedback';

// Re-export common types
export type { FeedbackIcon } from './registrationFeedback';
