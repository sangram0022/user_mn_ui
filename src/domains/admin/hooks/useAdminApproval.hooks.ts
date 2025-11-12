/**
 * Admin User Approval Hooks
 * React Query hooks for approving and rejecting pending users
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../services/api/queryClient';
import { adminApprovalService } from '../services';
import { logger } from '../../../core/logging';
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

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Approve pending user with optional trial benefits
 */
export const useApproveUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data?: ApproveUserRequest }) =>
      adminApprovalService.approveUser(userId, data),
    onSuccess: (_response: ApproveUserResponse, { userId }) => {
      // Invalidate user lists (pending count will change)
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      
      // Invalidate analytics (user counts change)
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats.all });
    },
  });
};

/**
 * Reject pending user with reason
 */
export const useRejectUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: RejectUserRequest }) =>
      adminApprovalService.rejectUser(userId, data),
    onSuccess: (_response: RejectUserResponse, { userId }) => {
      // Invalidate user lists
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      
      // Invalidate analytics
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats.all });
    },
  });
};

// ============================================================================
// Bulk Operation Hooks
// ============================================================================

/**
 * Bulk approve multiple users
 */
export const useBulkApproveUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkApprovalRequest) =>
      adminApprovalService.bulkApproveUsers(request),
    onSuccess: (result: BulkApprovalResult) => {
      // Invalidate all user-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats.all });
      
      // Log results for debugging
      logger().debug('Bulk approval results', { approved: result.approved, total: result.total, failed: result.failed });
      if (result.failed > 0) {
        logger().warn('Bulk approval errors', { errors: result.errors });
      }
    },
  });
};

/**
 * Bulk reject multiple users
 */
export const useBulkRejectUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkRejectionRequest) =>
      adminApprovalService.bulkRejectUsers(request),
    onSuccess: (result: BulkRejectionResult) => {
      // Invalidate all user-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats.all });
      
      // Log results
      logger().debug('Bulk rejection results', { rejected: result.rejected, total: result.total, failed: result.failed });
      if (result.failed > 0) {
        logger().warn('Bulk rejection errors', { errors: result.errors });
      }
    },
  });
};

/**
 * Combined hook for approval/rejection with state management
 */
export const useUserApproval = () => {
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  const bulkApprove = useBulkApproveUsers();
  const bulkReject = useBulkRejectUsers();

  return {
    // Single operations
    approve: approveUser.mutate,
    approveAsync: approveUser.mutateAsync,
    reject: rejectUser.mutate,
    rejectAsync: rejectUser.mutateAsync,
    
    // Bulk operations
    bulkApprove: bulkApprove.mutate,
    bulkApproveAsync: bulkApprove.mutateAsync,
    bulkReject: bulkReject.mutate,
    bulkRejectAsync: bulkReject.mutateAsync,
    
    // Loading states
    isApproving: approveUser.isPending,
    isRejecting: rejectUser.isPending,
    isBulkApproving: bulkApprove.isPending,
    isBulkRejecting: bulkReject.isPending,
    
    // Error states
    approveError: approveUser.error,
    rejectError: rejectUser.error,
    bulkApproveError: bulkApprove.error,
    bulkRejectError: bulkReject.error,
  };
};
