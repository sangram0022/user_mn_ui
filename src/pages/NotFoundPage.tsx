import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components';
import { ROUTE_PATHS } from '../core/routing/routes';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-secondary px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-warning">
          <AlertCircle className="h-10 w-10 text-white" />
        </div>

        <h1 className="text-6xl font-bold text-text-primary mb-4">404</h1>
        
        <h2 className="text-2xl font-semibold text-text-primary mb-2">
          Page Not Found
        </h2>

        <p className="text-text-tertiary mb-8">
          Sorry, we couldn't find the page you're looking for. The page may have been moved or deleted.
        </p>

        <div className="card-base p-6 space-y-4">
          <Button
            onClick={() => navigate(ROUTE_PATHS.HOME)}
            className="w-full flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" />
            Go to Homepage
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </Button>
        </div>

        <p className="mt-6 text-sm text-text-tertiary">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}
