/**
 * Infrastructure - Security Layer
 * Handles authentication, authorization, encryption, and security utilities
 * 
 * @module infrastructure/security
 */

// Authentication
export { AuthManager } from './AuthManager';
export type { 
  AuthToken, 
  AuthCredentials, 
  AuthSession,
  AuthProvider 
} from './types';

// Authorization
export { PermissionManager } from './PermissionManager';
export { RoleManager } from './RoleManager';
export type { 
  Permission, 
  Role, 
  AccessControl,
  PermissionCheck 
} from './types';

// Encryption
export { EncryptionService } from './EncryptionService';
export { HashingService } from './HashingService';
export type { 
  EncryptionAlgorithm,
  HashAlgorithm,
  EncryptedData 
} from './types';

// Security Utilities
export { sanitizeInput } from './utils/sanitization';
export { validateInput } from './utils/validation';
export { detectXSS } from './utils/xssDetection';
export { preventCSRF } from './utils/csrfProtection';

// Security Hooks
export { useAuth } from './hooks/useAuth';
export { usePermissions } from './hooks/usePermissions';
export { useSecureStorage } from './hooks/useSecureStorage';
