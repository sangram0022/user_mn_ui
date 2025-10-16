import { Lock } from 'lucide-react';
import { startTransition, useActionState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useToast } from '@hooks/useToast';
import {
  PasswordInput,
  SubmitButton,
  TextInput,
  useFormFields, // ✅ React 19: Renamed from useFormState
  usePasswordVisibility,
} from '@shared/index';
import { validateEmail, validatePassword } from '@shared/utils/formValidation';
import { useAuth } from '../context/AuthContext';

interface LoginFormData extends Record<string, unknown> {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginState {
  success: boolean;
  error: string | null;
}

// Server action for login - runs outside React component
async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validate inputs
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return {
      success: false,
      error: emailValidation.error || 'Invalid email address',
    };
  }

  const passwordValidation = validatePassword(password, 8);
  if (!passwordValidation.isValid) {
    return {
      success: false,
      error: passwordValidation.error || 'Password must be at least 8 characters',
    };
  }

  // Note: Actual login call will be made in the component using useAuth
  // This validates the inputs first
  return {
    success: true,
    error: null,
  };
}

const LoginPage: React.FC = () => {
  const { toast } = useToast();
  const { formData, updateField } = useFormFields<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const { showPassword, togglePasswordVisibility } = usePasswordVisibility();

  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  // Use React 19's useActionState for form handling
  const [state, submitAction, isPending] = useActionState(loginAction, {
    success: false,
    error: null,
  });

  // Navigate on successful login
  useEffect(() => {
    if (state.success && !state.error) {
      // Perform actual login with auth context
      const performLogin = async () => {
        try {
          await authLogin({
            email: formData.email,
            password: formData.password,
          });

          // Small delay to ensure state is fully updated
          await new Promise((resolve) => setTimeout(resolve, 100));

          toast.success('Login successful! Redirecting to dashboard...');

          // Navigate to dashboard after successful login
          navigate('/dashboard', { replace: true });
        } catch (error) {
          // Error will be handled by the auth context
          toast.error('Login failed. Please check your credentials and try again.');
          console.error('Login failed:', error);
        }
      };

      performLogin();
    }
  }, [state.success, state.error, authLogin, formData.email, formData.password, navigate, toast]);

  // React 19: Wrap action call in startTransition to avoid warnings
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Create FormData from the form
    const form = event.currentTarget;
    const formDataObj = new FormData(form);

    // Add controlled input values to FormData since they're not in the form
    formDataObj.set('email', formData.email);
    formDataObj.set('password', formData.password);
    formDataObj.set('rememberMe', formData.rememberMe.toString());

    // Call action within startTransition
    startTransition(() => {
      submitAction(formDataObj);
    });
  };

  return (
    <>
      <div className="mx-auto w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto mb-6 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40">
            <Lock className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account to continue</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md mt-8">
        <div className="bg-white/95 backdrop-blur-sm p-8 shadow-xl rounded-2xl border border-gray-200/50">
          {/* Error Alert */}
          {state.error && (
            <div className="mb-6" role="alert" aria-live="assertive">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                {state.error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6" aria-label="Login form">
            {/* Email Field */}
            <TextInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(value) => updateField('email', value)}
              required
              placeholder="Enter your email"
              autoComplete="email"
            />

            {/* Password Field */}
            <PasswordInput
              label="Password"
              value={formData.password}
              onChange={(value) => updateField('password', value)}
              showPassword={showPassword}
              onToggleVisibility={togglePasswordVisibility}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <label
                htmlFor="remember-me-checkbox"
                className="inline-flex items-center gap-2 text-sm text-gray-900 cursor-pointer"
              >
                <input
                  id="remember-me-checkbox"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => updateField('rememberMe', e.target.checked)}
                  className="w-4 h-4 border border-gray-300 rounded accent-blue-500"
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <SubmitButton isLoading={isPending}>Sign In</SubmitButton>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/95 text-gray-600">Don't have an account?</span>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <Link
              to="/register"
              className="font-medium text-blue-500 hover:text-blue-600 transition-colors"
            >
              Create a new account
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
