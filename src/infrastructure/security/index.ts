/**
 * Infrastructure - Security Layer
 * Handles authentication, authorization, encryption, and security utilities
 *
 * @module infrastructure/security
 */

// Authentication
export { AuthManager } from './AuthManager';
export type { AuthCredentials, AuthProvider, AuthSession, AuthToken } from './types';

// Authorization
export { PermissionManager } from './PermissionManager';
export { RoleManager } from './RoleManager';
export type { AccessControl, Permission, PermissionCheck, Role } from './types';

// Encryption
export { EncryptionService } from './EncryptionService';
export { HashingService } from './HashingService';
export type { EncryptedData, EncryptionAlgorithm, HashAlgorithm } from './types';

// Security Utilities
export { preventCSRF } from './utils/csrfProtection';
export { sanitizeInput } from './utils/sanitization';
export { validateInput } from './utils/validation';
export { detectXSS } from './utils/xssDetection';

// Security Hooks
export { useAuth } from './hooks/useAuth';
export { usePermissions } from './hooks/usePermissions';
export { useSecureStorage } from './hooks/useSecureStorage';

// CSP and Security Headers
export {
  buildCSPHeader,
  createCSPDirectives,
  generateNonce,
  getCSPHeader,
  getCSPReportOnlyHeader,
  getDevCSPHeader,
  getProdCSPHeader,
  type CSPDirectives,
} from './csp';

export {
  applySecurityHeaders,
  buildPermissionsPolicy,
  createSecureHeaders,
  defaultPermissionsPolicy,
  getDevSecurityHeaders,
  getSecurityHeaders,
  getSecurityMetaTags,
  hstsHeader,
  referrerPolicyHeader,
  validateSecurityHeaders,
  xFrameOptionsHeader,
  type PermissionsPolicyConfig,
  type SecurityHeaders,
} from './headers';

export { SecurityProvider, useNonce, useSecurity, withSecurity } from './SecurityProvider';
