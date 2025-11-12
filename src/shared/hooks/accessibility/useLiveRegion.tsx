/**
 * Live Region Hook
 * 
 * Provides screen reader announcements using ARIA live regions.
 * Supports both polite and assertive priority levels.
 * 
 * @returns { announce, LiveRegion } - Function to announce messages and component to render
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { announce, LiveRegion } = useLiveRegion();
 * 
 *   const handleSave = () => {
 *     // ... save logic
 *     announce('Changes saved successfully', 'polite');
 *   };
 * 
 *   return (
 *     <>
 *       <LiveRegion />
 *       <button onClick={handleSave}>Save</button>
 *     </>
 *   );
 * }
 * ```
 */

import { useState } from 'react';

interface Message {
  id: string;
  text: string;
  priority: 'polite' | 'assertive';
}

export function useLiveRegion() {
  const [messages, setMessages] = useState<Message[]>([]);

  const announce = (text: string, priority: 'polite' | 'assertive' = 'polite') => {
    const id = `announcement-${Date.now()}`;
    setMessages(prev => [...prev, { id, text, priority }]);

    // Auto-clear after announcement
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== id));
    }, 1000);
  };

  const LiveRegion = () => (
    <>
      {/* Polite announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {messages
          .filter(msg => msg.priority === 'polite')
          .map(msg => (
            <div key={msg.id}>{msg.text}</div>
          ))}
      </div>

      {/* Assertive announcements */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="alert"
      >
        {messages
          .filter(msg => msg.priority === 'assertive')
          .map(msg => (
            <div key={msg.id}>{msg.text}</div>
          ))}
      </div>
    </>
  );

  return { announce, LiveRegion };
}
