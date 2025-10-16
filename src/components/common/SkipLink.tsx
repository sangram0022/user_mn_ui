/**
 * Skip Link Component
 *
 * Provides keyboard navigation shortcut to main content.
 * Invisible until focused, meets WCAG 2.1 AA requirements.
 */

export function SkipLink() {
  return (
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
  );
}

export function SkipLinks() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#navigation" className="skip-link">
        Skip to navigation
      </a>
      <a href="#search" className="skip-link">
        Skip to search
      </a>
    </>
  );
}
