/**
 * Admin Services Index
 * Central export point for all admin API services
 */

// Service exports
export { default as adminService } from './adminService';
export { default as adminRoleService } from './adminRoleService';
export { default as adminApprovalService } from './adminApprovalService';
export { default as adminAnalyticsService } from './adminAnalyticsService';
export { default as adminAuditService } from './adminAuditService';

// Named exports for convenience
export * from './adminService';
export * from './adminRoleService';
export * from './adminAnalyticsService';
export * from './adminAuditService';

// Approval service exports (avoid conflict with adminService)
export {
  rejectUser,
  bulkRejectUsers,
} from './adminApprovalService';
