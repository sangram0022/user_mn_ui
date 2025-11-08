/**
 * Admin User Approval Service
 * API calls for approving and rejecting pending user registrations
 * 
 * Endpoints implemented:
 * - POST /api/v1/admin/users/:id/approve (approve user)
 * - POST /api/v1/admin/users/:id/reject (reject user)
 */

import { apiClient } from '../../../services/api/apiClient';
import { API_PREFIXES, unwrapResponse } from '../../../services/api/common';
import { logger } from '@/core/logging';
import type {
  ApproveUserRequest,
  ApproveUserResponse,
  RejectUserRequest,
  RejectUserResponse,
  BulkApprovalRequest,
  BulkApprovalResult,
  BulkRejectionRequest,
  BulkRejectionResult,
} from '../types';

const API_PREFIX = API_PREFIXES.ADMIN_USERS;

// ============================================================================
// Approval Endpoints
// ============================================================================

/**
 * POST /api/v1/admin/users/:id/approve
 * Approve a pending user with optional trial benefits and role assignment
 */
export const approveUser = async (
  userId: string,
  data?: ApproveUserRequest
): Promise<ApproveUserResponse> => {
  const response = await apiClient.post<ApproveUserResponse>(
    `${API_PREFIX}/${userId}/approve`,
    data || {}
  );
  return unwrapResponse<ApproveUserResponse>(response.data);
};

/**
 * POST /api/v1/admin/users/:id/reject
 * Reject a pending user registration with reason
 */
export const rejectUser = async (
  userId: string,
  data: RejectUserRequest
): Promise<RejectUserResponse> => {
  if (!data.reason || data.reason.length < 10) {
    throw new Error('Rejection reason must be at least 10 characters');
  }
  
  const response = await apiClient.post<RejectUserResponse>(
    `${API_PREFIX}/${userId}/reject`,
    data
  );
  return unwrapResponse<RejectUserResponse>(response.data);
};

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Bulk approve multiple pending users
 */
export const bulkApproveUsers = async (
  request: BulkApprovalRequest
): Promise<BulkApprovalResult> => {
  const results: BulkApprovalResult = {
    total: request.user_ids.length,
    approved: 0,
    failed: 0,
    success_ids: [],
    errors: [],
  };
  
  for (const userId of request.user_ids) {
    try {
      await approveUser(userId, request.options);
      results.approved++;
      results.success_ids.push(userId);
    } catch (error) {
      logger().error('Bulk approval failed for user', error instanceof Error ? error : null, {
        userId,
        context: 'adminApprovalService.bulkApproveUsers',
      });
      results.failed++;
      results.errors.push({
        user_id: userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        error_code: 'APPROVAL_FAILED',
      });
    }
    
    // Rate limiting: small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
};

/**
 * Bulk reject multiple pending users
 */
export const bulkRejectUsers = async (
  request: BulkRejectionRequest
): Promise<BulkRejectionResult> => {
  if (!request.reason || request.reason.length < 10) {
    throw new Error('Rejection reason must be at least 10 characters');
  }
  
  const results: BulkRejectionResult = {
    total: request.user_ids.length,
    rejected: 0,
    failed: 0,
    success_ids: [],
    errors: [],
  };
  
  for (const userId of request.user_ids) {
    try {
      await rejectUser(userId, {
        reason: request.reason,
        ...request.options,
      });
      results.rejected++;
      results.success_ids.push(userId);
    } catch (error) {
      logger().error('Bulk rejection failed for user', error instanceof Error ? error : null, {
        userId,
        reason: request.reason,
        context: 'adminApprovalService.bulkRejectUsers',
      });
      results.failed++;
      results.errors.push({
        user_id: userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        error_code: 'REJECTION_FAILED',
      });
    }
    
    // Rate limiting: small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
};

// Export all as default object
const adminApprovalService = {
  approveUser,
  rejectUser,
  bulkApproveUsers,
  bulkRejectUsers,
};

export default adminApprovalService;
