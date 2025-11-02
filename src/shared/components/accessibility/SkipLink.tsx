/**
 * Skip Link Component for Accessibility
 * WCAG 2.1 AA: Bypass Blocks (2.4.1)
 * Allows keyboard users to skip navigation and jump to main content
 */

interface SkipLinkProps {
  href: string;
  children: string;
}

export default function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
    >
      {children}
    </a>
  );
}
