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
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  type SuccessMessageKey,
  type ToastType,
} from './errorHandler';
