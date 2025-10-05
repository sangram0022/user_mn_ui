import type { RegisterResponse } from '../types';

export type FeedbackIcon = 'mail' | 'shield' | 'clock' | 'login' | 'info';

export interface RegistrationHighlight {
  label: string;
  value: string;
}

export interface RegistrationNextStep {
  id: string;
  title: string;
  description: string;
  icon: FeedbackIcon;
}

export interface RegistrationFeedback {
  title: string;
  subtitle: string;
  message: string;
  email: string;
  highlights: RegistrationHighlight[];
  nextSteps: RegistrationNextStep[];
  redirectSeconds: number | null;
}

const formatDateTime = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
      return isoDate;
    }

    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: undefined
    }).format(date);
  } catch {
    return isoDate;
  }
};

export const buildRegistrationFeedback = (payload: RegisterResponse): RegistrationFeedback => {
  const verificationPending = Boolean(payload.verification_required);
  const approvalPending = Boolean(payload.approval_required);

  const highlights: RegistrationHighlight[] = [
    {
      label: 'Account ID',
      value: payload.user_id
    },
    {
      label: 'Created',
      value: formatDateTime(payload.created_at)
    },
    {
      label: 'Verification',
      value: verificationPending ? 'Email verification required' : 'Completed automatically'
    },
    {
      label: 'Approval',
      value: approvalPending ? 'Awaiting administrator review' : 'Not required'
    }
  ];

  const nextSteps: RegistrationNextStep[] = [];

  if (verificationPending) {
    nextSteps.push({
      id: 'verify',
      title: 'Verify your email address',
      description: `We sent a verification link to ${payload.email}. The link stays active for 24 hours.`,
      icon: 'mail'
    });
  } else {
    nextSteps.push({
      id: 'login',
      title: 'You can sign in right away',
      description: 'Use your email and password to access the dashboard.',
      icon: 'login'
    });
  }

  if (approvalPending) {
    nextSteps.push({
      id: 'approval',
      title: 'Admin approval in progress',
      description: 'An administrator will review your account shortly. We will email you once it is activated.',
      icon: 'shield'
    });
  }

  nextSteps.push({
    id: 'support',
    title: 'Need help?',
    description: 'If the email has not arrived within a few minutes, check your spam folder or contact support.',
    icon: 'info'
  });

  const redirectSeconds = verificationPending || approvalPending ? null : 8;

  return {
    title: 'Account created successfully',
    subtitle: 'Welcome aboard! Your workspace is ready.',
    message: verificationPending
      ? 'Before you sign in, please confirm your email address so we can keep your account secure.'
      : 'Your credentials are ready. You can sign in immediately or explore the next steps below.',
    email: payload.email,
    highlights,
    nextSteps,
    redirectSeconds
  };
};
