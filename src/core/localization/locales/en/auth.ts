// ========================================
// Auth Domain Localization
// All authentication-related text
// ========================================

export const auth = {
  // Login Page
  login: {
    title: 'Welcome Back',
    subtitle: 'Sign in to your account to continue',
    emailLabel: 'Email Address',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    submitButton: 'Sign In',
    submitting: 'Signing in...',
    divider: 'Or continue with',
    socialGoogle: 'Google',
    socialGitHub: 'GitHub',
    noAccount: "Don't have an account?",
    signUpLink: 'Sign up for free',
  },

  // Register Page
  register: {
    title: 'Create Account',
    subtitle: 'Join thousands of users managing teams efficiently',
    firstNameLabel: 'First Name',
    firstNamePlaceholder: 'John',
    lastNameLabel: 'Last Name',
    lastNamePlaceholder: 'Doe',
    usernameLabel: 'Username',
    usernamePlaceholder: 'Choose a username',
    emailLabel: 'Email Address',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Minimum 8 characters',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: 'Re-enter your password',
    termsPrefix: 'I agree to the',
    termsLink: 'Terms of Service',
    termsAnd: 'and',
    privacyLink: 'Privacy Policy',
    submitButton: 'Create Account',
    submitting: 'Creating Account...',
    socialDivider: 'Or sign up with',
    socialGoogle: 'Google',
    socialGitHub: 'GitHub',
    haveAccount: 'Already have an account?',
    signInLink: 'Sign in',
    passwordStrengthLabel: 'Strength:',
  },

  // Forgot Password Page
  forgotPassword: {
    title: 'Reset Password',
    subtitle: "Enter your email and we'll send you a reset link",
    emailLabel: 'Email Address',
    emailPlaceholder: 'you@example.com',
    submitButton: 'Send Reset Link',
    submitting: 'Sending...',
    backToLogin: 'Back to',
    loginLink: 'Sign in',
    successMessage: 'Password reset link sent! Check your email.',
  },

  // Reset Password Page
  resetPassword: {
    title: 'Create New Password',
    subtitle: 'Enter your new password below',
    passwordLabel: 'New Password',
    passwordPlaceholder: 'Enter new password',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: 'Re-enter new password',
    submitButton: 'Reset Password',
    submitting: 'Resetting...',
    successMessage: 'Password reset successful! You can now sign in.',
    backToLogin: 'Back to sign in',
  },

  // Verify Email Page
  verifyEmail: {
    title: 'Verify Your Email',
    verifying: 'Verifying...',
    successMessage: 'Email verified successfully!',
    continueButton: 'Continue to Dashboard',
  },

  // Logout
  logout: {
    button: 'Sign Out',
    confirmMessage: 'Are you sure you want to sign out?',
  },

  // Password Strength
  passwordStrength: {
    label: 'Password Strength:',
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
    veryStrong: 'Very Strong',
    requirements: 'Password must contain:',
    minLength: 'At least 8 characters',
    uppercase: 'One uppercase letter',
    lowercase: 'One lowercase letter',
    number: 'One number',
    special: 'One special character',
  },

  // Session Management
  session: {
    expired: 'Your session has expired. Please sign in again.',
    idle: 'You have been inactive for a while. Please sign in again.',
    refreshing: 'Refreshing session...',
  },
} as const;
