/**
 * Registration feedback utilities
 * Provides user feedback for registration process
 */

import type { RegisterResponse } from '@shared/types';

export type FeedbackIcon = 'check' | 'warning' | 'info' | 'error' | 'mail' | 'shield' | 'clock' | 'login';

export interface RegistrationFeedback {
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

export function buildRegistrationFeedback(
  response: RegisterResponse
): RegistrationFeedback {
  const { email, verification_required, approval_required } = response;
  
  let redirectSeconds: number | null = null;
  let title = 'Registration Successful!';
  let subtitle = 'Your account has been created';
  let message = 'Welcome to the platform!';

  const highlights: RegistrationFeedback['highlights'] = [
    {
      label: 'Account Status',
      value: 'Active',
      icon: 'check',
      text: 'Account created successfully',
      type: 'success'
    }
  ];

  const nextSteps: RegistrationFeedback['nextSteps'] = [];

  if (verification_required) {
    title = 'Check Your Email';
    subtitle = 'We sent you a verification link';
    message = 'Please check your email and click the verification link to activate your account.';
    redirectSeconds = null;

    highlights.push({
      label: 'Email Verification',
      value: 'Required',
      icon: 'mail',
      text: 'Email verification required',
      type: 'warning'
    });

    nextSteps.push({
      id: 'verify-email',
      title: 'Verify Your Email',
      description: 'Click the link in your email to verify your account',
      icon: 'mail',
      text: 'Check your email for verification link'
    });
  }

  if (approval_required) {
    highlights.push({
      label: 'Admin Approval',
      value: 'Pending',
      icon: 'warning',
      text: 'Admin approval required',
      type: 'warning'
    });

    nextSteps.push({
      id: 'admin-approval',
      title: 'Admin Approval',
      description: 'Your account is pending admin approval',
      icon: 'warning',
      text: 'Wait for admin approval'
    });
  }

  if (!verification_required && !approval_required) {
    redirectSeconds = 5;
    nextSteps.push({
      id: 'login',
      title: 'Login to Your Account',
      description: 'You can now login with your credentials',
      icon: 'check',
      text: 'Redirecting to login...'
    });
  }

  return {
    title,
    subtitle,
    message,
    email,
    redirectSeconds,
    highlights,
    nextSteps
  };
}