import type { FC } from 'react';
import { startTransition, useActionState, useCallback, useEffect, useId, useState } from 'react';

import { useNavigate } from '@hooks/useNavigate';
import { useToast } from '@hooks/useToast';
import { apiClient } from '@lib/api/client';
import { PageMetadata } from '@shared/components/PageMetadata';
import type { UserProfile as BaseUserProfile } from '@shared/types';
import Breadcrumb from '@shared/ui/Breadcrumb';
import { formatDate } from '@shared/utils';
import { prefetchRoute } from '@shared/utils/resource-loading';
import {
  Bell,
  Camera,
  CheckCircle,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Loader,
  MapPin,
  Save,
  Settings,
  Shield,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useAuth } from '../../auth';
import { GDPRAccountDeletion } from '../components/GDPRAccountDeletion';
import { GDPRDataExport } from '../components/GDPRDataExport';

type ApiUserProfile = BaseUserProfile & {
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  social_links?: {
    linkedin?: string | null;
    twitter?: string | null;
    github?: string | null;
  } | null;
};

interface SecuritySettings {
  two_factor_enabled: boolean;
  last_password_change: string;
  active_sessions: number;
}

// Server action for profile update
interface ProfileUpdateState {
  success: boolean;
  error: string | null;
}

async function updateProfileAction(
  _prevState: ProfileUpdateState,
  formData: FormData
): Promise<ProfileUpdateState> {
  const full_name = formData.get('full_name') as string;
  const username = formData.get('username') as string;
  const bio = formData.get('bio') as string;
  const location = formData.get('location') as string;
  const website = formData.get('website') as string;
  const linkedin = formData.get('linkedin') as string;
  const twitter = formData.get('twitter') as string;
  const github = formData.get('github') as string;

  try {
    await apiClient.updateUserProfile({
      full_name,
      username,
      bio,
      location,
      website,
      social_links: {
        linkedin,
        twitter,
        github,
      },
    } as Partial<ApiUserProfile>);

    return { success: true, error: null };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
    return { success: false, error: errorMessage };
  }
}

// Server action for password change
interface PasswordChangeState {
  success: boolean;
  error: string | null;
}

async function changePasswordAction(
  _prevState: PasswordChangeState,
  formData: FormData
): Promise<PasswordChangeState> {
  const current_password = formData.get('current_password') as string;
  const new_password = formData.get('new_password') as string;
  const confirm_password = formData.get('confirm_password') as string;

  // Validation
  if (new_password !== confirm_password) {
    return { success: false, error: 'New passwords do not match' };
  }

  if (new_password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long' };
  }

  try {
    const response = await apiClient.changePassword({
      current_password,
      new_password,
      confirm_password,
    });

    if (response.success !== false) {
      return { success: true, error: null };
    } else {
      return { success: false, error: response.message || 'Failed to change password' };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
    return { success: false, error: errorMessage };
  }
}

const ProfilePage: FC = () => {
  const { refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ApiUserProfile | null>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'privacy'>(
    'profile'
  );

  // Use React 19's useActionState for profile update
  const [profileState, submitProfileAction, isProfilePending] = useActionState(
    updateProfileAction,
    {
      success: false,
      error: null,
    }
  );

  // Use React 19's useActionState for password change
  const [passwordState, submitPasswordAction, isPasswordPending] = useActionState(
    changePasswordAction,
    {
      success: false,
      error: null,
    }
  );

  const fullNameInputId = useId();
  const usernameInputId = useId();
  const bioInputId = useId();
  const locationInputId = useId();
  const websiteInputId = useId();
  const currentPasswordInputId = useId();
  const newPasswordInputId = useId();
  const confirmPasswordInputId = useId();

  // Form state for editing
  const [editForm, setEditForm] = useState({
    full_name: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    social_links: {
      linkedin: '',
      twitter: '',
      github: '',
    },
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Load profile data
  // ? FIXED: Wrapped with useCallback to prevent infinite re-renders
  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);

      const profileData = (await apiClient.getUserProfile()) as ApiUserProfile;
      setProfile(profileData);

      // Initialize edit form with current data
      setEditForm({
        full_name: profileData.full_name || '',
        username: profileData.username || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        website: profileData.website || '',
        social_links: {
          linkedin: profileData.social_links?.linkedin || '',
          twitter: profileData.social_links?.twitter || '',
          github: profileData.social_links?.github || '',
        },
      });

      // Mock security settings for now
      setSecuritySettings({
        two_factor_enabled: false,
        last_password_change: '2024-01-15T10:30:00Z',
        active_sessions: 2,
      });
    } catch {
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  }, [toast]); // Only depends on stable toast reference

  // Prefetch likely next routes for improved navigation performance
  useEffect(() => {
    prefetchRoute('/settings');
    prefetchRoute('/dashboard');
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]); // ? Now safe - loadProfile is memoized

  // Handle successful profile update
  useEffect(() => {
    if (profileState.success) {
      setSuccess('Profile updated successfully!');
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      loadProfile(); // ? Safe to call - loadProfile is now memoized
      refreshProfile();
      setTimeout(() => setSuccess(''), 3000);
    } else if (profileState.error) {
      toast.error(profileState.error);
    }
  }, [profileState.success, profileState.error, loadProfile, refreshProfile, toast]);

  // Handle successful password change
  useEffect(() => {
    if (passwordState.success) {
      setSuccess('Password changed successfully!');
      toast.success('Password changed successfully!');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setTimeout(() => setSuccess(''), 3000);
    } else if (passwordState.error) {
      toast.error(passwordState.error);
    }
  }, [passwordState.success, passwordState.error, toast]);

  // Save profile changes
  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDataObj = new FormData(e.currentTarget);
    // React 19: Wrap in startTransition to avoid warnings
    startTransition(() => {
      submitProfileAction(formDataObj);
    });
  };

  // Change password
  const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDataObj = new FormData(e.currentTarget);
    // React 19: Wrap in startTransition to avoid warnings
    startTransition(() => {
      submitPasswordAction(formDataObj);
    });
  };

  // Render tab functions
  const renderPrivacyTab = () => (
    <div className="p-6 space-y-6">
      {/* GDPR Data Export */}
      <GDPRDataExport />

      {/* GDPR Account Deletion */}
      <GDPRAccountDeletion
        onDeleteSuccess={() => {
          // Logout and redirect to home
          navigate('/');
        }}
      />
    </div>
  );

  // Determine tab content
  let tabContent = null;
  switch (activeTab) {
    case 'profile':
      tabContent = renderProfileTab();
      break;
    case 'security':
      tabContent = renderSecurityTab();
      break;
    case 'preferences':
      tabContent = renderPreferencesTab();
      break;
    case 'privacy':
      tabContent = renderPrivacyTab();
      break;
  }

  function renderProfileTab() {
    return (
      <div className="p-6">
        {/* Profile Header */}
        <div className="mb-8 flex items-center gap-6 border-b border-[var(--color-border)] pb-6">
          {/* Avatar */}
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)]">
            <UserIcon className="h-10 w-10 text-[var(--color-text-primary)]" aria-hidden="true" />
            <button
              className="absolute bottom-0 right-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-[var(--color-border)] bg-[var(--color-success)]"
              aria-label="Change profile picture"
            >
              <Camera className="h-3 w-3 text-[var(--color-text-primary)]" aria-hidden="true" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h2 className="mb-1 text-2xl font-bold text-[var(--color-text-primary)]">
              {profile?.full_name || profile?.username || 'User'}
            </h2>
            <p className="mb-2 text-sm text-[var(--color-text-tertiary)]">{profile?.email}</p>
            <div className="flex items-center gap-4">
              <span className="badge badge-verified animate-bounce-subtle">Verified</span>
              <span className="text-xs text-[var(--color-text-tertiary)]">
                Member since {formatDate(profile?.created_at || '')}
              </span>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
              isEditing
                ? 'border-[var(--color-error)] bg-[var(--color-surface-primary)] text-[var(--color-error)] hover:bg-[var(--color-error-light)]'
                : 'border-[var(--color-primary)] bg-[var(--color-surface-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]'
            }`}
            aria-label={isEditing ? 'Cancel editing profile' : 'Edit profile'}
          >
            {isEditing ? (
              <>
                <X className="icon-sm" aria-hidden="true" />
                Cancel
              </>
            ) : (
              <>
                <Edit3 className="icon-sm" aria-hidden="true" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        {/* Profile Form */}
        <div className="grid grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            {isEditing ? (
              <>
                <label
                  htmlFor={fullNameInputId}
                  className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
                >
                  Full Name
                </label>
                <input
                  id={fullNameInputId}
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, full_name: e.target.value }))}
                  className="w-full rounded-lg border border-[color:var(--color-border-primary)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
                  placeholder="Enter your full name"
                />
              </>
            ) : (
              <div role="group" aria-labelledby={`${fullNameInputId}-label`}>
                <p
                  id={`${fullNameInputId}-label`}
                  className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
                >
                  Full Name
                </p>
                <p className="m-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)]">
                  {profile?.full_name || 'Not specified'}
                </p>
              </div>
            )}
          </div>

          {/* Username */}
          <div>
            {isEditing ? (
              <>
                <label
                  htmlFor={usernameInputId}
                  className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
                >
                  Username
                </label>
                <input
                  id={usernameInputId}
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))}
                  className="w-full rounded-lg border border-[color:var(--color-border-primary)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
                  placeholder="Enter your username"
                />
              </>
            ) : (
              <div role="group" aria-labelledby={`${usernameInputId}-label`}>
                <p
                  id={`${usernameInputId}-label`}
                  className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
                >
                  Username
                </p>
                <p className="m-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)]">
                  {profile?.username || 'Not specified'}
                </p>
              </div>
            )}
          </div>

          {/* Bio - Full Width */}
          <div className="col-span-full">
            {isEditing ? (
              <>
                <label
                  htmlFor={bioInputId}
                  className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
                >
                  Bio
                </label>
                <textarea
                  id={bioInputId}
                  value={editForm.bio}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full resize-vertical rounded-lg border border-[color:var(--color-border-primary)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
                  placeholder="Tell us about yourself..."
                />
              </>
            ) : (
              <div role="group" aria-labelledby={`${bioInputId}-label`}>
                <p
                  id={`${bioInputId}-label`}
                  className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
                >
                  Bio
                </p>
                <p className="m-0 min-h-16 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)]">
                  {profile?.bio || 'No bio provided'}
                </p>
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            {isEditing ? (
              <>
                <label
                  htmlFor={locationInputId}
                  className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
                >
                  <MapPin className="mr-2 inline icon-sm" />
                  Location
                </label>
                <input
                  id={locationInputId}
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                  className="w-full rounded-lg border border-[color:var(--color-border-primary)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
                  placeholder="Your location"
                />
              </>
            ) : (
              <div role="group" aria-labelledby={`${locationInputId}-label`}>
                <p
                  id={`${locationInputId}-label`}
                  className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
                >
                  <MapPin className="mr-2 inline icon-sm" />
                  Location
                </p>
                <p className="m-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)]">
                  {profile?.location || 'Not specified'}
                </p>
              </div>
            )}
          </div>

          {/* Website */}
          <div>
            {isEditing ? (
              <>
                <label
                  htmlFor={websiteInputId}
                  className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
                >
                  <Globe className="mr-2 inline icon-sm" />
                  Website
                </label>
                <input
                  id={websiteInputId}
                  type="url"
                  value={editForm.website}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, website: e.target.value }))}
                  className="w-full rounded-lg border border-[color:var(--color-border-primary)] px-3 py-2 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
                  placeholder="https://your-website.com"
                />
              </>
            ) : (
              <div role="group" aria-labelledby={`${websiteInputId}-label`}>
                <p
                  id={`${websiteInputId}-label`}
                  className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
                >
                  <Globe className="mr-2 inline icon-sm" />
                  Website
                </p>
                <p className="m-0 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] px-3 py-2 text-sm text-[var(--color-text-primary)]">
                  {profile?.website ? (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-primary)]"
                    >
                      {profile.website}
                    </a>
                  ) : (
                    'Not specified'
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-8 flex justify-end border-t border-[var(--color-border)] pt-6"
          >
            {/* Inline error display */}
            {profileState.error && (
              <div className="mr-4 flex-1 rounded-lg border border-[var(--color-error)] bg-[var(--color-error-light)] px-4 py-2 text-sm text-[var(--color-error)]">
                {profileState.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isProfilePending}
              className="flex cursor-pointer items-center gap-2 rounded-lg border-none bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--color-primary)]/40 disabled:cursor-not-allowed disabled:bg-[var(--color-surface-secondary)] disabled:hover:translate-y-0 disabled:hover:shadow-sm"
              aria-label="Save profile changes"
            >
              {isProfilePending ? (
                <Loader className="spinner spinner-sm spinner-white" aria-hidden="true" />
              ) : (
                <Save className="icon-sm" aria-hidden="true" />
              )}
              {isProfilePending ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    );
  }

  function renderSecurityTab() {
    return (
      <div className="p-6">
        {/* Security Overview */}
        <div className="mb-8 rounded-lg border border-[var(--color-primary)] bg-[var(--color-primary)] p-4">
          <h3 className="mb-2 m-0 text-base font-semibold text-[var(--color-primary)]">
            Security Status
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--color-primary)]">
                {securitySettings?.two_factor_enabled ? '' : ''}
              </div>
              <p className="m-0 text-xs text-[var(--color-primary)]">Two-Factor Auth</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--color-primary)]">
                {securitySettings?.active_sessions || 0}
              </div>
              <p className="m-0 text-xs text-[var(--color-primary)]">Active Sessions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--color-primary)]" />
              <p className="m-0 text-xs text-[var(--color-primary)]">Email Verified</p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <form
          onSubmit={handleChangePassword}
          className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-primary)] p-6"
        >
          <h3 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
            Change Password
          </h3>

          {/* Inline error display */}
          {passwordState.error && (
            <div className="mb-4 rounded-lg border border-[var(--color-error)] bg-[var(--color-error-light)] px-4 py-2 text-sm text-[var(--color-error)]">
              {passwordState.error}
            </div>
          )}

          <div className="grid gap-4">
            {/* Current Password */}
            <div>
              <label
                htmlFor={currentPasswordInputId}
                className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  id={currentPasswordInputId}
                  name="current_password"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.current_password}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, current_password: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[color:var(--color-border-primary)] bg-[var(--color-surface-primary)] px-3 py-2 pr-10 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer border-none bg-transparent p-0 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                  aria-label={
                    showPasswords.current ? 'Hide current password' : 'Show current password'
                  }
                >
                  {showPasswords.current ? (
                    <EyeOff className="icon-sm" aria-hidden="true" />
                  ) : (
                    <Eye className="icon-sm" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor={newPasswordInputId}
                className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id={newPasswordInputId}
                  name="new_password"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.new_password}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, new_password: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[color:var(--color-border-primary)] bg-[var(--color-surface-primary)] px-3 py-2 pr-10 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer border-none bg-transparent p-0 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                  aria-label={showPasswords.new ? 'Hide new password' : 'Show new password'}
                >
                  {showPasswords.new ? (
                    <EyeOff className="icon-sm" aria-hidden="true" />
                  ) : (
                    <Eye className="icon-sm" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor={confirmPasswordInputId}
                className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id={confirmPasswordInputId}
                  name="confirm_password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirm_password}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, confirm_password: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[color:var(--color-border-primary)] bg-[var(--color-surface-primary)] px-3 py-2 pr-10 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer border-none bg-transparent p-0 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                  aria-label={
                    showPasswords.confirm ? 'Hide confirm password' : 'Show confirm password'
                  }
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="icon-sm" aria-hidden="true" />
                  ) : (
                    <Eye className="icon-sm" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Change Password Button */}
            <button
              type="submit"
              disabled={
                isPasswordPending ||
                !passwordForm.current_password ||
                !passwordForm.new_password ||
                !passwordForm.confirm_password
              }
              className={`justify-self-start flex items-center gap-2 rounded-lg border-none px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition-all duration-200 ${
                isPasswordPending ||
                !passwordForm.current_password ||
                !passwordForm.new_password ||
                !passwordForm.confirm_password
                  ? 'cursor-not-allowed bg-[var(--color-surface-secondary)]'
                  : 'cursor-pointer bg-gradient-to-br from-[var(--color-error)] to-[var(--color-error)] hover:from-[var(--color-error)] hover:to-[var(--color-error)]'
              }`}
            >
              {isPasswordPending ? (
                <Loader className="spinner spinner-sm spinner-white" aria-hidden="true" />
              ) : (
                <Shield className="icon-sm" aria-hidden="true" />
              )}
              {isPasswordPending ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  function renderPreferencesTab() {
    return (
      <div className="p-6">
        {/* Notification Settings */}
        <div className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-primary)] p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[var(--color-text-primary)]">
            <Bell className="icon-md" />
            Notification Preferences
          </h3>

          <div className="grid gap-4">
            {[
              {
                id: 'email_notifications',
                label: 'Email Notifications',
                description: 'Receive important updates via email',
              },
              {
                id: 'push_notifications',
                label: 'Push Notifications',
                description: 'Get real-time notifications in your browser',
              },
              {
                id: 'marketing_emails',
                label: 'Marketing Emails',
                description: 'Receive product updates and newsletters',
              },
            ].map(({ id, label, description }) => (
              <div
                key={id}
                className="flex items-center justify-between rounded-lg bg-[var(--color-surface-secondary)] p-4"
              >
                <div>
                  <h4 className="mb-1 text-sm font-medium text-[var(--color-text-primary)]">
                    {label}
                  </h4>
                  <p className="m-0 text-xs text-[var(--color-text-secondary)]">{description}</p>
                </div>
                <label aria-label={label} className="relative inline-block h-6 w-12">
                  <input
                    type="checkbox"
                    defaultChecked={id === 'email_notifications'}
                    className="h-0 w-0 opacity-0"
                  />
                  <span
                    className={`absolute bottom-0 left-0 right-0 top-0 cursor-pointer rounded-3xl transition-all duration-400 ${
                      id === 'email_notifications'
                        ? 'bg-[var(--color-primary)]'
                        : 'bg-[var(--color-border)]'
                    }`}
                  >
                    <span
                      className={`absolute bottom-0.5 h-[1.125rem] w-[1.125rem] rounded-full bg-[var(--color-surface-primary)] transition-all duration-400 ${
                        id === 'email_notifications' ? 'left-7' : 'left-0.5'
                      }`}
                    />
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-secondary)]">
        <div className="text-center" role="status" aria-live="polite">
          <Loader className="spinner spinner-xl spinner-primary mx-auto mb-4" aria-hidden="true" />
          <p className="text-[var(--color-text-secondary)]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMetadata
        title={`${profile?.full_name || 'User'} Profile - Settings`}
        description="Manage your profile information, security settings, and preferences."
        keywords="profile, user settings, security, preferences, account management"
        ogTitle="Profile Settings - User Management System"
        ogDescription="Update your profile, manage security settings, and customize your experience."
      />
      <div className="page-wrapper">
        <div className="container-narrow">
          {/* Breadcrumb Navigation */}
          <Breadcrumb />

          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-[var(--color-text-primary)]">
              Profile Settings
            </h1>
            <p className="m-0 text-sm text-[var(--color-text-secondary)]">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Alerts */}
          {success && (
            <div
              className="mb-6 flex items-center gap-3 rounded-lg border border-[var(--color-success)] bg-[var(--color-success-light)] p-4"
              role="status"
              aria-live="polite"
            >
              <CheckCircle className="h-5 w-5 text-[var(--color-success)]" aria-hidden="true" />
              <p className="m-0 text-sm text-[var(--color-success)]">{success}</p>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="card-base">
            <div
              className="flex border-b border-[var(--color-border)]"
              role="tablist"
              aria-label="Profile settings sections"
            >
              {[
                { id: 'profile', label: 'Profile', icon: UserIcon },
                { id: 'security', label: 'Security', icon: Shield },
                { id: 'preferences', label: 'Preferences', icon: Settings },
                { id: 'privacy', label: 'Privacy & Data', icon: FileText },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() =>
                    setActiveTab(id as 'profile' | 'security' | 'preferences' | 'privacy')
                  }
                  className={`flex flex-1 items-center justify-center gap-2 border-b-2 border-none p-4 text-sm font-medium transition-all duration-200 ${
                    activeTab === id
                      ? 'border-b-[color:var(--color-primary)] bg-[color:var(--color-background-secondary)] text-[var(--color-primary)]'
                      : 'border-transparent bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[color:var(--color-text-primary)]'
                  }`}
                  role="tab"
                  aria-selected={activeTab === id}
                  aria-controls={`${id}-panel`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div role="tabpanel" id={`${activeTab}-panel`} aria-labelledby={`${activeTab}-tab`}>
              {tabContent}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
