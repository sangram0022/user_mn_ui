// ========================================
// Profile Domain Localization
// ProfilePage and ChangePasswordPage translations
// ========================================

export const profile = {
  // Profile Page
  profilePage: {
    title: 'Profile',
    fields: {
      role: 'Role',
      status: 'Status',
      emailVerified: 'Email Verified',
    },
    status: {
      active: 'Active',
      inactive: 'Inactive',
      verified: 'Verified',
      notVerified: 'Not Verified',
    },
  },

  // Change Password Page
  changePassword: {
    title: 'Change Password',
    subtitle: 'Update your password to keep your account secure',
    securityNote: 'Make sure your new password is strong and unique to this account',
    
    form: {
      currentPassword: {
        label: 'Current Password',
        placeholder: 'Enter your current password',
      },
      newPassword: {
        label: 'New Password',
        placeholder: 'Enter your new password',
        hint: 'Must be at least 8 characters long',
      },
      confirmPassword: {
        label: 'Confirm New Password',
        placeholder: 'Confirm your new password',
      },
      submit: 'Change Password',
      submitting: 'Changing Password...',
      cancel: 'Cancel',
    },

    validation: {
      passwordsNotMatch: 'New passwords do not match',
      passwordTooShort: 'New password must be at least 8 characters long',
      passwordSameAsCurrent: 'New password must be different from current password',
      allFieldsRequired: 'All fields are required',
    },

    success: 'Password changed successfully!',
    error: 'Failed to change password',
  },
} as const;
