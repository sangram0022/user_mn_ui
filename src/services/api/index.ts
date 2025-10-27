/**
 * API Services Index - COMPLETE
 * Central export point for all API service layers
 *
 * Reference: API_COMPLETE_REFERENCE.md (All 52 endpoints)
 * - Part 1: Authentication & Profile (16 endpoints)
 * - Part 2: Admin, RBAC, GDPR (20 endpoints)
 * - Part 2 Continued: Audit Logging (2 endpoints)
 * - Part 2 Final: Health & Monitoring (12 endpoints) + Frontend Logging (1 endpoint)
 */

// Authentication
export {
  authService,
  AuthService,
  type AuthToken,
  type AuthUser,
  type LoginCredentials,
  type LoginResponse,
} from './auth.service';

// User Profile
export { userProfileService, UserProfileService } from './profile.service';

// Admin Management
export { adminService, AdminService } from './admin.service';

// GDPR Compliance
export { gdprService, GDPRService } from './gdpr.service';

// Audit Logging (Enhanced with Severity, Export, Statistics)
export { auditService, AuditService, type AuditSeverity } from './audit.service';

// RBAC Management
export { rbacService, RBACService } from './rbac.service';

// Health & Monitoring (NEW - 11 endpoints)
export { healthService, HealthService } from './health.service';

// Frontend Error Logging (NEW - Error batching, deduplication, global handlers)
export { frontendErrorLog, FrontendErrorLogService } from './frontend-error-log.service';

// Complete API Type Definitions (All 52 endpoints)
export type * from '@shared/types/api-complete.types';

// Re-export services as object for convenience
import { adminService } from './admin.service';
import { auditService } from './audit.service'; // Enhanced implementation with severity, export, stats
import { authService } from './auth.service';
import { frontendErrorLog } from './frontend-error-log.service';
import { gdprService } from './gdpr.service';
import { healthService } from './health.service';
import { userProfileService } from './profile.service';
import { rbacService } from './rbac.service';

/**
 * API Services Container
 * Provides access to all API services in one object
 *
 * @example
 * import { api } from '@services/api';
 *
 * // Authentication (16 endpoints)
 * const loginResponse = await api.auth.login({ email, password });
 * const tokens = await api.auth.refreshSecure();
 *
 * // User Profile (2 endpoints)
 * const profile = await api.profile.getCurrentProfile();
 * await api.profile.updateProfile({ first_name: 'John' });
 *
 * // Admin (6 endpoints)
 * const users = await api.admin.getUsers({ page: 1, limit: 20 });
 * await api.admin.approveUser('user-123');
 *
 * // RBAC (8 endpoints)
 * const roles = await api.rbac.listRoles();
 * await api.rbac.assignRoleToUser('user-123', 'role-456');
 *
 * // GDPR (2 endpoints)
 * const exportData = await api.gdpr.exportMyData();
 * await api.gdpr.deleteMyAccount(password, 'DELETE MY ACCOUNT');
 *
 * // Audit (2 endpoints - Enhanced)
 * const logs = await api.audit.queryAuditLogs({ severity: 'CRITICAL' });
 * const summary = await api.audit.getAuditSummary();
 * const csvBlob = await api.audit.exportAuditLogs('csv');
 *
 * // Health Monitoring (11 endpoints - NEW)
 * const health = await api.health.getDetailedHealth();
 * const ready = await api.health.isReady();
 * const stopMonitoring = api.health.monitorHealth((health) => {
 *   console.log('System status:', health.status);
 * }, 30000);
 *
 * // Frontend Error Logging (1 endpoint - NEW)
 * await api.errorLog.logError(error, { component: 'UserProfile' });
 * await api.errorLog.logWarning('Deprecated API usage');
 */
export const api = {
  /**
   * Authentication Service (16 endpoints)
   * - Login (standard & secure)
   * - Registration & email verification
   * - Password reset & change
   * - Token refresh & logout
   * - CSRF token management
   */
  auth: authService,

  /**
   * User Profile Service (2 endpoints)
   * - Get & update profile
   * - Preferences management
   */
  profile: userProfileService,

  /**
   * Admin Service (6 endpoints)
   * - User CRUD operations
   * - User approval/rejection
   * - User activation/deactivation
   */
  admin: adminService,

  /**
   * GDPR Service (2 endpoints)
   * - Data export (Article 15)
   * - Account deletion (Article 17)
   * - Compliance status
   */
  gdpr: gdprService,

  /**
   * Audit Service (2 endpoints - ENHANCED)
   * - Query audit logs with severity filtering
   * - Export to JSON/CSV
   * - Statistics and analytics
   * - IP tracking and user agent logging
   */
  audit: auditService,

  /**
   * RBAC Service (8 endpoints)
   * - Role CRUD operations
   * - Permission management
   * - Role assignment/revocation
   * - Cache management
   */
  rbac: rbacService,

  /**
   * Health Monitoring Service (11 endpoints - NEW)
   * - Basic health, ping, readiness
   * - Detailed health with subsystems
   * - Database, system, cache health
   * - Circuit breakers, events
   * - Continuous monitoring utilities
   */
  health: healthService,

  /**
   * Frontend Error Log Service (1 endpoint - NEW)
   * - Log errors/warnings/info
   * - Automatic batching
   * - Error deduplication
   * - Global error handlers
   * - Metadata enrichment
   */
  errorLog: frontendErrorLog,
};

export default api;
