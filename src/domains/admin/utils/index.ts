/**
 * Admin Utils - Index
 * 
 * Central export point for all admin utility functions
 */

// Error handling utilities
export {
  handleAdminError,
  handleValidationError,
  handleSuccess,
  showSuccess,
  showError,
  showInfo,
  showWarning,
  showToast,
  showSuccessMessage,
  getErrorMessage,
  extractUserMessage,
  createAdminError,
  isAdminError,
  AdminError,
  type SuccessMessageKey,
  type ToastType,
} from './errorHandler';

// Re-export error/success messages from core
export { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/core/error';
