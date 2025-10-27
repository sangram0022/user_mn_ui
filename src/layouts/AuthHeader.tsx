import { Shield } from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';

const AuthHeader: FC = () => (
  <header className="bg-[var(--color-surface-primary)]/80 backdrop-blur-sm border-b border-[var(--color-border)] sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] rounded-lg flex items-center justify-center">
              <Shield className="icon-md text-[var(--color-text-primary)]" />
            </div>
            <span className="text-xl font-bold text-[color:var(--color-text-primary)]">
              UserMgmt
            </span>
          </div>
        </Link>
      </div>
    </div>
  </header>
);

export default AuthHeader;
