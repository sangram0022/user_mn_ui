import { useState } from 'react';
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
import Badge from '../../../shared/components/ui/Badge';
import { formatShortDate } from '../../../shared/utils/dateFormatters';
import { logger } from '../../../core/logging';
import { handleError } from '@/core/error/errorHandler';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
import { useToast } from '../../../hooks/useToast';

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
  const toast = useToast();
  const handleStandardError = useStandardErrorHandler();
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

  // Form state
  const [formData, setFormData] = useState<Partial<UpdateUserRequest>>({});
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [approvalMessage, setApprovalMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Initialize form when user data loads
  if (user && Object.keys(formData).length === 0) {
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number || undefined,
      bio: user.bio || undefined,
      date_of_birth: user.date_of_birth || undefined,
      gender: user.gender || undefined,
    });
    setSelectedRoles(user.roles);
  }

  const handleInputChange = (field: keyof UpdateUserRequest, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!userId) return;

    try {
      await updateUser.mutateAsync({
        userId,
        data: formData,
      });
      toast.success('User profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      const result = handleError(err);
      // Use standard error handler for API errors
      handleStandardError(err, {
        context: { operation: 'updateUser', userId, errors: result.context?.errors },
        customMessage: result.userMessage,
      });
      logger().error('Failed to update user', err instanceof Error ? err : null, { userId });
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number || undefined,
        bio: user.bio || undefined,
        date_of_birth: user.date_of_birth || undefined,
        gender: user.gender || undefined,
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
          replace: true,
        },
      });
      toast.success('User roles updated successfully');
    } catch (err) {
      const result = handleError(err);
      // Use standard error handler for API errors
      handleStandardError(err, {
        context: { operation: 'updateRoles', userId, errors: result.context?.errors },
        customMessage: result.userMessage,
      });
      logger().error('Failed to update roles', err instanceof Error ? err : null, { userId });
    }
  };

  const handleApprove = async () => {
    if (!userId) return;

    try {
      await approveUser.mutateAsync({
        userId,
        data: {
          welcome_message: approvalMessage || undefined,
          initial_role: 'user',
          send_welcome_email: true,
        },
      });
      toast.success('User approved successfully');
      setShowApprovalModal(false);
      setApprovalMessage('');
    } catch (err) {
      const result = handleError(err);
      // Use standard error handler for API errors
      handleStandardError(err, {
        context: { operation: 'approveUser', userId, errors: result.context?.errors },
        customMessage: result.userMessage,
      });
      logger().error('Failed to approve user', err instanceof Error ? err : null, { userId });
    }
  };

  const handleReject = async () => {
    if (!userId) return;
    if (rejectionReason.length < 10) {
      alert('Rejection reason must be at least 10 characters');
      return;
    }

    try {
      await rejectUser.mutateAsync({
        userId,
        data: {
          reason: rejectionReason,
          block_email: false,
          reapplication_wait_days: 7,
        },
      });
      toast.success('User rejected');
      setShowRejectionModal(false);
      setRejectionReason('');
    } catch (err) {
      const result = handleError(err);
      // Use standard error handler for API errors
      handleStandardError(err, {
        context: { operation: 'rejectUser', userId, errors: result.context?.errors },
        customMessage: result.userMessage,
      });
      logger().error('Failed to reject user', err instanceof Error ? err : null, { userId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">⚠️ Error Loading User</div>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : 'User not found'}
          </p>
          <Button onClick={() => navigate('/admin/users')} className="mt-4">
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/admin/users')} variant="ghost" size="sm">
            ← Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
            <p className="mt-1 text-sm text-gray-600">View and manage user information</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!user.is_approved && (
            <>
              <Button onClick={() => setShowApprovalModal(true)} variant="primary">
                Approve User
              </Button>
              <Button onClick={() => setShowRejectionModal(true)} variant="danger">
                Reject User
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveProfile}
                    size="sm"
                    disabled={updateUser.isPending}
                  >
                    {updateUser.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-2xl">
                    {user.first_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profile Picture</p>
                  {isEditing && (
                    <Button variant="ghost" size="sm" className="mt-1">
                      Upload New Photo
                    </Button>
                  )}
                </div>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.first_name || ''}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.first_name}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.last_name || ''}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.last_name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900">{user.email}</p>
                    {user.is_verified && (
                      <Badge variant="success" size="sm">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <p className="text-gray-900">@{user.username || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone_number || ''}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    placeholder="+1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.phone_number || 'Not provided'}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.date_of_birth || ''}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">
                    {user.date_of_birth ? formatShortDate(user.date_of_birth) : 'Not provided'}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                {isEditing ? (
                  <select
                    value={formData.gender || ''}
                    onChange={(e) => handleInputChange('gender', e.target.value as Gender)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">
                    {user.gender
                      ? GENDER_OPTIONS.find((g) => g.value === user.gender)?.label
                      : 'Not provided'}
                  </p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.bio || 'No bio provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Role Management Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Role Management</h2>
              <Button
                onClick={handleSaveRoles}
                variant="outline"
                size="sm"
                disabled={assignRoles.isPending || JSON.stringify(selectedRoles) === JSON.stringify(user.roles)}
              >
                {assignRoles.isPending ? 'Saving...' : 'Save Roles'}
              </Button>
            </div>

            <div className="space-y-3">
              {AVAILABLE_ROLES.map((role) => (
                <label key={role} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-900 capitalize">{role}</span>
                </label>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">Current Roles:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {(Array.isArray(user.roles) ? user.roles : []).map((role) => (
                  <Badge key={role} variant="info">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Info */}
        <div className="space-y-6">
          {/* Account Status Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant={user.is_active ? 'success' : 'danger'}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email Verified</p>
                <p className="text-gray-900">{user.is_verified ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-gray-900">{user.is_approved ? 'Yes' : 'Pending'}</p>
              </div>
            </div>
          </div>

          {/* Activity Stats Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Stats</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Last Login</p>
                <p className="text-gray-900">
                  {user.last_login_at ? formatShortDate(user.last_login_at) : 'Never'}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timestamps</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="text-gray-900">{formatShortDate(user.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">User ID</p>
                <p className="text-xs text-gray-500 font-mono">{user.user_id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Welcome Message (Optional)
                </label>
                <textarea
                  value={approvalMessage}
                  onChange={(e) => setApprovalMessage(e.target.value)}
                  rows={4}
                  placeholder="Welcome to our platform! We're excited to have you..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleApprove}
                  disabled={approveUser.isPending}
                  className="flex-1"
                >
                  {approveUser.isPending ? 'Approving...' : 'Approve'}
                </Button>
                <Button
                  onClick={() => setShowApprovalModal(false)}
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

      {/* Rejection Modal */}
      {showRejectionModal && (
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
                  placeholder="Please provide a reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {rejectionReason.length}/10 characters minimum
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleReject}
                  disabled={rejectUser.isPending || rejectionReason.length < 10}
                  variant="danger"
                  className="flex-1"
                >
                  {rejectUser.isPending ? 'Rejecting...' : 'Reject'}
                </Button>
                <Button
                  onClick={() => setShowRejectionModal(false)}
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
