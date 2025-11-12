/**
 * useUserApprovalManagement Hook
 * Manages user approval/rejection workflow, state, and business logic
 * 
 * React 19 Features:
 * - useOptimistic for instant approval/rejection feedback
 */

import { useState, useOptimistic } from 'react';
import {
  useUserList,
  useApproveUser,
  useRejectUser,
  useBulkApproveUsers,
  useBulkRejectUsers,
} from './index';
import type { ListUsersFilters } from '../types';
import { logger } from '@/core/logging';

const PAGE_SIZE = 10;

export interface ApprovalFormData {
  welcomeMessage: string;
  trialDays: number;
  trialBenefits: string[];
  sendWelcomeEmail: boolean;
}

export interface RejectionFormData {
  rejectionReason: string;
  blockEmail: boolean;
  reapplicationWaitDays: number;
}

export function useUserApprovalManagement() {
  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selection state
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Modal states
  const [showBulkApprovalModal, setShowBulkApprovalModal] = useState(false);
  const [showBulkRejectionModal, setShowBulkRejectionModal] = useState(false);
  const [showIndividualApprovalModal, setShowIndividualApprovalModal] = useState(false);
  const [showIndividualRejectionModal, setShowIndividualRejectionModal] = useState(false);

  // Approval form state
  const [approvalForm, setApprovalForm] = useState<ApprovalFormData>({
    welcomeMessage: '',
    trialDays: 30,
    trialBenefits: ['premium_features', 'priority_support'],
    sendWelcomeEmail: true,
  });

  // Rejection form state
  const [rejectionForm, setRejectionForm] = useState<RejectionFormData>({
    rejectionReason: '',
    blockEmail: false,
    reapplicationWaitDays: 7,
  });

  // API hooks
  const filters: ListUsersFilters = {
    page: currentPage,
    page_size: PAGE_SIZE,
    status: ['pending'],
    search: searchTerm || undefined,
    sort_by: sortField,
    sort_order: sortOrder,
  };

  const { data: usersData, isLoading, isError, error } = useUserList(filters);
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  const bulkApproveUsers = useBulkApproveUsers();
  const bulkRejectUsers = useBulkRejectUsers();

  const users = usersData?.users || [];
  const pagination = usersData?.pagination;

  // Optimistic UI for instant approval/rejection feedback
  const [optimisticUsers, setOptimisticUsers] = useOptimistic(
    users,
    (state, action: { type: 'approve' | 'reject'; userId: string }) => {
      return state.map((user) =>
        user.user_id === action.userId
          ? {
              ...user,
              status: action.type === 'approve' ? ('active' as const) : ('rejected' as const),
            }
          : user
      );
    }
  );

  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedUsers(new Set());
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      const allIds = new Set(users.map((u) => u.user_id));
      setSelectedUsers(allIds);
    }
  };

  const handleIndividualApprove = (userId: string) => {
    setSelectedUserId(userId);
    setShowIndividualApprovalModal(true);
  };

  const handleIndividualReject = (userId: string) => {
    setSelectedUserId(userId);
    setShowIndividualRejectionModal(true);
  };

  const resetApprovalForm = () => {
    setApprovalForm({
      welcomeMessage: '',
      trialDays: 30,
      trialBenefits: ['premium_features', 'priority_support'],
      sendWelcomeEmail: true,
    });
  };

  const resetRejectionForm = () => {
    setRejectionForm({
      rejectionReason: '',
      blockEmail: false,
      reapplicationWaitDays: 7,
    });
  };

  const handleApproveUser = async () => {
    if (!selectedUserId) return;

    // Instant UI feedback
    setOptimisticUsers({ type: 'approve', userId: selectedUserId });

    try {
      await approveUser.mutateAsync({
        userId: selectedUserId,
        data: {
          welcome_message: approvalForm.welcomeMessage || undefined,
          initial_role: 'user',
          trial_days: approvalForm.trialDays,
          send_welcome_email: approvalForm.sendWelcomeEmail,
        },
      });
      setShowIndividualApprovalModal(false);
      resetApprovalForm();
      logger().info('User approved with optimistic update', { userId: selectedUserId });
    } catch (err) {
      logger().error(
        'Failed to approve user, rollback automatic',
        err instanceof Error ? err : new Error(String(err)),
        { userId: selectedUserId }
      );
      throw err;
    }
  };

  const handleRejectUser = async () => {
    if (!selectedUserId) return;
    if (rejectionForm.rejectionReason.length < 10) {
      throw new Error('Rejection reason must be at least 10 characters');
    }

    // Instant UI feedback
    setOptimisticUsers({ type: 'reject', userId: selectedUserId });

    try {
      await rejectUser.mutateAsync({
        userId: selectedUserId,
        data: {
          reason: rejectionForm.rejectionReason,
          block_email: rejectionForm.blockEmail,
          reapplication_wait_days: rejectionForm.reapplicationWaitDays,
        },
      });
      setShowIndividualRejectionModal(false);
      resetRejectionForm();
      logger().info('User rejected with optimistic update', { userId: selectedUserId });
    } catch (err) {
      logger().error(
        'Failed to reject user, rollback automatic',
        err instanceof Error ? err : new Error(String(err)),
        { userId: selectedUserId }
      );
      throw err;
    }
  };

  const handleBulkApprove = async () => {
    if (selectedUsers.size === 0) return;

    try {
      await bulkApproveUsers.mutateAsync({
        user_ids: Array.from(selectedUsers),
        options: {
          welcome_message: approvalForm.welcomeMessage || undefined,
          initial_role: 'user',
          trial_days: approvalForm.trialDays,
          send_welcome_email: approvalForm.sendWelcomeEmail,
        },
      });
      setShowBulkApprovalModal(false);
      setSelectedUsers(new Set());
      resetApprovalForm();
    } catch (err) {
      logger().error(
        'Failed to bulk approve users',
        err instanceof Error ? err : new Error(String(err)),
        { userCount: selectedUsers.size }
      );
      throw err;
    }
  };

  const handleBulkReject = async () => {
    if (selectedUsers.size === 0) return;
    if (rejectionForm.rejectionReason.length < 10) {
      throw new Error('Rejection reason must be at least 10 characters');
    }

    try {
      await bulkRejectUsers.mutateAsync({
        user_ids: Array.from(selectedUsers),
        reason: rejectionForm.rejectionReason,
        options: {
          block_email: rejectionForm.blockEmail,
          reapplication_wait_days: rejectionForm.reapplicationWaitDays,
        },
      });
      setShowBulkRejectionModal(false);
      setSelectedUsers(new Set());
      resetRejectionForm();
    } catch (err) {
      logger().error(
        'Failed to bulk reject users',
        err instanceof Error ? err : new Error(String(err)),
        { userCount: selectedUsers.size }
      );
      throw err;
    }
  };

  return {
    // Data (with optimistic updates)
    users: optimisticUsers, // React 19 useOptimistic for instant feedback
    pagination,
    isLoading,
    isError,
    error,

    // Selection state
    selectedUsers,
    selectedUserId,

    // Sort/Filter state
    searchTerm,
    sortField,
    sortOrder,

    // Modal state (FIXED: exported individual modal state)
    showApprovalModal: showIndividualApprovalModal,
    setShowApprovalModal: setShowIndividualApprovalModal,
    showRejectionModal: showIndividualRejectionModal,
    setShowRejectionModal: setShowIndividualRejectionModal,
    showBulkApprovalModal,
    showBulkRejectionModal,
    setShowBulkApprovalModal,
    setShowBulkRejectionModal,

    // Form state
    approvalForm,
    setApprovalForm,
    rejectionForm,
    setRejectionForm,
    resetApprovalForm,
    resetRejectionForm,

    // Handlers
    handleSearch,
    handleSort,
    handlePageChange,
    handleSelectUser,
    handleSelectAll,
    handleIndividualApprove,
    handleIndividualReject,
    handleApproveUser,
    handleRejectUser,
    handleBulkApprove,
    handleBulkReject,
  };
}
