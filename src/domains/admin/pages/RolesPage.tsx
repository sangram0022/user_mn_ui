/**
 * RolesPage Component (Refactored)
 * Admin page for managing roles and permissions
 * 
 * REFACTORED: Extracted components and business logic
 * - useRoleManagement: Business logic and state management
 * - RoleFormModal: Create/Edit role form
 * - DeleteRoleModal: Delete confirmation
 * - RoleFilters: Search and filter UI
 * - RoleTable: Role list display
 * - Pagination: Page navigation
 */

import { useRoleManagement } from '../hooks/useRoleManagement';
import RoleFormModal from '../components/RoleFormModal';
import DeleteRoleModal from '../components/DeleteRoleModal';
import RoleFilters from '../components/RoleFilters';
import RoleTable from '../components/RoleTable';
import Pagination from '../components/Pagination';
import Button from '@/shared/components/ui/Button';

export default function RolesPage() {
  const {
    // Data
    roles,
    pagination,
    isLoading,
    isError,
    error,

    // Filter state
    searchTerm,
    levelFilter,
    sortField,
    sortOrder,

    // Modal state
    showCreateModal,
    showEditModal,
    showDeleteModal,
    selectedRole,

    // Form state
    formData,
    setFormData,

    // Handlers
    handleSearch,
    handleSort,
    setCurrentPage,
    setLevelFilter,
    setShowCreateModal,
    setShowEditModal,
    setShowDeleteModal,
    openEditModal,
    openDeleteModal,
    handleCreateRole,
    handleEditRole,
    handleDeleteRole,
  } = useRoleManagement();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-gray-500">Loading roles...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h3 className="mb-2 text-lg font-semibold text-red-800">Error Loading Roles</h3>
        <p className="text-red-600">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="mt-1 text-gray-600">Manage system roles and their permissions</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="lg">
          Create Role
        </Button>
      </div>

      {/* Filters */}
      <RoleFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        levelFilter={levelFilter}
        onLevelFilterChange={setLevelFilter}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortChange={handleSort}
      />

      {/* Role Table */}
      <RoleTable roles={roles} onEdit={openEditModal} onDelete={openDeleteModal} />

      {/* Pagination */}
      {roles.length > 0 && (
        <div className="mt-6">
          <Pagination pagination={pagination} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Create/Edit Modal */}
      <RoleFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRole}
        formData={formData}
        setFormData={setFormData}
        mode="create"
      />

      <RoleFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditRole}
        formData={formData}
        setFormData={setFormData}
        mode="edit"
      />

      {/* Delete Modal */}
      <DeleteRoleModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteRole}
        roleName={selectedRole}
      />
    </div>
  );
}
