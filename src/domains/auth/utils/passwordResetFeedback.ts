/**
 * Password reset feedback utilities
 * Provides user feedback for password reset confirmation process
 */

export type FeedbackIcon =
  | 'check'
  | 'warning'
  | 'info'
  | 'error'
  | 'mail'
  | 'shield'
  | 'clock'
  | 'login';

export interface PasswordResetFeedback {
  title: string;
  subtitle: string;
  message: string;
  email?: string;
  redirectSeconds: number | null;
  highlights: Array<{
    label: string;
    value: string;
    icon: FeedbackIcon;
    text: string;
    type: 'success' | 'warning' | 'info' | 'error';
  }>;
  nextSteps: Array<{
    id: string;
    title: string;
    description: string;
    icon: FeedbackIcon;
    text: string;
    action?: string;
  }>;
}

export interface PasswordResetResponse {
  message: string;
  email?: string;
  success: boolean;
  token_valid?: boolean;
  token_expired?: boolean;
  token_used?: boolean;
}

export function buildPasswordResetFeedback(response: PasswordResetResponse): PasswordResetFeedback {
  const { email, success, token_valid, token_expired, token_used } = response;

  let redirectSeconds: number | null = null;
  let title = 'Password Reset Successful!';
  let subtitle = 'Your password has been updated';
  let message = 'You can now log in with your new password.';

  const highlights: PasswordResetFeedback['highlights'] = [];
  const nextSteps: PasswordResetFeedback['nextSteps'] = [];

  // Handle token validation errors
  if (token_expired) {
    title = 'Reset Link Expired';
    subtitle = 'This password reset link has expired';
    message = 'Password reset links are valid for a limited time. Please request a new one.';

    highlights.push({
      label: 'Token Status',
      value: 'Expired',
      icon: 'error',
      text: 'Reset link no longer valid',
      type: 'error',
    });

    nextSteps.push({
      id: 'request-new',
      title: 'Request New Reset Link',
      description: 'Go to the forgot password page to get a new link',
      icon: 'mail',
      text: 'Get a new reset link',
      action: '/forgot-password',
    });

    return {
      title,
      subtitle,
      message,
      email,
      redirectSeconds,
      highlights,
      nextSteps,
    };
  }

  if (token_used) {
    title = 'Reset Link Already Used';
    subtitle = 'This password reset link has been used';
    message =
      'Each reset link can only be used once. If you need to reset your password again, please request a new link.';

    highlights.push({
      label: 'Token Status',
      value: 'Used',
      icon: 'warning',
      text: 'Reset link already redeemed',
      type: 'warning',
    });

    nextSteps.push({
      id: 'try-login',
      title: 'Try Logging In',
      description: 'Your password may have been reset. Try logging in.',
      icon: 'login',
      text: 'Go to login page',
      action: '/login',
    });

    nextSteps.push({
      id: 'request-new',
      title: 'Request New Reset Link',
      description: 'If you still need to reset your password, request a new link',
      icon: 'mail',
      text: 'Get a new reset link',
      action: '/forgot-password',
    });

    return {
      title,
      subtitle,
      message,
      email,
      redirectSeconds,
      highlights,
      nextSteps,
    };
  }

  if (!token_valid && !success) {
    title = 'Invalid Reset Link';
    subtitle = 'This password reset link is not valid';
    message =
      'The link may be incorrect or has been tampered with. Please request a new reset link.';

    highlights.push({
      label: 'Token Status',
      value: 'Invalid',
      icon: 'error',
      text: 'Reset link is not valid',
      type: 'error',
    });

    nextSteps.push({
      id: 'request-new',
      title: 'Request New Reset Link',
      description: 'Go to the forgot password page to get a valid link',
      icon: 'mail',
      text: 'Get a new reset link',
      action: '/forgot-password',
    });

    return {
      title,
      subtitle,
      message,
      email,
      redirectSeconds,
      highlights,
      nextSteps,
    };
  }

  // Success case
  if (success) {
    redirectSeconds = 5;

    highlights.push({
      label: 'Password Status',
      value: 'Updated',
      icon: 'check',
      text: 'Password changed successfully',
      type: 'success',
    });

    highlights.push({
      label: 'Security',
      value: 'Enhanced',
      icon: 'shield',
      text: 'Account security updated',
      type: 'success',
    });

    nextSteps.push({
      id: 'login',
      title: 'Log In to Your Account',
      description: 'Use your new password to log in',
      icon: 'login',
      text: 'Redirecting to login...',
      action: '/login',
    });

    if (email) {
      nextSteps.push({
        id: 'confirmation',
        title: 'Confirmation Email Sent',
        description: `A confirmation email has been sent to ${email}`,
        icon: 'mail',
        text: 'Check your email',
      });
    }
  }

  return {
    title,
    subtitle,
    message,
    email,
    redirectSeconds,
    highlights,
    nextSteps,
  };
}
