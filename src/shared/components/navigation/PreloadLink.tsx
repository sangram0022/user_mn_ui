// ========================================
// Simple Link Component - AWS CloudFront Optimized
// ========================================
// Simplified link component for AWS CloudFront deployment:
// - AWS CloudFront handles all route preloading and optimization
// - No custom preloading logic needed
// - Clean, minimal implementation
// ========================================

import { Link } from 'react-router-dom';

// ========================================
// Component Interface
// ========================================

export interface PreloadLinkProps {
  to: string;
  priority?: 'high' | 'medium' | 'low'; // Maintained for compatibility, unused
  preloadOnHover?: boolean; // Maintained for compatibility, unused
  preloadOnVisible?: boolean; // Maintained for compatibility, unused
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

// ========================================
// Simple Link Component
// ========================================

export function PreloadLink({
  to,
  className,
  children,
  onClick,
}: PreloadLinkProps) {
  // Handle navigation
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <Link
      to={to}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}