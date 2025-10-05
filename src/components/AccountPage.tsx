import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserRoleName } from '../utils/user';
import { Settings, Lock, Bell, Shield } from 'lucide-react';

const AccountPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          margin: '0 0 0.5rem 0',
          color: '#111827',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Settings className="w-6 h-6" />
          Account Settings
        </h1>
        <p style={{ margin: 0, color: '#6b7280' }}>
          Manage your account preferences and security settings
        </p>
      </div>

      {/* Account Information */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#f9fafb',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ margin: 0, color: '#111827', fontSize: '1.125rem', fontWeight: '600' }}>
            Account Information
          </h2>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
                Email Address
              </label>
              <div style={{
                padding: '0.75rem',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                color: '#6b7280'
              }}>
                {user?.email || 'No email set'}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
                Username
              </label>
              <div style={{
                padding: '0.75rem',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                color: '#6b7280'
              }}>
                {user?.username || 'No username set'}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
                Full Name
              </label>
              <div style={{
                padding: '0.75rem',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                color: '#6b7280'
              }}>
                {user?.full_name || 'No full name set'}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '500' }}>
                Role
              </label>
              <div style={{
                padding: '0.75rem',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                color: '#6b7280'
              }}>
                {getUserRoleName(user) || 'No role assigned'}
              </div>
            </div>
          </div>

          <button style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            Edit Profile
          </button>
        </div>
      </div>

      {/* Security Settings */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#f9fafb',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ margin: 0, color: '#111827', fontSize: '1.125rem', fontWeight: '600' }}>
            Security Settings
          </h2>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Lock className="w-5 h-5 text-gray-600" />
                <div>
                  <div style={{ fontWeight: '500', color: '#111827' }}>Change Password</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Update your account password
                  </div>
                </div>
              </div>
              <button style={{
                padding: '0.5rem 1rem',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                Change
              </button>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Shield className="w-5 h-5 text-gray-600" />
                <div>
                  <div style={{ fontWeight: '500', color: '#111827' }}>Two-Factor Authentication</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Add an extra layer of security
                  </div>
                </div>
              </div>
              <button style={{
                padding: '0.5rem 1rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                Enable
              </button>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Bell className="w-5 h-5 text-gray-600" />
                <div>
                  <div style={{ fontWeight: '500', color: '#111827' }}>Email Notifications</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Manage your notification preferences
                  </div>
                </div>
              </div>
              <button style={{
                padding: '0.5rem 1rem',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                Configure
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #fecaca',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#fef2f2',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #fecaca'
        }}>
          <h2 style={{ margin: 0, color: '#dc2626', fontSize: '1.125rem', fontWeight: '600' }}>
            Danger Zone
          </h2>
        </div>
        <div style={{ padding: '1.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: '#fef2f2',
            borderRadius: '8px',
            border: '1px solid #fecaca'
          }}>
            <div>
              <div style={{ fontWeight: '500', color: '#dc2626' }}>Delete Account</div>
              <div style={{ fontSize: '0.875rem', color: '#7f1d1d' }}>
                Permanently delete your account and all data
              </div>
            </div>
            <button style={{
              padding: '0.5rem 1rem',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
