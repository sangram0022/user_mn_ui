/**
 * UserApprovalPage Component (Refactored)
 * Main orchestration page for user approval workflow
 * 
 * Reduced from 759 lines to ~180 lines by extracting:
 * - Business logic → useUserApprovalManagement hook
 * - Table UI → PendingUsersTable component
 * - Modal UI → UserApprovalModal, UserRejectionModal components
 */

import { useUserApprovalManagement } from '../hooks/useUserApprovalManagement';
import PendingUsersTable from '../components/PendingUsersTable';
import UserApprovalModal from '../components/UserApprovalModal';
import UserRejectionModal from '../components/UserRejectionModal';
import Pagination from './Pagination';
import Button from '@/shared/components/ui/Button';

export default function UserApprovalPage() {
  const {
    // Data
    users,
    pagination,
    isLoading,
    isError,
    error,
    
    // Search & Sort
    searchTerm,
    sortField,
    sortOrder,
    handleSearch,
    handleSort,
    handlePageChange,
    
    // Selection
    selectedUsers,
    handleSelectUser,
    handleSelectAll,
    
    // Modals
    showApprovalModal,
    setShowApprovalModal,
    showRejectionModal,
    setShowRejectionModal,
    showBulkApprovalModal,
    setShowBulkApprovalModal,
    showBulkRejectionModal,
    setShowBulkRejectionModal,
    
    // Forms
    approvalForm,
    setApprovalForm,
    rejectionForm,
    setRejectionForm,
    resetApprovalForm,
    resetRejectionForm,
    
    // Actions
    handleApproveUser,
    handleRejectUser,
    handleBulkApprove,
    handleBulkReject,
    handleIndividualApprove,
    handleIndividualReject,
  } = useUserApprovalManagement();

  // Stats
  const pendingCount = pagination?.total_items || 0;
  const selectedCount = selectedUsers.size;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">User Approvals</h1>
        <p className="text-gray-600">Review and approve pending user registrations</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
          <div className="text-sm text-blue-800">Pending Approvals</div>
        </div>
        <div className="rounded-lg bg-green-50 p-4">
          <div className="text-2xl font-bold text-green-600">{selectedCount}</div>
          <div className="text-sm text-green-800">Selected Users</div>
        </div>
        <div className="rounded-lg bg-purple-50 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {pagination?.page || 1}/{pagination?.total_pages || 1}
          </div>
          <div className="text-sm text-purple-800">Current Page</div>
        </div>
      </div>

      {/* Search & Bulk Actions Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-4 shadow">
        {/* Search */}
        <div className="flex-1 min-w-[250px]">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name, email, or username..."
            className="w-full rounded border border-gray-300 px-4 py-2"
          />
        </div>

        {/* Bulk Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowBulkApprovalModal(true)}
            disabled={selectedCount === 0}
            variant="success"
          >
            Approve Selected ({selectedCount})
          </Button>
          <Button
            onClick={() => setShowBulkRejectionModal(true)}
            disabled={selectedCount === 0}
            variant="danger"
          >
            Reject Selected ({selectedCount})
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-gray-600">Loading pending users...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="rounded-lg bg-red-50 p-6 text-center shadow">
          <div className="mb-4 text-4xl">❌</div>
          <p className="mb-2 font-medium text-red-800">Failed to load users</p>
          <p className="text-sm text-red-600">{error?.message || 'Unknown error'}</p>
        </div>
      )}

      {/* Users Table */}
      {!isLoading && !isError && (
        <>
          <PendingUsersTable
            users={users}
            selectedUsers={selectedUsers}
            sortField={sortField}
            sortOrder={sortOrder}
            onSelectAll={handleSelectAll}
            onSelectUser={handleSelectUser}
            onSort={handleSort}
            onApprove={handleIndividualApprove}
            onReject={handleIndividualReject}
          />

          {/* Pagination */}
          {pagination && pagination.total_pages > 1 && (
            <div className="mt-6">
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Individual Approval Modal */}
      <UserApprovalModal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          resetApprovalForm();
        }}
        onApprove={handleApproveUser}
        formData={approvalForm}
        setFormData={setApprovalForm}
        isBulk={false}
        userCount={1}
      />

      {/* Individual Rejection Modal */}
      <UserRejectionModal
        isOpen={showRejectionModal}
        onClose={() => {
          setShowRejectionModal(false);
          resetRejectionForm();
        }}
        onReject={handleRejectUser}
        formData={rejectionForm}
        setFormData={setRejectionForm}
        isBulk={false}
        userCount={1}
      />

      {/* Bulk Approval Modal */}
      <UserApprovalModal
        isOpen={showBulkApprovalModal}
        onClose={() => {
          setShowBulkApprovalModal(false);
          resetApprovalForm();
        }}
        onApprove={handleBulkApprove}
        formData={approvalForm}
        setFormData={setApprovalForm}
        isBulk={true}
        userCount={selectedCount}
      />

      {/* Bulk Rejection Modal */}
      <UserRejectionModal
        isOpen={showBulkRejectionModal}
        onClose={() => {
          setShowBulkRejectionModal(false);
          resetRejectionForm();
        }}
        onReject={handleBulkReject}
        formData={rejectionForm}
        setFormData={setRejectionForm}
        isBulk={true}
        userCount={selectedCount}
      />
    </div>
  );
}
