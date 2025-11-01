// ========================================
// Backend Error Code Mapping
// Maps backend error_code to user-friendly messages
// Reference: BACKEND_API_DOCUMENTATION.md
// ========================================

/**
 * Backend Error Codes from API responses
 * Format: { error_code: "CODE", message: "Backend message", status_code: 400 }
 */
export const errors = {
  // ========================================
  // Authentication & Authorization Errors
  // ========================================
  
  // Login Errors
  INVALID_CREDENTIALS: 'Invalid email or password. Please check your credentials and try again.',
  ACCOUNT_LOCKED: 'Your account has been locked due to multiple failed login attempts. Please try again later or reset your password.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before signing in. Check your inbox for the verification link.',
  PASSWORD_EXPIRED: 'Your password has expired. Please reset your password to continue.',
  
  // Registration Errors
  EMAIL_ALREADY_EXISTS: 'This email address is already registered. Please sign in or use a different email.',
  USERNAME_ALREADY_EXISTS: 'This username is already taken. Please choose a different username.',
  INVALID_EMAIL_FORMAT: 'Please enter a valid email address.',
  WEAK_PASSWORD: 'Password is too weak. Please use a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match. Please make sure both passwords are the same.',
  PASSWORD_MISMATCH: 'Passwords do not match. Please make sure both passwords are the same.',
  TERMS_NOT_ACCEPTED: 'Please accept the Terms of Service and Privacy Policy to continue.',
  
  // Token Errors
  TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
  TOKEN_INVALID: 'Invalid authentication token. Please sign in again.',
  REFRESH_TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
  REFRESH_TOKEN_INVALID: 'Invalid refresh token. Please sign in again.',
  TOKEN_MISSING: 'Authentication required. Please sign in.',
  
  // Password Reset Errors
  RESET_TOKEN_EXPIRED: 'Password reset link has expired. Please request a new one.',
  RESET_TOKEN_INVALID: 'Invalid password reset link. Please request a new one.',
  PASSWORD_RESET_FAILED: 'Failed to reset password. Please try again.',
  
  // Email Verification Errors
  VERIFICATION_TOKEN_EXPIRED: 'Email verification link has expired. Please request a new one.',
  VERIFICATION_TOKEN_INVALID: 'Invalid verification link. Please request a new one.',
  EMAIL_ALREADY_VERIFIED: 'Your email is already verified. You can sign in now.',
  
  // CSRF Errors
  CSRF_TOKEN_MISSING: 'Security token missing. Please refresh the page and try again.',
  CSRF_TOKEN_INVALID: 'Invalid security token. Please refresh the page and try again.',
  CSRF_TOKEN_EXPIRED: 'Security token expired. Please refresh the page and try again.',
  
  // ========================================
  // Validation Errors
  // ========================================
  
  VALIDATION_ERROR: 'Please check your input and try again.',
  REQUIRED_FIELD_MISSING: 'Please fill in all required fields.',
  INVALID_INPUT: 'Invalid input. Please check your data and try again.',
  INVALID_FORMAT: 'Invalid format. Please check your input.',
  
  // Field-Specific Validation
  INVALID_USERNAME: 'Username must be 3-20 characters and contain only letters, numbers, and underscores.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 8 characters long.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  INVALID_DATE: 'Please enter a valid date.',
  INVALID_URL: 'Please enter a valid URL.',
  
  // ========================================
  // Permission & Access Errors
  // ========================================
  
  UNAUTHORIZED: 'You are not authorized to perform this action. Please sign in.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  ACCESS_DENIED: 'Access denied. Please contact support if you believe this is an error.',
  INSUFFICIENT_PERMISSIONS: 'You do not have sufficient permissions to perform this action.',
  
  // ========================================
  // Resource Errors
  // ========================================
  
  NOT_FOUND: 'The requested resource was not found.',
  RESOURCE_NOT_FOUND: 'Resource not found. It may have been deleted or moved.',
  USER_NOT_FOUND: 'User not found.',
  RESOURCE_ALREADY_EXISTS: 'This resource already exists.',
  DUPLICATE_ENTRY: 'Duplicate entry. This record already exists.',
  
  // ========================================
  // Rate Limiting & Throttling
  // ========================================
  
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',
  TOO_MANY_ATTEMPTS: 'Too many failed attempts. Please try again later.',
  THROTTLED: 'Request throttled. Please slow down and try again.',
  
  // ========================================
  // Server & Network Errors
  // ========================================
  
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later.',
  GATEWAY_TIMEOUT: 'Request timeout. Please check your connection and try again.',
  DATABASE_ERROR: 'Database error. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  
  // ========================================
  // Business Logic Errors
  // ========================================
  
  OPERATION_FAILED: 'Operation failed. Please try again.',
  INVALID_OPERATION: 'Invalid operation. This action is not allowed.',
  CONFLICT: 'Conflict detected. Please refresh and try again.',
  PRECONDITION_FAILED: 'Precondition failed. Please check your data and try again.',
  
  // ========================================
  // File Upload Errors
  // ========================================
  
  FILE_TOO_LARGE: 'File is too large. Maximum size is {{maxSize}}.',
  INVALID_FILE_TYPE: 'Invalid file type. Allowed types: {{allowedTypes}}.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  
  // ========================================
  // Session & State Errors
  // ========================================
  
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  SESSION_INVALID: 'Invalid session. Please sign in again.',
  STATE_MISMATCH: 'State mismatch. Please refresh and try again.',
  
  // ========================================
  // Payment & Subscription Errors (if applicable)
  // ========================================
  
  PAYMENT_REQUIRED: 'Payment required to access this feature.',
  SUBSCRIPTION_EXPIRED: 'Your subscription has expired. Please renew to continue.',
  INSUFFICIENT_CREDITS: 'Insufficient credits. Please add credits to continue.',
  
  // ========================================
  // Default Fallback
  // ========================================
  
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again or contact support.',
  DEFAULT: 'Something went wrong. Please try again.',
} as const;

// Type for error codes
export type ErrorCode = keyof typeof errors;

// Helper to check if error code exists
export const isKnownErrorCode = (code: string): code is ErrorCode => {
  return code in errors;
};

// Get error message with fallback
export const getErrorMessage = (code: string, fallback?: string): string => {
  if (isKnownErrorCode(code)) {
    return errors[code];
  }
  return fallback || errors.DEFAULT;
};
