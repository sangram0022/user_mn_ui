/**
 * User View Page - Beautiful, Read-only User Details
 * Consistent theming with modern card-based layout
 */

import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../hooks';
import Button from '../../../shared/components/ui/Button';
import Badge from '../../../shared/components/ui/Badge';
import { formatShortDate, formatLongDate } from '../../../shared/utils/dateFormatters';
import { formatUserRole } from '../../../shared/utils/textFormatters';

export default function UserViewPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  // Fetch user data
  const { data: user, isLoading, isError, error } = useUser(userId!);

  // Loading State
  if (isLoading) {
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/users')}
            className="mb-4"
          >
            ← Back to Users
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
              <p className="text-gray-600 mt-1">View user information and activity</p>
            </div>
            <Link to={`/admin/users/${userId}/edit`}>
              <Button variant="primary" size="md">
                ✏️ Edit User
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white text-4xl font-bold mb-4 shadow-lg">
                  {initials}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
                <p className="text-gray-500 mt-1">@{user.username || user.email.split('@')[0]}</p>
              </div>

              {/* Status Badges */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Status</span>
                  <Badge variant={user.is_active ? 'success' : 'danger'}>
                    {user.is_active ? '✓ Active' : '✗ Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Verified</span>
                  <Badge variant={user.is_verified ? 'success' : 'warning'}>
                    {user.is_verified ? '✓ Verified' : '⚠ Unverified'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Approval</span>
                  <Badge variant={user.is_approved ? 'success' : 'warning'}>
                    {user.is_approved ? '✓ Approved' : '⏳ Pending'}
                  </Badge>
                </div>
              </div>

              {/* Roles */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Roles</h3>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(user.roles) ? user.roles : []).map((role) => (
                    <Badge key={role} variant="info">
                      {formatUserRole(role)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Link to={`/admin/users/${userId}/edit`} className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    ✏️ Edit Profile
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                  🗑️ Delete User
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Details Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <span className="text-2xl mr-2">📧</span>
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Email Address</label>
                  <p className="text-base text-gray-900 font-medium">{user.email}</p>
                </div>
                {user.phone_number && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Phone Number</label>
                    <p className="text-base text-gray-900 font-medium">{user.phone_number}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Username</label>
                  <p className="text-base text-gray-900 font-medium">@{user.username || 'Not set'}</p>
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
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">First Name</label>
                  <p className="text-base text-gray-900 font-medium">{user.first_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Last Name</label>
                  <p className="text-base text-gray-900 font-medium">{user.last_name}</p>
                </div>
                {user.date_of_birth && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Date of Birth</label>
                    <p className="text-base text-gray-900 font-medium">{formatShortDate(user.date_of_birth)}</p>
                  </div>
                )}
                {user.gender && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Gender</label>
                    <p className="text-base text-gray-900 font-medium capitalize">{user.gender.replace('_', ' ')}</p>
                  </div>
                )}
              </div>
              {user.bio && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-500 mb-2">Bio</label>
                  <p className="text-base text-gray-700 leading-relaxed">{user.bio}</p>
                </div>
              )}
            </div>

            {/* Account Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <span className="text-2xl mr-2">📊</span>
                Account Activity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Member Since</label>
                  <p className="text-base text-gray-900 font-medium">{formatLongDate(user.created_at)}</p>
                </div>
                {user.last_login_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Last Login</label>
                    <p className="text-base text-gray-900 font-medium">{formatLongDate(user.last_login_at)}</p>
                  </div>
                )}
                {user.approved_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Approved On</label>
                    <p className="text-base text-gray-900 font-medium">{formatLongDate(user.approved_at)}</p>
                  </div>
                )}
                {user.approved_by && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Approved By</label>
                    <p className="text-base text-gray-900 font-medium">{user.approved_by}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Account Meta */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <span className="text-2xl mr-2">🔑</span>
                Account Metadata
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">User ID</span>
                  <code className="text-xs bg-gray-100 px-3 py-1 rounded font-mono text-gray-700">
                    {user.user_id}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
