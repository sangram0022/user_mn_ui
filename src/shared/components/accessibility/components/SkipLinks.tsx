/**
 * SkipLinks Component
 * Provides keyboard-accessible skip navigation links
 */

export function SkipLinks() {
  const skipToContent = () => {
    const contentElement = document.getElementById('main-content') || 
                          document.querySelector('main') || 
                          document.querySelector('[role="main"]');
    
    if (contentElement) {
      (contentElement as HTMLElement).focus();
      contentElement.scrollIntoView();
    }
  };

  const skipToNavigation = () => {
    const navElement = document.getElementById('main-navigation') || 
                      document.querySelector('nav') || 
                      document.querySelector('[role="navigation"]');
    
    if (navElement) {
      (navElement as HTMLElement).focus();
      navElement.scrollIntoView();
    }
  };

  return (
    <div className="skip-links">
      <a
        href="#main-content"
        onClick={skipToContent}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg"
      >
        Skip to main content
      </a>
      <a
        href="#main-navigation"
        onClick={skipToNavigation}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:shadow-lg"
      >
        Skip to navigation
      </a>
    </div>
  );
}
