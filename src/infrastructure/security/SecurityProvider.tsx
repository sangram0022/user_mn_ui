/* eslint-disable react-refresh/only-export-components */
/**
 * Security Context Provider
 *
 * Provides security utilities throughout the application including
 * CSP nonce management and security header integration.
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { generateNonce, getDevCSPHeader, getProdCSPHeader } from './csp';
import { getDevSecurityHeaders, getSecurityHeaders } from './headers';

interface SecurityContextValue {
  nonce: string;
  cspHeader: string;
  securityHeaders: Record<string, string>;
  regenerateNonce: () => void;
}

const SecurityContext = createContext<SecurityContextValue | undefined>(undefined);

interface SecurityProviderProps {
  children: React.ReactNode;
  initialNonce?: string;
}

/**
 * Security Provider Component
 *
 * Manages CSP nonce and security headers for the application.
 * Regenerates nonce on navigation for enhanced security.
 */
export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children, initialNonce }) => {
  const [nonce, setNonce] = React.useState<string>(initialNonce || generateNonce());

  // Generate appropriate CSP header based on environment
  const cspHeader = useMemo(() => {
    if (import.meta.env.DEV) {
      return getDevCSPHeader(nonce);
    }
    return getProdCSPHeader(nonce);
  }, [nonce]);

  // Get security headers based on environment
  const securityHeaders = useMemo(() => {
    const headers = import.meta.env.DEV ? getDevSecurityHeaders() : getSecurityHeaders();

    return headers as unknown as Record<string, string>;
  }, []);

  // Regenerate nonce function
  const regenerateNonce = React.useCallback(() => {
    setNonce(generateNonce());
  }, []);

  // Add CSP to document (for client-side enforcement)
  useEffect(() => {
    // Create or update CSP meta tag
    let metaTag = document.querySelector('meta[http-equiv="Content-Security-Policy"]');

    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('http-equiv', 'Content-Security-Policy');
      document.head.appendChild(metaTag);
    }

    metaTag.setAttribute('content', cspHeader);

    // Cleanup on unmount
    return () => {
      if (metaTag?.parentNode) {
        metaTag.parentNode.removeChild(metaTag);
      }
    };
  }, [cspHeader]);

  // Log security configuration in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔒 Security Configuration:', {
        nonce,
        cspHeader: cspHeader.substring(0, 100) + '...',
        securityHeaders,
        environment: import.meta.env.MODE,
      });
    }
  }, [nonce, cspHeader, securityHeaders]);

  const value = useMemo(
    () => ({
      nonce,
      cspHeader,
      securityHeaders,
      regenerateNonce,
    }),
    [nonce, cspHeader, securityHeaders, regenerateNonce]
  );

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
};

/**
 * Hook to access security context
 */
export const useSecurity = (): SecurityContextValue => {
  const context = useContext(SecurityContext);

  if (!context) {
    throw new Error('useSecurity must be used within SecurityProvider');
  }

  return context;
};

/**
 * Hook to get current nonce (useful for inline scripts)
 */
export const useNonce = (): string => {
  const { nonce } = useSecurity();
  return nonce;
};

/**
 * HOC to wrap component with security provider
 */
export const withSecurity = <P extends object>(Component: React.ComponentType<P>): React.FC<P> => {
  return (props: P) => (
    <SecurityProvider>
      <Component {...props} />
    </SecurityProvider>
  );
};
