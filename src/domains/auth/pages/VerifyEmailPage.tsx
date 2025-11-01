import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import { useVerifyEmail } from '../hooks/useVerifyEmail';
import { useToast } from '../../../hooks/useToast';
import { parseAuthError } from '../utils/authErrorMapping';
import { Button } from '../../../components';
import { ROUTE_PATHS } from '../../../core/routing/routes';

type VerificationStatus = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const toast = useToast();
  const { mutate: verifyEmail } = useVerifyEmail();

  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid or missing verification token');
      return;
    }

    verifyEmail(
      { token },
      {
        onSuccess: () => {
          setStatus('success');
          toast.success('Email verified successfully!');
          setTimeout(() => {
            navigate(ROUTE_PATHS.LOGIN, {
              state: { message: 'Email verified! You can now log in.' },
            });
          }, 3000);
        },
        onError: (error: Error) => {
          setStatus('error');
          const errorMapping = parseAuthError(error);
          setErrorMessage(errorMapping.message || 'Failed to verify email');
          toast.error(errorMapping.message || 'Failed to verify email');
        },
      }
    );
  }, [token, verifyEmail, toast, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4">
        <div className="max-w-md w-full text-center">
          <Loader className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Verifying Your Email
          </h1>
          <p className="text-text-tertiary">Please wait...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Email Verified!
          </h1>
          <p className="text-text-tertiary mb-6">
            Your email has been successfully verified. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error">
          <XCircle className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Verification Failed
        </h1>
        <p className="text-text-tertiary mb-6">
          {errorMessage || "We couldn't verify your email. The link may have expired or is invalid."}
        </p>
        <div className="card-base p-6">
          <Mail className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
          <p className="text-text-secondary mb-6">
            Need a new verification link? Register again or contact support.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate(ROUTE_PATHS.REGISTER)}
              className="w-full"
            >
              Back to Register
            </Button>
            <Link
              to={ROUTE_PATHS.LOGIN}
              className="block text-center text-primary hover:text-primary-dark font-medium"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
