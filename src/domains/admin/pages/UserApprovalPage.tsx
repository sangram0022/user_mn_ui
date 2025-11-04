import { useState } from 'react';
import {
  useUserList,
  useApproveUser,
  useRejectUser,
  useBulkApproveUsers,
  useBulkRejectUsers,
} from '../hooks';
import type { ListUsersFilters } from '../types';
import Button from '../../../shared/components/ui/Button';
import { formatShortDate } from '../../../shared/utils/dateFormatters';

const TRIAL_DAYS_OPTIONS = [7, 14, 30, 60, 90];

export default function UserApprovalPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [showBulkApprovalModal, setShowBulkApprovalModal] = useState(false);
  const [showBulkRejectionModal, setShowBulkRejectionModal] = useState(false);
  const [showIndividualApprovalModal, setShowIndividualApprovalModal] = useState(false);
  const [showIndividualRejectionModal, setShowIndividualRejectionModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Approval form state
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [trialDays, setTrialDays] = useState(30);
  const [trialBenefits, setTrialBenefits] = useState<string[]>(['premium_features', 'priority_support']);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  // Rejection form state
  const [rejectionReason, setRejectionReason] = useState('');
  const [blockEmail, setBlockEmail] = useState(false);
  const [reapplicationWaitDays, setReapplicationWaitDays] = useState(7);

  const filters: ListUsersFilters = {
    page: currentPage,
    page_size: pageSize,
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

  const handleApproveUser = async () => {
    if (!selectedUserId) return;

    try {
      await approveUser.mutateAsync({
        userId: selectedUserId,
        data: {
          welcome_message: welcomeMessage || undefined,
          initial_role: 'user',
          trial_days: trialDays,
          send_welcome_email: sendWelcomeEmail,
        },
      });
      setShowIndividualApprovalModal(false);
      resetApprovalForm();
    } catch (err) {
      console.error('Failed to approve user:', err);
    }
  };

  const handleRejectUser = async () => {
    if (!selectedUserId) return;
    if (rejectionReason.length < 10) {
      alert('Rejection reason must be at least 10 characters');
      return;
    }

    try {
      await rejectUser.mutateAsync({
        userId: selectedUserId,
        data: {
          reason: rejectionReason,
          block_email: blockEmail,
          reapplication_wait_days: reapplicationWaitDays,
        },
      });
      setShowIndividualRejectionModal(false);
      resetRejectionForm();
    } catch (err) {
      console.error('Failed to reject user:', err);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedUsers.size === 0) return;

    try {
      await bulkApproveUsers.mutateAsync({
        user_ids: Array.from(selectedUsers),
        options: {
          welcome_message: welcomeMessage || undefined,
          initial_role: 'user',
          trial_days: trialDays,
          send_welcome_email: sendWelcomeEmail,
        },
      } as unknown as Parameters<typeof bulkApproveUsers.mutateAsync>[0]);
      setShowBulkApprovalModal(false);
      setSelectedUsers(new Set());
      resetApprovalForm();
    } catch (err) {
      console.error('Failed to bulk approve users:', err);
    }
  };

  const handleBulkReject = async () => {
    if (selectedUsers.size === 0) return;
    if (rejectionReason.length < 10) {
      alert('Rejection reason must be at least 10 characters');
      return;
    }

    try {
      await bulkRejectUsers.mutateAsync({
        user_ids: Array.from(selectedUsers),
        reason: rejectionReason,
        options: {
          block_email: blockEmail,
          reapplication_wait_days: reapplicationWaitDays,
        },
      } as unknown as Parameters<typeof bulkRejectUsers.mutateAsync>[0]);
      setShowBulkRejectionModal(false);
      setSelectedUsers(new Set());
      resetRejectionForm();
    } catch (err) {
      console.error('Failed to bulk reject users:', err);
    }
  };

  const resetApprovalForm = () => {
    setWelcomeMessage('');
    setTrialDays(30);
    setTrialBenefits(['premium_features', 'priority_support']);
    setSendWelcomeEmail(true);
    setSelectedUserId(null);
  };

  const resetRejectionForm = () => {
    setRejectionReason('');
    setBlockEmail(false);
    setReapplicationWaitDays(7);
    setSelectedUserId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending users...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">⚠️ Error Loading Users</div>
          <p className="text-gray-600">{error instanceof Error ? error.message : 'Failed to load users'}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Approvals</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review and approve pending user registrations ({pagination?.total_items || 0} pending)
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name, email, username..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="flex items-center gap-4 p-3 bg-primary-50 rounded-md">
            <span className="text-sm font-medium text-primary-900">
              {selectedUsers.size} user(s) selected
            </span>
            <Button
              onClick={() => setShowBulkApprovalModal(true)}
              variant="success"
              size="sm"
            >
              Bulk Approve
            </Button>
            <Button
              onClick={() => setShowBulkRejectionModal(true)}
              variant="danger"
              size="sm"
            >
              Bulk Reject
            </Button>
            <Button onClick={() => setSelectedUsers(new Set())} variant="outline" size="sm">
              Clear Selection
            </Button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('first_name')}
                >
                  User {sortField === 'first_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('email')}
                >
                  Email {sortField === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('created_at')}
                >
                  Registered {sortField === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.user_id)}
                      onChange={() => handleSelectUser(user.user_id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-sm">
                            {user.first_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                        <div className="text-sm text-gray-500">@{user.username || user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-xs text-gray-500">
                      {user.is_verified && '✓ Verified'}
                      {!user.is_verified && '⚠ Not Verified'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatShortDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      onClick={() => handleIndividualApprove(user.user_id)}
                      variant="success"
                      size="sm"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleIndividualReject(user.user_id)}
                      variant="danger"
                      size="sm"
                    >
                      Reject
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {users.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">✓</div>
            <p className="text-gray-500 text-lg mb-2">No pending approvals</p>
            <p className="text-gray-400 text-sm">All users have been processed</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && users.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, pagination.total_items)} of {pagination.total_items} results
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.has_prev}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.has_next}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Approval Modal */}
      {showBulkApprovalModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bulk Approve Users ({selectedUsers.size} users)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Welcome Message (Optional)
                </label>
                <textarea
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  rows={3}
                  placeholder="Welcome! We're excited to have you join our community..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trial Period (Days)
                </label>
                <select
                  value={trialDays}
                  onChange={(e) => setTrialDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {TRIAL_DAYS_OPTIONS.map((days) => (
                    <option key={days} value={days}>
                      {days} days
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trial Benefits
                </label>
                <div className="space-y-2">
                  {['premium_features', 'priority_support', 'unlimited_storage', 'advanced_analytics'].map((benefit) => (
                    <label key={benefit} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={trialBenefits.includes(benefit)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTrialBenefits([...trialBenefits, benefit]);
                          } else {
                            setTrialBenefits(trialBenefits.filter((b) => b !== benefit));
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{benefit.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sendWelcomeEmail}
                    onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Send welcome email</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleBulkApprove}
                  disabled={bulkApproveUsers.isPending}
                  variant="success"
                  className="flex-1"
                >
                  {bulkApproveUsers.isPending ? 'Approving...' : `Approve ${selectedUsers.size} Users`}
                </Button>
                <Button
                  onClick={() => setShowBulkApprovalModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Rejection Modal */}
      {showBulkRejectionModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bulk Reject Users ({selectedUsers.size} users)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason (Required, min 10 characters)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  placeholder="Please provide a reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">{rejectionReason.length}/10 characters</p>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={blockEmail}
                    onChange={(e) => setBlockEmail(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Block email addresses from re-registration</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reapplication Wait Period (Days)
                </label>
                <input
                  type="number"
                  value={reapplicationWaitDays}
                  onChange={(e) => setReapplicationWaitDays(Number(e.target.value))}
                  min="0"
                  max="365"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleBulkReject}
                  disabled={bulkRejectUsers.isPending || rejectionReason.length < 10}
                  variant="danger"
                  className="flex-1"
                >
                  {bulkRejectUsers.isPending ? 'Rejecting...' : `Reject ${selectedUsers.size} Users`}
                </Button>
                <Button
                  onClick={() => setShowBulkRejectionModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Approval Modal */}
      {showIndividualApprovalModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Welcome Message (Optional)
                </label>
                <textarea
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  rows={3}
                  placeholder="Welcome! We're excited to have you..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trial Period (Days)
                </label>
                <select
                  value={trialDays}
                  onChange={(e) => setTrialDays(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {TRIAL_DAYS_OPTIONS.map((days) => (
                    <option key={days} value={days}>
                      {days} days
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trial Benefits
                </label>
                <div className="space-y-2">
                  {['premium_features', 'priority_support', 'unlimited_storage', 'advanced_analytics'].map((benefit) => (
                    <label key={benefit} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={trialBenefits.includes(benefit)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTrialBenefits([...trialBenefits, benefit]);
                          } else {
                            setTrialBenefits(trialBenefits.filter((b) => b !== benefit));
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{benefit.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sendWelcomeEmail}
                    onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Send welcome email</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleApproveUser}
                  disabled={approveUser.isPending}
                  variant="success"
                  className="flex-1"
                >
                  {approveUser.isPending ? 'Approving...' : 'Approve User'}
                </Button>
                <Button
                  onClick={() => {
                    setShowIndividualApprovalModal(false);
                    resetApprovalForm();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Rejection Modal */}
      {showIndividualRejectionModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason (Required, min 10 characters)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  placeholder="Please provide a reason..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">{rejectionReason.length}/10 characters</p>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={blockEmail}
                    onChange={(e) => setBlockEmail(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Block email from re-registration</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reapplication Wait Period (Days)
                </label>
                <input
                  type="number"
                  value={reapplicationWaitDays}
                  onChange={(e) => setReapplicationWaitDays(Number(e.target.value))}
                  min="0"
                  max="365"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleRejectUser}
                  disabled={rejectUser.isPending || rejectionReason.length < 10}
                  variant="danger"
                  className="flex-1"
                >
                  {rejectUser.isPending ? 'Rejecting...' : 'Reject User'}
                </Button>
                <Button
                  onClick={() => {
                    setShowIndividualRejectionModal(false);
                    resetRejectionForm();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
