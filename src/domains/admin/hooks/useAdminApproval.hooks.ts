/**
 * Admin User Approval Hooks
 * React Query hooks for approving and rejecting pending users
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApprovalService } from '../services';
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
import { adminUserKeys } from './useAdminUsers.hooks';

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
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(userId) });
      
      // Invalidate analytics (user counts change)
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
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
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(userId) });
      
      // Invalidate analytics
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
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
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      
      // Log results for debugging
      console.log(`Bulk approval: ${result.approved}/${result.total} succeeded`);
      if (result.failed > 0) {
        console.warn('Bulk approval errors:', result.errors);
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
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      
      // Log results
      console.log(`Bulk rejection: ${result.rejected}/${result.total} succeeded`);
      if (result.failed > 0) {
        console.warn('Bulk rejection errors:', result.errors);
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
