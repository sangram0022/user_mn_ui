import type { FC } from 'react';
import type { Role } from '../types';
import RoleCard from './RoleCard';

interface Props {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onViewUsers: (role: Role) => void;
  onSelectRole: (role: Role) => void;
  selectedRoleId?: string | null;
}

const RolesList: FC<Props> = ({ roles, onEdit, onDelete, onViewUsers, onSelectRole, selectedRoleId }) => {
  return (
    <div className="grid gap-4">
      {roles.map((role) => (
        <div
          key={role.id}
          onClick={(e) => {
            // Ignore clicks that originate from buttons inside the card
            const target = e.target as HTMLElement;
            if (target.closest('button')) return;
            onSelectRole(role);
          }}
          className={selectedRoleId === role.id ? 'ring-2 ring-blue-500 rounded-md' : ''}
        >
          <RoleCard
            role={role}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewUsers={onViewUsers}
          />
        </div>
      ))}
    </div>
  );
};

export default RolesList;
