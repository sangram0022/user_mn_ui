import React from 'react';
import Button from '../../../../shared/components/ui/Button';

interface Props {
  userName: string;
  onBack: () => void;
  onEdit: () => void;
  isEditing: boolean;
}

export default function UserDetailHeader({ userName, onBack, onEdit, isEditing }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
        <p className="text-gray-600">{userName ? `${userName} — Manage profile and permissions` : 'Manage user profile and permissions'}</p>
      </div>
      <div className="flex space-x-3">
        <Button variant="secondary" onClick={onBack}>← Back to Users</Button>
        {!isEditing && (
          <Button variant="primary" onClick={onEdit}>Edit Profile</Button>
        )}
      </div>
    </div>
  );
}
