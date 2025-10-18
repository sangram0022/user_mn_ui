/**
 * Infrastructure - Security Layer
 * Consolidates security-related utilities, headers, and shared types.
 *
 * @module infrastructure/security
 */

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
