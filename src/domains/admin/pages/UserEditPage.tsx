/**
 * User Edit Page - Beautiful Form for Editing User Details
 * Consistent theming with validation and smooth UX
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser, useUpdateUser } from '../hooks';
import Button from '../../../shared/components/ui/Button';
import Badge from '../../../shared/components/ui/Badge';
import type { UpdateUserRequest, Gender } from '../types';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function UserEditPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  // Fetch user data
  const { data: user, isLoading: isLoadingUser, isError, error } = useUser(userId!);
  const updateUser = useUpdateUser();

  // Form state
  const [formData, setFormData] = useState<Partial<UpdateUserRequest>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        username: user.username,
        phone_number: user.phone_number || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender,
        bio: user.bio || '',
        is_active: user.is_active,
        is_verified: user.is_verified,
        is_approved: user.is_approved,
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof UpdateUserRequest, value: string | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !hasChanges) return;

    try {
      await updateUser.mutateAsync({
        userId,
        data: formData,
      });
      
      // Navigate back to users list after successful update
      navigate('/admin/users', { 
        state: { message: 'User updated successfully!' } 
      });
    } catch (err) {
      console.error('Failed to update user:', err);
      // Error handling is done by the mutation
    }
  };

  const handleCancel = () => {
    navigate('/admin/users');
  };

  // Loading State
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading user details...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (isError || !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading User</h2>
            <p className="text-red-600 mb-6">{error?.message || 'User not found'}</p>
            <Button variant="outline" onClick={() => navigate('/admin/users')}>
              ← Back to Users List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const fullName = `${user.first_name} ${user.last_name}`;
  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="mb-4"
          >
            ← Back to Users
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit User Profile</h1>
              <p className="text-gray-600 mt-1">Update user information and settings</p>
            </div>
            {hasChanges && (
              <Badge variant="warning">Unsaved Changes</Badge>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Overview Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white text-3xl font-bold shadow-lg">
                  {initials}
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
                <p className="text-gray-500 mt-1">@{user.username || user.email.split('@')[0]}</p>
                <div className="flex gap-2 mt-3">
                  <Badge variant={user.is_active ? 'success' : 'danger'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant={user.is_verified ? 'success' : 'warning'}>
                    {user.is_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                  <Badge variant={user.is_approved ? 'success' : 'warning'}>
                    {user.is_approved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-2">👤</span>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  value={formData.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  value={formData.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  value={formData.gender || ''}
                  onChange={(e) => handleInputChange('gender', e.target.value as Gender)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={formData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-2">📧</span>
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  value={formData.phone_number || ''}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="+1 234 567 8900"
                />
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={formData.username || ''}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="username"
                />
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-2">⚙️</span>
              Account Settings
            </h3>
            <div className="space-y-4">
              {/* Active Status */}
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div>
                  <div className="font-medium text-gray-900">Active Status</div>
                  <div className="text-sm text-gray-500">Allow user to log in and access the system</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_active || false}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                />
              </label>

              {/* Email Verified */}
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div>
                  <div className="font-medium text-gray-900">Email Verified</div>
                  <div className="text-sm text-gray-500">Mark user's email as verified</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_verified || false}
                  onChange={(e) => handleInputChange('is_verified', e.target.checked)}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                />
              </label>

              {/* Approved Status */}
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div>
                  <div className="font-medium text-gray-900">Approved</div>
                  <div className="text-sm text-gray-500">Approve user account for full access</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_approved || false}
                  onChange={(e) => handleInputChange('is_approved', e.target.checked)}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                />
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (user) {
                      setFormData({
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        username: user.username,
                        phone_number: user.phone_number || '',
                        date_of_birth: user.date_of_birth || '',
                        gender: user.gender,
                        bio: user.bio || '',
                        is_active: user.is_active,
                        is_verified: user.is_verified,
                        is_approved: user.is_approved,
                      });
                      setHasChanges(false);
                    }
                  }}
                  disabled={!hasChanges}
                >
                  Reset Changes
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!hasChanges || updateUser.isPending}
                >
                  {updateUser.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">💾</span>
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
