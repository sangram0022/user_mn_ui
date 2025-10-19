/**
 * API Services Index
 * Central export point for all API service layers
 *
 * Reference: API_DOCUMENTATION_COMPLETE.md
 */

// Authentication
export {
  authService,
  AuthService,
  type LoginCredentials,
  type AuthToken,
  type AuthUser,
  type LoginResponse,
} from './auth.service';

// User Profile
export { userProfileService, UserProfileService } from './profile.service';

// Admin Management
export { adminService, AdminService } from './admin.service';

// GDPR Compliance
export { gdprService, GDPRService } from './gdpr.service';

// Audit Logging
export { auditService, AuditService } from './audit.service';

// Re-export commonly used services as object for convenience
import { authService } from './auth.service';
import { userProfileService } from './profile.service';
import { adminService } from './admin.service';
import { gdprService } from './gdpr.service';
import { auditService } from './audit.service';

/**
 * API Services Container
 * Provides access to all API services in one object
 *
 * @example
 * import { api } from '@services/api';
 *
 * // Authentication
 * const loginResponse = await api.auth.login({ email, password });
 *
 * // User Profile
 * const profile = await api.profile.getCurrentProfile();
 *
 * // Admin
 * const users = await api.admin.getUsers();
 *
 * // GDPR
 * const exportData = await api.gdpr.exportMyData();
 *
 * // Audit
 * const logs = await api.audit.getAuditLogs();
 */
export const api = {
  /**
   * Authentication Service
   * Handles login, registration, password reset, email verification
   */
  auth: authService,

  /**
   * User Profile Service
   * Handles user profile and preferences management
   */
  profile: userProfileService,

  /**
   * Admin Service
   * Handles administrative operations for users and roles
   */
  admin: adminService,

  /**
   * GDPR Service
   * Handles GDPR compliance: data export and account deletion
   */
  gdpr: gdprService,

  /**
   * Audit Service
   * Handles audit logging and compliance tracking
   */
  audit: auditService,
};

export default api;
