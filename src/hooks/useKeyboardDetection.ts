/**
 * Mouse/Keyboard Detection Hook
 *
 * Detects whether user is using mouse or keyboard for navigation
 * and adds appropriate class to body for accessibility styling.
 */

import { useEffect } from 'react';

export function useKeyboardDetection() {
  useEffect(() => {
    let isMouseUser = false;

    const handleMouseDown = () => {
      if (!isMouseUser) {
        isMouseUser = true;
        document.body.classList.add('mouse-user');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab key indicates keyboard navigation
      if (e.key === 'Tab' && isMouseUser) {
        isMouseUser = false;
        document.body.classList.remove('mouse-user');
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
