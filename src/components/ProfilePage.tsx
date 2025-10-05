import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, type UserProfile as ApiUserProfile } from '../services/apiClientComplete';
import ErrorAlert from './ErrorAlert';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { 
  User as UserIcon, 
  MapPin, 
  Globe, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Shield,
  Settings,
  Bell,
  Eye,
  EyeOff,
  CheckCircle,
  Loader
} from 'lucide-react';

interface SecuritySettings {
  two_factor_enabled: boolean;
  last_password_change: string;
  active_sessions: number;
}

const ProfilePage: React.FC = () => {
  const { refreshProfile } = useAuth();
  const [profile, setProfile] = useState<ApiUserProfile | null>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

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
      github: ''
    }
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Load profile data
  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      
      const [profileResponse] = await Promise.all([
        apiClient.getProfile(),
        // Load security settings would be called here if available
      ]);

      if (profileResponse.success && profileResponse.profile) {
        setProfile(profileResponse.profile);
        
        // Initialize edit form with current data
        setEditForm({
          full_name: profileResponse.profile.full_name || '',
          username: profileResponse.profile.username || '',
          bio: profileResponse.profile.bio || '',
          location: profileResponse.profile.location || '',
          website: profileResponse.profile.website || '',
          social_links: {
            linkedin: profileResponse.profile.social_links?.linkedin || '',
            twitter: profileResponse.profile.social_links?.twitter || '',
            github: profileResponse.profile.social_links?.github || ''
          }
        });
      }

      // Mock security settings for now
      setSecuritySettings({
        two_factor_enabled: false,
        last_password_change: '2024-01-15T10:30:00Z',
        active_sessions: 2
      });

    } catch (err: unknown) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      clearError();

      const response = await apiClient.updateProfile(editForm);
      
      if (response.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        await loadProfile();
        await refreshProfile();
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        handleError(new Error(response.message || 'Failed to update profile'));
      }
    } catch (err: unknown) {
      handleError(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      handleError(new Error('New passwords do not match'));
      return;
    }

    if (passwordForm.new_password.length < 6) {
      handleError(new Error('Password must be at least 6 characters long'));
      return;
    }

    try {
      setIsSaving(true);
      clearError();

      const response = await apiClient.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        confirm_password: passwordForm.confirm_password
      });

      if (response.success) {
        setSuccess('Password changed successfully!');
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        handleError(new Error(response.message || 'Failed to change password'));
      }
    } catch (err: unknown) {
      handleError(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Memoized tab content for performance
  const tabContent = useMemo(() => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'security':
        return renderSecurityTab();
      case 'preferences':
        return renderPreferencesTab();
      default:
        return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  function renderProfileTab() {
    return (
      <div style={{ padding: '1.5rem' }}>
        {/* Profile Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1.5rem', 
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          {/* Avatar */}
          <div style={{
            width: '5rem',
            height: '5rem',
            backgroundColor: '#3b82f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <UserIcon style={{ width: '2.5rem', height: '2.5rem', color: 'white' }} />
            <button style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '1.5rem',
              height: '1.5rem',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <Camera style={{ width: '0.75rem', height: '0.75rem', color: 'white' }} />
            </button>
          </div>

          {/* Profile Info */}
          <div style={{ flex: 1 }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#111827',
              margin: '0 0 0.25rem'
            }}>
              {profile?.full_name || profile?.username || 'User'}
            </h2>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280',
              margin: '0 0 0.5rem'
            }}>
              {profile?.email}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{
                fontSize: '0.75rem',
                color: '#10b981',
                backgroundColor: '#dcfce7',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontWeight: '500'
              }}>
                ✓ Verified
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: '#6b7280'
              }}>
                Member since {new Date(profile?.created_at || '').toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: isEditing ? '#dc2626' : '#3b82f6',
              backgroundColor: 'white',
              border: `1px solid ${isEditing ? '#dc2626' : '#3b82f6'}`,
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isEditing ? (
              <>
                <X style={{ width: '1rem', height: '1rem' }} />
                Cancel
              </>
            ) : (
              <>
                <Edit3 style={{ width: '1rem', height: '1rem' }} />
                Edit Profile
              </>
            )}
          </button>
        </div>

        {/* Profile Form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Full Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.full_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#111827',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  outline: 'none'
                }}
                placeholder="Enter your full name"
              />
            ) : (
              <p style={{
                padding: '0.75rem',
                fontSize: '0.875rem',
                color: '#111827',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                margin: 0
              }}>
                {profile?.full_name || 'Not specified'}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Username
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#111827',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  outline: 'none'
                }}
                placeholder="Enter your username"
              />
            ) : (
              <p style={{
                padding: '0.75rem',
                fontSize: '0.875rem',
                color: '#111827',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                margin: 0
              }}>
                {profile?.username || 'Not specified'}
              </p>
            )}
          </div>

          {/* Bio - Full Width */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Bio
            </label>
            {isEditing ? (
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#111827',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p style={{
                padding: '0.75rem',
                fontSize: '0.875rem',
                color: '#111827',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                margin: 0,
                minHeight: '4rem'
              }}>
                {profile?.bio || 'No bio provided'}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              <MapPin style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.5rem' }} />
              Location
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#111827',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  outline: 'none'
                }}
                placeholder="Your location"
              />
            ) : (
              <p style={{
                padding: '0.75rem',
                fontSize: '0.875rem',
                color: '#111827',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                margin: 0
              }}>
                {profile?.location || 'Not specified'}
              </p>
            )}
          </div>

          {/* Website */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              <Globe style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.5rem' }} />
              Website
            </label>
            {isEditing ? (
              <input
                type="url"
                value={editForm.website}
                onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#111827',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  outline: 'none'
                }}
                placeholder="https://your-website.com"
              />
            ) : (
              <p style={{
                padding: '0.75rem',
                fontSize: '0.875rem',
                color: '#111827',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                margin: 0
              }}>
                {profile?.website ? (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                    {profile.website}
                  </a>
                ) : (
                  'Not specified'
                )}
              </p>
            )}
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div style={{ 
            marginTop: '2rem', 
            paddingTop: '1.5rem', 
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'white',
                background: isSaving ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {isSaving ? (
                <Loader style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
              ) : (
                <Save style={{ width: '1rem', height: '1rem' }} />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderSecurityTab() {
    return (
      <div style={{ padding: '1.5rem' }}>
        {/* Security Overview */}
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#0369a1',
            margin: '0 0 0.5rem'
          }}>
            Security Status
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0369a1' }}>
                {securitySettings?.two_factor_enabled ? '✓' : '⚠️'}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#0369a1', margin: 0 }}>
                Two-Factor Auth
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0369a1' }}>
                {securitySettings?.active_sessions || 0}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#0369a1', margin: 0 }}>
                Active Sessions
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0369a1' }}>
                ✓
              </div>
              <p style={{ fontSize: '0.75rem', color: '#0369a1', margin: 0 }}>
                Email Verified
              </p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 1rem'
          }}>
            Change Password
          </h3>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {/* Current Password */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '2.5rem',
                    fontSize: '0.875rem',
                    color: '#111827',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    outline: 'none'
                  }}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#9ca3af'
                  }}
                >
                  {showPasswords.current ? (
                    <EyeOff style={{ width: '1rem', height: '1rem' }} />
                  ) : (
                    <Eye style={{ width: '1rem', height: '1rem' }} />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '2.5rem',
                    fontSize: '0.875rem',
                    color: '#111827',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    outline: 'none'
                  }}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#9ca3af'
                  }}
                >
                  {showPasswords.new ? (
                    <EyeOff style={{ width: '1rem', height: '1rem' }} />
                  ) : (
                    <Eye style={{ width: '1rem', height: '1rem' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '2.5rem',
                    fontSize: '0.875rem',
                    color: '#111827',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    outline: 'none'
                  }}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#9ca3af'
                  }}
                >
                  {showPasswords.confirm ? (
                    <EyeOff style={{ width: '1rem', height: '1rem' }} />
                  ) : (
                    <Eye style={{ width: '1rem', height: '1rem' }} />
                  )}
                </button>
              </div>
            </div>

            {/* Change Password Button */}
            <button
              onClick={handleChangePassword}
              disabled={isSaving || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'white',
                background: isSaving || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #dc2626, #991b1b)',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: isSaving || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                justifySelf: 'start'
              }}
            >
              {isSaving ? (
                <Loader style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
              ) : (
                <Shield style={{ width: '1rem', height: '1rem' }} />
              )}
              {isSaving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderPreferencesTab() {
    return (
      <div style={{ padding: '1.5rem' }}>
        {/* Notification Settings */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Bell style={{ width: '1.25rem', height: '1.25rem' }} />
            Notification Preferences
          </h3>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              { id: 'email_notifications', label: 'Email Notifications', description: 'Receive important updates via email' },
              { id: 'push_notifications', label: 'Push Notifications', description: 'Get real-time notifications in your browser' },
              { id: 'marketing_emails', label: 'Marketing Emails', description: 'Receive product updates and newsletters' }
            ].map(({ id, label, description }) => (
              <div key={id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#111827',
                    margin: '0 0 0.25rem'
                  }}>
                    {label}
                  </h4>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    margin: 0
                  }}>
                    {description}
                  </p>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '3rem',
                  height: '1.5rem'
                }}>
                  <input
                    type="checkbox"
                    defaultChecked={id === 'email_notifications'}
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: id === 'email_notifications' ? '#3b82f6' : '#cbd5e1',
                    borderRadius: '1.5rem',
                    transition: '0.4s',
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '',
                      height: '1.125rem',
                      width: '1.125rem',
                      left: id === 'email_notifications' ? '1.75rem' : '0.125rem',
                      bottom: '0.125rem',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.4s',
                    }} />
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Theme Settings */}
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          padding: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Settings style={{ width: '1.25rem', height: '1.25rem' }} />
            Appearance
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { value: 'light', label: '☀️ Light', active: true },
              { value: 'dark', label: '🌙 Dark', active: false },
              { value: 'auto', label: '🔄 Auto', active: false }
            ].map(({ value, label, active }) => (
              <button
                key={value}
                style={{
                  padding: '1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: active ? '#3b82f6' : '#6b7280',
                  backgroundColor: active ? '#eff6ff' : '#f9fafb',
                  border: `1px solid ${active ? '#3b82f6' : '#e5e7eb'}`,
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader style={{ 
            width: '2rem', 
            height: '2rem', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#6b7280' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '64rem',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0 0 0.5rem'
          }}>
            Profile Settings
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: 0
          }}>
            Manage your account settings and preferences
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ marginBottom: '1.5rem' }}>
            <ErrorAlert error={error} />
          </div>
        )}

        {success && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#10b981' }} />
            <p style={{ fontSize: '0.875rem', color: '#065f46', margin: 0 }}>{success}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <nav style={{
            display: 'flex',
            borderBottom: '1px solid #e5e7eb'
          }}>
            {[
              { id: 'profile', label: 'Profile', icon: UserIcon },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'preferences', label: 'Preferences', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as 'profile' | 'security' | 'preferences')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: activeTab === id ? '#3b82f6' : '#6b7280',
                  backgroundColor: activeTab === id ? '#f8fafc' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === id ? '2px solid #3b82f6' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon style={{ width: '1rem', height: '1rem' }} />
                {label}
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          {tabContent}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
