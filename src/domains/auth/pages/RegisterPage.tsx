import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Info,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react';
import React, {
  ComponentType,
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useToast } from '@hooks/useToast';
import { apiClient } from '@lib/api';
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateRequired,
} from '@shared/utils/formValidation';
import type { FeedbackIcon, RegistrationFeedback } from '../utils/registrationFeedback';
import { buildRegistrationFeedback } from '../utils/registrationFeedback';

const FEEDBACK_ICON_MAP: Record<FeedbackIcon, ComponentType<{ className?: string }>> = {
  mail: Mail,
  shield: ShieldCheck,
  clock: Clock,
  login: LogIn,
  info: Info,
  check: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

interface RegisterState {
  success: boolean;
  error: string | null;
  feedback: RegistrationFeedback | null;
}

// Server action for registration
async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const termsAccepted = formData.get('terms_accepted') === 'true';

  // Validate inputs
  const firstNameValidation = validateRequired(firstName, 'First name');
  if (!firstNameValidation.isValid) {
    return {
      success: false,
      error: firstNameValidation.error || 'First name is required',
      feedback: null,
    };
  }

  const lastNameValidation = validateRequired(lastName, 'Last name');
  if (!lastNameValidation.isValid) {
    return {
      success: false,
      error: lastNameValidation.error || 'Last name is required',
      feedback: null,
    };
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return { success: false, error: emailValidation.error || 'Invalid email', feedback: null };
  }

  const passwordValidation = validatePassword(password, 8);
  if (!passwordValidation.isValid) {
    return {
      success: false,
      error: passwordValidation.error || 'Password must be at least 8 characters',
      feedback: null,
    };
  }

  const passwordMatchValidation = validatePasswordMatch(password, confirmPassword);
  if (!passwordMatchValidation.isValid) {
    return {
      success: false,
      error: passwordMatchValidation.error || 'Passwords do not match',
      feedback: null,
    };
  }

  if (!termsAccepted) {
    return {
      success: false,
      error: 'You must accept the Terms and Conditions to register',
      feedback: null,
    };
  }

  // Perform registration
  try {
    const response = await apiClient.register({
      email,
      password,
      confirm_password: confirmPassword,
      first_name: firstName,
      last_name: lastName,
    });

    const feedback = buildRegistrationFeedback(response);
    return { success: true, error: null, feedback };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Registration failed. Please try again.';
    return {
      success: false,
      error: errorMessage,
      feedback: null,
    };
  }
}

const RegisterPage: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    terms_accepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Use React 19's useActionState for form handling
  const [state, submitAction, isPending] = useActionState(registerAction, {
    success: false,
    error: null,
    feedback: null,
  });

  const [hasNavigated, setHasNavigated] = useState(false);

  const navigate = useNavigate();

  const handleProceedToLogin = useCallback(() => {
    setHasNavigated((prev) => {
      if (!prev) {
        navigate('/login', {
          state: { message: 'Registration successful! Please log in with your credentials.' },
        });
      }
      return true;
    });
  }, [navigate]);

  // React 19 best practice: Compute from props, don't sync
  const feedbackCountdown = state.success && state.feedback ? state.feedback.redirectSeconds : null;

  // Only maintain local countdown state for the timer
  const [localCountdown, setLocalCountdown] = useState<number | null>(null);

  // Sync only when feedback countdown changes (new success state)
  const prevFeedbackRef = useRef<number | null>(null);
  if (feedbackCountdown !== prevFeedbackRef.current) {
    prevFeedbackRef.current = feedbackCountdown;
    setLocalCountdown(feedbackCountdown);

    // Show toast notification on registration success
    if (feedbackCountdown !== null) {
      toast.success('Registration successful! Redirecting to login...');
    }
  }

  // Show toast on registration error
  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error, toast]);

  const redirectCountdown = localCountdown;

  // Separate effect for timer
  useEffect(() => {
    if (redirectCountdown === null || redirectCountdown <= 0 || hasNavigated) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (redirectCountdown === 1) {
        handleProceedToLogin();
      } else {
        setLocalCountdown(redirectCountdown - 1);
      }
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [redirectCountdown, hasNavigated, handleProceedToLogin]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Create FormData from the form
    const form = event.currentTarget;
    const formDataObj = new FormData(form);

    // Add terms_accepted to FormData
    formDataObj.set('terms_accepted', formData.terms_accepted ? 'true' : 'false');

    // React 19: Call action within startTransition to avoid warnings
    startTransition(() => {
      submitAction(formDataObj);
    });
  };

  if (state.success && state.feedback) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-gray-200/50 bg-white/95 p-10 shadow-2xl backdrop-blur-sm">
          <div className="text-center" role="status" aria-live="polite">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary shadow-lg">
              <CheckCircle className="h-8 w-8 text-white" aria-hidden="true" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              {state.feedback.title}
            </h2>
            <p className="mt-2 text-gray-500">{state.feedback.subtitle}</p>
            <p className="mt-4 text-base text-gray-700">{state.feedback.message}</p>
            <p className="mt-3 text-sm text-gray-500">
              Account email:{' '}
              <span className="font-medium text-gray-900">{state.feedback.email}</span>
            </p>
            {redirectCountdown !== null && (
              <p className="mt-2 text-sm text-blue-500">
                We'll take you to the login screen in {redirectCountdown} second
                {redirectCountdown === 1 ? '' : 's'}.
              </p>
            )}
          </div>

          <section className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Account snapshot
            </h3>
            <dl className="mt-4 grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
              {state.feedback.highlights.map((highlight: { label: string; value: string }) => (
                <div
                  key={highlight.label}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {highlight.label}
                  </dt>
                  <dd className="mt-1 break-words text-sm font-semibold text-slate-900">
                    {highlight.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-8">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Next steps
            </h3>
            <div className="mt-4 flex flex-col gap-4">
              {state.feedback.nextSteps.map(
                (step: { id: string; title: string; description: string; icon: FeedbackIcon }) => {
                  const IconComponent = FEEDBACK_ICON_MAP[step.icon] ?? Info;
                  return (
                    <div
                      key={step.id}
                      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                        <IconComponent className="h-5 w-5 text-blue-500" aria-hidden="true" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">{step.title}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-slate-500">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </section>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleProceedToLogin}
              className="inline-flex items-center justify-center gap-2 rounded-lg border-none bg-gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-sm outline-none transition-all hover:-translate-y-0.5 hover:shadow-lg focus:shadow-[0_0_0_3px_rgba(59,130,246,0.5)]"
            >
              <LogIn className="h-4 w-4" />
              {redirectCountdown !== null ? `Go to login (${redirectCountdown}s)` : 'Go to login'}
            </button>
            {redirectCountdown !== null && (
              <button
                type="button"
                onClick={() => setLocalCountdown(null)}
                className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-transparent px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Stay on this page
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (state.success && !state.feedback) {
    return (
      <div className="flex min-h-screen flex-col justify-center bg-gradient-page px-4 py-12">
        <div className="mx-auto w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary shadow-lg">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Registration Successful!
          </h2>
          <p className="mt-4 text-gray-500">
            Your account has been created successfully. You can now head to the login page.
          </p>
          <button
            type="button"
            onClick={handleProceedToLogin}
            className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border-none bg-gradient-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <LogIn className="h-4 w-4" />
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="layout-narrow py-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: 'var(--theme-primary)' }}
          >
            <User className="h-8 w-8 text-white" aria-hidden="true" />
          </div>
          <h2
            className="text-3xl font-bold tracking-tight mb-2"
            style={{ color: 'var(--theme-text)' }}
          >
            Create Your Account
          </h2>
          <p className="text-base" style={{ color: 'var(--theme-textSecondary)' }}>
            Get started with our user management platform
          </p>
        </div>

        <div className="card">
          {/* Error Alert */}
          {state.error && (
            <div className="mb-6" role="alert" aria-live="assertive">
              <div
                className="border-2 rounded-lg p-4"
                style={{
                  background: 'color-mix(in srgb, #ef4444 10%, var(--theme-background) 90%)',
                  borderColor: '#ef4444',
                  color: '#991b1b',
                }}
              >
                {state.error}
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
            aria-label="Registration form"
          >
            {/* First Name Field */}
            <div>
              <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-sm text-gray-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  placeholder="Enter your first name"
                />
              </div>
            </div>

            {/* Last Name Field */}
            <div>
              <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-sm text-gray-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-sm text-gray-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 text-sm text-gray-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center border-none bg-transparent pr-3"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 text-sm text-gray-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center border-none bg-transparent pr-3"
                  aria-label={
                    showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                id="terms_accepted"
                name="terms_accepted"
                type="checkbox"
                required
                checked={formData.terms_accepted}
                onChange={handleChange}
                className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-500"
              />
              <label htmlFor="terms_accepted" className="ml-3 text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-500 no-underline">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-500 no-underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full cursor-pointer justify-center rounded-lg border-none bg-gradient-primary px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
              >
                {isPending ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white/95 px-2 text-gray-500">Already have an account?</span>
              </div>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="font-medium text-blue-500 no-underline transition-colors hover:text-blue-600"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
