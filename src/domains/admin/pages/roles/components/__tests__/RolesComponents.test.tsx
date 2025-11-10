import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';

import RolesFilters from '../RolesFilters';
import RolesStats from '../RolesStats';
import RolesList from '../RolesList';
import type { Role } from '../../types';

describe('Roles presentational components', () => {
  it('renders RolesFilters and responds to placeholders', () => {
    render(
      <RolesFilters searchTerm="" onSearchChange={() => {}} sortBy="level" onSortChange={() => {}} />
    );

    expect(screen.getByPlaceholderText(/Search roles/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders RolesStats with counts', () => {
    render(
      <RolesStats totalRoles={5} totalPermissions={20} totalUsersWithRoles={120} permissionCategories={4} />
    );

    expect(screen.getByText('Total Roles')).toBeInTheDocument();
    expect(screen.getByText('Available Permissions')).toBeInTheDocument();
    expect(screen.getByText('Users with Roles')).toBeInTheDocument();
    expect(screen.getByText('Permission Categories')).toBeInTheDocument();
  });

  it('renders RolesList and shows items', () => {
    const roles: Role[] = [
      {
        id: 'r1',
        name: 'Admin',
        description: 'Admin role',
        level: 1,
        color: 'blue',
        permissions: [],
        userCount: 2,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'r2',
        name: 'User',
        description: 'User role',
        level: 5,
        color: 'gray',
        permissions: [],
        userCount: 100,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    render(
      <RolesList
        roles={roles}
        onEdit={() => {}}
        onDelete={() => {}}
        onViewUsers={() => {}}
        onSelectRole={() => {}}
        selectedRoleId={null}
      />
    );

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });
});
