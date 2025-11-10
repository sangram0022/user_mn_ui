/**
 * useRoleManagement Hook
 * Manages role CRUD operations and form state
 */

import { useState } from 'react';
import {
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useRoleList,
} from './index';
import type { UpdateRoleRequest } from '../types';
import { logger } from '@/core/logging';

export interface RoleFormData {
  role_name: string;
  display_name: string;
  description: string;
  level: number;
  permissions: string[]; // "resource:action" format
}

interface UseRoleManagementOptions {
  pageSize?: number;
}

export function useRoleManagement(options: UseRoleManagementOptions = {}) {
  const { pageSize = 10 } = options;

  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<{ min?: number; max?: number }>({});
  const [sortField, setSortField] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<RoleFormData>({
    role_name: '',
    display_name: '',
    description: '',
    level: 50,
    permissions: [],
  });

  // API hooks
  const { data: rolesData, isLoading, isError, error } = useRoleList({
    include_permissions: true,
    include_users_count: true,
  });

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  // Helper: Convert string permissions to API format
  const convertPermissionsToAPIFormat = (permissions: string[]) => {
    const permissionsMap = new Map<string, Set<string>>();
    permissions.forEach((perm) => {
      const [resource, action] = perm.split(':');
      if (!permissionsMap.has(resource)) {
        permissionsMap.set(resource, new Set());
      }
      permissionsMap.get(resource)?.add(action);
    });

    return Array.from(permissionsMap.entries()).map(([resource, actions]) => ({
      resource,
      actions: Array.from(actions),
    }));
  };

  // Helper: Convert API permissions to string format
  const convertPermissionsFromAPIFormat = (permissions: Array<{ resource: string; actions: string[] }>) => {
    const result: string[] = [];
    permissions.forEach((perm) => {
      perm.actions.forEach((action) => {
        result.push(`${perm.resource}:${action}`);
      });
    });
    return result;
  };

  // Client-side filtering and pagination
  const getFilteredRoles = () => {
    let filtered = rolesData?.roles || [];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (role) =>
          role.role_name.toLowerCase().includes(searchLower) ||
          role.display_name.toLowerCase().includes(searchLower)
      );
    }

    // Level filter
    if (levelFilter.min !== undefined) {
      filtered = filtered.filter((role) => role.level >= levelFilter.min!);
    }
    if (levelFilter.max !== undefined) {
      filtered = filtered.filter((role) => role.level <= levelFilter.max!);
    }

    // Sorting
    filtered = [...filtered].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      if (sortField === 'name') {
        aVal = a.role_name;
        bVal = b.role_name;
      } else if (sortField === 'level') {
        aVal = a.level;
        bVal = b.level;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    return filtered;
  };

  const filteredRoles = getFilteredRoles();
  const totalItems = filteredRoles.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const roles = filteredRoles.slice(startIndex, startIndex + pageSize);

  const pagination = {
    page: currentPage,
    page_size: pageSize,
    total_items: totalItems,
    total_pages: totalPages,
    has_prev: currentPage > 1,
    has_next: currentPage < totalPages,
  };

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

  const resetForm = () => {
    setFormData({
      role_name: '',
      display_name: '',
      description: '',
      level: 50,
      permissions: [],
    });
  };

  const handleCreateRole = async () => {
    if (!formData.role_name || !formData.display_name) {
      throw new Error('Role name and display name are required');
    }

    if (formData.role_name.length < 2 || formData.role_name.length > 50) {
      throw new Error('Role name must be between 2 and 50 characters');
    }

    const permissions = convertPermissionsToAPIFormat(formData.permissions);

    try {
      await createRole.mutateAsync({
        role_name: formData.role_name,
        display_name: formData.display_name,
        description: formData.description || undefined,
        level: formData.level,
        permissions,
      });
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      logger().error(
        'Failed to create role',
        err instanceof Error ? err : new Error(String(err)),
        { roleName: formData.role_name }
      );
      throw err;
    }
  };

  const handleEditRole = async () => {
    if (!selectedRole) return;

    const permissions = convertPermissionsToAPIFormat(formData.permissions);

    const updateData: UpdateRoleRequest = {
      display_name: formData.display_name,
      description: formData.description,
      level: formData.level,
      permissions,
    };

    try {
      await updateRole.mutateAsync({ roleName: selectedRole, data: updateData });
      setShowEditModal(false);
      resetForm();
      setSelectedRole(null);
    } catch (err) {
      logger().error(
        'Failed to update role',
        err instanceof Error ? err : new Error(String(err)),
        { roleName: selectedRole }
      );
      throw err;
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      await deleteRole.mutateAsync({ roleName: selectedRole });
      setShowDeleteModal(false);
      setSelectedRole(null);
    } catch (err) {
      logger().error(
        'Failed to delete role',
        err instanceof Error ? err : new Error(String(err)),
        { roleName: selectedRole }
      );
      throw err;
    }
  };

  const openEditModal = (roleName: string) => {
    const role = rolesData?.roles.find((r) => r.role_name === roleName);
    if (!role) return;

    setSelectedRole(roleName);
    setFormData({
      role_name: role.role_name,
      display_name: role.display_name,
      description: role.description || '',
      level: role.level,
      permissions: convertPermissionsFromAPIFormat(role.permissions || []),
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (roleName: string) => {
    setSelectedRole(roleName);
    setShowDeleteModal(true);
  };

  return {
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
    resetForm,
  };
}
