/**
 * API Message Utilities
 *
 * Utilities for processing API responses and mapping message keys
 * to localized messages. This demonstrates how to integrate the
 * localization system with backend API responses.
 *
 * @author GitHub Copilot
 */

import type {
  ApiResponseWithMessage,
  MessageKey,
  ValidationError,
} from '../../types/localization.types';

// ============================================================================
// API Response Processing
// ============================================================================

/**
 * Process an API error response and extract message information
 */
export function processApiError(error: unknown): ApiResponseWithMessage {
  // Handle different error formats
  if (error && typeof error === 'object') {
    const apiError = error as Record<string, unknown>;

    // Standard API error format with messageKey
    if (apiError.messageKey && typeof apiError.messageKey === 'string') {
      return {
        messageKey: apiError.messageKey as MessageKey,
        messageData: apiError.messageData as Record<string, unknown>,
        message: apiError.message as string,
        success: false,
      };
    }

    // Direct message format
    if (apiError.message && typeof apiError.message === 'string') {
      return {
        message: apiError.message,
        success: false,
      };
    }

    // Error with details array (validation errors)
    if (apiError.details && Array.isArray(apiError.details)) {
      return {
        messageKey: 'errors.validation.multiple',
        messageData: { count: apiError.details.length },
        message: 'Multiple validation errors occurred',
        success: false,
        details: apiError.details,
      };
    }
  }

  // Fallback for unknown error formats
  return {
    messageKey: 'errors.unknown',
    message: 'An unexpected error occurred',
    success: false,
  };
}

/**
 * Process a success API response and extract message information
 */
export function processApiSuccess(response: unknown): ApiResponseWithMessage {
  if (response && typeof response === 'object') {
    const apiResponse = response as Record<string, unknown>;

    // Standard success format with messageKey
    if (apiResponse.messageKey && typeof apiResponse.messageKey === 'string') {
      return {
        messageKey: apiResponse.messageKey as MessageKey,
        messageData: apiResponse.messageData as Record<string, unknown>,
        message: apiResponse.message as string,
        success: true,
        data: apiResponse.data,
      };
    }

    // Direct message format
    if (apiResponse.message && typeof apiResponse.message === 'string') {
      return {
        message: apiResponse.message,
        success: true,
        data: apiResponse.data,
      };
    }
  }

  // Default success message
  return {
    messageKey: 'success.operation.completed',
    message: 'Operation completed successfully',
    success: true,
  };
}

/**
 * Map backend validation errors to frontend format
 */
export function mapValidationErrors(backendErrors: unknown[]): ValidationError[] {
  return backendErrors.map((error, index) => {
    if (error && typeof error === 'object') {
      const validationError = error as Record<string, unknown>;

      return {
        field: (validationError.field as string) || `field_${index}`,
        code: (validationError.code as string) || 'VALIDATION_ERROR',
        message: (validationError.message as string) || 'Validation failed',
        messageKey: validationError.messageKey as string,
        messageData: validationError.messageData as Record<
          string,
          string | number | boolean | null | undefined
        >,
        value: validationError.value,
      };
    }

    return {
      field: `field_${index}`,
      code: 'UNKNOWN_ERROR',
      message: String(error || 'Unknown validation error'),
    };
  });
}

// ============================================================================
// Message Key Mapping
// ============================================================================

/**
 * Common API message key mappings for different operations
 */
export const API_MESSAGE_KEYS = {
  // User operations
  USER_CREATED: 'success.user.created' as MessageKey,
  USER_UPDATED: 'success.user.updated' as MessageKey,
  USER_DELETED: 'success.user.deleted' as MessageKey,
  USER_NOT_FOUND: 'errors.user.notFound' as MessageKey,
  USER_ALREADY_EXISTS: 'errors.user.alreadyExists' as MessageKey,

  // Authentication
  LOGIN_SUCCESS: 'success.auth.loginSuccess' as MessageKey,
  LOGIN_FAILED: 'errors.auth.loginFailed' as MessageKey,
  LOGOUT_SUCCESS: 'success.auth.logoutSuccess' as MessageKey,
  TOKEN_EXPIRED: 'errors.auth.tokenExpired' as MessageKey,
  UNAUTHORIZED: 'errors.auth.unauthorized' as MessageKey,

  // Validation
  VALIDATION_FAILED: 'errors.validation.failed' as MessageKey,
  REQUIRED_FIELD: 'errors.validation.required' as MessageKey,
  INVALID_EMAIL: 'errors.validation.email' as MessageKey,
  INVALID_PASSWORD: 'errors.validation.password' as MessageKey,

  // Network/System
  NETWORK_ERROR: 'errors.network.connectionFailed' as MessageKey,
  SERVER_ERROR: 'errors.server.internalError' as MessageKey,
  TIMEOUT: 'errors.network.timeout' as MessageKey,

  // Admin operations
  ROLE_ASSIGNED: 'success.admin.roleAssigned' as MessageKey,
  PERMISSION_GRANTED: 'success.admin.permissionGranted' as MessageKey,
  ACCESS_DENIED: 'errors.admin.accessDenied' as MessageKey,

  // Bulk operations
  BULK_UPDATE_SUCCESS: 'success.bulk.updateCompleted' as MessageKey,
  BULK_DELETE_SUCCESS: 'success.bulk.deleteCompleted' as MessageKey,
  BULK_OPERATION_FAILED: 'errors.bulk.operationFailed' as MessageKey,

  // GDPR
  DATA_EXPORTED: 'success.gdpr.dataExported' as MessageKey,
  DATA_DELETED: 'success.gdpr.dataDeleted' as MessageKey,
  CONSENT_UPDATED: 'success.gdpr.consentUpdated' as MessageKey,
} as const;

// ============================================================================
// API Response Builder
// ============================================================================

/**
 * Build a standardized API response with message key
 */
export function buildApiResponse(
  messageKey: MessageKey,
  messageData?: Record<string, unknown>,
  data?: unknown,
  success = true
): ApiResponseWithMessage {
  return {
    messageKey,
    messageData,
    success,
    data,
  };
}

/**
 * Build validation error response
 */
export function buildValidationErrorResponse(errors: ValidationError[]): ApiResponseWithMessage {
  return {
    messageKey: 'errors.validation.multiple',
    messageData: { count: errors.length },
    success: false,
    details: errors,
  };
}

// ============================================================================
// Example Usage Functions
// ============================================================================

/**
 * Example: Process user creation API response
 */
export function handleUserCreationResponse(response: unknown): {
  success: boolean;
  messageKey: MessageKey;
  messageData?: Record<string, unknown>;
} {
  const processed = processApiSuccess(response);

  if (processed.success) {
    return {
      success: true,
      messageKey: API_MESSAGE_KEYS.USER_CREATED,
      messageData: {
        name: (processed.data as Record<string, unknown>)?.name || 'User',
      },
    };
  }

  return {
    success: false,
    messageKey: 'errors.user.creationFailed',
  };
}

/**
 * Example: Process login API response
 */
export function handleLoginResponse(response: unknown, error?: unknown): ApiResponseWithMessage {
  if (error) {
    return processApiError(error);
  }

  if (response && typeof response === 'object') {
    const loginResponse = response as Record<string, unknown>;

    if (loginResponse.token) {
      return buildApiResponse(
        API_MESSAGE_KEYS.LOGIN_SUCCESS,
        { username: loginResponse.username },
        loginResponse
      );
    }
  }

  return buildApiResponse(API_MESSAGE_KEYS.LOGIN_FAILED, undefined, undefined, false);
}

/**
 * Example: Process validation errors from form submission
 */
export function handleFormValidationErrors(backendResponse: unknown): ValidationError[] {
  if (backendResponse && typeof backendResponse === 'object') {
    const response = backendResponse as Record<string, unknown>;

    if (response.errors && Array.isArray(response.errors)) {
      return mapValidationErrors(response.errors);
    }

    if (response.validationErrors && Array.isArray(response.validationErrors)) {
      return mapValidationErrors(response.validationErrors);
    }

    // Handle single field error
    if (response.field && response.message) {
      return [
        {
          field: response.field as string,
          code: (response.code as string) || 'VALIDATION_ERROR',
          message: response.message as string,
          messageKey: response.messageKey as string,
        },
      ];
    }
  }

  return [];
}
