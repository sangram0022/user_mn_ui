import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useUser,
  useUpdateUser,
  useAssignRoles,
  useApproveUser,
  useRejectUser,
} from '../hooks';
import type { Gender, UpdateUserRequest } from '../types';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import Badge from '../../../shared/components/ui/Badge';
import { useUserEditForm } from '../../../core/validation';
import { formatShortDate } from '../../../shared/utils/dateFormatters';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const AVAILABLE_ROLES = ['user', 'admin', 'moderator', 'support'];

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  // Fetch user data
  const { data: user, isLoading, isError, error } = useUser(userId!);

  // Mutations
  const updateUser = useUpdateUser();
  const assignRoles = useAssignRoles();
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();

  // Form state for roles and other actions
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [approvalMessage, setApprovalMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // React Hook Form for user profile editing
  const form = useUserEditForm({
    onSuccess: async (data) => {
      if (!userId) return;
      
      try {
        await updateUser.mutateAsync({
          userId,
          data: data as UpdateUserRequest,
        });
        setIsEditing(false);
      } catch (err) {
        console.error('Failed to update user:', err);
      }
    },
    onError: (error) => {
      console.error('User edit form error:', error);
    }
  });

  // Initialize form when user data loads
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
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSaveRoles = async () => {
    if (!userId) return;

    try {
      await assignRoles.mutateAsync({ 
        userId, 
        data: { 
          roles: selectedRoles,
          replace: true
        }
      });
    } catch (err) {
      console.error('Failed to assign roles:', err);
    }
  };

  const handleApproveUser = async () => {
    if (!userId) return;

    try {
      await approveUser.mutateAsync({
        userId,
        data: approvalMessage.trim() ? {
          welcome_message: approvalMessage.trim(),
          send_welcome_email: true
        } : undefined,
      });
      setShowApprovalModal(false);
      setApprovalMessage('');
    } catch (err) {
      console.error('Failed to approve user:', err);
    }
  };

  const handleRejectUser = async () => {
    if (!userId) return;

    try {
      await rejectUser.mutateAsync({
        userId,
        data: {
          reason: rejectionReason.trim(),
          send_notification: true
        }
      });
      setShowRejectionModal(false);
      setRejectionReason('');
    } catch (err) {
      console.error('Failed to reject user:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg text-gray-600">Loading user details...</div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <h3 className="font-bold">Error loading user</h3>
        <p>{error?.message || 'User not found'}</p>
        <Button
          variant="secondary"
          className="mt-3"
          onClick={() => navigate('/admin/users')}
        >
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
          <p className="text-gray-600">Manage user profile and permissions</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/users')}
          >
            ← Back to Users
          </Button>
          {!isEditing && (
            <Button
              variant="primary"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* User Status Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant={user.is_active ? 'success' : 'danger'}>
          {user.is_active ? 'Active' : 'Inactive'}
        </Badge>
        <Badge variant={user.is_verified ? 'success' : 'warning'}>
          {user.is_verified ? 'Verified' : 'Unverified'}
        </Badge>
        <Badge variant={user.is_approved ? 'success' : 'warning'}>
          {user.is_approved ? 'Approved' : 'Pending Approval'}
        </Badge>
      </div>

      {/* User Profile Form */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
        </div>
        
        <form onSubmit={form.handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              {isEditing ? (
                <Input
                  {...form.register('first_name')}
                  error={form.formState.errors.first_name?.message}
                  disabled={form.formState.isSubmitting}
                />
              ) : (
                <p className="py-2 text-gray-900">{user.first_name}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              {isEditing ? (
                <Input
                  {...form.register('last_name')}
                  error={form.formState.errors.last_name?.message}
                  disabled={form.formState.isSubmitting}
                />
              ) : (
                <p className="py-2 text-gray-900">{user.last_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  {...form.register('email')}
                  error={form.formState.errors.email?.message}
                  disabled={form.formState.isSubmitting}
                />
              ) : (
                <p className="py-2 text-gray-900">{user.email}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              {isEditing ? (
                <Input
                  {...form.register('username')}
                  error={form.formState.errors.username?.message}
                  disabled={form.formState.isSubmitting}
                />
              ) : (
                <p className="py-2 text-gray-900">{user.username || 'N/A'}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <Input
                  type="tel"
                  {...form.register('phone_number')}
                  error={form.formState.errors.phone_number?.message}
                  disabled={form.formState.isSubmitting}
                />
              ) : (
                <p className="py-2 text-gray-900">{user.phone_number || 'N/A'}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth
              </label>
              {isEditing ? (
                <Input
                  type="date"
                  {...form.register('date_of_birth')}
                  error={form.formState.errors.date_of_birth?.message}
                  disabled={form.formState.isSubmitting}
                />
              ) : (
                <p className="py-2 text-gray-900">
                  {user.date_of_birth ? formatShortDate(user.date_of_birth) : 'N/A'}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              {isEditing ? (
                <select
                  {...form.register('gender')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={form.formState.isSubmitting}
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="py-2 text-gray-900">
                  {user.gender ? GENDER_OPTIONS.find(opt => opt.value === user.gender)?.label : 'N/A'}
                </p>
              )}
              {form.formState.errors.gender && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.gender.message}</p>
              )}
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  {...form.register('bio')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={form.formState.isSubmitting}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="py-2 text-gray-900 whitespace-pre-wrap">
                  {user.bio || 'No bio provided'}
                </p>
              )}
              {form.formState.errors.bio && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.bio.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          {isEditing && (
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelEdit}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={form.formState.isSubmitting || updateUser.isPending}
                loading={form.formState.isSubmitting || updateUser.isPending}
              >
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Roles Section */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">User Roles</h2>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveRoles}
            disabled={assignRoles.isPending}
            loading={assignRoles.isPending}
          >
            Save Roles
          </Button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AVAILABLE_ROLES.map((role) => (
              <label key={role} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role)}
                  onChange={() => handleRoleToggle(role)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 capitalize">{role}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* User Actions */}
      {!user.is_approved && (
        <div className="bg-white shadow-sm rounded-lg border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">User Actions</h2>
          </div>
          
          <div className="p-6 flex space-x-4">
            <Button
              variant="primary"
              onClick={() => setShowApprovalModal(true)}
              disabled={approveUser.isPending}
            >
              Approve User
            </Button>
            <Button
              variant="danger"
              onClick={() => setShowRejectionModal(true)}
              disabled={rejectUser.isPending}
            >
              Reject User
            </Button>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Approve User</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to approve this user? You can optionally add a message.
            </p>
            <textarea
              value={approvalMessage}
              onChange={(e) => setApprovalMessage(e.target.value)}
              placeholder="Optional approval message..."
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
              rows={3}
            />
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowApprovalModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleApproveUser}
                loading={approveUser.isPending}
              >
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Reject User</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this user.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
              rows={3}
              required
            />
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowRejectionModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleRejectUser}
                disabled={!rejectionReason.trim()}
                loading={rejectUser.isPending}
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}