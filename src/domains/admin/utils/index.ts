/**
 * Admin Utils - Index
 * 
 * Central export point for all admin utility functions
 */

// Error handling utilities
export {
  handleAdminError,
  handleValidationError,
  getErrorMessage,
  extractUserMessage,
  createAdminError,
  isAdminError,
  AdminError,
} from './errorHandler';

// Re-export error/success messages from core
export { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/core/error';
