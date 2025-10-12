/**
 * Forgot password feedback utilities
 * Provides user feedback for password reset request process
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

export interface ForgotPasswordFeedback {
  title: string;
  subtitle: string;
  message: string;
  email: string;
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

export interface ForgotPasswordResponse {
  message: string;
  email: string;
  reset_token_sent: boolean;
  expires_in?: number;
  rate_limited?: boolean;
  retry_after?: number;
}

export function buildForgotPasswordFeedback(
  response: ForgotPasswordResponse
): ForgotPasswordFeedback {
  const { email, reset_token_sent, expires_in, rate_limited, retry_after } = response;

  const redirectSeconds: number | null = null;
  let title = 'Check Your Email';
  let subtitle = 'Password reset link sent';
  let message = 'We have sent a password reset link to your email address.';

  const highlights: ForgotPasswordFeedback['highlights'] = [];
  const nextSteps: ForgotPasswordFeedback['nextSteps'] = [];

  if (rate_limited) {
    title = 'Too Many Requests';
    subtitle = 'Please wait before trying again';
    message = `You've requested too many password resets. Please wait ${retry_after || 15} minutes before trying again.`;

    highlights.push({
      label: 'Rate Limit',
      value: 'Active',
      icon: 'warning',
      text: 'Too many reset attempts',
      type: 'warning',
    });

    if (retry_after) {
      highlights.push({
        label: 'Retry After',
        value: `${retry_after} minutes`,
        icon: 'clock',
        text: 'Time until next attempt',
        type: 'info',
      });
    }

    nextSteps.push({
      id: 'wait',
      title: 'Wait Before Retrying',
      description: `Please wait ${retry_after || 15} minutes before requesting another reset`,
      icon: 'clock',
      text: 'Rate limit active',
    });
  } else if (reset_token_sent) {
    highlights.push({
      label: 'Email Status',
      value: 'Sent',
      icon: 'check',
      text: 'Reset link sent successfully',
      type: 'success',
    });

    if (expires_in) {
      highlights.push({
        label: 'Link Expires',
        value: `${expires_in} minutes`,
        icon: 'clock',
        text: 'Reset link expiration time',
        type: 'info',
      });
    }

    nextSteps.push({
      id: 'check-email',
      title: 'Check Your Email',
      description: 'Click the reset link in your email to create a new password',
      icon: 'mail',
      text: 'Open your email inbox',
    });

    nextSteps.push({
      id: 'reset-password',
      title: 'Reset Your Password',
      description: 'Follow the instructions in the email to set a new password',
      icon: 'shield',
      text: 'Create new password',
    });

    nextSteps.push({
      id: 'check-spam',
      title: 'Check Spam Folder',
      description: "If you don't see the email, check your spam or junk folder",
      icon: 'info',
      text: 'Email might be in spam',
    });
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
