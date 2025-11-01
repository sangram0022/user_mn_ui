// ========================================
// Skip Links - Accessibility Navigation
// Allows keyboard users to skip to main content
// ========================================

export default function SkipLinks() {
  return (
    <div className="skip-links">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#navigation" className="skip-link">
        Skip to navigation
      </a>
      <a href="#footer" className="skip-link">
        Skip to footer
      </a>
      
      <style>{`
        .skip-links {
          position: relative;
          z-index: 9999;
        }
        
        .skip-link {
          position: absolute;
          left: -9999px;
          top: 0;
          z-index: 9999;
          padding: 1rem 1.5rem;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          font-weight: 600;
          border-radius: 0 0 0.5rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: left 0.2s ease;
        }
        
        .skip-link:focus {
          left: 0;
          outline: 2px solid #1e40af;
          outline-offset: 2px;
        }
        
        .skip-link:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
}
