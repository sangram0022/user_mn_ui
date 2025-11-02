/**
 * Keyboard Shortcuts Hook
 * Global and local keyboard shortcut management (WCAG 2.1 AA)
 */

import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: (e: KeyboardEvent) => void;
  description?: string;
}

export function useKeyboardShortcut(
  shortcuts: KeyboardShortcut | KeyboardShortcut[],
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const shortcutArray = Array.isArray(shortcuts) ? shortcuts : [shortcuts];

    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcutArray) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;
        const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey;

        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          altMatch &&
          metaMatch
        ) {
          e.preventDefault();
          shortcut.handler(e);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Common keyboard shortcuts
 */
export const SHORTCUTS = {
  ESCAPE: { key: 'Escape', description: 'Close dialog/modal' },
  SEARCH: { key: '/', ctrl: true, description: 'Focus search' },
  SUBMIT: { key: 'Enter', description: 'Submit form' },
  CANCEL: { key: 'Escape', description: 'Cancel action' },
  SAVE: { key: 's', ctrl: true, description: 'Save changes' },
  HELP: { key: '?', shift: true, description: 'Show help' },
} as const;
