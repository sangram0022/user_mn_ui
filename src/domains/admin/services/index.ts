/**
 * Admin Services Index
 * Central export point for all admin API services
 */

// Service exports (default exports only to avoid conflicts)
export { default as adminService } from './adminService';
export { default as adminRoleService } from './adminRoleService';
export { default as adminApprovalService } from './adminApprovalService';
export { default as adminAnalyticsService } from './adminAnalyticsService';
export { default as adminAuditService } from './adminAuditService';

// Approval service exports (specific named exports that don't conflict)
export {
  rejectUser,
  bulkRejectUsers,
} from './adminApprovalService';
