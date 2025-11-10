import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useUser,
  useUpdateUser,
  useAssignRoles,
  useApproveUser,
  useRejectUser,
} from '../hooks';
import type { UpdateUserRequest } from '../types';
import UserDetailHeader from './user-detail/components/UserDetailHeader';
import ProfileForm from './user-detail/components/ProfileForm';
import RolesSection from './user-detail/components/RolesSection';
import UserActions from './user-detail/components/UserActions';
import ApprovalModal from './user-detail/components/ApprovalModal';
import RejectionModal from './user-detail/components/RejectionModal';
import { AVAILABLE_ROLES } from './user-detail/utils';
import { useUserEditForm } from '../../../core/validation';
import { logger } from '../../../core/logging';

export default function UserDetailPageRefactored() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  const { data: user, isLoading, isError, error } = useUser(userId!);

  const updateUser = useUpdateUser();
  const assignRoles = useAssignRoles();
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [approvalMessage, setApprovalMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const form = useUserEditForm({
    onSuccess: async (data) => {
      if (!userId) return;
      try {
        await updateUser.mutateAsync({ userId, data: data as UpdateUserRequest });
        setIsEditing(false);
      } catch (err) {
        logger().error('Failed to update user', err instanceof Error ? err : new Error(String(err)), { userId });
      }
    },
    onError: (error) => {
      logger().error('User edit form error', error instanceof Error ? error : new Error(String(error)));
    }
  });

  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
        phone_number: user.phone_number || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || undefined,
        bio: user.bio || '',
        is_active: user.is_active ?? true,
        is_verified: user.is_verified ?? false,
        is_approved: user.is_approved ?? false,
      });
      setSelectedRoles(user.roles || []);
    }
  }, [user, form]);

  const handleCancelEdit = () => {
    if (user) {
      form.reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
        phone_number: user.phone_number || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || undefined,
        bio: user.bio || '',
        is_active: user.is_active ?? true,
        is_verified: user.is_verified ?? false,
        is_approved: user.is_approved ?? false,
      });
    }
    setIsEditing(false);
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);
  };

  const handleSaveRoles = async () => {
    if (!userId) return;
    try {
      await assignRoles.mutateAsync({ userId, data: { roles: selectedRoles, replace: true } });
    } catch (err) {
      logger().error('Failed to assign roles', err instanceof Error ? err : new Error(String(err)), { userId, roles: selectedRoles });
    }
  };

  const handleApproveUser = async () => {
    if (!userId) return;
    try {
      await approveUser.mutateAsync({ userId, data: approvalMessage.trim() ? { welcome_message: approvalMessage.trim(), send_welcome_email: true } : undefined });
      setShowApprovalModal(false);
      setApprovalMessage('');
    } catch (err) {
      logger().error('Failed to approve user', err instanceof Error ? err : new Error(String(err)), { userId });
    }
  };

  const handleRejectUser = async () => {
    if (!userId) return;
    try {
      await rejectUser.mutateAsync({ userId, data: { reason: rejectionReason.trim(), send_notification: true } });
      setShowRejectionModal(false);
      setRejectionReason('');
    } catch (err) {
      logger().error('Failed to reject user', err instanceof Error ? err : new Error(String(err)), { userId });
    }
  };

  if (isLoading) return (<div className="flex items-center justify-center min-h-96"><div className="text-lg text-gray-600">Loading user details...</div></div>);
  if (isError || !user) return (<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"><h3 className="font-bold">Error loading user</h3><p>{String(error) || 'User not found'}</p></div>);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <UserDetailHeader userName={`${user.first_name} ${user.last_name}`} onBack={() => navigate('/admin/users')} onEdit={() => setIsEditing(true)} isEditing={isEditing} />

      <div className="flex flex-wrap gap-2">
        {/* Status badges kept inline for now */}
        {/* ... */}
      </div>

  <ProfileForm form={form} isEditing={isEditing} onCancel={handleCancelEdit} />

      <RolesSection availableRoles={AVAILABLE_ROLES} selectedRoles={selectedRoles} onToggle={handleRoleToggle} onSave={handleSaveRoles} saving={assignRoles.isPending} />

      <UserActions onApprove={() => setShowApprovalModal(true)} onReject={() => setShowRejectionModal(true)} approving={approveUser.isPending} rejecting={rejectUser.isPending} isApproved={user.is_approved} />

      <ApprovalModal visible={showApprovalModal} message={approvalMessage} onChange={setApprovalMessage} onCancel={() => setShowApprovalModal(false)} onConfirm={handleApproveUser} loading={approveUser.isPending} />

      <RejectionModal visible={showRejectionModal} reason={rejectionReason} onChange={setRejectionReason} onCancel={() => setShowRejectionModal(false)} onConfirm={handleRejectUser} loading={rejectUser.isPending} />
    </div>
  );
}
